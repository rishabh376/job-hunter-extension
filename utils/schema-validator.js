/* Simple schema validator for optimized resume JSON
   Exports: SchemaValidator.validateOptimizedResume(obj) -> { valid: bool, errors: [string] }
*/
(function(global){
  function isNonEmptyString(v){ return typeof v === 'string' && v.trim().length > 0; }

  // JSON Schema (kept inline for popup/browser fallback). This mirrors schema/optimized-resume.schema.json
  const RESUME_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "required": ["contact","skills","experience"],
    "properties": {
      "contact": {
        "type": "object",
        "required": ["name","email"],
        "properties": {
          "name": { "type": "string" },
          "email": { "type": "string", "format": "email" },
          "phone": { "type": "string" },
          "location": { "type": "string" }
        }
      },
      "summary": { "type": "string" },
      "skills": { "type": "array", "items": { "type": "string" }, "minItems": 1 },
      "experience": {
        "type": "array",
        "minItems": 1,
        "items": {
          "type": "object",
          "required": ["title"],
          "properties": {
            "title": { "type": "string" },
            "company": { "type": "string" },
            "startDate": { "type": "string" },
            "endDate": { "type": "string" },
            "description": { "type": "string" }
          }
        }
      }
    },
    "additionalProperties": true
  };

  function validateOptimizedResume(obj){
    const errors = [];
    // If Ajv is available (bundled into the extension or in Node), use it for authoritative validation
    try {
      if (typeof Ajv !== 'undefined') {
        const ajv = new Ajv({ allErrors: true });
        const validate = ajv.compile(RESUME_SCHEMA);
        const valid = validate(obj);
        if (!valid) {
          (validate.errors || []).forEach(err => errors.push(`${err.instancePath} ${err.message}`));
        }
        return { valid: errors.length === 0, errors };
      }
    } catch (e) {
      // fall back to simple checks below
      console.warn('Ajv validation failed or Ajv not available, falling back to simple validator', e);
    }

    // Fallback simple validation (original lightweight rules)
    if (!obj || typeof obj !== 'object') { errors.push('Resume must be a JSON object'); return { valid:false, errors }; }

    if (!obj.contact) {
      errors.push('Missing contact section');
    } else {
      if (!isNonEmptyString(obj.contact.name)) errors.push('contact.name is required');
      if (!isNonEmptyString(obj.contact.email)) errors.push('contact.email is required');
      else {
        const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!emailRe.test(obj.contact.email)) errors.push('contact.email looks invalid');
      }
    }

    if (!Array.isArray(obj.skills) || obj.skills.length === 0) errors.push('skills should be a non-empty array');

    if (!Array.isArray(obj.experience) || obj.experience.length === 0) errors.push('experience should be a non-empty array');
    else {
      obj.experience.forEach((job, idx) => {
        if (!isNonEmptyString(job.title)) errors.push(`experience[${idx}].title is required`);
      });
    }

    return { valid: errors.length === 0, errors };
  }

  global.SchemaValidator = { validateOptimizedResume };
  try { if (typeof module !== 'undefined') module.exports = global.SchemaValidator; } catch(e){}
})(typeof self !== 'undefined' ? self : this);
