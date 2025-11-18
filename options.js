document.addEventListener('DOMContentLoaded', () => {
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
  const unlockKeyBtn = document.getElementById('unlockKeyBtn');
  const apiPassphrase = document.getElementById('apiPassphrase');
  const apiStatus = document.getElementById('apiStatus');

  // Helper to set UI status messages
  function setStatus(elem, msg, timeout = 2000) {
    try {
      elem.textContent = msg || '';
      if (timeout > 0 && msg) setTimeout(() => { elem.textContent = ''; }, timeout);
    } catch (e) { console.warn('setStatus error', e); }
  }

  // Load settings
  chrome.storage.sync.get(['autoApply','resumeData'], (data) => {
    if (chrome.runtime.lastError) console.error('storage.get error', chrome.runtime.lastError);
    autoApply.checked = !!(data && data.autoApply);
    const r = (data && data.resumeData) || {};
    firstName.value = r.firstName || '';
    lastName.value = r.lastName || '';
    email.value = r.email || '';
    phone.value = r.phone || '';
    city.value = r.city || '';
    state.value = r.state || '';
    if (r.resumeFileName) resumeInfo.textContent = `Saved file: ${r.resumeFileName}`;
  });

  // Load AI settings (including preference to allow storing plain API key)
  chrome.storage.sync.get(['aiProvider','openaiApiKey','aiModel','allowPlainApiKey'], (s) => {
    aiProvider.value = s.aiProvider || 'openai';
    openaiApiKey.value = s.openaiApiKey || '';
    aiModel.value = s.aiModel || 'gpt-3.5-turbo';
    // checkbox for explicit opt-in to store plain API key
    try { document.getElementById('allowPlainKey').checked = !!s.allowPlainApiKey; } catch(e){}
  });

  // Load encrypted key status
  chrome.storage.sync.get(['encryptedOpenaiApiKey'], (r) => {
    if (r && r.encryptedOpenaiApiKey) apiStatus.textContent = 'Encrypted API key stored';
  });

  resumeFile.addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    // Limit resume size to 5 MB to avoid huge storage uploads
    const MAX_BYTES = 5 * 1024 * 1024;
    if (f.size > MAX_BYTES) {
      setStatus(status, `File too large (${Math.round(f.size/1024)} KB). Max 5MB.` , 4000);
      resumeFile.value = '';
      resumeFile._dataUrl = null;
      resumeFile._name = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        // Store base64 data URI
        const dataUrl = reader.result;
        resumeInfo.textContent = `Selected: ${f.name} (${Math.round(f.size/1024)} KB)`;
        // Persist to a temp place until Save is clicked
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

  saveBtn.addEventListener('click', () => {
    const resumeData = {
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      phone: phone.value,
      city: city.value,
      state: state.value
    };
    // Basic validation
    function isValidEmail(e) {
      if (!e) return false;
      const re = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      return re.test(e.trim());
    }
    if (email.value && !isValidEmail(email.value)) {
      setStatus(status, 'Please enter a valid email address', 3000);
      return;
    }
    if (resumeFile._dataUrl) {
      resumeData.resumeFile = resumeFile._dataUrl;
      resumeData.resumeFileName = resumeFile._name;
    }

    const aiSettings = { aiProvider: aiProvider.value, aiModel: aiModel.value };

    // If user provided a plain API key, only store it when user explicitly allows storing plain keys
    const allowPlain = !!(document.getElementById('allowPlainKey') && document.getElementById('allowPlainKey').checked);
    const toStore = { autoApply: autoApply.checked, resumeData, ...aiSettings, allowPlainApiKey: allowPlain };
    if (openaiApiKey.value) {
      if (allowPlain) {
        toStore.openaiApiKey = openaiApiKey.value;
        setStatus(apiStatus, 'Plain API key saved (not recommended)', 3500);
      } else {
        setStatus(apiStatus, 'API key present but not saved. Enable "Allow storing plain API key" to save.', 4500);
      }
    }

    chrome.storage.sync.set(toStore, () => {
      if (chrome.runtime.lastError) {
        console.error('storage.set error', chrome.runtime.lastError);
        setStatus(status, 'Save failed: ' + chrome.runtime.lastError.message, 4000);
        return;
      }
      setStatus(status, 'Saved', 2000);
    });
  });

  clearBtn.addEventListener('click', () => {
    chrome.storage.sync.remove(['resumeData','autoApply'], () => {
      if (chrome.runtime.lastError) console.error('storage.remove error', chrome.runtime.lastError);
      firstName.value = lastName.value = email.value = phone.value = city.value = state.value = '';
      resumeFile.value = '';
      resumeFile._dataUrl = null;
      resumeInfo.textContent = '';
      setStatus(status, 'Cleared', 2000);
    });
  });

  // Encrypt & save API key using passphrase
  encryptKeyBtn.addEventListener('click', async () => {
    const key = openaiApiKey.value;
    const pass = apiPassphrase.value;
    if (!key || !pass) {
      setStatus(apiStatus, 'Provide both API key and passphrase', 3000);
      return;
    }
    setStatus(apiStatus, 'Encrypting...', 0);
    try {
      // CryptoHelper is provided by utils/crypto.js (loaded by options page)
      const encrypted = await CryptoHelper.encryptText(pass, key);
      await new Promise(res => chrome.storage.sync.set({ encryptedOpenaiApiKey: encrypted }, res));
      // Remove plain key if present (unless user explicitly allows storing it)
      const allowPlain = !!(document.getElementById('allowPlainKey') && document.getElementById('allowPlainKey').checked);
      if (!allowPlain) await new Promise(res => chrome.storage.sync.remove(['openaiApiKey'], res));
      setStatus(apiStatus, 'Encrypted API key saved', 2500);
    } catch (e) {
      console.error('Encryption error', e);
      setStatus(apiStatus, 'Encryption failed: ' + (e.message || e), 4000);
    }
    // clear earlier persistent 'Encrypting...' if still set
    setTimeout(() => { if (apiStatus.textContent === 'Encrypting...') apiStatus.textContent = ''; }, 2500);
  });

  // Unlock API key for session: decrypt and send to background for in-memory use
  unlockKeyBtn.addEventListener('click', async () => {
    const pass = apiPassphrase.value;
    if (!pass) { apiStatus.textContent = 'Enter passphrase to unlock'; return; }
    setStatus(apiStatus, 'Unlocking...', 0);
    chrome.storage.sync.get(['encryptedOpenaiApiKey'], async (r) => {
      if (chrome.runtime.lastError) {
        console.error('storage.get error', chrome.runtime.lastError);
        setStatus(apiStatus, 'Storage read error', 3000);
        return;
      }
      const blob = r && r.encryptedOpenaiApiKey;
      if (!blob) { setStatus(apiStatus, 'No encrypted key stored', 3000); return; }
      try {
        const plain = await CryptoHelper.decryptText(pass, blob);
        // Send decrypted key to background for session use
        chrome.runtime.sendMessage({ action: 'unlockApiKey', apiKey: plain }, (resp) => {
          if (chrome.runtime.lastError) console.error('sendMessage error', chrome.runtime.lastError);
          setStatus(apiStatus, resp && resp.unlocked ? 'API key unlocked for session' : 'Unlock failed in background', 2500);
        });
      } catch (e) {
        console.error('Decrypt failed', e);
        setStatus(apiStatus, 'Decrypt failed: ' + (e.message || e), 3500);
      }
    });
  });

  // Validate API key with a low-cost test call
  const validateResult = document.getElementById('validateResult');
  const encryptValidateBtn = document.getElementById('encryptValidateBtn');

  async function showValidateResult(text) {
    try {
      if (validateResult) validateResult.textContent = typeof text === 'string' ? text : JSON.stringify(text, null, 2);
    } catch (e) { console.warn('showValidateResult error', e); }
  }

  if (typeof validateKeyBtn !== 'undefined' && validateKeyBtn) {
    validateKeyBtn.addEventListener('click', async () => {
      const provider = aiProvider.value || 'openai';
      const key = openaiApiKey.value;
      const model = aiModel.value || 'gpt-3.5-turbo';

      // If provider requires a key, ensure one is present or instruct user to unlock
      if ((provider === 'openai' || provider === 'github') && (!key || key.trim() === '')) {
        // Check if an encrypted key exists
        chrome.storage.sync.get(['encryptedOpenaiApiKey'], (r) => {
          if (r && r.encryptedOpenaiApiKey) {
            setStatus(apiStatus, 'Key is encrypted. Unlock it in Options or popup before validating.', 4000);
          } else {
            setStatus(apiStatus, 'No API key provided. Paste your key or encrypt one first.', 4000);
          }
        });
        return;
      }

      setStatus(apiStatus, 'Validating API key...', 0);
      showValidateResult('');
      try {
        // Minimal ping-style messages; we only need to know whether the provider accepts the key
        const messages = [
          { role: 'system', content: 'You are a lightweight validation assistant. Respond briefly.' },
          { role: 'user', content: 'Ping: please respond with short confirmation.' }
        ];
        const result = await ApiConnector.call({ provider, apiKey: key, model, messages, max_tokens: 10, temp: 0 });
        setStatus(apiStatus, 'Validation succeeded', 3000);
        console.log('Validate API key result:', result);
        showValidateResult(result);
      } catch (err) {
        console.error('Validate API key error', err);
        setStatus(apiStatus, 'Validation failed: ' + (err && err.message ? err.message : err), 6000);
        showValidateResult(err && err.message ? err.message : String(err));
      }
    });
  }

  // Encrypt + Validate flow
  if (typeof encryptValidateBtn !== 'undefined' && encryptValidateBtn) {
    encryptValidateBtn.addEventListener('click', async () => {
      const provider = aiProvider.value || 'openai';
      const key = openaiApiKey.value;
      const model = aiModel.value || 'gpt-3.5-turbo';
      const pass = apiPassphrase.value;

      if (!key) {
        // if no key in input, check for encrypted and instruct unlock
        const r = await new Promise(res => chrome.storage.sync.get(['encryptedOpenaiApiKey'], res));
        if (r && r.encryptedOpenaiApiKey) { setStatus(apiStatus, 'No plain key in input. Unlock the encrypted key first.', 4000); return; }
        setStatus(apiStatus, 'Provide API key in the input to validate and encrypt', 4000); return;
      }

      setStatus(apiStatus, 'Validating API key...', 0);
      showValidateResult('');
      try {
        const messages = [
          { role: 'system', content: 'You are a lightweight validation assistant. Respond briefly.' },
          { role: 'user', content: 'Ping: please respond with short confirmation.' }
        ];
        const result = await ApiConnector.call({ provider, apiKey: key, model, messages, max_tokens: 10, temp: 0 });
        setStatus(apiStatus, 'Validation succeeded — encrypting (if passphrase provided)', 3000);
        showValidateResult(result);
        if (!pass) { setStatus(apiStatus, 'Validation OK. Provide a passphrase to encrypt.', 4000); return; }
        // Encrypt and save
        try {
          const encrypted = await CryptoHelper.encryptText(pass, key);
          await new Promise(res => chrome.storage.sync.set({ encryptedOpenaiApiKey: encrypted }, res));
          // Remove plain key unless user opted in
          const allowPlain = !!(document.getElementById('allowPlainKey') && document.getElementById('allowPlainKey').checked);
          if (!allowPlain) await new Promise(res => chrome.storage.sync.remove(['openaiApiKey'], res));
          setStatus(apiStatus, 'Encrypted API key saved', 3000);
        } catch (ee) {
          console.error('Encrypt after validate failed', ee);
          setStatus(apiStatus, 'Encrypt after validate failed: ' + (ee.message || ee), 4000);
        }
      } catch (err) {
        console.error('Encrypt+Validate failed', err);
        setStatus(apiStatus, 'Validation failed: ' + (err && err.message ? err.message : err), 6000);
        showValidateResult(err && err.message ? err.message : String(err));
      }
    });
  }
});
