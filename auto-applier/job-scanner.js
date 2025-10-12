// Decide *whether* we should apply (rate-limit + rules)
const JobScanner = (() => {
  const RULES = {
    maxPerHour: 10,
    minSalary:  40000, // USD
    mustHave:   ['javascript'], // quick filter
    notInTitle: ['senior', 'lead', 'principal', 'staff'],
    locales:    ['remote', 'hybrid', 'new york', 'san francisco']
  };

  const shouldApply = async (jobData) => {
    const { title, salary, location, description } = jobData;

    if (RULES.notInTitle.some(t => title.toLowerCase().includes(t))) return false;

    const hourlyCount = await getHourlyCount();
    if (hourlyCount >= RULES.maxPerHour) return false;

    const hasMustHave = RULES.mustHave.length === 0 ||
                        RULES.mustHave.some(k => description.toLowerCase().includes(k));

    const salaryOK = !salary || extractSalary(salary) >= RULES.minSalary;
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

  const extractSalary = (txt) => {
    const m = txt.match(/\$?(\d{1,3}(?:,\d{3})*)/g);
    if (!m) return Infinity;
    const nums = m.map(n => parseInt(n.replace(/,/g,'')));
    return Math.min(...nums); // take lower bound
  };

  return { shouldApply };
})();