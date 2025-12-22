// List available Ollama models using the REST API
// Make sure Ollama is running locally (default: http://localhost:11434)

const fetch = require('node-fetch');

(async () => {
  try {
    const res = await fetch('http://localhost:11434/api/tags');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log('Ollama models:', data.models);
  } catch (err) {
    console.error('Error listing Ollama models:', err);
  }
})();
