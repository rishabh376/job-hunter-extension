// Decide *whether* we should apply (rate-limit + rules)
const JobScanner = (() => {
  // Default rules (fallback if storage fails)
  const DEFAULT_RULES = {
    maxPerHour: 5,
    minSalary: '',
    maxSalary: '',
    mustHave: [],
    notInTitle: [],
    locales: []
  };

  // Load rules from storage
  const loadRules = async () => {
    try {
      const data = await new Promise((resolve) => {
        chrome.storage.sync.get([
          'jobTitleKeywords', 'minSalary', 'maxSalary', 'preferredLocations',
          'excludeTitles', 'requiredSkills', 'maxAppsPerHour'
        ], (result) => {
          if (chrome.runtime.lastError) {
            console.error('Storage error:', chrome.runtime.lastError);
            resolve(DEFAULT_RULES);
          } else {
            resolve(result);
          }
        });
      });

      return {
        maxPerHour: parseInt(data.maxAppsPerHour) || DEFAULT_RULES.maxPerHour,
        minSalary: data.minSalary ? parseFloat(data.minSalary) : '',
        maxSalary: data.maxSalary ? parseFloat(data.maxSalary) : '',
        mustHave: data.requiredSkills ? data.requiredSkills.split(',').map(s => s.trim()).filter(s => s) : DEFAULT_RULES.mustHave,
        notInTitle: data.excludeTitles ? data.excludeTitles.split(',').map(s => s.trim()).filter(s => s) : DEFAULT_RULES.notInTitle,
        locales: data.preferredLocations ? data.preferredLocations.split(',').map(s => s.trim()).filter(s => s) : DEFAULT_RULES.locales,
        titleKeywords: data.jobTitleKeywords ? data.jobTitleKeywords.split(',').map(s => s.trim()).filter(s => s) : []
      };
    } catch (e) {
      console.error('loadRules error:', e);
      return DEFAULT_RULES;
    }
  };

  const shouldApply = async (jobData) => {
    const rules = await loadRules();
    const { title, salary, location, description } = jobData;

    // Check excluded titles
    if (rules.notInTitle.some(t => title.toLowerCase().includes(t.toLowerCase()))) return false;

    // Check title keywords (if specified)
    if (rules.titleKeywords.length > 0) {
      const hasTitleKeyword = rules.titleKeywords.some(k =>
        title.toLowerCase().includes(k.toLowerCase())
      );
      if (!hasTitleKeyword) return false;
    }

    // Rate limiting
    const hourlyCount = await getHourlyCount();
    if (hourlyCount >= rules.maxPerHour) return false;

    // Required skills check
    const hasMustHave = rules.mustHave.length === 0 ||
                        rules.mustHave.some(k => description.toLowerCase().includes(k.toLowerCase()));

    // Salary range check
    let salaryOK = true;
    if (salary) {
      const extractedSalary = extractSalaryINR(salary);
      if (rules.minSalary && extractedSalary < rules.minSalary) salaryOK = false;
      if (rules.maxSalary && extractedSalary > rules.maxSalary) salaryOK = false;
    }

    // Location check
    const localeOK = rules.locales.length === 0 ||
                     rules.locales.some(l => location.toLowerCase().includes(l.toLowerCase()));

    return hasMustHave && salaryOK && localeOK;
  };

  const getHourlyCount = () => new Promise(res => {
    chrome.storage.local.get(['hourlyApps'], r => {
      const arr = r.hourlyApps || [];
      const cutOff = Date.now() - 3600_000;
      const recent = arr.filter(t => t > cutOff);
      chrome.storage.local.set({ hourlyApps: recent });
      res(recent.length);
    });
  });

  // Extract minimum salary from a string, supporting INR and USD
  const extractSalaryINR = (txt) => {
    // Try to match INR (₹, INR, LPA, etc.)
    const inrMatch = txt.match(/(₹|INR)?\s*([\d,.]+)\s*(LPA|lpa|lakhs?|per annum)?/);
    if (inrMatch) {
      let num = inrMatch[2].replace(/,/g, '');
      let val = parseFloat(num);
      // If LPA or lakhs, multiply by 100000
      if (/LPA|lpa|lakh/i.test(inrMatch[3] || '')) val *= 100000;
      // If value is very low, assume it's in lakhs
      if (val < 1000) val *= 100000;
      return val;
    }
    // Fallback: try USD (convert to INR, rough rate)
    const usdMatch = txt.match(/\$([\d,]+)/);
    if (usdMatch) {
      let usd = parseInt(usdMatch[1].replace(/,/g, ''));
      return usd * 83; // Approximate USD to INR
    }
    // Fallback: extract any number
    const m = txt.match(/(\d{1,3}(?:,\d{3})*)/g);
    if (!m) return Infinity;
    const nums = m.map(n => parseInt(n.replace(/,/g, '')));
    return Math.min(...nums);
  };

  return { shouldApply };
})();

// Expose globally
if (typeof window !== 'undefined') {
  window.JobScanner = JobScanner;
}

export default JobScanner;
// Record an application timestamp


