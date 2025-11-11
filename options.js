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
  const unlockKeyBtn = document.getElementById('unlockKeyBtn');
  const apiPassphrase = document.getElementById('apiPassphrase');
  const apiStatus = document.getElementById('apiStatus');

  // Load settings
  chrome.storage.sync.get(['autoApply','resumeData'], (data) => {
    autoApply.checked = !!data.autoApply;
    const r = data.resumeData || {};
    firstName.value = r.firstName || '';
    lastName.value = r.lastName || '';
    email.value = r.email || '';
    phone.value = r.phone || '';
    city.value = r.city || '';
    state.value = r.state || '';
    if (r.resumeFileName) resumeInfo.textContent = `Saved file: ${r.resumeFileName}`;
  });

  // Load AI settings
  chrome.storage.sync.get(['aiProvider','openaiApiKey','aiModel'], (s) => {
    aiProvider.value = s.aiProvider || 'openai';
    openaiApiKey.value = s.openaiApiKey || '';
    aiModel.value = s.aiModel || 'gpt-3.5-turbo';
  });

  // Load encrypted key status
  chrome.storage.sync.get(['encryptedOpenaiApiKey'], (r) => {
    if (r && r.encryptedOpenaiApiKey) apiStatus.textContent = 'Encrypted API key stored';
  });

  resumeFile.addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      // Store base64 data URI
      const dataUrl = reader.result;
      resumeInfo.textContent = `Selected: ${f.name} (${Math.round(f.size/1024)} KB)`;
      // Persist to a temp place until Save is clicked
      resumeFile._dataUrl = dataUrl;
      resumeFile._name = f.name;
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
    if (resumeFile._dataUrl) {
      resumeData.resumeFile = resumeFile._dataUrl;
      resumeData.resumeFileName = resumeFile._name;
    }

    const aiSettings = { aiProvider: aiProvider.value, aiModel: aiModel.value };

    // If user provided a plain API key, store it (unencrypted) unless they choose to encrypt.
    const toStore = { autoApply: autoApply.checked, resumeData, ...aiSettings };
    if (openaiApiKey.value) toStore.openaiApiKey = openaiApiKey.value;

    chrome.storage.sync.set(toStore, () => {
      status.textContent = 'Saved';
      setTimeout(() => status.textContent = '', 2000);
    });
  });

  clearBtn.addEventListener('click', () => {
    chrome.storage.sync.remove(['resumeData','autoApply'], () => {
      firstName.value = lastName.value = email.value = phone.value = city.value = state.value = '';
      resumeFile.value = '';
      resumeFile._dataUrl = null;
      resumeInfo.textContent = '';
      status.textContent = 'Cleared';
      setTimeout(() => status.textContent = '', 2000);
    });
  });

  // Encrypt & save API key using passphrase
  encryptKeyBtn.addEventListener('click', async () => {
    const key = openaiApiKey.value;
    const pass = apiPassphrase.value;
    if (!key || !pass) {
      apiStatus.textContent = 'Provide both API key and passphrase';
      return;
    }
    apiStatus.textContent = 'Encrypting...';
    try {
      // CryptoHelper is provided by utils/crypto.js (loaded by options page)
      const encrypted = await CryptoHelper.encryptText(pass, key);
      await new Promise(res => chrome.storage.sync.set({ encryptedOpenaiApiKey: encrypted }, res));
      // Remove plain key if present
      await new Promise(res => chrome.storage.sync.remove(['openaiApiKey'], res));
      apiStatus.textContent = 'Encrypted API key saved';
    } catch (e) {
      apiStatus.textContent = 'Encryption failed: ' + e.message;
    }
    setTimeout(() => apiStatus.textContent = '', 2500);
  });

  // Unlock API key for session: decrypt and send to background for in-memory use
  unlockKeyBtn.addEventListener('click', async () => {
    const pass = apiPassphrase.value;
    if (!pass) { apiStatus.textContent = 'Enter passphrase to unlock'; return; }
    apiStatus.textContent = 'Unlocking...';
    chrome.storage.sync.get(['encryptedOpenaiApiKey'], async (r) => {
      const blob = r.encryptedOpenaiApiKey;
      if (!blob) { apiStatus.textContent = 'No encrypted key stored'; return; }
      try {
        const plain = await CryptoHelper.decryptText(pass, blob);
        // Send decrypted key to background for session use
        chrome.runtime.sendMessage({ action: 'unlockApiKey', apiKey: plain }, (resp) => {
          apiStatus.textContent = resp && resp.unlocked ? 'API key unlocked for session' : 'Unlock failed in background';
          setTimeout(() => apiStatus.textContent = '', 2000);
        });
      } catch (e) {
        apiStatus.textContent = 'Decrypt failed: ' + e.message;
        setTimeout(() => apiStatus.textContent = '', 2500);
      }
    });
  });
});
