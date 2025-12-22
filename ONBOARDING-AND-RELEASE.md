# Job Hunter Pro Extension — Onboarding, Testing, and Release Guide

---

## 1. Onboarding Wizard (User Experience)

### Purpose
- Guide new users through initial setup: provider selection, model/API key entry, resume upload, and test connection.

### Steps
1. **Welcome Screen**: Brief intro, "Get Started" button.
2. **Provider Selection**: Dropdown for OpenAI, Google, Ollama, LM Studio. Inline help for each.
3. **Model/API Key Entry**: Show/hide fields based on provider. Passphrase option for encryption.
4. **Resume Upload**: Prompt to upload or paste resume data.
5. **Test Connection**: Button to verify provider/model/API key (shows real-time status).
6. **CORS Proxy Help**: If local provider, show CORS proxy instructions and endpoint override.
7. **Finish**: Confirmation, tips, and link to documentation.

### Implementation
- Add onboarding.html/onboarding.js (modal or first-run page).
- Store onboarding completion flag in chrome.storage.sync.
- Auto-launch wizard if not completed.

---

## 2. Automated & Manual Testing

### Automated Tests
- Add tests for:
  - Provider/model/API key validation logic
  - Encryption/decryption flows
  - Storage and retrieval of all settings
  - CORS proxy endpoint override
  - Error handling (missing fields, network errors)
- Use Node.js and jsdom for DOM-based tests (see tests/ directory for patterns).
- Example: `node tests/options.test.js`

### Manual QA
- Test all providers (OpenAI, Google, Ollama, LM Studio) on Chrome, Edge, Firefox.
- Test onboarding wizard, CORS proxy, and endpoint override.
- Test error messages, help text, and UI flows.

---

## 3. Store Packaging (Chrome Web Store, Firefox Add-ons)

### Manifest & Assets
- Ensure manifest.json is Manifest V3, with correct permissions and icons.
- Add screenshots, promo images, and a clear description.
- Write a privacy policy (link in manifest and store listing).

### Build & Lint
- Run `npm run lint` and all tests before packaging.
- Remove dev-only/test files from release zip.

### Submission
- Chrome: Go to https://chrome.google.com/webstore/devconsole, upload zip, fill out listing.
- Firefox: Go to https://addons.mozilla.org/en-US/developers/, upload zip, fill out listing.
- Respond to any review feedback (permissions, privacy, etc.).

---

## 4. Documentation & Support
- Update README.md and OPTIONS-FULL-EXECUTION.md for all new features.
- Add FAQ and troubleshooting section.
- Provide contact/support email or GitHub issues link.

---

## 5. Security & Privacy Review
- Double-check API key handling, encryption, and storage.
- Minimize permissions in manifest.json.
- Ensure no analytics or tracking without user consent.

---

## 6. Post-Launch
- Monitor user feedback and crash reports.
- Patch and update as needed.
- Announce release on relevant channels (GitHub, social, etc.).

---

For code samples, UI wireframes, or implementation of any step, just ask!
