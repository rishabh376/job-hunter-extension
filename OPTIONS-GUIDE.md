# ---
# **Copyright © 2025 Rishabh376**
# Author: Rishabh376  
# GitHub: https://github.com/rishabh376/job-hunter-extension
# This documentation and code are original works. Please credit the author and project if reused.
# ---
# <img src="https://img.icons8.com/color/96/rocket.png" width="48" height="48" style="vertical-align:middle;"/> **Job Hunter Extension**
# <img src="https://img.icons8.com/color/96/settings.png" width="32" height="32" style="vertical-align:middle;"/> **Options Page Features Guide**

# Google Generative Language API Support

### How to Set Up Google Provider
1. In the Options page, select "Google" as your AI provider.
2. Enter your Google API key (from Google Cloud Console > APIs & Services > Credentials).
3. Enter the model name (e.g., `models/text-bison-001`). For Google, the model path is part of the URL.
4. Click "Validate API Key" or "Test & Save Everything" to confirm your setup.

### Message Conversion
When using Google, chat-style messages are converted to a single prompt (role: content concatenation). This works for most validations and prompts. For advanced chat-like flows, the extension can be adapted to use Google’s recommended message schema.

### Quotas and Billing
Google Generative Language API calls are billed per token and subject to quota. Use small `maxOutputTokens` for validation and initial tests to avoid excessive charges.

### Permissions
The extension requires host permissions for `generativelanguage.googleapis.com` and `*.googleapis.com` (already included in manifest.json). Only API key usage is supported; OAuth would require a larger change.

### Tips & Recommendations
- Use explicit model names (e.g., `models/text-bison-001`).
- Validate your API key before saving.
- Monitor quota usage in Google Cloud Console.
- For advanced chat flows, request support for Google’s structured message schema.

# Options Page Features Guide

## Overview
The Options page has been significantly enhanced with security-first UX patterns, async/await architecture, and one-click validation flows.

## Feature 1: API Key Encryption & Passphrase

### Setup Flow
1. **Enter API Key** in the "OpenAI API Key" field
2. **Set Passphrase** in the "Passphrase for Encryption" field
3. Click **"Encrypt & Save API Key"** button
4. ✅ Confirmation: "Encrypted API key saved"

### Why Encrypt?
- API key never stored in plain text
- Passphrase-protected with PBKDF2 + AES-GCM encryption
- Encrypted blob stored in `chrome.storage.sync`

## Feature 2: Session Unlock with Passphrase

### Unlock Flow
1. Enter your **Passphrase** in the "Passphrase for Encryption" field
2. Click **"Unlock API Key for Session"** button
3. ✅ Confirmation: "API key unlocked for session"
4. **Session Status** shows: "✅ API key unlocked for session"

### What Happens?
- Passphrase is used to decrypt your API key
- Decrypted key is sent to the background service worker
- Key is held **in-memory only** during your session
- Key automatically cleared when browser closes

## Feature 3: Plain Key Storage Warning (⚠️ NOT RECOMMENDED)

### Enable Plain Key Storage
1. Check the checkbox: **"Allow storing plain API key"**
2. ⚠️ **Security Warning Modal Appears**
3. Modal warns: "Storing your API key in plain text is a security risk"
4. Click **"I Understand"** to confirm risk
5. Or click **"Cancel"** to revert checkbox

### Why Use Encrypted Instead?
- ✅ Encryption recommended (3x safer)
- ✅ Passphrase protection prevents unauthorized access
- ✅ No additional security vulnerabilities
- ❌ Plain storage puts key at risk if device is compromised

### When to Use Plain Storage?
- **Local development only** on isolated devices
- **Never in production** or shared environments
- **Never for high-privilege keys** with sensitive permissions

## Feature 4: Validate API Key

### Validate Without Encryption
1. Enter your **API Key** (plain, not encrypted)
2. Confirm **AI Provider** is set correctly
3. Click **"Validate API Key"** button
4. Low-cost ping test sent to API provider
5. ✅ Shows: "Validation succeeded"
6. Result displayed below button

### Validate Before Encryption
1. Enter your **API Key** and **Passphrase**
2. Click **"Validate & Encrypt"** button
3. API key tested first (validates before committing)
4. ✅ If valid: API key is encrypted and saved
5. ❌ If invalid: Shows error, key not saved

## Feature 5: Test & Save (Recommended 🌟)

### All-In-One Setup Flow
1. Enter your **Resume Data** (name, email, phone, etc.)
2. Enter your **API Key** (will be validated)
3. Enter your **Passphrase** (optional, for encryption)
4. Click **"Test & Save Everything"** button

### What Happens Automatically
1. ✅ **Tests API Key** with validation call
2. ✅ **If valid**: Saves all settings in one operation
3. ✅ Shows validation result
4. ✅ Shows confirmation: "All settings saved successfully"

### What Gets Saved
- Resume data (name, email, phone, city, state)
- Uploaded resume file
- AI provider selection (OpenAI, GitHub Models, Ollama)
- AI model selection (gpt-3.5-turbo, gpt-4, etc.)
- Plain API key (if "Allow plain storage" is checked)

### Error Handling
- ❌ "No API key provided" - Paste your key first
- ❌ "Key is encrypted. Unlock it first" - Click "Unlock API Key for Session"
- ❌ "Validation failed: [error]" - Check key and model name
- ❌ "All settings saved" - Shows status even if key validation was skipped

## Feature 6: Session Status Display

### Status Indicators

**Locked State:**
```
🔒 API key locked
```
- Shown when no key is currently decrypted
- Plain/encrypted key in storage but not in-memory
- No jobs can be auto-applied until unlocked

**Unlocked State:**
```
✅ API key unlocked for session
```
- Shown after clicking "Unlock API Key for Session"
- Decrypted key available in-memory
- Auto-apply jobs can use the API
- Status persists until browser close or extension reload

### Status Updates
- Status auto-updates when you click:
  - "Unlock API Key for Session"
  - "Encrypt & Save API Key" (if not previously unlocked)
  - "Test & Save Everything" (no change to status)

## Feature 7: Resume File Upload

### File Upload
1. Click **"Choose File"** button
2. Select your resume (PDF, DOCX, or text)
3. File shows: "Selected: filename.pdf (250 KB)"
4. File is held in-memory until **"Save"** is clicked

### File Size Limits
- **Maximum 5 MB** per resume
- Prevents huge storage uploads
- Checks file size before processing

### File Processing
- Converted to Base64 data URL
- Stored in `chrome.storage.sync`
- Available to content scripts for job application
- Used by resume optimizer for keyword extraction

## Feature 8: Email Validation

### Validation Rules
- Email field is **optional**
- If provided, must be valid email format
- Examples:
  - ✅ `user@example.com` - Valid
  - ✅ `john.doe+jobs@company.co.uk` - Valid
  - ❌ `user@` - Invalid (missing domain)
  - ❌ `user.example.com` - Invalid (missing @)
  - ❌ `user @example.com` - Invalid (space)

### Validation Feedback
- ❌ "Please enter a valid email address" - If invalid
- ✅ Email saved if valid or empty

## Keyboard Shortcuts & Tips

### Speed Up Setup
1. Tab through fields to move quickly
2. Enter → Auto-validates email format
3. Paste API key → Tab to next field → Click "Test & Save"

### Common Issues

**Issue: "Key is encrypted. Unlock it first"**
- Solution: Click "Unlock API Key for Session" button
- You need to enter the passphrase first

**Issue: "Validation failed: 401 Unauthorized"**
- Solution: Check your API key is correct (copy from OpenAI website)
- Make sure there are no leading/trailing spaces

**Issue: "Validation failed: 429 Too Many Requests"**
- Solution: Wait a few seconds before retrying
- OpenAI has rate limits for API calls

**Issue: "Save failed"**
- Solution: Check browser console (F12) for error details
- Try clearing cache/cookies and reload page

## Best Practices

### Security Best Practices ✅
1. ✅ Use **encrypted storage** with passphrase (recommended)
2. ✅ Use **session-only unlock** for daily use
3. ✅ Use **strong passphrase** (mix of upper/lower/numbers/symbols)
4. ✅ **Never share** your passphrase or API key
5. ✅ **Rotate keys** if accidentally exposed

### UX Best Practices ✅
1. ✅ Use **"Test & Save Everything"** for quickest setup
2. ✅ **Validate before encrypting** to catch errors early
3. ✅ **Unlock once per session** then enjoy auto-apply
4. ✅ Check **Session Status** display to verify unlock state

### Avoid ❌
1. ❌ Sharing encrypted key file with passphrase in messages
2. ❌ Using same passphrase as other accounts
3. ❌ Leaving API key in browser history
4. ❌ Enabling "Allow plain storage" in shared environments

## Architecture Details

### Storage Promise Pattern
All storage operations use `StoragePromise` for clean async/await:

```javascript
// Load settings
const data = await StoragePromise.get(['apiProvider', 'apiModel']);

// Save settings
await StoragePromise.set({ apiProvider: 'openai', apiModel: 'gpt-4' });

// Remove settings
await StoragePromise.remove(['encryptedOpenaiApiKey']);
```

### Error Handling
All handlers use try/catch with user-friendly messages:

```javascript
try {
  const result = await ApiConnector.call({ /* config */ });
  setStatus(apiStatus, '✅ Success message', 3000);
} catch (err) {
  const msg = err?.message || String(err);
  setStatus(apiStatus, '❌ Error: ' + msg, 6000);
}
```

## Testing the Options Page

### Manual Testing Checklist
- [ ] Load extension in Chrome/Edge/Firefox
- [ ] Go to `chrome-extension://.../options.html`
- [ ] Enter resume data and save
- [ ] Enter API key and click "Validate"
- [ ] Click checkbox for "Allow plain key" and see modal
- [ ] Click "Encrypt & Save API Key"
- [ ] Click "Unlock API Key for Session"
- [ ] Verify session status changes to "✅ API key unlocked"
- [ ] Click "Test & Save Everything" and verify all settings save
- [ ] Reload page and verify settings persist
- [ ] Check `chrome.storage.sync` (in developer tools) for saved data

### Automated Tests
```bash
npm install  # Install dev dependencies
node tests/run-tests.js  # Run test suite
```

All tests should pass:
- ✅ Crypto helper tests (encryption/decryption)
- ✅ Schema validator tests (resume data validation)
- ✅ FileUtils tests (base64 encoding)
- ✅ Content DOM tests (DOM extraction)
