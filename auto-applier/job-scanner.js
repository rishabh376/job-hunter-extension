// Decide *whether* we should apply (rate-limit + rules)
const JobScanner = (() => {
  const RULES = {
    maxPerHour: 13,
    minSalary:  1700000, // INR per year (₹17LPA)
    mustHave:   ['Azure DevOps', 'DevOps', 'Kubernetes', 'Terraform', 'GitHub Actions', 'Git'], // quick filter
    notInTitle: ['manager', 'director', 'principal', 'lead'], // exclude these titles
    locales:    ['remote', 'hybrid', 'Pune', 'Bangalore', 'Delhi', 'Gurgaon', 'Mumbai', 'India', 'Chennai', 'Hyderabad', 'Noida', 'Kolkata'], // expanded Indian cities
  };

  const shouldApply = async (jobData) => {
    const { title, salary, location, description } = jobData;

    if (RULES.notInTitle.some(t => title.toLowerCase().includes(t))) return false;

    const hourlyCount = await getHourlyCount();
    if (hourlyCount >= RULES.maxPerHour) return false;

    const hasMustHave = RULES.mustHave.length === 0 ||
                        RULES.mustHave.some(k => description.toLowerCase().includes(k));

    const salaryOK = !salary || extractSalaryINR(salary) >= RULES.minSalary;
    const localeOK = RULES.locales.some(l => location.toLowerCase().includes(l));

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


export default JobScanner;
// Record an application timestamp


