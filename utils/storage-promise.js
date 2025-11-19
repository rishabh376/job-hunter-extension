/* Promise-based wrapper for chrome.storage.sync
   Provides: StoragePromise.get(keys) -> Promise
             StoragePromise.set(obj) -> Promise
             StoragePromise.remove(keys) -> Promise
*/
(function(global) {
  const StoragePromise = {
    get: (keys) => new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.get(keys, (result) => {
          if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
          else resolve(result || {});
        });
      } catch (e) { reject(e); }
    }),

    set: (obj) => new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.set(obj, () => {
          if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
          else resolve();
        });
      } catch (e) { reject(e); }
    }),

    remove: (keys) => new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.remove(keys, () => {
          if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
          else resolve();
        });
      } catch (e) { reject(e); }
    })
  };

  global.StoragePromise = StoragePromise;
  try { if (typeof module !== 'undefined') module.exports = StoragePromise; } catch(e){}
})(typeof self !== 'undefined' ? self : this);
