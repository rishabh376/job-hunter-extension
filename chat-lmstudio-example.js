// Example: Chat with LM Studio local model (OpenAI API compatible)
// Make sure LM Studio is running and the model is started (API at http://127.0.0.1:1234)

const fetch = require('node-fetch');

(async () => {
  const response = await fetch('http://127.0.0.1:1234/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'dolphin-2.2.1-mistral-7b',
      messages: [{ role: 'user', content: 'Hello, Dolphin!' }],
      max_tokens: 100,
      temperature: 0.7
    })
  });
  const data = await response.json();
  console.log('LM Studio response:', data);
})();
