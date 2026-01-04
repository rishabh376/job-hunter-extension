# Job Hunter Pro - API Integration & Local LLM Setup Guide

## 🔌 API Plugin Integration Guide

This guide provides complete step-by-step instructions for integrating AI providers and using local LLMs with Job Hunter Pro.

---

## Table of Contents

1. [Cloud AI Setup](#cloud-ai-setup)
2. [Local LLM Setup](#local-llm-setup)
3. [Auto-Apply Workflow](#auto-apply-workflow)
4. [API Plugin Architecture](#api-plugin-architecture)
5. [Troubleshooting](#troubleshooting)

---

## 🌐 Cloud AI Setup

### Option 1: OpenAI Integration

#### Step 1: Get OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in to your account
3. Click "Create new secret key"
4. Copy the API key (starts with `sk-`)

#### Step 2: Configure Extension
1. Open extension options page
2. Select "OpenAI" as provider
3. Paste your API key
4. Choose model: `gpt-4o` (recommended) or `gpt-3.5-turbo`
5. Click "Test & Save Everything"

#### Step 3: Verify Setup
- Green checkmark appears: "✅ API key validated"
- Sample response shows in validation area

### Option 2: Anthropic Claude Integration

#### Step 1: Get Anthropic API Key
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up/Login
3. Navigate to API Keys section
4. Create new key
5. Copy the key (starts with `sk-ant-`)

#### Step 2: Configure Extension
1. Select "Anthropic Claude" as provider
2. Paste API key
3. Choose model: `claude-3-5-sonnet-20241022` (recommended)
4. Test connection

### Option 3: Google Gemini Integration

#### Step 1: Get Google API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create/select project
3. Generate API key

#### Step 2: Configure Extension
1. Select "Google Generative API" as provider
2. Paste API key
3. Model: `gemini-pro` or `gemini-1.5-flash`

### Option 4: GitHub Models (Free Tier)

#### Step 1: Get GitHub Personal Access Token
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Create token with `Copilot` scope

#### Step 2: Configure Extension
1. Select "GitHub Models" as provider
2. Paste token as API key
3. Model: `gpt-4o-mini` (free)

---

## 🏠 Local LLM Setup

### Why Use Local LLMs?
- **Privacy**: No data sent to cloud
- **Cost**: No API charges
- **Offline**: Works without internet
- **Customization**: Use any model you want

### Option 1: Ollama Setup

#### Prerequisites
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 5-20GB for models
- **OS**: Windows, macOS, or Linux

#### Step 1: Install Ollama
```bash
# Windows (PowerShell)
winget install Ollama.Ollama

# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh
```

#### Step 2: Start Ollama Service
```bash
# Start Ollama (runs in background)
ollama serve
```

#### Step 3: Download Models
```bash
# Recommended models for resume optimization
ollama pull llama3.2:3b        # Fast, lightweight
ollama pull llama3.1:8b        # Good balance
ollama pull codellama:7b       # Code-focused
ollama pull mistral:7b         # Good general purpose
```

#### Step 4: Configure Extension
1. Open extension options
2. Select "Ollama (local)" as provider
3. Model name: `llama3.2:3b` (exact name from `ollama list`)
4. Leave API key blank
5. Click "Test & Save Everything"

#### Step 5: CORS Setup (Required)
Since extensions can't directly access localhost APIs, use the CORS proxy:

```bash
# Install dependencies (one time)
npm install

# Start CORS proxy
node utils/cors-proxy.js
```

In extension options, set "Provider Endpoint" to: `http://localhost:8080`

### Option 2: LM Studio Setup

#### Prerequisites
- **RAM**: 8GB minimum
- **GPU**: NVIDIA GPU recommended (optional)

#### Step 1: Download & Install
1. Download from [LM Studio website](https://lmstudio.ai/)
2. Install and run LM Studio

#### Step 2: Download Models
1. Open LM Studio
2. Go to "My Models" tab
3. Search and download models like:
   - `dolphin-2.2.1-mistral-7b`
   - `codellama-7b-instruct`
   - `llama-2-7b-chat`

#### Step 3: Start Local Server
1. Go to "Local Server" tab
2. Select downloaded model
3. Click "Start Server"
4. Note the port (usually 1234)

#### Step 4: Configure Extension
1. Select "LM Studio (local)" as provider
2. Model name: exact name shown in LM Studio
3. Provider Endpoint: `http://localhost:1234` (if different port)
4. Test connection

#### Step 5: CORS Setup (if needed)
If you get CORS errors, use the CORS proxy:
```bash
node utils/cors-proxy.js
```
Then set endpoint to: `http://localhost:8080`

---

## 🤖 Auto-Apply Workflow

### How Auto-Apply Works

#### Step 1: Enable Auto-Apply
1. Open extension popup
2. Check "Auto-apply" toggle
3. Configure personal info in options

#### Step 2: Job Detection
The extension automatically detects when you're on a job page by:
- URL pattern matching (LinkedIn, Indeed, etc.)
- DOM analysis for job posting elements
- Content script injection

#### Step 3: Resume Optimization Trigger
When a job is detected:
1. Extension extracts job description
2. Sends to AI for resume optimization
3. Generates tailored resume content

#### Step 4: Form Auto-Fill
The extension automatically:
1. Fills personal information fields
2. Uploads optimized resume PDF
3. Checks required checkboxes
4. Selects appropriate dropdown options

#### Step 5: Application Submission
- Waits for user confirmation (configurable)
- Submits application
- Tracks success/failure
- Updates statistics

### Auto-Apply Settings

#### Rate Limiting
- **Max per hour**: 13 applications (configurable)
- **Min salary filter**: ₹1,700,000/year (configurable)
- **Location filter**: India-focused (configurable)

#### Safety Features
- **Manual review**: Option to review before submit
- **Duplicate prevention**: Won't apply to same job twice
- **Error handling**: Retries failed submissions

---

## 🔧 API Plugin Architecture

### Plugin Interface

All AI providers implement the same interface:

```javascript
const provider = {
  call: async ({ provider, apiKey, model, messages, max_tokens, temp }) => {
    // Implementation specific to provider
    return responseText;
  },

  listModels: async (provider, apiKey) => {
    // Return available models for provider
    return { models: [...] };
  }
};
```

### Adding New Providers

#### Step 1: Update ENDPOINTS
```javascript
const ENDPOINTS = {
  // ... existing providers
  'new-provider': 'https://api.new-provider.com/v1/chat'
};
```

#### Step 2: Add to requiresKey
```javascript
const requiresKey = provider === 'openai' || /* ... */ || provider === 'new-provider';
```

#### Step 3: Implement Handler
```javascript
if (provider === 'new-provider') {
  // Custom API call logic
  const response = await fetch(url, { /* ... */ });
  // Parse and return response
}
```

#### Step 4: Update UI
- Add option to provider dropdown
- Update host_permissions in manifest.json

### Provider-Specific Features

#### OpenAI
- Streaming support
- Function calling
- Multiple models (GPT-3.5, GPT-4, GPT-4o)

#### Anthropic
- Large context windows
- Constitutional AI safety
- Multiple Claude models

#### Google Gemini
- Multimodal capabilities
- Free tier available
- Fast inference

#### Local Providers
- Privacy-focused
- No API costs
- Custom model selection

---

## 🔍 Troubleshooting

### Common Issues

#### 1. "Failed to fetch" Errors
**Cause**: CORS restrictions for local APIs
**Solution**: Use CORS proxy
```bash
node utils/cors-proxy.js
```

#### 2. "API key invalid" Errors
**Cause**: Wrong API key or insufficient permissions
**Solution**:
- Verify API key format
- Check API key permissions
- Test with simple API call

#### 3. "Model not found" Errors
**Cause**: Wrong model name
**Solution**:
- Check exact model name spelling
- Verify model is available for your account
- Use `listModels()` to see available options

#### 4. Auto-apply not working
**Cause**: Site structure changed or permissions
**Solution**:
- Check content script permissions
- Verify job board URL patterns
- Update selectors in form-filler.js

#### 5. Local LLM not responding
**Cause**: Service not running or wrong port
**Solution**:
- Verify Ollama/LM Studio is running
- Check port numbers
- Test API endpoint directly

### Debug Mode

Enable debug logging:
```javascript
// In browser console
chrome.storage.local.set({ jh_debug: true });
```

### Performance Optimization

#### For Local LLMs
- Use smaller models for faster response
- Increase context window for better results
- Monitor RAM usage

#### For Cloud APIs
- Use GPT-4o-mini for cost savings
- Implement caching for repeated requests
- Monitor API usage and costs

---

## 📊 Usage Statistics

### Tracking Features
- Applications submitted
- Success rate
- Time saved
- API usage costs

### Analytics Dashboard
- View in extension popup
- Export to CSV
- Reset statistics

---

## 🔒 Security Best Practices

### API Key Management
- Always use encryption with passphrase
- Never store plain API keys
- Rotate keys regularly

### Local LLM Security
- Keep models updated
- Use trusted model sources
- Monitor system resources

### Data Privacy
- No user data sent to external servers
- All processing happens locally or via trusted APIs
- Resume data encrypted at rest

---

## 🚀 Advanced Configuration

### Custom Models
```javascript
// Add custom model configurations
const CUSTOM_MODELS = {
  'my-model': {
    provider: 'ollama',
    model: 'custom-model:version',
    parameters: { temp: 0.7, max_tokens: 1000 }
  }
};
```

### Batch Processing
- Queue multiple applications
- Rate limiting
- Error recovery

### Integration APIs
- Webhook notifications
- External tracking systems
- CRM integration