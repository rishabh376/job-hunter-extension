// Example usage of listGoogleModels from api-connector.js
// Replace 'YOUR_GOOGLE_API_KEY' with your actual API key

const { listGoogleModels } = require('./utils/api-connector');

(async () => {
  const apiKey = 'AIzaSyA5lnOTTbM9eSaDtdg9F4NU4PETMo5nYK0'; // TODO: Replace with your real key
  try {
    const models = await listGoogleModels(apiKey);
    console.log('Available Google Gemini models:', models);
  } catch (err) {
    console.error('Error listing models:', err);
  }
})();
