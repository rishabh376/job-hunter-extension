// Thin fetch wrapper for OpenAI + backup free models (Ollama, GitHub Models)
const ApiConnector = (() => {
  const ENDPOINTS = {
    openai: 'https://api.openai.com/v1/chat/completions',
    github: 'https://models.inference.ai.azure.com/chat/completions', // free tier
    ollama: 'http://localhost:11434/api/chat'                       // local, $0
  };

  const call = async ({provider = 'openai', apiKey, model, messages, max_tokens = 1000, temp = 0.7}) => {
    const url  = ENDPOINTS[provider];
    const body = { model, messages, max_tokens, temperature: temp };

    const headers = { 'Content-Type': 'application/json' };
    if (provider === 'openai') headers['Authorization'] = `Bearer ${apiKey}`;
    if (provider === 'github') headers['Authorization'] = `Bearer ${apiKey}`; // GitHub PAT

    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`${provider} error: ${res.status} ${await res.text()}`);
    const json = await res.json();
    return provider === 'ollama' ? json.message.content : json.choices[0].message.content;
  };

  return { call };
})();

