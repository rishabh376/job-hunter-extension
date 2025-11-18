// Thin fetch wrapper for OpenAI + backup free models (Ollama, GitHub Models)
const ApiConnector = (() => {
  const ENDPOINTS = {
    openai: 'https://api.openai.com/v1/chat/completions',
    github: 'https://models.inference.ai.azure.com/chat/completions', // free tier
    ollama: 'http://localhost:11434/api/chat'                       // local, $0
  };

  const call = async ({provider = 'openai', apiKey, model, messages, max_tokens = 1000, temp = 0.7}) => {
    const url  = ENDPOINTS[provider];
    if (!url) throw new Error(`Unknown provider: ${provider}`);

    // Providers that require an API key
    const requiresKey = provider === 'openai' || provider === 'github';
    if (requiresKey && (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '')) {
      throw new Error(`${provider} requires an API key. Please unlock or provide a valid key.`);
    }

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
    // OpenAI / GitHub Models
    if (json.choices && json.choices[0] && json.choices[0].message && typeof json.choices[0].message.content === 'string') {
      return json.choices[0].message.content;
    }
    // Fallback to returning raw JSON string
    return JSON.stringify(json);
  };

  return { call };
})();

