// Background service worker
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