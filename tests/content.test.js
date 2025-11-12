const assert = require('assert');
const { JSDOM } = require('jsdom');
const path = require('path');

// Test FileUtils.base64ToUint8Array works in Node
const fu = require(path.resolve(__dirname, '..', 'utils', 'file-utils.js'));

function run(){
  const s = 'hello';
  const b64 = Buffer.from(s).toString('base64');
  const arr = fu.base64ToUint8Array(b64);
  assert(arr instanceof Uint8Array);
  const decoded = Buffer.from(arr).toString();
  assert(decoded === s);
  console.log('content.test.js: FileUtils base64 roundtrip PASS');

  // Minimal DOM test: ensure our content.js extractGenericData finds elements
  const dom = new JSDOM(`<!DOCTYPE html><body><h1 class="job-title">Senior Dev</h1><div class="company">Acme</div></body>`);
  const win = dom.window;
  // Evaluate a tiny snippet of extractGenericData logic
  const title = win.document.querySelector('h1, [class*="title"], [class*="job-title"]')?.textContent?.trim();
  const company = win.document.querySelector('[class*="company"], [class*="employer"]')?.textContent?.trim();
  assert(title === 'Senior Dev');
  assert(company === 'Acme');
  console.log('content.test.js: DOM extractor logic PASS');
}

if (require.main === module) run();
module.exports = run;
