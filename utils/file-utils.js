/* File utilities: base64 -> Uint8Array conversion for tests and browser usage */
(function(global){
  function base64ToUint8Array(base64) {
    // Accept data URLs and bare base64
    const idx = base64.indexOf(',');
    const raw = idx >= 0 ? base64.slice(idx+1) : base64;
    // atob available in browser; in Node use Buffer
    if (typeof atob === 'function') {
      const bin = atob(raw);
      const len = bin.length;
      const arr = new Uint8Array(len);
      for (let i = 0; i < len; i++) arr[i] = bin.charCodeAt(i);
      return arr;
    } else if (typeof Buffer !== 'undefined') {
      return Uint8Array.from(Buffer.from(raw, 'base64'));
    } else {
      throw new Error('No base64 decoder available');
    }
  }

  // browser-only: create a File object from data URL
  function base64ToFile(base64, filename) {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const u8 = base64ToUint8Array(base64);
    try { return new File([u8], filename, { type: mime }); } catch(e) { return { name: filename, type: mime, size: u8.length, _uint8: u8 }; }
  }

  global.FileUtils = { base64ToUint8Array, base64ToFile };
  try { if (typeof module !== 'undefined') module.exports = global.FileUtils; } catch(e){}
})(typeof self !== 'undefined' ? self : this);
