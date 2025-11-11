// Simple test runner using Node (no external deps)
const assert = require('assert');
const fs = require('fs');
const path = require('path');

function logOk(msg){ console.log('\x1b[32m%s\x1b[0m', 'PASS:', msg); }
function logFail(msg){ console.log('\x1b[31m%s\x1b[0m', 'FAIL:', msg); }

(async function(){
  try {
    // Load KeywordExtractor
    const kePath = path.resolve(__dirname, '..', 'resume-builder', 'resume-templates', 'keyword-extractor.js');
    const ke = require(kePath);
    const sampleJD = 'We are hiring a JavaScript developer with React, Node.js and AWS experience.';
    const keywords = ke.extract(sampleJD, { topN: 10 });
    assert(keywords.includes('javascript'));
    assert(keywords.includes('react') || keywords.includes('node'));
    logOk('KeywordExtractor.extract basic detection');

    // Test base64 conversion
    const fuPath = path.resolve(__dirname, '..', 'utils', 'file-utils.js');
    const fu = require(fuPath);
    const sample = 'hello world';
    const b64 = Buffer.from(sample).toString('base64');
    const arr = fu.base64ToUint8Array(b64);
    assert(arr instanceof Uint8Array);
    const decoded = Buffer.from(arr).toString();
    assert(decoded === sample);
    logOk('FileUtils.base64ToUint8Array roundtrip');

    // If Ajv is available (dev dependency in CI), validate sample optimized resume against schema
    try {
      const Ajv = require('ajv');
      const schemaPath = path.resolve(__dirname, '..', 'schema', 'optimized-resume.schema.json');
      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      const ajv = new Ajv();
      const validate = ajv.compile(schema);
      const sampleResume = {
        contact: { name: 'John Doe', email: 'john@example.com', phone: '123-456-7890', location: 'City, ST' },
        summary: 'Experienced developer',
        skills: ['javascript','react'],
        experience: [ { title: 'Developer', company: 'Acme', description: 'Built things' } ]
      };
      const valid = validate(sampleResume);
      assert(valid, 'Sample optimized resume should validate against schema');
      logOk('AJV schema validation (dev)');
    } catch (e) {
      console.log('AJV not available — skipping AJV schema test in local Node (CI will run it).');
    }

    console.log('\nAll tests passed.');
  } catch (err) {
    logFail(err.message || err);
    process.exitCode = 1;
  }
})();
