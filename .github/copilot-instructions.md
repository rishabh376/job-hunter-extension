# Copilot Instructions for Job Hunter Pro Extension

## Project Overview
- This is a Chrome/Firefox extension (Manifest V3) for AI-powered job hunting, resume optimization, and automated job application.
- Major features: job detection, resume optimization (OpenAI/Ollama/GitHub Models), auto-apply, encrypted API key management, and application tracking.

## Architecture & Key Components
- **background.js**: Service worker for job tracking, API calls, and session management.
- **content.js**: Content script for job detection, DOM extraction, and form filling.
- **popup.js/html/css**: UI for stats, resume optimization, and unlocking API keys.
- **options.js/html**: Resume configuration and API key encryption.
- **utils/**: Shared utilities (API connector, crypto, logger, storage, schema validation).
- **resume-builder/**: Resume templates, keyword extraction, and optimization logic.
- **auto-applier/**: Job scanner (multi-board), form filler, and application tracker.
- **schema/**: JSON Schema for resume validation (Ajv).
- **tests/**: Node-based tests for all major modules, run via `node tests/run-tests.js`.

## Developer Workflows
- **Install dependencies**: `npm install`
- **Run all tests**: `node tests/run-tests.js`
- **Run individual tests**: `node tests/<test-file>.js`
- **Lint code**: `npm run lint`
- **CI/CD**: GitHub Actions workflow in `.github/workflows/nodejs-tests.yml` runs tests and linter on push.
- **Load extension**: Use "Load unpacked" in Chrome/Edge/Brave/Opera or "Load Temporary Add-on" in Firefox.

## Project-Specific Patterns
- **Encrypted API keys**: Use `options.js` for encryption/decryption with passphrase; keys stored in `chrome.storage.sync`.
- **Schema validation**: Resume data validated against `schema/optimized-resume.schema.json` using Ajv (browser and Node).
- **Job board detection**: Add new boards in `auto-applier/job-scanner.js` by updating `BOARD_CONFIG`.
- **Keyword extraction**: Extend keywords in `resume-builder/resume-templates/keyword-extractor.js`.
- **AI provider integration**: Add new providers in `utils/api-connector.js`.
- **Logging**: Use `utils/logger.js` for both console and persistent logs.
- **Application tracking**: Stats and history managed via `auto-applier/application-tracker.js` and displayed in popup.

## Integration Points
- **OpenAI API**: Used for resume optimization; API key encrypted and unlocked per session.
- **Ollama/GitHub Models**: Supported as alternative AI providers.
- **Chrome/Firefox APIs**: Storage, tabs, messaging, and service worker APIs used throughout.

## Example Patterns
- To add a job board: update `BOARD_CONFIG` in `auto-applier/job-scanner.js`.
- To add a keyword: update `KEYWORDS` in `resume-builder/resume-templates/keyword-extractor.js`.
- To add a test: create a new file in `tests/` and require it in `tests/run-tests.js`.

## References
- See [README.md](../../README.md) for full documentation and troubleshooting.
- See `.github/workflows/nodejs-tests.yml` for CI setup.
- See `schema/optimized-resume.schema.json` for resume validation rules.

---
**If any section is unclear or missing, please provide feedback for further refinement.**
