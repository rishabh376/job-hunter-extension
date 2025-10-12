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

  // Auto-apply toggle
  autoApplyToggle.addEventListener('change', function() {
    chrome.storage.sync.set({ autoApply: this.checked });
  });

  // Optimize resume button
  optimizeBtn.addEventListener('click', async function() {
    optimizeBtn.disabled = true;
    optimizeBtn.textContent = 'Optimizing...';
    
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Send message to content script
    chrome.tabs.sendMessage(tab.id, { action: 'optimizeResume' }, function(response) {
      if (response && response.success) {
        document.getElementById('optimizationStatus').innerHTML = 
          '<p style="color: green;">Resume optimized successfully!</p>';
      } else {
        document.getElementById('optimizationStatus').innerHTML = 
          '<p style="color: red;">Optimization failed. Please try again.</p>';
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