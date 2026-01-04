document.addEventListener('DOMContentLoaded', function() {
  const autoApplyToggle = document.getElementById('autoApply');
  const optimizeBtn = document.getElementById('optimizeResume');
  const settingsBtn = document.getElementById('openSettings');
  const appCountSpan = document.getElementById('appCount');
  const successRateSpan = document.getElementById('successRate');

  // Load settings
  chrome.storage.sync.get(['autoApply', 'applicationStats'], function(data) {
    autoApplyToggle.checked = data.autoApply || false;
    updateStats(data.applicationStats);
  });

  // Load optimized resume preview
  const optimizedPreview = document.getElementById('optimizedResumePreview');
  const downloadBtn = document.getElementById('downloadOptimized');
  const validationErrors = document.getElementById('validationErrors');
  const unlockStatus = document.getElementById('unlockStatus');
  const loadOptimized = () => {
    chrome.storage.sync.get(['optimizedResume'], (r) => {
      const o = r && r.optimizedResume;
      optimizedPreview.textContent = o ? JSON.stringify(o, null, 2) : 'No optimized resume yet.';
      // Validate schema and show friendly errors
      try {
        if (o) {
          const result = SchemaValidator.validateOptimizedResume(o);
          if (!result.valid) {
            validationErrors.textContent = result.errors.join('; ');
            optimizedPreview.style.borderColor = '#f8d7da';
          } else {
            validationErrors.textContent = '';
            optimizedPreview.style.borderColor = '#eee';
          }
        } else {
          validationErrors.textContent = '';
          optimizedPreview.style.borderColor = '#eee';
        }
      } catch (e) {
        validationErrors.textContent = 'Validation failed: ' + e.message;
      }
    });
  };
  loadOptimized();

  // Query background for API unlocked status
  chrome.runtime.sendMessage({ action: 'getApiUnlockedStatus' }, (resp) => {
    const unlocked = resp && resp.unlocked;
    unlockStatus.textContent = unlocked ? 'API: unlocked for session' : 'API: locked (open Options to unlock)';
    unlockStatus.style.color = unlocked ? '#1b5e20' : '#bf360c';
  });

  // Inline unlock/lock controls
  const popupPass = document.getElementById('popupPassphrase');
  const popupUnlockBtn = document.getElementById('popupUnlockBtn');
  const popupLockBtn = document.getElementById('popupLockBtn');
  const popupClipboardUnlockBtn = document.getElementById('popupClipboardUnlockBtn');
  const togglePassVisible = document.getElementById('togglePassVisible');

  popupUnlockBtn.addEventListener('click', async () => {
    const pass = popupPass.value;
    if (!pass) { unlockStatus.textContent = 'Enter passphrase'; return; }
    unlockStatus.textContent = 'Unlocking...';
    // Read encrypted key from storage
    chrome.storage.sync.get(['encryptedOpenaiApiKey'], async (r) => {
      const blob = r && r.encryptedOpenaiApiKey;
      if (!blob) { unlockStatus.textContent = 'No encrypted key stored (use Options)'; return; }
      try {
        const plain = await CryptoHelper.decryptText(pass, blob);
        // Send to background to unlock for session
        chrome.runtime.sendMessage({ action: 'unlockApiKey', apiKey: plain }, (resp) => {
          const ok = resp && resp.unlocked;
          unlockStatus.textContent = ok ? 'API: unlocked for session' : 'Unlock failed';
          unlockStatus.style.color = ok ? '#1b5e20' : '#bf360c';
        });
      } catch (e) {
        unlockStatus.textContent = 'Decrypt failed: ' + e.message;
        unlockStatus.style.color = '#bf360c';
      }
    });
  });

  popupLockBtn.addEventListener('click', () => {
    // Lock by asking background to clear unlocked key
    chrome.runtime.sendMessage({ action: 'unlockApiKey', apiKey: null }, (_resp) => {
      unlockStatus.textContent = 'API: locked';
      unlockStatus.style.color = '#bf360c';
    });
  });

  // Toggle passphrase visibility
  togglePassVisible.addEventListener('click', () => {
    if (popupPass.type === 'password') popupPass.type = 'text'; else popupPass.type = 'password';
  });

  // Unlock from clipboard
  popupClipboardUnlockBtn.addEventListener('click', async () => {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      unlockStatus.textContent = 'Clipboard API not available';
      return;
    }
    try {
      const text = await navigator.clipboard.readText();
      if (!text) { unlockStatus.textContent = 'Clipboard is empty'; return; }
      popupPass.value = text;
      // Try to clear clipboard after reading for extra security (best-effort)
      let cleared = false;
      try {
        await navigator.clipboard.writeText('');
        cleared = true;
      } catch (e) {
        // ignore — not critical
      }
      if (cleared) {
        unlockStatus.textContent = 'Clipboard cleared after unlock';
        setTimeout(() => {
          unlockStatus.textContent = '';
        }, 1200);
      }
      // Trigger unlock flow
      popupUnlockBtn.click();
    } catch (e) {
      unlockStatus.textContent = 'Clipboard read failed: ' + e.message;
    }
  });

  downloadBtn.addEventListener('click', () => {
    chrome.storage.sync.get(['optimizedResume'], (r) => {
      const o = r && r.optimizedResume;
      if (!o) return;
      const blob = new Blob([JSON.stringify(o, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'optimized_resume.json';
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  // Auto-apply toggle
  autoApplyToggle.addEventListener('change', function() {
    chrome.storage.sync.set({ autoApply: this.checked });
  });

  // Optimize resume button
  optimizeBtn.addEventListener('click', async function() {
    optimizeBtn.disabled = true;
    optimizeBtn.textContent = 'Optimizing...';
    // Ask the background service worker to optimize the resume (it will fetch job data from the active tab)
    chrome.runtime.sendMessage({ action: 'optimizeResumeRequest' }, function(response) {
      if (response && response.success) {
        document.getElementById('optimizationStatus').innerHTML =
          '<p style="color: green;">Resume optimized successfully!</p>';
      } else {
        document.getElementById('optimizationStatus').innerHTML =
          '<p style="color: red;">Optimization failed. ' + (response && response.error ? response.error : 'Please try again.') + '</p>';
      }

      optimizeBtn.disabled = false;
      optimizeBtn.textContent = 'Optimize Current Resume';
    });
  });

  // Settings button
  settingsBtn.addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });

  function updateStats(stats) {
    stats = stats || { sent: 0, success: 0 };
    appCountSpan.textContent = stats.sent;
    const rate = stats.sent > 0 ? Math.round((stats.success / stats.sent) * 100) : 0;
    successRateSpan.textContent = rate + '%';
  }
});