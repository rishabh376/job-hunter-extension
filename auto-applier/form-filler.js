// Generic form filler – works across most job boards
const FormFiller = (() => {
  const FILL_MAP = {
    firstName : /first.*name|fname|given.*name/i,
    lastName  : /last.*name|lname|surname/i,
    email     : /email|e-mail/i,
    phone     : /phone|mobile|tel/i,
    city      : /city|town/i,
    state     : /state|province|region/i,
    country   : /country/i,
    linkedin  : /linkedin/i,
    portfolio : /portfolio|website|url/i
  };

  const fill = async (profile) => {
    Logger.log('Filling application form…');

    // 1. Text inputs
    Object.entries(FILL_MAP).forEach(([key, regex]) => {
      const val = profile[key];
      if (!val) return;
      const input = findInput(regex);
      if (input && !input.value) {
        input.focus();
        input.value = val;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.blur();
      }
    });

    // 2. File upload (resume)
    const fileInput = document.querySelector('input[type="file"][accept*=".pdf"], input[type="file"][accept*="application/pdf"]');
    if (fileInput && profile.resumeFile) {
      const pdf = base64ToFile(profile.resumeFile, 'Resume.pdf');
      const dt = new DataTransfer(); dt.items.add(pdf);
      fileInput.files = dt.files;
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // 3. Checkboxes (equal opportunity / data retention)
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      const label = (cb.closest('label')?.textContent || '').toLowerCase();
      if (label.includes('agree') || label.includes('consent')) cb.checked = true;
    });

    // 4. Dropdowns (country, state, etc.)
    if (profile.country) selectOption(/country/i, profile.country);
    if (profile.state)  selectOption(/state|province/i, profile.state);
  };

  const findInput = (regex) => {
    const inputs = Array.from(document.querySelectorAll('input, textarea'));
    return inputs.find(el => regex.test(el.name) || regex.test(el.id) || regex.test(el.placeholder));
  };

  const selectOption = (regex, value) => {
    const select = document.querySelector('select');
    if (!select || !regex.test(select.name || select.id)) return;
    const opts = Array.from(select.options);
    const target = opts.find(o => o.text.toLowerCase().includes(value.toLowerCase()));
    if (target) { select.value = target.value; select.dispatchEvent(new Event('change')); }
  };

  const base64ToFile = (b64, filename) => {
    const arr = b64.split(','), mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]), n = bstr.length, u8 = new Uint8Array(n);
    while(n--) u8[n] = bstr.charCodeAt(n);
    return new File([u8], filename, { type: mime });
  };

  return { fill };
})();