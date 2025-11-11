Running tests

This repository includes a tiny Node-based test runner (no external dependencies) that verifies the keyword extractor and base64 conversion helper.

Prerequisites: Node.js (>=12)

From the project root run:

```powershell
node .\tests\run-tests.js
```

If tests fail, the script will exit with a non-zero code and print a failing message.

Notes:
- These tests are lightweight unit checks intended for local developer convenience.
- They do not run browser-specific code (e.g., File objects).
