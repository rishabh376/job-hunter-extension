# Manual Testing, Beta Testing & Deployment Guide

Complete step-by-step instructions for testing and deploying the Job Hunter extension.

---

## PHASE 1: MANUAL TESTING (2-3 hours)

### Part A: Load Extension in Chrome

#### Step 1: Open Chrome Extensions Page
1. Open **Google Chrome** browser
2. Click the **three-dot menu** (top-right corner)
3. Go to **More tools** → **Extensions**
   - Or paste this in address bar: `chrome://extensions`
4. You should see the Extensions management page

#### Step 2: Enable Developer Mode
1. In the top-right corner, toggle **Developer mode** ON
   - The toggle should turn blue
2. Three new buttons appear: "Load unpacked", "Pack extension", "Update"

#### Step 3: Load the Extension
1. Click **"Load unpacked"** button
2. Navigate to your extension folder:
   ```
   C:\Devops\Code-Samples\job-hunter-extension
   ```
3. Select the folder (the one containing `manifest.json`)
4. Click **"Select Folder"**

#### Step 4: Verify Extension Loaded
- You should see "Job Hunter Pro" listed in your extensions
- A puzzle icon appears in the top-right of Chrome (extension icon)
- If you see an error: Check that `manifest.json` exists and has no syntax errors

#### Step 5: Open Options Page
1. In the Extensions list, find "Job Hunter Pro"
2. Click **Details** button
3. Scroll down, find **"Extension options"**
4. Click **"Extension options"** link
5. The Options page opens in a new tab

**Expected Result**: Options page loads with all form fields visible

---

### Part B: Load Extension in Edge

#### Step 1: Open Edge Extensions Page
1. Open **Microsoft Edge** browser
2. Click the **three-dot menu** (top-right corner)
3. Go to **Extensions** → **Manage extensions**
   - Or paste this in address bar: `edge://extensions`

#### Step 2: Enable Developer Mode
1. In the bottom-left corner, toggle **Developer mode** ON
   - The toggle should turn blue

#### Step 3: Load the Extension
1. Click **"Load unpacked"** button
2. Navigate to: `C:\Devops\Code-Samples\job-hunter-extension`
3. Select the folder
4. Click **"Select Folder"**

#### Step 4: Verify & Open Options
- Same as Chrome steps 4-5 above
- Options page should look identical to Chrome version

---

### Part C: Load Extension in Firefox

#### Step 1: Open Firefox Add-ons Page
1. Open **Mozilla Firefox** browser
2. Click the **hamburger menu** (top-right corner)
3. Go to **Add-ons and themes** (or press Ctrl+Shift+A)
4. You see the Add-ons management page

#### Step 2: Load Temporary Add-on
1. Press **Ctrl+Shift+K** to open Web Developer Console
   - Or go to top-right menu → **More tools** → **Web Developer Tools**
2. Click the **Console** tab
3. In the console, type:
   ```javascript
   // Don't actually type this - use the UI method below instead
   ```

**Better Method - Use about:debugging**:
1. Paste in address bar: `about:debugging#/runtime/this-firefox`
2. Click **"Load Temporary Add-on"**
3. Navigate to `C:\Devops\Code-Samples\job-hunter-extension`
4. Select **`manifest.json`** file
5. Click **Open**

#### Step 3: Verify & Open Options
1. Look for "Job Hunter Pro" in the add-ons list
2. Click the extension name or icon
3. Options page should open (or go to `about:addons` and click it)

**Note**: Firefox temporary add-ons expire when you close the browser - reload them on next startup

---

### Part D: Test the Options Page UI

#### Step 1: Verify Page Layout (All Browsers)
Go through this checklist:

- [ ] Resume data section visible (Name, Email, Phone, City, State)
- [ ] Resume file upload button visible
- [ ] "Choose File" button works
- [ ] AI Provider dropdown visible (OpenAI, GitHub Models, Ollama)
- [ ] OpenAI API Key field visible
- [ ] AI Model dropdown visible
- [ ] Save button visible
- [ ] Clear button visible
- [ ] Encrypt & Save API Key button visible
- [ ] Unlock API Key for Session button visible
- [ ] Passphrase field visible
- [ ] Validate API Key button visible
- [ ] Validate & Encrypt button visible
- [ ] Test & Save Everything button visible (NEW)
- [ ] "Allow storing plain API key" checkbox visible (NEW)
- [ ] Session status display visible (NEW)

**Expected Result**: All elements render correctly, no layout broken

---

### Part E: Test Resume Data Flow

#### Test 1: Enter Resume Data
1. Scroll to "Resume Data" section
2. Enter your info:
   - **First Name**: John
   - **Last Name**: Doe
   - **Email**: john.doe@example.com
   - **Phone**: 555-123-4567
   - **City**: San Francisco
   - **State**: CA

#### Test 2: Save Resume Data
1. Scroll to the bottom
2. Click **"Save"** button
3. You should see: ✅ **"Saved"** message (appears for 2 seconds then disappears)
4. The status line turns green briefly

#### Test 3: Verify Data Persists
1. Press **F5** to reload the page
2. All your entered data should still be there
3. Check Chrome DevTools (F12) → Application → Storage:
   - Go to **chrome-extension://[ID]/options.html**
   - Check **Storage** → **Session Storage** or **Local Storage**
   - You should see your resume data saved

#### Test 4: Clear Data
1. Click **"Clear"** button
2. All fields should become empty
3. You should see: ✅ **"Cleared"** message
4. Reload (F5) - data stays empty (confirmed clear)

**Expected Result**: Data saves, persists on reload, and clears properly

---

### Part F: Test Email Validation

#### Test 1: Valid Email (Should Save)
1. Enter in Email field: `test@company.com`
2. Click **Save**
3. Should see: ✅ **"Saved"** message

#### Test 2: Invalid Email #1 (No @)
1. Enter in Email field: `testcompany.com`
2. Click **Save**
3. Should see: ❌ **"Please enter a valid email address"**
4. Data does NOT save

#### Test 3: Invalid Email #2 (No domain)
1. Enter in Email field: `test@`
2. Click **Save**
3. Should see: ❌ **"Please enter a valid email address"**

#### Test 4: Empty Email (Should Save)
1. Leave Email field empty
2. Click **Save**
3. Should see: ✅ **"Saved"** message (email is optional)

**Expected Result**: Valid emails save, invalid emails show error, empty is allowed

---

### Part G: Test Resume File Upload

#### Step 1: Prepare Test File
1. Create a test resume file (any format):
   - PDF, DOCX, or TXT file
   - Name it: `test-resume.pdf`
   - Keep it small (<5MB)

#### Step 2: Upload Small File
1. Scroll to Resume section
2. Click **"Choose File"** button
3. Select your test resume
4. You should see: **"Selected: test-resume.pdf (XXX KB)"**
5. File name appears below button

#### Step 3: Save with File
1. Click **"Save"** button
2. Should see: ✅ **"Saved"** message
3. File is now uploaded

#### Step 4: Reload & Verify
1. Press **F5** to reload
2. You should see: **"Saved file: test-resume.pdf"** message
3. File persists in storage

#### Test 5: File Size Limit
1. Click **"Choose File"** again
2. Try to select a file larger than 5MB
3. You should see: ❌ **"File too large (XXXX KB). Max 5MB."**
4. File is NOT uploaded

**Expected Result**: Files upload, persist, show name, and size limit is enforced

---

### Part H: Test API Key Encryption & Storage

#### Test 1: Encrypt API Key (Get a test key first)
**Note**: You'll need a real or test API key. For testing, use a fake key like:
```
sk-test-1234567890abcdefghijklmnop
```

1. Scroll to "OpenAI API Key" section
2. Enter your test API key
3. Enter a passphrase: `TestPass123!`
4. Click **"Encrypt & Save API Key"** button
5. You should see: ✅ **"Encrypted API key saved"**

#### Test 2: Verify Encrypted Key Stored
1. Check Chrome DevTools (F12):
   - Go to **Application** → **Storage** → **chrome.storage.sync**
   - Look for `encryptedOpenaiApiKey` - should exist
   - Look for `openaiApiKey` - should NOT exist (removed after encryption)

#### Test 3: Reload Page & Verify
1. Press **F5** to reload
2. You should see: ✅ **"Encrypted API key stored"** message below the button
3. API Key field is now EMPTY (encrypted key not shown)

#### Test 4: Unlock Key for Session
1. Enter your passphrase: `TestPass123!`
2. Click **"Unlock API Key for Session"** button
3. You should see: ✅ **"API key unlocked for session"**

#### Test 5: Check Session Status (NEW FEATURE)
1. Look for session status display (new in this update)
2. Should show: ✅ **"API key unlocked for session"** (green)
3. Color should be GREEN

#### Test 6: Reload & Verify Status Changes
1. Press **F5** to reload
2. Session status should change back to: 🔒 **"API key locked"** (gray)
3. This confirms session-only storage works

#### Test 7: Wrong Passphrase
1. Enter wrong passphrase: `WrongPass123!`
2. Click **"Unlock API Key for Session"**
3. Should see: ❌ **"Decrypt failed: [error message]"**
4. Key does NOT unlock with wrong passphrase

**Expected Result**: Encryption works, session status displays correctly, wrong passphrase fails

---

### Part I: Test Plain Key Storage Warning (NEW FEATURE)

#### Step 1: See the Warning Modal
1. Scroll to the **"Allow storing plain API key"** checkbox
2. Uncheck it (if checked)
3. Now CHECK it
4. A **MODAL** dialog should pop up with a warning:
   - Title: "⚠️ Security Warning"
   - Message: "Storing your API key in plain text is a security risk..."
   - Buttons: "Cancel" and "I Understand"

#### Step 2: Click Cancel
1. In the modal, click **"Cancel"** button
2. Modal should close
3. The checkbox should be UNCHECKED again (reverted)

#### Step 3: Click Confirm
1. Click the checkbox again
2. Modal appears again
3. Click **"I Understand"** button
4. Modal closes
5. Checkbox stays CHECKED

#### Step 4: Save with Plain Key Option
1. Enter an API key: `sk-test-1234567890`
2. Leave "Allow plain key" checkbox CHECKED
3. Click **"Save"** button
4. You should see: ⚠️ **"Plain API key saved (not recommended)"** message
5. This time the plain key was saved (because you opted-in)

**Expected Result**: Modal appears, Cancel reverts, Confirm keeps it checked, warning message shown

---

### Part J: Test "Test & Save Everything" Button (NEW FEATURE)

#### Step 1: Prepare Form (Valid Data)
Fill in the Options page form with:
- **First Name**: Jane
- **Email**: jane@example.com  
- **AI Provider**: openai
- **API Key**: `sk-test-1234567890abcd` (fake but valid format)
- Leave "Allow plain key" UNCHECKED (encrypted storage)

#### Step 2: Click Test & Save Everything
1. Scroll to find **"Test & Save Everything"** button (NEW)
2. Click it
3. You should see a sequence:

**First**: ✅ **"Testing API key..."** (while validation happens)

**Then**: ✅ **"Testing API key valid — saving settings..."** (validation succeeded)

**Finally**: ✅ **"All settings saved successfully"** (save completed)

#### Step 3: See Validation Result
1. Below the button, a validation result box appears
2. Should show the API response or success message
3. Example: `{"id":"chatcmpl-abc123","object":"chat.completion"...}`

#### Step 4: Reload & Verify All Saved
1. Press **F5** to reload page
2. All form fields still filled
3. Session status shows: 🔒 **"API key locked"** (because key was encrypted)

#### Test Failure Case: Invalid API Key
1. Clear API Key field
2. Click **"Test & Save Everything"**
3. You should see: ❌ **"No API key provided."**
4. Settings do NOT save

**Expected Result**: Button validates then saves all settings, success/error messages appear

---

### Part K: Test Validate API Key Button

#### Step 1: Enter Valid API Key
1. Paste a real OpenAI API key (if you have one)
2. Make sure AI Provider is "openai"
3. Click **"Validate API Key"** button
4. You should see: ✅ **"Validation succeeded"**
5. API response appears below

#### Step 2: Test with Invalid Key
1. Enter a fake key: `sk-wrong-key-12345`
2. Click **"Validate API Key"**
3. You should see: ❌ **"Validation failed: [error]"**
4. Example error: "401 Unauthorized" or "Invalid API key"

#### Step 3: Test with No Key
1. Clear the API Key field
2. Click **"Validate API Key"**
3. You should see: ❌ **"No API key provided. Paste your key or encrypt one first."**

**Expected Result**: Validation works with real keys, fails with invalid/missing keys

---

### Part L: Test Cross-Browser Consistency

Repeat Parts A-K in all three browsers:
1. ✅ Chrome (completed above)
2. ✅ Edge (same behavior as Chrome)
3. ✅ Firefox (same behavior as Chrome)

Create a checklist:

| Feature | Chrome | Edge | Firefox | Status |
|---------|--------|------|---------|--------|
| Page loads | ✅ | ✅ | ✅ | |
| Resume data saves | ✅ | ✅ | ✅ | |
| Email validation | ✅ | ✅ | ✅ | |
| File upload | ✅ | ✅ | ✅ | |
| Encryption works | ✅ | ✅ | ✅ | |
| Session status shows | ✅ | ✅ | ✅ | |
| Modal warning appears | ✅ | ✅ | ✅ | |
| Test & Save button | ✅ | ✅ | ✅ | |
| All buttons respond | ✅ | ✅ | ✅ | |

**Expected Result**: All features work identically across all browsers

---

### Part M: Check Console for Errors

#### Step 1: Open Developer Tools
1. Press **F12** in any browser
2. Click **Console** tab
3. Look for any red errors or warnings

#### Step 2: Go through all tests again
1. As you test features, watch the Console
2. Errors will show in RED
3. Warnings will show in YELLOW

**Expected Result**: No RED errors (warnings are okay), smooth operation

#### Step 3: Check Network Tab
1. Click **Network** tab
2. Click **"Validate API Key"** button
3. You should see API requests to `api.openai.com`
4. Requests should show as successful (green) or failed (red)
5. If red, check the response for error details

**Expected Result**: API calls work, responses received

---

### Part N: Final Manual Testing Checklist

Before moving to Beta Testing, verify:

- [ ] Extension loads in Chrome ✅
- [ ] Extension loads in Edge ✅
- [ ] Extension loads in Firefox ✅
- [ ] Options page UI looks good in all browsers ✅
- [ ] Resume data saves and persists ✅
- [ ] Email validation works ✅
- [ ] File upload works ✅
- [ ] Encryption/decrypt works ✅
- [ ] Session status displays correctly ✅
- [ ] Modal warning appears for plain key ✅
- [ ] Test & Save button works end-to-end ✅
- [ ] Validate API Key button works ✅
- [ ] No console errors in F12 ✅
- [ ] All buttons are responsive (no freezing) ✅
- [ ] Status messages appear at appropriate times ✅
- [ ] Reload persists encrypted keys (not plain text) ✅

**If ALL checkboxes are ✅, proceed to Phase 2: Beta Testing**

---

## PHASE 2: BETA TESTING (1 week)

### Part A: Recruit Beta Testers

#### Step 1: Identify Testers
You need 5-10 people to test:
- **Diverse experience levels**: Some tech-savvy, some not
- **Different job seekers**: People actually looking for jobs
- **Different browsers**: At least one person per browser (Chrome, Edge, Firefox)
- **Different OS**: Windows, Mac, Linux if possible

#### Step 2: Prepare Tester Instructions
Create a simple instruction document:
1. How to install the extension (see Phase 1 steps)
2. What to test (see testing checklist below)
3. How to report issues
4. Estimated time: 30-45 minutes

#### Step 3: Send to Testers
Email or message each tester:

**Subject**: "Help Test Job Hunter Pro Browser Extension"

**Body**:
```
Hi [Name],

I'm testing a new job hunting browser extension and would love your feedback!

The extension helps with:
- Auto-applying to jobs
- Optimizing resumes with AI
- Managing job applications

Testing takes about 30-45 minutes.

Here's what to do:
1. Download/load the extension (instructions attached)
2. Fill in your resume info in the Options page
3. Test the features (checklist attached)
4. Share feedback via this form: [link]

Thanks!
```

#### Step 4: Create Feedback Form
Use Google Forms or similar:

**Questions**:
1. What browser did you use? (Chrome/Edge/Firefox)
2. Did the extension load successfully? (Yes/No)
3. Was the Options page clear and easy to understand? (1-5 stars)
4. Did you encounter any errors? (Yes/No - if yes, describe)
5. What feature was most useful? (text)
6. What needs improvement? (text)
7. Would you use this extension? (Yes/No/Maybe)
8. Any other feedback? (text)

---

### Part B: Beta Testing Checklist for Testers

**Send this to each beta tester**:

```
BETA TESTING CHECKLIST

1. Installation
   [ ] Extension loads successfully
   [ ] No errors during installation
   [ ] Extension icon appears in toolbar

2. Options Page
   [ ] Page loads without freezing
   [ ] All fields are visible
   [ ] Text is readable (no layout issues)

3. Resume Data
   [ ] Can enter name, email, phone
   [ ] Can upload a resume file
   [ ] Data saves when clicking Save
   [ ] Data persists when refreshing page

4. API Key Setup
   [ ] Can enter API key
   [ ] Can set encryption passphrase
   [ ] Can encrypt the key
   [ ] Can unlock the key with passphrase
   [ ] Wrong passphrase shows error

5. Plain Key Warning (NEW)
   [ ] Modal warning appears when enabling plain storage
   [ ] Can cancel the warning
   [ ] Can confirm and enable plain storage
   [ ] Warning is clear about security risks

6. Session Status (NEW)
   [ ] Session status displays (locked/unlocked)
   [ ] Status updates after unlocking key
   [ ] Color changes (gray/green) clearly

7. Test & Save (NEW)
   [ ] Button exists and is clickable
   [ ] Shows validation status
   [ ] Saves all settings when valid
   [ ] Error message when API key missing

8. General
   [ ] No random errors or freezing
   [ ] All buttons respond quickly
   [ ] Status messages are clear
   [ ] Looks good in your browser

ISSUES FOUND:
(List any problems you encountered)

SUGGESTIONS FOR IMPROVEMENT:
(What could be better?)

Would you actually use this extension? YES / NO / MAYBE
```

---

### Part C: Monitor Feedback

#### Step 1: Collect Responses
1. Responses come in over 3-5 days
2. Create a spreadsheet to track:
   - Tester name
   - Browser used
   - Issues reported
   - Rating (1-5 stars)
   - Would use? (Yes/No)

#### Step 2: Categorize Issues
Group issues by severity:

**Critical** (blocks basic functionality):
- Extension won't load
- Data doesn't save
- Crashes on every click

**Important** (feature doesn't work as intended):
- Modal doesn't appear
- Encryption fails
- Wrong error messages

**Nice-to-Have** (polish/UX improvements):
- Button colors should be different
- Text should be larger
- Want remember password feature

#### Step 3: Fix Critical Issues
If Critical issues found:
1. Fix them immediately
2. Test the fix
3. Send updated extension to testers
4. Ask them to re-test

#### Step 4: Document Important Issues
Create a list:
1. Issue name
2. How to reproduce it
3. Expected behavior
4. Actual behavior
5. Priority (High/Medium/Low)

#### Step 5: Feedback Summary
Create a report:
```
BETA TESTING RESULTS
====================

Testers: 8 people
Browsers: Chrome (3), Edge (2), Firefox (3)
Average Rating: 4.5/5 stars

Critical Issues: 0
Important Issues: 2
Nice-to-Have: 3

Would Use Extension: 7/8 said Yes, 1 said Maybe

Top Feedback:
1. "[Issue #1]" - 5 testers mentioned
2. "[Issue #2]" - 3 testers mentioned
3. "[Suggestion]" - 2 testers suggested

Overall: Extension is ready for public release with minor improvements
```

---

### Part D: Make Improvements (If Needed)

#### For Critical Issues:
1. Fix immediately
2. Test thoroughly
3. Get testers to confirm fix
4. Document the fix

#### For Important Issues:
1. Fix before public release
2. Test in all browsers
3. Add to release notes

#### For Nice-to-Have:
1. Log for future versions
2. Don't delay release for these
3. Add to roadmap

---

### Part E: Close Beta Testing

#### Step 1: Thank Testers
Send thank-you message:
```
Hi [Testers],

Thank you SO much for testing Job Hunter Pro! Your feedback was invaluable.

We're making a few improvements based on your suggestions and will be 
launching publicly next week.

You'll get early access before anyone else - stay tuned!

Thanks again!
```

#### Step 2: Final Version Check
1. All critical issues fixed
2. All important issues fixed  
3. No new bugs introduced
4. All tests still passing
5. Documentation updated

#### Step 3: Create Release Notes
Document what's new:
```
JOB HUNTER PRO v1.4.0
Released: [Date]

NEW FEATURES
- Modal security warning for plain key storage
- One-click "Test & Save Everything" button
- Real-time session status display
- Improved error messages with guidance

IMPROVEMENTS
- Modernized Options page with async/await
- Better password encryption (PBKDF2 + AES-256-GCM)
- Enhanced validation for email and file uploads

BUG FIXES
- Fixed [issue #1]
- Fixed [issue #2]

SECURITY
- API keys now encrypted by default
- Added security warnings
- Session-only key access

COMPATIBILITY
- Chrome 90+
- Microsoft Edge 90+
- Firefox 91+
- Safari 15+
```

---

## PHASE 3: DEPLOYMENT (2-4 weeks per store)

### Part A: Deploy to Chrome Web Store

#### Step 1: Create Developer Account
1. Go to https://chrome.google.com/webstore/developer/dashboard
2. Sign in with Google account (or create one)
3. Pay **$5 one-time developer fee**
4. Accept terms and conditions
5. Verify your account with email

#### Step 2: Prepare Deployment Package
1. Create a folder: `job-hunter-extension-release`
2. Copy ALL files from your extension folder EXCEPT:
   - `.git/` folder
   - `node_modules/` folder
   - `.gitignore`
   - `package.json`
   - `package-lock.json`
   - `tests/` folder
   - `.github/` folder
   - Any documentation files (.md)

3. Create a `.crx` file (Chrome extension package):
   - Option 1 (Easiest): Let Chrome Web Store do this
   - Option 2 (Manual): Open `chrome://extensions` → Pack extension

#### Step 3: Create Store Listing
1. In developer dashboard, click **"New item"**
2. Click **"Choose file"** and select your extension folder
3. Upload the extension
4. Fill in required fields:

**App Details**:
- **Title**: Job Hunter Pro
- **Description**: (see below)
- **Category**: Productivity
- **Language**: English

**Description** (for store):
```
Job Hunter Pro helps you auto-apply to jobs and optimize your resume.

FEATURES:
✓ Auto-apply to job postings
✓ Optimize resume with AI (ChatGPT/OpenAI)
✓ Encrypted API key storage
✓ Support for multiple AI providers

SECURITY:
✓ Your API key is encrypted
✓ Passphrases protected with military-grade encryption
✓ No data collection or logging
✓ Open source

INSTRUCTIONS:
1. Save your resume in Options
2. Add OpenAI API key (encrypted)
3. Enable auto-apply
4. Click "Apply" on job postings!

Supports: ChatGPT API, GitHub Models, Local Ollama

Issues? Visit: https://github.com/rishabh376/job-hunter-extension
```

#### Step 4: Upload Screenshots/Icons
1. Chrome Web Store needs:
   - **Icon**: 128x128 pixels
   - **Screenshots**: 1280x800 pixels (upload 3-5)
   - **Promotional Image**: 920x680 pixels (optional)

2. Create screenshots showing:
   - Options page
   - Job listing with extension active
   - Resume auto-fill feature

#### Step 5: Set Pricing & Distribution
1. **Pricing**: Select "Free"
2. **Content Rating**: Fill out rating questionnaire
3. **Privacy**: 
   - Check "I comply with Chrome Web Store policies"
   - Check "I comply with Google's developer policies"

#### Step 6: Review & Submit
1. Click **"Review"**
2. Check all information is correct
3. Click **"Submit for review"**
4. Google reviews your extension (usually 2-4 hours)
5. You'll receive email when approved or rejected

#### Step 7: After Approval
1. Extension appears in Chrome Web Store
2. Share the store link: 
   ```
   https://chrome.google.com/webstore/detail/[YOUR_ID]/
   ```
3. Users can now install directly from store

---

### Part B: Deploy to Firefox Add-ons

#### Step 1: Create Mozilla Account
1. Go to https://addons.mozilla.org
2. Click **"Sign up"** (top-right)
3. Create account with email
4. Verify email address
5. Go to https://addons.mozilla.org/developers

#### Step 2: Submit Your Add-on
1. Click **"Submit a new add-on"** or **"My submissions"**
2. Click **"Upload New Version"**
3. Choose **"Firefox"** as platform
4. Select **"Manifest v3"** (matches your current setup)
5. Upload a ZIP file containing:
   - manifest.json
   - background.js
   - content.js
   - options.html, options.js, popup.html, popup.js
   - All files in /utils folder
   - All files in /auto-applier folder
   - All files in /resume-builder folder
   - icons/ folder

#### Step 3: Create ZIP Package
On Windows:
1. Right-click the extension folder
2. Send to → Compressed (zipped) folder
3. Rename to: `job-hunter-pro.zip`

Or use PowerShell:
```powershell
# In the extension directory
Compress-Archive -Path * -DestinationPath job-hunter-pro.zip -Exclude node_modules, .git, tests, .github, *.md
```

#### Step 4: Add-on Description
Fill in:
- **Name**: Job Hunter Pro
- **Summary**: Auto-apply to jobs and optimize resume with AI
- **Description**: (same as Chrome store)
- **Category**: Productivity / Tools
- **Homepage**: (your GitHub URL or leave blank)

#### Step 5: Review Privacy
1. Check: "This add-on does not send personal data"
2. OR if it does (like sending to OpenAI):
   - Check: "This add-on sends data to 3rd parties"
   - Specify: "Sends API requests to OpenAI"

#### Step 6: Submit for Review
1. Review all information
2. Click **"Submit"**
3. Mozilla reviews (usually 3-7 days)
4. Email notification when approved/rejected

#### Step 7: After Approval
1. Add-on appears on Mozilla Add-ons site
2. Share the link:
   ```
   https://addons.mozilla.org/en-US/firefox/addon/job-hunter-pro/
   ```
3. Users can install from Firefox Store

---

### Part C: Deploy to Microsoft Edge Add-ons

#### Step 1: Create Microsoft Partner Account
1. Go to https://partner.microsoft.com
2. Click **"Sign in"** (top-right)
3. Use Microsoft account (or create one)
4. Agree to developer agreement
5. Set up partner account

#### Step 2: Create New Product
1. Go to https://partner.microsoft.com/en-us/dashboard/microsoftedge/overview
2. Click **"Create new edge add-on"**
3. Fill in basic info

#### Step 3: Upload Extension Package
1. Create ZIP file (same as Firefox, see Part B)
2. Click **"Upload"**
3. Select your ZIP file
4. Edge analyzes the package (takes 1-2 minutes)

#### Step 4: Store Listing Details
Fill in:
- **Name**: Job Hunter Pro
- **Description**: (same as before)
- **Category**: Productivity
- **Privacy policy URL**: (your GitHub or leave blank)

#### Step 5: Screenshots & Assets
Add:
- **Icon**: 128x128 pixels
- **Screenshots**: 1280x800 pixels (at least 1, up to 5)
- **Promotional image**: 920x680 pixels

#### Step 6: Submit for Certification
1. Review all information
2. Click **"Submit"**
3. Microsoft reviews (usually 1-2 hours)
4. Email when approved/rejected

#### Step 7: After Approval
1. Add-on appears in Microsoft Edge Add-ons store
2. Share the link:
   ```
   https://microsoftedge.microsoft.com/addons/detail/job-hunter-pro/[YOUR_ID]
   ```
3. Users can install directly

---

### Part D: Self-Hosted Deployment (GitHub Releases)

If you want to distribute via GitHub:

#### Step 1: Create Release Package
1. Create a ZIP file with your extension (no node_modules, .git, tests)
2. Create a `.crx` file (for Chrome manual install):
   - Go to `chrome://extensions`
   - Enable Developer Mode
   - Click "Pack extension"
   - Select your extension folder
3. Creates `.crx` file you can share

#### Step 2: Create GitHub Release
1. Go to your GitHub repo
2. Click **"Releases"** (top-right area)
3. Click **"Create a new release"**
4. Tag: `v1.4.0`
5. Title: `Release 1.4.0 - Options Page Enhancement`
6. Description: (your release notes from Phase 2)
7. Upload files:
   - `job-hunter-pro.zip`
   - `job-hunter-pro.crx` (if created)
   - `README.md` (install instructions)

#### Step 3: Publish Release
1. Click **"Publish release"**
2. Release is now public
3. Users can download files directly

#### Step 4: Share Installation Instructions
Create README in release:
```markdown
# Job Hunter Pro v1.4.0

## Installation

### Chrome
1. Download `job-hunter-pro.crx`
2. Open chrome://extensions
3. Enable Developer Mode
4. Drag & drop the `.crx` file onto the page

### Or Load Unpacked
1. Download `job-hunter-pro.zip` and extract
2. Open chrome://extensions
3. Enable Developer Mode
4. Click "Load unpacked"
5. Select the extracted folder

### Firefox
1. Download `job-hunter-pro.zip`
2. Open about:debugging
3. Click "Load temporary add-on"
4. Select manifest.json from extracted folder

### Edge
1. Download `job-hunter-pro.crx`
2. Open edge://extensions
3. Enable Developer Mode
4. Drag & drop the `.crx` file

See README.md for more details.
```

---

### Part E: Post-Deployment Checklist

After deploying to all stores:

- [ ] Extension appears in Chrome Web Store ✅
- [ ] Extension appears in Firefox Add-ons ✅
- [ ] Extension appears in Edge Add-ons ✅
- [ ] GitHub Release created ✅
- [ ] All store links tested (can install) ✅
- [ ] Installation works in all browsers ✅
- [ ] Options page works after store install ✅
- [ ] Release notes posted ✅
- [ ] Social media/forums notified (optional) ✅
- [ ] GitHub issues/discussions updated ✅

---

### Part F: Monitor After Deployment

#### Track Installs & Feedback
1. **Chrome Web Store**: Check developer dashboard for:
   - Total installs (updated daily)
   - Active users
   - Average rating
   - User reviews

2. **Firefox Add-ons**: Check admin panel for:
   - Install count
   - Reviews/ratings
   - Download stats

3. **Microsoft Edge**: Check dashboard for:
   - Total installs
   - User ratings
   - Feedback

#### Address User Feedback
1. Check store reviews weekly
2. Respond to negative reviews:
   - Thank them for feedback
   - Ask for details if needed
   - Offer to fix issues
3. Report common issues as GitHub issues
4. Plan fixes for next version

#### Create Update Plan
After 2-4 weeks, plan v1.5.0:
1. Collect feedback
2. Prioritize improvements
3. Fix reported bugs
4. Add new features
5. Test thoroughly
6. Re-submit to all stores

---

## SUMMARY

### Timeline
- **Manual Testing**: 2-3 hours
- **Beta Testing**: 1 week
- **Deploy to Chrome**: 2-4 hours (+ review time)
- **Deploy to Firefox**: 2-4 hours (+ 3-7 days review)
- **Deploy to Edge**: 2-4 hours (+ 1-2 hours review)
- **GitHub Release**: 30 minutes

**Total**: ~1-2 weeks from start to public availability

### Success Criteria
- ✅ No critical bugs found in manual/beta testing
- ✅ All 3 stores have live listings
- ✅ Users can install successfully
- ✅ Average rating 4+ stars
- ✅ 100+ installs in first week (realistic goal)

### What's Next
1. Monitor feedback
2. Plan version 2.0 with advanced features
3. Build community (Discord, forum, etc.)
4. Create video tutorials
5. Partner with job search websites

---

**You're now ready to deploy!** 🚀

Feel free to ask if you have questions about any specific step.
