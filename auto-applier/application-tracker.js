// Persist every application attempt + outcome
const ApplicationTracker = (() => {
  const log = (jobData, status = 'applied', meta = {}) => {
    const entry = {
      id: crypto.randomUUID(),
      jobTitle: jobData.title,
      company: jobData.company,
      url: jobData.url,
      timestamp: Date.now(),
      status,               // applied | error | interview | rejected
      ...meta
    };

    chrome.storage.local.get({ applications: [] }, r => {
      const apps = r.applications;
      apps.unshift(entry); // newest first
      chrome.storage.local.set({ applications: apps.slice(0, 5000) }); // cap size
    });

    // Also push to optional webhook (Discord, Slack, etc.)
    if (meta.webhook) fetch(meta.webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: `📬 Applied to **${jobData.title}** at **${jobData.company}**` })
    }).catch(()=>{});
  };

  const getStats = () => new Promise(res => {
    chrome.storage.local.get({ applications: [] }, r => {
      const apps = r.applications;
      const now = Date.now();
      const today = apps.filter(a => now - a.timestamp < 86400_000).length;
      const week  = apps.filter(a => now - a.timestamp < 604800_000).length;
      res({ total: apps.length, today, week });
    });
  });

  return { log, getStats };
})();