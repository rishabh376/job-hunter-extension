// Lightweight crypto helper using Web Crypto API
// Provides: CryptoHelper.encryptText(passphrase, plaintext) -> base64 ciphertext
//           CryptoHelper.decryptText(passphrase, ciphertext) -> plaintext
(function(global){
  const toBase64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const fromBase64 = (b64) => Uint8Array.from(atob(b64), c => c.charCodeAt(0));

  async function getKeyMaterial(passphrase) {
    const enc = new TextEncoder();
    return await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  }

  async function deriveKey(passphrase, salt) {
    const keyMat = await getKeyMaterial(passphrase);
    return await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, keyMat, { name: 'AES-GCM', length: 256 }, false, ['encrypt','decrypt']);
  }

  async function encryptText(passphrase, plaintext) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await deriveKey(passphrase, salt);
    const enc = new TextEncoder();
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext));
    // return salt|iv|ciphertext as base64 joined with ':'
    return [toBase64(salt), toBase64(iv), toBase64(ct)].join(':');
  }

  async function decryptText(passphrase, blob) {
    const parts = blob.split(':');
    if (parts.length !== 3) throw new Error('Invalid encrypted data');
    const salt = fromBase64(parts[0]);
    const iv = fromBase64(parts[1]);
    const ct = fromBase64(parts[2]);
    const key = await deriveKey(passphrase, salt);
    const ptBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    const dec = new TextDecoder();
    return dec.decode(ptBuf);
  }

  global.CryptoHelper = { encryptText, decryptText };

  // CommonJS export for tests / Node (will not work in Node without Web Crypto but kept for UMD completeness)
  try { if (typeof module !== 'undefined') module.exports = global.CryptoHelper; } catch(e){}
})(typeof self !== 'undefined' ? self : this);
