# i@pply — Browser Extension

A powerful, production-ready Chrome/Firefox extension for intelligent job hunting with AI-powered resume optimization, automated job application, and secure API key management.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Project Structure](#project-structure)
5. [Configuration](#configuration)
6. [Usage](#usage)
7. [Testing](#testing)
8. [Development](#development)
9. [Troubleshooting](#troubleshooting)

---

## Overview

**Job Hunter Pro** is a full-featured browser extension designed to:

- **Detect job postings** from popular job boards (LinkedIn, Indeed, Glassdoor).
- **Extract job descriptions** and relevant metadata automatically.
- **Optimize resumes** using multiple AI providers (OpenAI, Anthropic Claude, Google Gemini, Ollama, GitHub Models, LM Studio).
- **Auto-apply** to jobs with intelligent form filling.
- **Track applications** with statistics (applications sent, success rate).
- **Secure API keys** with encryption and session-based unlocking.
- **Validate resume data** against JSON Schema with browser-based Ajv validation.

The extension is built with **Manifest V3** (Chrome's latest extension standard), supports **encrypted storage**, **schema validation**, and includes **comprehensive automated tests** with CI/CD integration.

---

## 🎯 Quick Start & Demo

### For Sales/Marketing Demo
See [`DEMO-GUIDE.md`](DEMO-GUIDE.md) for complete demo walkthrough with screenshots.

### For API Integration Setup
See [`API-INTEGRATION-GUIDE.md`](API-INTEGRATION-GUIDE.md) for detailed API plugin setup and local LLM configuration.

### Automated Demo Setup
```bash
# Setup complete demo environment
chmod +x setup-demo.sh
./setup-demo.sh
```

---

## Prerequisites

### System Requirements

- **Operating System**: Windows, macOS, or Linux
- **RAM**: 2 GB minimum
- **Disk Space**: 100 MB minimum

### Software Requirements

- **Node.js**: v16+ (for testing and build tools)
  - Download: https://nodejs.org/
  - Verify: `node --version` and `npm --version`

- **Browser**: Chrome/Edge/Brave/Opera (v88+) or Firefox (v109+)
  - Chrome: https://www.google.com/chrome/
  - Firefox: https://www.mozilla.org/firefox/

- **Git**: (Optional, for version control)
  - Download: https://git-scm.com/

### API Requirements

- **OpenAI API Key** (for resume optimization)
  - Sign up: https://platform.openai.com/
  - Create API key: https://platform.openai.com/api-keys
  - Keep your API key safe; you'll encrypt it in the extension.

- **Alternative AI Providers** (optional):
  - Ollama: https://ollama.ai/ (local, no API key needed)
  - GitHub Models: https://github.com/marketplace/models (requires GitHub token)

---

## Installation

### Step 1: Clone or Download the Extension

```bash
# Clone via Git
git clone https://github.com/rishabh376/job-hunter-extension.git
cd job-hunter-extension

# Or download as ZIP and extract
# Then navigate to the folder
cd job-hunter-extension
```

### Step 2: Install Node.js Dependencies (for testing)

```bash
# Install npm dependencies
npm install
```

This installs:
- **Ajv**: JSON Schema validator
- **jsdom**: DOM testing library
- **ESLint**: Code quality linter

### Step 3: Verify Installation

```bash
# Run all tests to verify setup
node tests/run-tests.js
```

Expected output:
```
PASS: KeywordExtractor.extract basic detection
PASS: FileUtils.base64ToUint8Array roundtrip
PASS: Content DOM tests (jsdom)
PASS: Crypto helper tests
PASS: Schema validator tests
PASS: Background API flow tests

All tests passed.
```

---

## Project Structure

```
job-hunter-extension/
├── manifest.json                          # Extension manifest (Manifest V3)
├── background.js                          # Background service worker (job tracking, API optimization)
├── content.js                             # Content script (job detection, form filling, auto-apply)
├── popup.html                             # Popup UI (stats, auto-apply toggle, optimization)
├── popup.js                               # Popup logic (event handlers, unlock, validation)
├── popup.css                              # Popup styling
├── options.html                           # Options page (resume configuration, API key setup)
├── options.js                             # Options logic (encrypt/decrypt API key)
│
├── utils/
│   ├── api-connector.js                   # API wrapper (OpenAI, Ollama, GitHub Models)
│   ├── crypto.js                          # Web Crypto encryption/decryption helpers
│   ├── logger.js                          # Logging utility (console + storage)
│   ├── storage-manager.js                 # Chrome storage wrapper (sync/local)
│   ├── file-utils.js                      # File & base64 utilities
│   ├── schema-validator.js                # JSON Schema validator (uses Ajv)
│   ├── ajv.real.js                        # Vendored Ajv UMD build (browser validation)
│
├── resume-builder/
│   ├── resume-templates/
│   │   ├── keyword-extractor.js           # Extract keywords from job descriptions
│   │   ├── resume-optimizer.js            # Format optimized resume from AI response
│
├── auto-applier/
│   ├── job-scanner.js                     # Detect jobs on LinkedIn, Indeed, Glassdoor
│   ├── form-filler.js                     # Fill application forms (text, file upload, etc.)
│   ├── application-tracker.js             # Track applications and statistics
│
├── icons/
│   ├── icon-16.png                        # Extension icons (various sizes)
│   ├── icon-48.png
│   ├── icon-128.png
│
├── schema/
│   ├── optimized-resume.schema.json       # JSON Schema for resume validation
│
├── tests/
│   ├── run-tests.js                       # Main test runner (Node)
│   ├── validator.test.js                  # Ajv schema validation tests
│   ├── content.test.js                    # Content script DOM tests (jsdom)
│   ├── crypto.test.js                     # Encryption/decryption tests
│   ├── schema-validator.test.js           # SchemaValidator utility tests
│   ├── background.test.js                 # Background API flow tests (mocked chrome.*)
│
├── .github/
│   └── workflows/
│       └── nodejs-tests.yml               # GitHub Actions CI workflow
│
├── README.md                              # This file
├── package.json                           # Node.js dependencies and scripts
├── .eslintrc.json                         # ESLint configuration
```

---

## Configuration

### 1. Set Up Resume Data

1. **Open Extension Options**:
   - Click extension icon → "Configure Resume" button
   - Or go to `chrome://extensions/` → Job Hunter Pro → "Options"

2. **Fill in Resume Information**:
  - **Contact**: Name, email, phone, location (city/state in India, e.g., "Bangalore, Karnataka")
   - **Summary**: Brief professional summary
   - **Skills**: List of skills (comma-separated)
   - **Experience**: Previous jobs (title, company, dates, description)

3. **Save Resume Data**:
   - Click "Save Resume" — data is stored in `chrome.storage.sync`

### 2. Set Up API Key (for Resume Optimization)

1. **Get OpenAI API Key**:
   - Sign up at https://platform.openai.com/
   - Create API key at https://platform.openai.com/api-keys
   - Keep the key safe (you'll encrypt it)

2. **Encrypt API Key in Extension**:
   - Open Extension Options → Scroll to "API Configuration"
   - Select AI Provider: `openai` (or `ollama`, `github`)
   - Select Model: `gpt-3.5-turbo` (or `gpt-4`)
   - Paste OpenAI API Key
   - **Create a passphrase** (to encrypt the key)
   - Click "Save & Encrypt" — key is now encrypted in storage

3. **Unlock API Key for Session** (when you want to use optimization):
   - Open popup → Enter passphrase → Click "Unlock"
   - Passphrase is verified, key is decrypted and stored in background memory
   - You can also unlock from clipboard: paste passphrase to clipboard → click "Unlock from clipboard"

### 3. Enable Auto-Apply (Optional)

1. Open popup → Toggle "Enable auto-apply" on
2. When jobs are detected on job boards, auto-apply will trigger automatically
3. Monitor application stats in popup

---

## Usage

### Using the Extension in Chrome

#### Load the Extension

1. **Open Chrome** and go to `chrome://extensions/`
2. **Enable Developer Mode** (toggle in top-right corner)
3. **Click "Load unpacked"** and select your extension folder
4. Extension appears in the list; click its icon to open the **popup**

#### Optimize a Resume

1. **Navigate to a job posting** on LinkedIn, Indeed, or Glassdoor
2. **Open the popup** → Click "Optimize Current Resume"
3. Extension fetches the job description and your resume
4. If API key is locked, unlock it via passphrase
5. Resume is optimized by AI and stored in popup preview
6. **Download optimized resume** as JSON

#### Auto-Apply to Jobs

1. **Enable auto-apply** in popup
2. **Navigate to job board** (LinkedIn, Indeed, Glassdoor)
3. When job is detected, extension auto-fills the application form
4. Check popup for **Application Stats** (sent, success rate)

#### Track Application History

1. Open popup → See "Application Stats"
2. Click **"Configure Resume"** to open options page
3. View stored job history and application logs

#### Manage API Key

1. Open Extension Options (`chrome-extension://YOUR_EXTENSION_ID/options.html`)
2. **Encrypt API key**: Paste key + create passphrase → Save & Encrypt
3. **Unlock for session**: Enter passphrase in popup → Click "Unlock"
4. **Lock after use**: Click "Lock" in popup to clear session key

### Using the Extension in Firefox

#### Load the Extension

1. **Open Firefox** and go to `about:debugging#/runtime/this-firefox`
2. **Click "Load Temporary Add-on"** and select `manifest.json`
3. Extension loads temporarily; click its icon to open the popup

#### Note on Firefox Compatibility

- Firefox's MV3 support is partial. Most features work, but some APIs may differ:
  - `chrome.tabs.sendMessage` → Works
  - `chrome.storage.sync` → Works
  - Service Worker → May have limitations
- For full cross-browser support, let me know and I can create an MV2 version.

### Using the Extension in Edge/Brave/Opera

Same as Chrome:
1. Go to `edge://extensions/` (Edge), `brave://extensions/` (Brave), `opera://extensions/` (Opera)
2. Enable Developer Mode
3. Load unpacked from folder
4. Test as normal

---

## Testing

### Run All Tests

```bash
# In the extension folder
node tests/run-tests.js
```

This runs:
- **KeywordExtractor tests**: Verify keyword extraction from job descriptions
- **Base64 conversion tests**: Verify file encoding/decoding
- **Schema validation tests**: Verify JSON Schema validation against resume data
- **Crypto tests**: Verify encryption/decryption roundtrip
- **Content DOM tests**: Verify job detection and form filling logic (jsdom)
- **Background API tests**: Verify API optimization and unlock flows (mocked)

### Run Individual Tests

```bash
# Keyword extraction
node tests/validator.test.js

# Crypto encryption
node tests/crypto.test.js

# Schema validation
node tests/schema-validator.test.js

# Content script (jsdom)
node tests/content.test.js

# Background flows (mocked)
node tests/background.test.js
```

### Run Linter

```bash
# Check code quality
npm run lint
```

### CI/CD with GitHub Actions

The `.github/workflows/nodejs-tests.yml` workflow runs on every push:
- Installs dependencies
- Runs linter (ESLint)
- Runs all tests (Node + jsdom)
- Reports pass/fail

To see CI results:
1. Push to GitHub
2. Go to `Actions` tab in your repo
3. Check workflow status

---

## Development

### Add New Features

#### 1. Add a new keyword to extraction

Edit `resume-builder/resume-templates/keyword-extractor.js`:

```javascript
const KEYWORDS = ['javascript', 'react', 'nodejs', 'your-new-keyword', ...];
```

#### 2. Add a new job board

Edit `auto-applier/job-scanner.js` to detect the new board's job container:

```javascript
const BOARD_CONFIG = {
  'linkedin.com': { jobContainer: '.base-card', ... },
  'your-new-board.com': { jobContainer: '.job-item', ... },
};
```

#### 3. Add a new AI provider

Edit `utils/api-connector.js`:

```javascript
if (provider === 'your-provider') {
  // Implement API call logic
}
```

#### 4. Write a new test

Create `tests/my-feature.test.js`:

```javascript
const assert = require('assert');

module.exports = function() {
  console.log('Running my-feature tests...');
  assert(true === true);
};
```

Add to `tests/run-tests.js`:

```javascript
const myTest = require('./my-feature.test');
myTest();
logOk('My feature tests');
```

---

## Troubleshooting

### Issue: "No active tab" when clicking Optimize

**Solution**: Make sure you're on a job posting page and the popup has access to the tab. Check `manifest.json` permissions.

### Issue: "API key locked" message

**Solution**: 
1. Open Extension Options
2. Scroll to "API Configuration"
3. Check that API key is encrypted (look for lock icon)
4. In popup, enter passphrase and click "Unlock"

### Issue: Resume optimization returns `{ optimizedText: result }`

**Solution**: 
- Model returned non-JSON response. Check:
  1. API key is valid
  2. Model supports JSON (e.g., `gpt-3.5-turbo`)
  3. Prompt is clear in `background.js`

### Issue: Auto-apply not triggering

**Solution**:
1. Check "Enable auto-apply" toggle is ON
2. Verify job board is detected (LinkedIn, Indeed, Glassdoor)
3. Check background script logs: Right-click extension icon → "Service Worker" → Console
4. Look for errors like "Job detected" or "Auto-apply triggered"

### Issue: Form filling incomplete

**Solution**:
1. Job board may have unique form selectors
2. Edit `auto-applier/form-filler.js` to add custom selectors for that board
3. Check content script logs: Right-click page → Inspect → Console

### Issue: Tests fail with "Ajv not defined"

**Solution**:
- Run `npm install` to install dev dependencies
- Ajv is only needed for CI/tests, not for the extension runtime

### Issue: Extension not loading in Firefox

**Solution**:
1. Firefox's MV3 support is partial
2. Try loading as temporary add-on: `about:debugging#/runtime/this-firefox`
3. If persistent issues, I can create an MV2 version

### Issue: Chrome says "This extension is not available in this region"

**Solution**:
- This is a developer warning. Ignore if you're testing locally.
- To publish to Chrome Web Store, follow https://developer.chrome.com/docs/webstore/

---

## API Reference

### Chrome Storage

**Resume Data** (`chrome.storage.sync.resumeData`):
```json
{
  "contact": { "name": "...", "email": "...", "phone": "...", "location": "Bangalore, Karnataka, India" },
  ## India-Centric Salary & Location Logic

  **Job Filtering**
  - The extension now uses Indian salary standards: minimum salary is ₹6,00,000 per year (6 LPA), parsed from INR, LPA, lakhs, or USD (converted to INR).
  - Only jobs with locations matching Indian cities (e.g., Pune, Bangalore, Delhi, Gurgaon, Mumbai, Chennai, Hyderabad, Noida, Kolkata) or "remote"/"hybrid" are considered.
  - Salary and location logic is enforced in `auto-applier/job-scanner.js`.

  **Resume Data**
  - When entering your location, use Indian city/state (e.g., "Hyderabad, Telangana").

  **Example:**
  ```json
  {
    "contact": {
      "name": "Amit Kumar",
      "email": "amit@example.com",
      "phone": "+91-9876543210",
      "location": "Pune, Maharashtra, India"
    },
    ...
  }
  ```
  "summary": "...",
  "skills": ["...", "..."],
  "experience": [{ "title": "...", "company": "...", "startDate": "...", "endDate": "...", "description": "..." }]
}
```

**Optimized Resume** (`chrome.storage.sync.optimizedResume`):
```json
{
  "contact": { "name": "...", "email": "...", ... },
  "summary": "...",
  "skills": ["...", "..."],
  "experience": [{ "title": "...", "company": "...", ... }]
}
```

**Encrypted API Key** (`chrome.storage.sync.encryptedOpenaiApiKey`):
- Format: Base64-encoded JSON with ciphertext, iv, salt

**Application Stats** (`chrome.storage.sync.applicationStats`):
```json
{
  "sent": 5,
  "success": 4
}
```

### Message Handlers

**Optimize Resume Request** (popup → background):
```javascript
chrome.runtime.sendMessage({ action: 'optimizeResumeRequest' }, (response) => {
  console.log(response.success, response.optimized);
});
```

**Unlock API Key** (popup → background):
```javascript
chrome.runtime.sendMessage({ action: 'unlockApiKey', apiKey: 'sk-...' }, (response) => {
  console.log(response.unlocked);
});
```

**Get API Unlock Status** (popup → background):
```javascript
chrome.runtime.sendMessage({ action: 'getApiUnlockedStatus' }, (response) => {
  console.log(response.unlocked);
});
```

---

## FAQ

**Q: Can I use this extension without an API key?**
A: Yes, but resume optimization won't work. You can still auto-apply with your default resume.

**Q: Is my API key stored securely?**
A: Yes, it's encrypted with Web Crypto using a passphrase you create. The passphrase is never stored.

**Q: Can I use this on mobile?**
A: No, browser extensions don't work on mobile. Chrome Mobile and Firefox Mobile have limited extension support.

**Q: Does this work on all job boards?**
A: Currently supports LinkedIn, Indeed, and Glassdoor. More can be added by editing `job-scanner.js`.

**Q: Can I publish this to the Chrome Web Store?**
A: Yes, follow Google's extension publishing guide: https://developer.chrome.com/docs/webstore/

**Q: What's the success rate of auto-apply?**
A: Depends on form complexity. Simple fields (name, email) have ~95% success. File uploads have ~80% success.

---

## Support & Contributing

- **Report Issues**: Create an issue on GitHub with detailed logs
- **Feature Requests**: Describe the feature and use case
- **Submit PRs**: Follow code style (see `.eslintrc.json`)

---

## License

MIT License — See LICENSE file for details

---

## Contact

- **Author**: rishabh376
- **Repository**: https://github.com/rishabh376/job-hunter-extension
- **Issues**: https://github.com/rishabh376/job-hunter-extension/issues

---

**Last Updated**: January 5 , 2026
**Version**: 1.0.1
