/**
 * Options page logic: Load/save settings, API key management with encryption,
 * validation, and session unlock. Uses StoragePromise for cleaner async/await.
 */

// StoragePromise wrapper - convert chrome.storage.sync to Promise-based
const StoragePromise = {
  async get(keys) {
    return new Promise((res) => {
      chrome.storage.sync.get(keys, (data) => {
        if (chrome.runtime.lastError) {
          console.error('StoragePromise.get error:', chrome.runtime.lastError);
          res({});
        } else {
          res(data || {});
        }
      });
    });
  },
  async set(obj) {
    return new Promise((res) => {
      chrome.storage.sync.set(obj, () => {
        if (chrome.runtime.lastError) {
          console.error('StoragePromise.set error:', chrome.runtime.lastError);
        }
        res();
      });
    });
  },
  async remove(keys) {
    return new Promise((res) => {
      chrome.storage.sync.remove(keys, () => {
        if (chrome.runtime.lastError) {
          console.error('StoragePromise.remove error:', chrome.runtime.lastError);
        }
        res();
      });
    });
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  // UI elements
  const autoApply = document.getElementById('autoApply');
  const firstName = document.getElementById('firstName');
  const lastName = document.getElementById('lastName');
  const email = document.getElementById('email');
  const phone = document.getElementById('phone');
  const city = document.getElementById('city');
  const state = document.getElementById('state');
  const resumeFile = document.getElementById('resumeFile');
  const resumeInfo = document.getElementById('resumeInfo');
  const aiProvider = document.getElementById('aiProvider');
  const openaiApiKey = document.getElementById('openaiApiKey');
  const aiModel = document.getElementById('aiModel');
  const saveBtn = document.getElementById('saveBtn');
  const clearBtn = document.getElementById('clearBtn');
  const status = document.getElementById('status');
  const encryptKeyBtn = document.getElementById('encryptKeyBtn');
  const validateKeyBtn = document.getElementById('validateKeyBtn');
  const encryptValidateBtn = document.getElementById('encryptValidateBtn');
  const testSaveBtn = document.getElementById('testSaveBtn');
  const unlockKeyBtn = document.getElementById('unlockKeyBtn');
  const apiPassphrase = document.getElementById('apiPassphrase');
  const apiStatus = document.getElementById('apiStatus');
  const validateResult = document.getElementById('validateResult');
  const allowPlainKey = document.getElementById('allowPlainKey');
  const sessionStatusLine = document.getElementById('sessionStatusLine');
  const plainKeyModal = document.getElementById('plainKeyModal');
  const modalCancel = document.getElementById('modalCancel');
  const modalConfirm = document.getElementById('modalConfirm');

  // Helper to set UI status messages
  function setStatus(elem, msg, timeout = 2000) {
    try {
      if (elem) {
        elem.textContent = msg || '';
        if (timeout > 0 && msg) {
          setTimeout(() => { if (elem) elem.textContent = ''; }, timeout);
        }
      }
    } catch (e) {
      console.warn('setStatus error', e);
    }
  }

  // Show/hide modal confirmation for plain key storage
  function showPlainKeyModal() {
    if (plainKeyModal) plainKeyModal.style.display = 'flex';
  }

  function hidePlainKeyModal() {
    if (plainKeyModal) plainKeyModal.style.display = 'none';
  }

  // Modal: Cancel plain key opt-in
  if (modalCancel) {
    modalCancel.addEventListener('click', () => {
      if (allowPlainKey) allowPlainKey.checked = false;
      hidePlainKeyModal();
    });
  }

  // Modal: Confirm plain key opt-in
  if (modalConfirm) {
    modalConfirm.addEventListener('click', () => {
      if (allowPlainKey) allowPlainKey.checked = true;
      hidePlainKeyModal();
    });
  }

  // Plain key checkbox: show modal when user tries to enable
  if (allowPlainKey) {
    allowPlainKey.addEventListener('change', (e) => {
      if (e.target.checked) {
        showPlainKeyModal();
      } else {
        hidePlainKeyModal();
      }
    });
  }

  // Load settings from storage
  async function loadSettings() {
    try {
      const data = await StoragePromise.get(['autoApply', 'resumeData']);
      if (autoApply) autoApply.checked = !!data.autoApply;
      const r = data.resumeData || {};
      if (firstName) firstName.value = r.firstName || '';
      if (lastName) lastName.value = r.lastName || '';
      if (email) email.value = r.email || '';
      if (phone) phone.value = r.phone || '';
      if (city) city.value = r.city || '';
      if (state) state.value = r.state || '';
      if (r.resumeFileName && resumeInfo) resumeInfo.textContent = `Saved file: ${r.resumeFileName}`;
    } catch (e) {
      console.error('loadSettings error', e);
    }
  }

  // Load AI settings
  async function loadAiSettings() {
    try {
      const s = await StoragePromise.get(['aiProvider', 'openaiApiKey', 'aiModel', 'allowPlainApiKey']);
      if (aiProvider) aiProvider.value = s.aiProvider || 'openai';
      if (openaiApiKey) openaiApiKey.value = s.openaiApiKey || '';
      if (aiModel) aiModel.value = s.aiModel || 'gpt-3.5-turbo';
      if (allowPlainKey) allowPlainKey.checked = !!s.allowPlainApiKey;
    } catch (e) {
      console.error('loadAiSettings error', e);
    }
  }

  // Load encrypted key status
  async function loadEncryptedKeyStatus() {
    try {
      const r = await StoragePromise.get(['encryptedOpenaiApiKey']);
      if (r && r.encryptedOpenaiApiKey && apiStatus) {
        apiStatus.textContent = '✅ Encrypted API key stored';
      }
    } catch (e) {
      console.error('loadEncryptedKeyStatus error', e);
    }
  }

  // Update session unlock status display
  async function updateSessionStatus() {
    try {
      chrome.runtime.sendMessage({ action: 'getSessionStatus' }, (resp) => {
        if (chrome.runtime.lastError) {
          console.warn('getSessionStatus error:', chrome.runtime.lastError);
          return;
        }
        if (sessionStatusLine) {
          if (resp && resp.apiKeyUnlocked) {
            sessionStatusLine.textContent = '✅ API key unlocked for session';
            sessionStatusLine.style.color = '#4CAF50';
          } else {
            sessionStatusLine.textContent = '🔒 API key locked';
            sessionStatusLine.style.color = '#999';
          }
        }
      });
    } catch (e) {
      console.error('updateSessionStatus error', e);
    }
  }

  // Initialize
  await loadSettings();
  await loadAiSettings();
  await loadEncryptedKeyStatus();
  updateSessionStatus();

  // Resume file upload handler
  if (resumeFile) {
    resumeFile.addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;

      const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
      if (f.size > MAX_BYTES) {
        setStatus(status, `File too large (${Math.round(f.size / 1024)} KB). Max 5MB.`, 4000);
        resumeFile.value = '';
        resumeFile._dataUrl = null;
        resumeFile._name = null;
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const dataUrl = reader.result;
          if (resumeInfo) resumeInfo.textContent = `Selected: ${f.name} (${Math.round(f.size / 1024)} KB)`;
          resumeFile._dataUrl = dataUrl;
          resumeFile._name = f.name;
        } catch (e) {
          console.error('resumeFile onload error', e);
          setStatus(status, 'Failed to read file', 3000);
        }
      };
      reader.onerror = (err) => {
        console.error('FileReader error', err);
        setStatus(status, 'Error reading file', 3000);
        resumeFile._dataUrl = null;
        resumeFile._name = null;
      };
      reader.readAsDataURL(f);
    });
  }

  // Save button: save resume + AI settings
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const resumeData = {
        firstName: firstName?.value || '',
        lastName: lastName?.value || '',
        email: email?.value || '',
        phone: phone?.value || '',
        city: city?.value || '',
        state: state?.value || ''
      };

      // Email validation
      function isValidEmail(e) {
        if (!e) return true; // optional field
        const re = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        return re.test(e.trim());
      }

      if (email?.value && !isValidEmail(email.value)) {
        setStatus(status, 'Please enter a valid email address', 3000);
        return;
      }

      if (resumeFile._dataUrl) {
        resumeData.resumeFile = resumeFile._dataUrl;
        resumeData.resumeFileName = resumeFile._name;
      }

      const aiSettings = {
        aiProvider: aiProvider?.value || 'openai',
        aiModel: aiModel?.value || 'gpt-3.5-turbo'
      };

      const allowPlain = allowPlainKey?.checked ?? false;
      const toStore = {
        autoApply: autoApply?.checked ?? false,
        resumeData,
        ...aiSettings,
        allowPlainApiKey: allowPlain
      };

      if (openaiApiKey?.value) {
        if (allowPlain) {
          toStore.openaiApiKey = openaiApiKey.value;
          setStatus(apiStatus, '⚠️ Plain API key saved (not recommended)', 3500);
        } else {
          setStatus(apiStatus, '📌 API key present but not saved. Enable "Allow storing plain API key" to save.', 4500);
        }
      }

      try {
        await StoragePromise.set(toStore);
        setStatus(status, '✅ Saved', 2000);
      } catch (e) {
        console.error('Save error', e);
        setStatus(status, '❌ Save failed: ' + (e.message || e), 4000);
      }
    });
  }

  // Clear button
  if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
      try {
        await StoragePromise.remove(['resumeData', 'autoApply']);
        if (firstName) firstName.value = '';
        if (lastName) lastName.value = '';
        if (email) email.value = '';
        if (phone) phone.value = '';
        if (city) city.value = '';
        if (state) state.value = '';
        if (resumeFile) {
          resumeFile.value = '';
          resumeFile._dataUrl = null;
        }
        if (resumeInfo) resumeInfo.textContent = '';
        setStatus(status, '✅ Cleared', 2000);
      } catch (e) {
        console.error('Clear error', e);
        setStatus(status, '❌ Clear failed: ' + (e.message || e), 3000);
      }
    });
  }

  // Encrypt API key button
  if (encryptKeyBtn) {
    encryptKeyBtn.addEventListener('click', async () => {
      const key = openaiApiKey?.value || '';
      const pass = apiPassphrase?.value || '';

      if (!key || !pass) {
        setStatus(apiStatus, 'Provide both API key and passphrase', 3000);
        return;
      }

      setStatus(apiStatus, 'Encrypting...', 0);
      try {
        if (!window.CryptoHelper) throw new Error('CryptoHelper not loaded');
        const encrypted = await CryptoHelper.encryptText(pass, key);
        await StoragePromise.set({ encryptedOpenaiApiKey: encrypted });

        const allowPlain = allowPlainKey?.checked ?? false;
        if (!allowPlain) {
          await StoragePromise.remove(['openaiApiKey']);
        }
        setStatus(apiStatus, '✅ Encrypted API key saved', 2500);
      } catch (e) {
        console.error('Encryption error', e);
        setStatus(apiStatus, '❌ Encryption failed: ' + (e.message || e), 4000);
      }
    });
  }

  // Unlock API key for session
  if (unlockKeyBtn) {
    unlockKeyBtn.addEventListener('click', async () => {
      const pass = apiPassphrase?.value || '';
      if (!pass) {
        setStatus(apiStatus, 'Enter passphrase to unlock', 3000);
        return;
      }

      setStatus(apiStatus, 'Unlocking...', 0);
      try {
        const r = await StoragePromise.get(['encryptedOpenaiApiKey']);
        const blob = r?.encryptedOpenaiApiKey;
        if (!blob) {
          setStatus(apiStatus, '❌ No encrypted key stored', 3000);
          return;
        }

        if (!window.CryptoHelper) throw new Error('CryptoHelper not loaded');
        const plain = await CryptoHelper.decryptText(pass, blob);

        chrome.runtime.sendMessage({ action: 'unlockApiKey', apiKey: plain }, (resp) => {
          if (chrome.runtime.lastError) {
            console.error('sendMessage error', chrome.runtime.lastError);
            setStatus(apiStatus, '❌ Unlock failed', 3000);
            return;
          }
          setStatus(apiStatus, resp?.unlocked ? '✅ API key unlocked for session' : '❌ Unlock failed in background', 2500);
          updateSessionStatus();
        });
      } catch (e) {
        console.error('Decrypt failed', e);
        setStatus(apiStatus, '❌ Decrypt failed: ' + (e.message || e), 3500);
      }
    });
  }

  // Validate API key
  if (validateKeyBtn) {
    validateKeyBtn.addEventListener('click', async () => {
      const provider = aiProvider?.value || 'openai';
      const key = openaiApiKey?.value || '';
      const model = aiModel?.value || 'gpt-3.5-turbo';

      if ((provider === 'openai' || provider === 'github') && !key.trim()) {
        const r = await StoragePromise.get(['encryptedOpenaiApiKey']);
        if (r?.encryptedOpenaiApiKey) {
          setStatus(apiStatus, '🔒 Key is encrypted. Unlock it in Options or popup before validating.', 4000);
        } else {
          setStatus(apiStatus, '❌ No API key provided. Paste your key or encrypt one first.', 4000);
        }
        return;
      }

      setStatus(apiStatus, 'Validating API key...', 0);
      if (validateResult) validateResult.textContent = '';

      try {
        if (!window.ApiConnector) throw new Error('ApiConnector not loaded');
        const messages = [
          { role: 'system', content: 'You are a lightweight validation assistant. Respond briefly.' },
          { role: 'user', content: 'Ping: please respond with short confirmation.' }
        ];
        const result = await ApiConnector.call({
          provider,
          apiKey: key,
          model,
          messages,
          max_tokens: 10,
          temp: 0
        });
        setStatus(apiStatus, '✅ Validation succeeded', 3000);
        if (validateResult) validateResult.textContent = JSON.stringify(result, null, 2);
      } catch (err) {
        console.error('Validate error', err);
        const errMsg = err?.message || String(err);
        setStatus(apiStatus, '❌ Validation failed: ' + errMsg, 6000);
        if (validateResult) validateResult.textContent = errMsg;
      }
    });
  }

  // Encrypt + Validate flow
  if (encryptValidateBtn) {
    encryptValidateBtn.addEventListener('click', async () => {
      const provider = aiProvider?.value || 'openai';
      const key = openaiApiKey?.value || '';
      const model = aiModel?.value || 'gpt-3.5-turbo';
      const pass = apiPassphrase?.value || '';

      if (!key) {
        const r = await StoragePromise.get(['encryptedOpenaiApiKey']);
        if (r?.encryptedOpenaiApiKey) {
          setStatus(apiStatus, '❌ No plain key in input. Unlock the encrypted key first.', 4000);
          return;
        }
        setStatus(apiStatus, '❌ Provide API key in the input to validate and encrypt', 4000);
        return;
      }

      setStatus(apiStatus, 'Validating API key...', 0);
      if (validateResult) validateResult.textContent = '';

      try {
        if (!window.ApiConnector) throw new Error('ApiConnector not loaded');
        const messages = [
          { role: 'system', content: 'You are a lightweight validation assistant. Respond briefly.' },
          { role: 'user', content: 'Ping: please respond with short confirmation.' }
        ];
        const result = await ApiConnector.call({
          provider,
          apiKey: key,
          model,
          messages,
          max_tokens: 10,
          temp: 0
        });

        setStatus(apiStatus, '✅ Validation succeeded — encrypting (if passphrase provided)', 3000);
        if (validateResult) validateResult.textContent = JSON.stringify(result, null, 2);

        if (!pass) {
          setStatus(apiStatus, '✅ Validation OK. Provide a passphrase to encrypt.', 4000);
          return;
        }

        // Encrypt and save
        if (!window.CryptoHelper) throw new Error('CryptoHelper not loaded');
        const encrypted = await CryptoHelper.encryptText(pass, key);
        await StoragePromise.set({ encryptedOpenaiApiKey: encrypted });

        const allowPlain = allowPlainKey?.checked ?? false;
        if (!allowPlain) {
          await StoragePromise.remove(['openaiApiKey']);
        }
        setStatus(apiStatus, '✅ Encrypted API key saved', 3000);
      } catch (err) {
        console.error('Encrypt+Validate error', err);
        const errMsg = err?.message || String(err);
        setStatus(apiStatus, '❌ Validation failed: ' + errMsg, 6000);
        if (validateResult) validateResult.textContent = errMsg;
      }
    });
  }

  // Test & Save flow: Validate API key then save all settings
  if (testSaveBtn) {
    testSaveBtn.addEventListener('click', async () => {
      const provider = aiProvider?.value || 'openai';
      const key = openaiApiKey?.value || '';
      const model = aiModel?.value || 'gpt-3.5-turbo';

      // Validation
      if ((provider === 'openai' || provider === 'github') && !key.trim()) {
        const r = await StoragePromise.get(['encryptedOpenaiApiKey']);
        if (r?.encryptedOpenaiApiKey) {
          setStatus(apiStatus, '🔒 Key is encrypted. Unlock it before Test & Save.', 4000);
        } else {
          setStatus(apiStatus, '❌ No API key provided.', 3000);
        }
        return;
      }

      setStatus(apiStatus, 'Testing API key...', 0);
      if (validateResult) validateResult.textContent = '';

      try {
        if (!window.ApiConnector) throw new Error('ApiConnector not loaded');
        const messages = [
          { role: 'system', content: 'You are a lightweight validation assistant. Respond briefly.' },
          { role: 'user', content: 'Ping: please respond with short confirmation.' }
        ];
        const result = await ApiConnector.call({
          provider,
          apiKey: key,
          model,
          messages,
          max_tokens: 10,
          temp: 0
        });

        setStatus(apiStatus, '✅ API key valid — saving settings...', 0);
        if (validateResult) validateResult.textContent = '✅ Test passed:\n' + JSON.stringify(result, null, 2);

        // Now save all settings
        const resumeData = {
          firstName: firstName?.value || '',
          lastName: lastName?.value || '',
          email: email?.value || '',
          phone: phone?.value || '',
          city: city?.value || '',
          state: state?.value || ''
        };

        if (resumeFile._dataUrl) {
          resumeData.resumeFile = resumeFile._dataUrl;
          resumeData.resumeFileName = resumeFile._name;
        }

        const allowPlain = allowPlainKey?.checked ?? false;
        const toStore = {
          autoApply: autoApply?.checked ?? false,
          resumeData,
          aiProvider: provider,
          aiModel: model,
          allowPlainApiKey: allowPlain
        };

        if (key) {
          if (allowPlain) {
            toStore.openaiApiKey = key;
          }
        }

        await StoragePromise.set(toStore);
        setStatus(apiStatus, '✅ All settings saved successfully', 3000);
        setStatus(status, '✅ All settings saved', 2000);
        updateSessionStatus();
      } catch (err) {
        console.error('Test & Save error', err);
        const errMsg = err?.message || String(err);
        setStatus(apiStatus, '❌ Test failed: ' + errMsg, 6000);
        if (validateResult) validateResult.textContent = '❌ Test failed:\n' + errMsg;
      }
    });
  }
});
