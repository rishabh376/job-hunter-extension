// Central wrapper around chrome.storage with namespacing and fallbacks
const StorageManager = (() => {
  const NAMESPACE = 'jh_';                 // prefix every key
  const AREA      = chrome.storage.sync;   // or local for >8 kB values

  const key = k => NAMESPACE + k;

  return {
    get:  (keys, cb) => AREA.get(keys.map(key), cb),
    set:  (obj, cb) => AREA.set(Object.fromEntries(
              Object.entries(obj).map(([k,v]) => [key(k),v])), cb),
    remove: (keys, cb) => AREA.remove(keys.map(key), cb),
    clear:  (cb) => AREA.clear(cb),
    bytesLeft: (cb) => AREA.getBytesInUse(cb) // quota helper
  };
})();