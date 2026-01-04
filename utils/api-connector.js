// Thin fetch wrapper for OpenAI + backup free models (Ollama, GitHub Models)
const ApiConnector = (() => {
  const ENDPOINTS = {
    openai: 'https://api.openai.com/v1/chat/completions',
    github: 'https://models.inference.ai.azure.com/chat/completions', // free tier
    ollama: 'http://localhost:11434/api/chat',                       // local, $0
    lmstudio: 'http://localhost:1234/v1/chat/completions',           // local LM Studio
    anthropic: 'https://api.anthropic.com/v1/messages'               // Claude
  };

  // List available models for different providers
  const listModels = async (provider, apiKey) => {
    switch (provider) {
      case 'google': {
        if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
          throw new Error('Google provider requires an API key.');
        }
        const url = `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(apiKey)}`;
        const headers = { 'Content-Type': 'application/json' };
        let res;
        try {
          res = await fetch(url, { method: 'GET', headers });
        } catch (networkErr) {
          throw new Error(`google network error: ${networkErr.message || networkErr}`);
        }
        if (!res.ok) {
          const txt = await res.text().catch(() => '<no body>');
          throw new Error(`google error: ${res.status} ${res.statusText} - ${txt}`);
        }
        const json = await res.json().catch(() => null);
        if (!json) throw new Error('google returned invalid JSON');
        return json;
      }
      case 'openai':
        // OpenAI doesn't have a public list endpoint, return common models
        return {
          models: [
            { name: 'gpt-4o', description: 'Most advanced GPT-4 model' },
            { name: 'gpt-4o-mini', description: 'Fast and affordable' },
            { name: 'gpt-4-turbo', description: 'Latest GPT-4 Turbo' },
            { name: 'gpt-3.5-turbo', description: 'Fast and cost-effective' }
          ]
        };
      case 'github':
        // GitHub Models inference has specific models
        return {
          models: [
            { name: 'gpt-4o', description: 'GPT-4o via GitHub' },
            { name: 'gpt-4o-mini', description: 'GPT-4o mini via GitHub' },
            { name: 'Phi-3-medium-128k-instruct', description: 'Microsoft Phi-3' }
          ]
        };
      case 'ollama':
        try {
          const res = await fetch('http://localhost:11434/api/tags');
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          return { models: data.models || [] };
        } catch (err) {
          throw new Error(`Ollama list models failed: ${err.message}`);
        }
      case 'anthropic':
        return {
          models: [
            { name: 'claude-3-5-sonnet-20241022', description: 'Most intelligent Claude model' },
            { name: 'claude-3-5-haiku-20241022', description: 'Fast and cost-effective' },
            { name: 'claude-3-opus-20240229', description: 'Powerful for complex tasks' },
            { name: 'claude-3-sonnet-20240229', description: 'Balanced performance' }
          ]
        };
      default:
        throw new Error(`Model listing not supported for provider: ${provider}`);
    }
  };
  const call = async ({provider = 'openai', apiKey, model, messages, max_tokens = 1000, temp = 0.7}) => {
    // Providers that require an API key
    const requiresKey = provider === 'openai' || provider === 'github' || provider === 'google' || provider === 'anthropic';
    if (requiresKey && (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '')) {
      throw new Error(`${provider} requires an API key. Please unlock or provide a valid key.`);
    }

    // Helper: join chat-style messages into a single prompt (used for Google)
    const messagesToPrompt = (msgs) => {
      if (!Array.isArray(msgs)) return String(msgs || '');
      return msgs.map(m => (m.role ? m.role.toUpperCase() + ': ' : '') + (m.content || '')).join('\n\n');
    };

    // Special handling for Google Generative Language API (REST)

    if (provider === 'google') {
      // Google Gemini API expects model in the path, e.g. 'gemini-pro', and v1 endpoint
      const modelId = model || 'gemini-pro';
      const promptText = messagesToPrompt(messages);
      // v1 endpoint for Gemini
      const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(modelId)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const gbody = {
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { temperature: temp, maxOutputTokens: max_tokens }
      };
      const headers = { 'Content-Type': 'application/json' };
      let res;
      try {
        res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(gbody) });
      } catch (networkErr) {
        throw new Error(`google network error: ${networkErr.message || networkErr}`);
      }
      if (!res.ok) {
        const txt = await res.text().catch(() => '<no body>');
        throw new Error(`google error: ${res.status} ${res.statusText} - ${txt}`);
      }
      const json = await res.json().catch(() => null);
      if (!json) throw new Error('google returned invalid JSON');
      // Gemini returns candidates array with content.parts[0].text
      if (json.candidates && json.candidates[0] && json.candidates[0].content && json.candidates[0].content.parts && json.candidates[0].content.parts[0].text) {
        return json.candidates[0].content.parts[0].text;
      }
      // fallback
      return JSON.stringify(json);
    }

    // Special handling for Anthropic Claude
    if (provider === 'anthropic') {
      const url = ENDPOINTS.anthropic;
      // Convert messages to Anthropic format
      const systemMessage = messages.find(m => m.role === 'system');
      const chatMessages = messages.filter(m => m.role !== 'system').map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));
      
      const abody = {
        model: model || 'claude-3-sonnet-20240229',
        max_tokens: max_tokens,
        temperature: temp,
        system: systemMessage ? systemMessage.content : undefined,
        messages: chatMessages
      };
      const headers = {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      };
      let res;
      try {
        res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(abody) });
      } catch (networkErr) {
        throw new Error(`anthropic network error: ${networkErr.message || networkErr}`);
      }
      if (!res.ok) {
        const txt = await res.text().catch(() => '<no body>');
        throw new Error(`anthropic error: ${res.status} ${res.statusText} - ${txt}`);
      }
      const json = await res.json().catch(() => null);
      if (!json) throw new Error('anthropic returned invalid JSON');
      if (json.content && json.content[0] && json.content[0].text) {
        return json.content[0].text;
      }
      return JSON.stringify(json);
    }

    // Fallback for other providers (openai, github, ollama, lmstudio)
    // Allow endpoint override for local LLMs (LM Studio/Ollama)
    let url = ENDPOINTS[provider];
    if (typeof window !== 'undefined' && window.localStorage && (provider === 'lmstudio' || provider === 'ollama')) {
      try {
        const custom = window.localStorage.getItem('aiEndpoint') || '';
        if (custom && custom.startsWith('http')) url = custom;
      } catch (e) {}
    }
    if (!url) throw new Error(`Unknown provider: ${provider}`);

    const body = { model, messages, max_tokens, temperature: temp };
    const headers = { 'Content-Type': 'application/json' };
    if (provider === 'openai' || provider === 'github') headers['Authorization'] = `Bearer ${apiKey}`;

    let res;
    try {
      res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    } catch (networkErr) {
      throw new Error(`${provider} network error: ${networkErr.message || networkErr}`);
    }

    if (!res.ok) {
      const txt = await res.text().catch(() => '<no body>');
      throw new Error(`${provider} error: ${res.status} ${res.statusText} - ${txt}`);
    }

    const json = await res.json().catch(() => null);
    if (!json) throw new Error(`${provider} returned invalid JSON`);

    // Normalize return: Ollama uses a different shape
    if (provider === 'ollama') return json.message && json.message.content ? json.message.content : JSON.stringify(json);
    // LM Studio: OpenAI-compatible, same as OpenAI
    if (provider === 'lmstudio') {
      if (json.choices && json.choices[0] && json.choices[0].message && typeof json.choices[0].message.content === 'string') {
        return json.choices[0].message.content;
      }
      return JSON.stringify(json);
    }
    // OpenAI / GitHub Models
    if (json.choices && json.choices[0] && json.choices[0].message && typeof json.choices[0].message.content === 'string') {
      return json.choices[0].message.content;
    }
    // Fallback to returning raw JSON string
    return JSON.stringify(json);
  };


  return { call, listModels };
})();


// Expose globally for options.js and popup.js
if (typeof window !== 'undefined') {
  window.ApiConnector = ApiConnector;
}

// Export for Node.js usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiConnector;
}

