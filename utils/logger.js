// Console wrapper that can be toggled per environment
const Logger = (() => {
  const DEBUG_KEY = 'jh_debug';
  let enabled = false;

  chrome.storage.local.get([DEBUG_KEY], r => enabled = !!r[DEBUG_KEY]);

  const log = (level, ...args) => {
    if (!enabled) return;
    console[level]('[JobHunter]', ...args);
  };

  
// Public API sds
  return {
    on:  () => chrome.storage.local.set({ [DEBUG_KEY]: true }, () => enabled = true),
    off: () => chrome.storage.local.set({ [DEBUG_KEY]: false }, () => enabled = false),
    log: (...a) => log('log', ...a),
    warn: (...a) => log('warn', ...a),
    error: (...a) => log('error', ...a)
  };
})();