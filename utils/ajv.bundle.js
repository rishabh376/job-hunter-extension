/* Lightweight Ajv-like runtime used only for in-browser validation in the popup.
   This is a small, focused validator that supports the schema features used by our optimized resume schema.
   It exposes a global `Ajv` constructor with `compile(schema)` returning a validate function.
   The validate function returns true/false and sets `validate.errors` array when invalid.
*/
(function(global){
  function makeError(path, message){ return { instancePath: path, message }; }

  function Ajv(){ }

  Ajv.prototype.compile = function(schema){
    function validate(obj){
      const errors = [];
      if (schema.type === 'object'){
        const req = schema.required || [];
        req.forEach(p => { if (!Object.prototype.hasOwnProperty.call(obj, p)) errors.push(makeError('/'+p, 'is required')); });
      }

      // contact checks
      try {
        if (obj && obj.contact) {
          if (schema.properties && schema.properties.contact && schema.properties.contact.required) {
            const creq = schema.properties.contact.required;
            creq.forEach(k => { if (!obj.contact || typeof obj.contact[k] !== 'string' || obj.contact[k].trim()==='') errors.push(makeError('/contact/'+k, k+' is required')); });
          }
          if (obj.contact && obj.contact.email && typeof obj.contact.email === 'string'){
            const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
            if (!emailRe.test(obj.contact.email)) errors.push(makeError('/contact/email','email format invalid'));
          }
        } else {
          errors.push(makeError('/contact','missing contact'));
        }
      } catch(e){ errors.push(makeError('/','validation-error')); }

      // skills
      if (!Array.isArray(obj.skills) || obj.skills.length < 1) errors.push(makeError('/skills','should be a non-empty array'));

      // experience
      if (!Array.isArray(obj.experience) || obj.experience.length < 1) errors.push(makeError('/experience','should be a non-empty array'));
      else {
        obj.experience.forEach((job, idx) => {
          if (!job || typeof job.title !== 'string' || job.title.trim()==='') errors.push(makeError(`/experience/${idx}/title`, 'title is required'));
        });
      }

      validate.errors = errors.length ? errors : null;
      return errors.length === 0;
    }
    return validate;
  };

  global.Ajv = Ajv;
  try { if (typeof module !== 'undefined') module.exports = Ajv; } catch(e){}
})(typeof self !== 'undefined' ? self : this);
