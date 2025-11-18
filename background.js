// Background service worker
// Load shared utilities
try {
  importScripts('utils/api-connector.js');
  importScripts('utils/crypto.js');
} catch (e) {
  console.warn('Could not import utilities in background:', e);
}

// In-memory unlocked API key (session only)
let unlockedApiKey = null;
chrome.runtime.onInstalled.addListener(function() {
  console.log('Job Hunter Pro installed');
  
  // Create context menu
  chrome.contextMenus.create({
    id: 'quickApply',
    title: 'Quick Apply with Job Hunter Pro',
    contexts: ['page'],
    documentUrlPatterns: [
      'https://*.linkedin.com/jobs/*',
      'https://*.indeed.com/*',
      'https://*.glassdoor.com/*'
    ]
  });
});

// Handle messages from content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // Background optimization request from popup
  if (request.action === 'optimizeResumeRequest') {
    (async () => {
      try {
        // Find active tab
        const tabs = await new Promise(res => chrome.tabs.query({ active: true, currentWindow: true }, res));
        const tab = tabs && tabs[0];
        if (!tab) return sendResponse({ success: false, error: 'No active tab' });

        // Ask content script for job description
        const jd = await new Promise((res) => {
          chrome.tabs.sendMessage(tab.id, { action: 'getJobDescription' }, (resp) => res(resp && resp.jobDescription));
        });

        // Get resume data and api settings
        const stored = await new Promise(res => chrome.storage.sync.get(['resumeData','openaiApiKey','aiProvider','aiModel','encryptedOpenaiApiKey'], res));
        const resumeData = (stored && stored.resumeData) || null;
        // Prefer in-memory unlocked key, otherwise fallback to stored plain key
        const apiKey = unlockedApiKey || ((stored && stored.openaiApiKey) ? stored.openaiApiKey : null);
        const provider = (stored && stored.aiProvider) || 'openai';
        const model = (stored && stored.aiModel) || 'gpt-3.5-turbo';

        if (!resumeData) return sendResponse({ success: false, error: 'No resume data found in settings' });
        if (!apiKey) {
          // If there's an encrypted key present, instruct the user to unlock via the popup/options
          if (stored && stored.encryptedOpenaiApiKey) {
            return sendResponse({ success: false, error: 'API key is encrypted. Please unlock it in the extension popup or Options.' });
          }
          return sendResponse({ success: false, error: 'No API key available. Add it in Options or unlock it for session.' });
        }

        // Build prompt
        // Stronger prompt: ask model to return only JSON and wrap result in a JSON fence.
        const userPrompt = `Optimize the following resume for this job description. Return only valid JSON (no explanatory text) with the same structure as the input. Wrap the JSON in triple backticks and label as json.\n\nJob Description:\n${jd || 'N/A'}\n\nCurrent Resume:\n${JSON.stringify(resumeData, null, 2)}`;

        const messages = [
          { role: 'system', content: 'You are an expert resume writer and ATS optimization specialist. Always return valid JSON and nothing else.' },
          { role: 'user', content: userPrompt }
        ];

        // Call API connector
        let result;
        try {
          result = await ApiConnector.call({ provider, apiKey, model, messages, max_tokens: 1500, temp: 0.7 });
        } catch (apiErr) {
          console.error('API call failed', apiErr);
          return sendResponse({ success: false, error: 'AI provider call failed: ' + (apiErr && apiErr.message ? apiErr.message : apiErr) });
        }

        // Try to extract JSON block from model output robustly
        let optimized = null;
        try {
          // Attempt direct parse
          optimized = JSON.parse(result);
        } catch (e1) {
          // Try to extract JSON between code fences ```json ... ``` or ``` ... ```
          const fenceMatch = result.match(/```(?:json\s*)?([\s\S]*?)```/i);
          const candidate = fenceMatch ? fenceMatch[1].trim() : result.trim();
          try { optimized = JSON.parse(candidate); } catch (e2) { optimized = { optimizedText: result }; }
        }

        // Persist optimized resume for later retrieval
        await new Promise(res => chrome.storage.sync.set({ optimizedResume: optimized }, res));

        sendResponse({ success: true, optimized });
      } catch (err) {
        console.error('optimizeResumeRequest error', err);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true; // keep channel open for async sendResponse
  }

  if (request.action === 'jobDetected') {
    console.log('Job detected:', request.jobData);
    
    // Update badge
    chrome.action.setBadgeText({
      text: '!',
      tabId: sender.tab.id
    });
    
    // Store job data
    chrome.storage.local.get(['jobHistory'], function(data) {
      const jobHistory = data.jobHistory || [];
      jobHistory.push({
        ...request.jobData,
        url: request.url,
        timestamp: Date.now()
      });
      chrome.storage.local.set({ jobHistory });
    });
    
    // Auto-apply if enabled
    chrome.storage.sync.get(['autoApply'], function(data) {
      if (data.autoApply) {
        // Trigger auto-application
        chrome.tabs.sendMessage(sender.tab.id, { action: 'startAutoApply' });
      }
    });
  }
  
  // Accept unlocked API key for session
  if (request.action === 'unlockApiKey') {
    unlockedApiKey = request.apiKey || null;
    console.log('Background: unlocked API key for session:', !!unlockedApiKey);
    sendResponse({ unlocked: !!unlockedApiKey });
    return;
  }
  
  // Report whether API key is unlocked in memory
  if (request.action === 'getApiUnlockedStatus') {
    sendResponse({ unlocked: !!unlockedApiKey });
    return;
  }

  // Get session status (used by options page)
  if (request.action === 'getSessionStatus') {
    sendResponse({ apiKeyUnlocked: !!unlockedApiKey });
    return;
  }
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === 'quickApply') {
    chrome.tabs.sendMessage(tab.id, { action: 'quickApply' });
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener(function(tab) {
  chrome.tabs.sendMessage(tab.id, { action: 'toggleJobHunter' });
});