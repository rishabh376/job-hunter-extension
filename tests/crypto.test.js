const assert = require('assert');
const path = require('path');

// Node 18+ has Web Crypto (globalThis.crypto.subtle)
const CryptoHelper = require(path.resolve(__dirname, '..', 'utils', 'crypto.js'));

async function run(){
  const pass = 'test-passphrase';
  const secret = 'sk-test-12345';
  const encrypted = await CryptoHelper.encryptText(pass, secret);
  const decrypted = await CryptoHelper.decryptText(pass, encrypted);
  assert(decrypted === secret, 'decrypted text should match original');
  console.log('crypto.test.js: PASS');
}

if (require.main === module) run();
module.exports = run;
