## 11. CORS Proxy for Local LLMs (LM Studio, Ollama)

Browser extensions cannot access local LLM APIs (like LM Studio or Ollama) directly due to CORS restrictions. Use the included CORS proxy:

1. Install dependencies (once):
	```
	npm install express http-proxy-middleware
	```
2. Start the proxy:
	```
	node utils/cors-proxy.js
	```
3. In the extension Options, set the provider endpoint to `http://localhost:8080` (instead of `http://localhost:1234`).
4. All requests will be forwarded with proper CORS headers.

If you see `Failed to fetch` or CORS errors, ensure the proxy is running and the target LLM API is available.

## 12. Troubleshooting CORS/Network Issues

- "Failed to fetch" or CORS errors: Use the CORS proxy as described above.
- "Network error" or no response: Ensure LM Studio/Ollama is running and the proxy is started.
- Still not working? Check firewall, antivirus, or browser settings that may block localhost connections.
# Job Hunter Pro Extension — Options Page: Full Execution & Integration Guide

## 1. UI Elements
- **Provider Dropdown (`aiProvider`)**: OpenAI, Google, Ollama, LM Studio
- **Model Input (`aiModel`)**: User enters model name (e.g., `gpt-3.5-turbo`, `dolphin-2.2.1-mistral-7b`)
- **API Key Input (`openaiApiKey`)**: Required for OpenAI/Google/GitHub, not for Ollama/LM Studio
- **Passphrase Input (`apiPassphrase`)**: Optional, for encrypting API key
- **Allow Plain Key Checkbox (`allowPlainKey`)**: Option to store API key unencrypted (not recommended)
- **Help Text**: Inline help for each field, with LM Studio-specific instructions
- **Save Button**: Triggers save logic
- **Status/Feedback Area**: Shows success/error messages

## 2. Initialization (On Page Load)
- Read `aiProvider`, `aiModel`, `openaiApiKey`, `allowPlainKey` from `chrome.storage.sync`
- Populate UI fields with stored values
- If API key is encrypted, prompt for passphrase to unlock
- Show/hide help text based on selected provider

## 3. User Actions & Validation
- **Provider Selection**: Changes available fields/help text
- **Model Input**: Required for all providers
- **API Key Input**: Required for OpenAI/Google/GitHub; hidden/disabled for Ollama/LM Studio
- **Passphrase Input**: Optional; if provided, encrypt API key before saving
- **Save**: Validates required fields, encrypts API key if needed, saves all settings to `chrome.storage.sync`
- **Unlock**: Decrypts API key for session use (background.js)

## 4. Storage & Security
- All settings are stored in `chrome.storage.sync` for cross-device sync
- API key is encrypted with passphrase if provided; otherwise, stored in plain text only if user allows
- Passphrase is never stored—must be entered each session to unlock the key
- On unlock, decrypted API key is kept in memory for background.js to use

## 5. Provider-Specific Logic
- **OpenAI/Google/GitHub**: Require API key; validate on save
- **Ollama/LM Studio**: No API key required; only model name is needed
- **LM Studio**: Show help text: “Start LM Studio, load your model, and ensure the API is running at http://localhost:1234. Select LM Studio (local) as provider, enter your model name, and leave API key blank.”

## 6. Integration with Extension
- On resume optimization or auto-apply, background.js reads provider/model/API key from storage and uses ApiConnector to call the correct endpoint
- ApiConnector supports all providers, including LM Studio at http://localhost:1234/v1/chat/completions

## 7. Error Handling & Feedback
- Show error messages for missing/invalid fields
- Show status messages for successful save, unlock, or errors
- If API key decryption fails, prompt for correct passphrase

## 8. Security Best Practices
- Warn user if storing API key in plain text
- Never store passphrase
- API key is only unlocked in memory for the session

## 9. Help & Documentation
- Inline help for each field (API key, model, provider)
- LM Studio-specific help: “Start LM Studio, load your model, and ensure the API is running at http://localhost:1234. Select LM Studio (local) as provider, enter your model name, and leave API key blank.”
- Example model names for each provider

## 10. Example User Flows

### OpenAI
1. Select “OpenAI” as provider
2. Enter model (e.g., `gpt-3.5-turbo`)
3. Enter API key
4. (Optional) Enter passphrase to encrypt key
5. Click Save

### LM Studio
1. Start LM Studio, load your model, ensure API is running at http://localhost:1234
2. Select “LM Studio (local)” as provider
3. Enter model (e.g., `dolphin-2.2.1-mistral-7b`)
4. Leave API key blank
5. Click Save

### Ollama
1. Start Ollama, load your model
2. Select “Ollama (local)” as provider
3. Enter model (e.g., `llama2`)
4. Leave API key blank
5. Click Save

---

## Code-Level Walkthrough (options.js)
- Reads/writes all settings to `chrome.storage.sync`
- Encrypts/decrypts API key using passphrase (if provided)
- Handles provider/model selection and validation
- Shows/hides help text and error messages
- Triggers background.js to reload settings on save/unlock

## UI Wireframe (Textual)
- Provider: [Dropdown]
- Model: [Text Input]
- API Key: [Text Input, hidden for Ollama/LM Studio]
- Passphrase: [Password Input, optional]
- [ ] Allow storing plain API key
- [Save Button]
- [Status/Help Area]

---

## Troubleshooting
- “Failed to fetch” with LM Studio: Ensure LM Studio is running, model is loaded, and API is at http://localhost:1234
- “API key required”: Only for OpenAI/Google/GitHub
- “Decryption failed”: Enter correct passphrase

---

For further details on encryption, storage, error handling, or integration, see the code in `options.js`, `utils/crypto.js`, and `utils/api-connector.js`.
