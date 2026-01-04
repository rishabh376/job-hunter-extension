# Loading Job Hunter Pro Extension in Microsoft Edge

## Complete Step-by-Step Guide with Screenshots

---

## **Step 1: Open Edge Extensions Page**

### Where to Find It:

**Option A: Via Address Bar**
1. Open Microsoft Edge browser
2. Click on the address bar (top left, where you type URLs)
3. Type: `edge://extensions/`
4. Press Enter

**Option B: Via Menu**
1. Open Microsoft Edge
2. Click the **three-dot menu** (⋯) in the top-right corner
3. Hover over **"Extensions"**
4. Click **"Manage extensions"**

### What You'll See:
- A page titled **"Extensions"**
- On the left sidebar: "Extensions" with a list
- In the main area: Your installed extensions (if any)
- Top-right corner: A toggle for **"Developer mode"**

---

## **Step 2: Enable Developer Mode**

### Location:
Top-right corner of the extensions page, next to the search box

### How to Enable:
1. Look for the **toggle switch** labeled **"Developer mode"** (it appears as a circle/switch)
2. Click on it to turn it **ON** (it will turn blue when enabled)
3. You'll see a confirmation at the bottom of the page

### What Changes:
After enabling, you'll see three new buttons appear at the top-left:
- **"Load unpacked"** ← This is what you'll use next
- **"Pack extension"**
- **"Inspect"**

---

## **Step 3: Click "Load unpacked" Button**

### Location:
Top-left area of the extensions page (appears after Developer mode is enabled)

### How to Click:
1. Look for the blue button that says **"Load unpacked"**
2. Click on it

### What Happens:
A **folder selection dialog** will open (Windows file browser)

---

## **Step 4: Select Your Extension Folder**

### What to Select:
Navigate to your extension folder: `C:\Devops\Code-Samples\job-hunter-extension`

### Step-by-Step:
1. The file browser opens (Windows Explorer-style)
2. Navigate to your extension folder:
   - **C:/** (your C: drive)
   - **Devops** (folder)
   - **Code-Samples** (folder)
   - **job-hunter-extension** (folder) ← **Select this one**
3. Once selected, the folder path should show: `C:\Devops\Code-Samples\job-hunter-extension`
4. Click the **"Select Folder"** button (bottom-right of the dialog)

### Important:
- ✅ Select the **job-hunter-extension folder itself** (NOT a subfolder like `utils` or `tests`)
- ✅ The folder **MUST contain** `manifest.json` at the root level
- ❌ Do NOT select `utils`, `tests`, or any subfolder

---

## **Step 5: Verify the Extension Loaded**

### What to Look For:
After clicking "Select Folder", you should see:

1. **Extension Card in the List**:
   - Extension name: **"Job Hunter Pro"**
   - Extension ID: A unique ID (e.g., `ckjhbdefghijklmnopqrstuv`)
   - Status: **"Enabled"** (if not, click the toggle to enable)
   - Buttons: "Remove", "Details", "Errors"

2. **No Error Messages**:
   - If you see red text or errors, click **"Details"** or **"Errors"** to see what's wrong
   - Common issues:
     - Missing `manifest.json`
     - Syntax errors in JavaScript files
     - Missing required files

---

## **Step 6: Access the Extension Popup**

### Where is the Extension Icon?

#### Option A: Toolbar (Recommended)
1. Look at the **top-right corner** of Edge, next to the address bar
2. You should see a **puzzle piece icon** (🧩) with a small **red dot** or **notification badge**
3. Click on it to see your extension

#### Option B: Search for Extension
1. In the extensions list, find **"Job Hunter Pro"**
2. Click the **extension icon** shown in the card

### If You Don't See the Icon:
1. Click the **puzzle piece icon** (🧩) in the top-right corner
2. Look for **"Job Hunter Pro"** in the dropdown list
3. Click the **pin icon** next to it to pin it to the toolbar



---

## **Step 7: Test the Extension**

### Opening the Popup

1. Click the **Job Hunter Pro icon** (🧩) in the toolbar (top-right)
2. A **popup window** will appear showing:
   - **Auto Application** toggle
   - **Resume Optimization** button
   - **Optimized Resume** preview
   - **Application Stats** (Applications sent, Success rate)
   - **Settings** button
   - **API unlock status** (at the top)

### Testing Features:

#### A. Test Settings
1. Click **"Configure Resume"** button
2. Edge opens a new tab with the Options page
3. Fill in your resume data and API configuration
4. Click **"Save Resume"** or **"Save & Encrypt"**

#### B. Test Auto-Apply
1. Toggle **"Enable auto-apply"** ON
2. Navigate to a job board (LinkedIn, Indeed, Glassdoor)
3. Check if the extension detects jobs
4. Application stats should update

#### C. Test Resume Optimization
1. Navigate to a job posting
2. Click **"Optimize Current Resume"** in the popup
3. Wait for optimization to complete
4. Check the **"Optimized Resume"** preview section
5. Click **"Download JSON"** to save the optimized resume

#### D. Test API Unlock
1. In the popup, enter your passphrase
2. Click **"Unlock"** button
3. Status should change to **"API: unlocked for session"** (green text)
4. Click **"Lock"** to lock again

---

## **Step 8: View Extension Logs & Debug**

### If Something Goes Wrong:

#### A. View Background Service Worker Logs
1. Right-click the extension icon (🧩) in the toolbar
2. Click **"Manage extension"** (or go back to `edge://extensions/`)
3. Find **"Job Hunter Pro"** card
4. Click **"Details"**
5. Scroll down and click **"Service worker"** to see console logs
6. Look for errors or warnings

#### B. View Popup Console
1. Open the popup (click extension icon)
2. Right-click inside the popup
3. Click **"Inspect"** or **"Inspect element"**
4. Developer tools open
5. Go to the **"Console"** tab
6. Look for errors (red text)

#### C. View Options Page Logs
1. Open the Options page (Settings → Configure Resume)
2. Right-click on the page
3. Click **"Inspect"**
4. Go to **"Console"** tab
5. Look for errors

---

## **Step 9: Common Issues & Solutions**

### Issue 1: Extension Won't Load
**Solution:**
- Make sure `manifest.json` exists in `C:\Devops\Code-Samples\job-hunter-extension\`
- Click **"Errors"** in the extension card to see specific errors
- Check file permissions (right-click folder → Properties → Security)

### Issue 2: API Unlock Shows "Locked" Message
**Solution:**
- Open Options page (Configure Resume button)
- Scroll to "API Configuration"
- Check that API key is encrypted (click "Save & Encrypt")
- Create a passphrase and save it
- Return to popup and try unlocking

### Issue 3: Resume Optimization Says "No active tab"
**Solution:**
- Make sure you're on a job posting page
- Refresh the page
- Try a different job site (LinkedIn, Indeed, Glassdoor)
- Check that you have permission granted (manifest.json should have `host_permissions`)

### Issue 4: Auto-Apply Not Triggering
**Solution:**
1. Toggle "Enable auto-apply" ON
2. Navigate to a job board (LinkedIn, Indeed, or Glassdoor)
3. Right-click page → Inspect → Console
4. Look for messages like "Job detected" or "Auto-apply triggered"
5. Check if the job board is in the supported list (edit `auto-applier/job-scanner.js` to add more)

### Issue 5: Passphrase Won't Unlock
**Solution:**
- Make sure you're typing the correct passphrase (case-sensitive)
- Clear popup cache: Close popup and reopen
- Check that the API key is actually encrypted (look in Options page)
- If forgotten, remove encrypted key and create new one in Options

---

## **Step 10: Unload or Remove the Extension**

### If You Want to Unload Temporarily:
1. Go to `edge://extensions/`
2. Find **"Job Hunter Pro"**
3. Toggle the **enable switch** to OFF
4. The extension will be disabled but not removed

### If You Want to Remove Permanently:
1. Go to `edge://extensions/`
2. Find **"Job Hunter Pro"**
3. Click **"Remove"** button
4. Confirm deletion

---

## **Full Edge Extension Path Reference**

```
Edge Menu (⋯)
  → Extensions
    → Manage extensions
      → edge://extensions/
        → Developer mode (toggle ON)
        → Load unpacked (select folder)
          → C:\Devops\Code-Samples\job-hunter-extension
            → ✅ Extension Loaded!
```

---

## **Quick Reference: Where to Find Everything**

| Component | Location | How to Access |
|-----------|----------|---------------|
| **Extensions Page** | `edge://extensions/` | Type in address bar or Menu → Extensions → Manage |
| **Developer Mode** | Top-right of extensions page | Toggle switch (turns blue when ON) |
| **Load Unpacked Button** | Top-left (after Dev mode enabled) | Blue button labeled "Load unpacked" |
| **Extension Folder** | `C:\Devops\Code-Samples\job-hunter-extension` | Windows File Browser (opened by Load unpacked) |
| **Extension Icon** | Top-right toolbar (🧩 puzzle piece) | Click to open popup |
| **Options Page** | New tab | Click "Configure Resume" in popup |
| **Service Worker Logs** | Extension Details → Service worker | Right-click extension → Manage → Details → scroll down |
| **Popup Console** | Developer tools | Right-click popup → Inspect → Console tab |

---

## **Summary Checklist**

- [ ] Open Edge and go to `edge://extensions/`
- [ ] Enable Developer mode (toggle in top-right)
- [ ] Click "Load unpacked" button
- [ ] Select `C:\Devops\Code-Samples\job-hunter-extension` folder
- [ ] Verify "Job Hunter Pro" appears in the list with status "Enabled"
- [ ] Click the extension icon (🧩) in the toolbar
- [ ] Test popup features (Settings, Optimize, Stats, Unlock)
- [ ] Configure resume and API key in Options page
- [ ] Test on a job board (LinkedIn, Indeed, Glassdoor)
- [ ] Check console logs for errors if issues occur

---

## **Next Steps**

1. **Configure Resume**: Click "Configure Resume" and fill in your information
2. **Set Up API**: Add OpenAI API key and create a passphrase
3. **Test Features**: Unlock API, optimize a resume, enable auto-apply
4. **Monitor**: Check stats and application history

**You're ready to use Job Hunter Pro in Microsoft Edge!** 🚀

---

*For additional help, check the main README.md or review the troubleshooting section above.*
