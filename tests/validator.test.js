const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

// Load schema
const schemaPath = path.resolve(__dirname, '..', 'schema', 'optimized-resume.schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

const ajv = new Ajv();
const validate = ajv.compile(schema);

function run(){
  const validResume = {
    contact: { name: 'Jane Doe', email: 'jane@example.com' },
    skills: ['javascript','react'],
    experience: [ { title: 'Engineer', company: 'Acme', description: 'Did stuff' } ]
  };
  const invalidResume = { contact: { name: '', email: 'notanemail' }, skills: [], experience: [] };

  assert(validate(validResume) === true, 'validResume should validate');
  assert(validate(invalidResume) === false, 'invalidResume should fail');

  console.log('validator.test.js: PASS');
}

if (require.main === module) run();
module.exports = run;
