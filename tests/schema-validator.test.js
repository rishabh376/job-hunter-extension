const assert = require('assert');
const path = require('path');

// Ensure real Ajv is available for the SchemaValidator in Node tests
global.Ajv = require('ajv');
const SchemaValidator = require(path.resolve(__dirname, '..', 'utils', 'schema-validator.js'));

function run(){
  const validResume = {
    contact: { name: 'Jane Doe', email: 'jane@example.com' },
    skills: ['javascript','react'],
    experience: [ { title: 'Engineer', company: 'Acme', description: 'Did stuff' } ]
  };
  const invalidResume = { contact: { name: '', email: 'notanemail' }, skills: [], experience: [] };

  const r1 = SchemaValidator.validateOptimizedResume(validResume);
  assert(r1.valid, 'valid resume should pass');
  const r2 = SchemaValidator.validateOptimizedResume(invalidResume);
  assert(!r2.valid, 'invalid resume should fail');
  console.log('schema-validator.test.js: PASS');
}

if (require.main === module) run();
module.exports = run;
