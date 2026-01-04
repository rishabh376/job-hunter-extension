// Job detection and auto-application logic

// Import helpers if available (for modularity)
// eslint-disable-next-line no-undef
const JobScanner = window.JobScanner || (window.autoApplier && window.autoApplier.JobScanner);
const FormFiller = window.FormFiller || (window.autoApplier && window.autoApplier.FormFiller);

class JobHunterContent {
  constructor() {
    this.jobBoard = this.detectJobBoard();
    this.jobData = null;
    this.init();
  }

  detectJobBoard() {
    const hostname = window.location.hostname;
    if (hostname.includes('linkedin.com')) return 'linkedin';
    if (hostname.includes('indeed.com')) return 'indeed';
    if (hostname.includes('naukri.com')) return 'naukri';
    if (hostname.includes('glassdoor.com')) return 'glassdoor';
    if (hostname.includes('monster.com')) return 'monster';
    if (hostname.includes('ziprecruiter.com')) return 'ziprecruiter';
    if (hostname.includes('careerbuilder.com')) return 'careerbuilder';
    if (hostname.includes('simplyhired.com')) return 'simplyhired';
    return 'unknown';
  }

  async init() {
    console.log('i@pply: Detected', this.jobBoard);
    
    // Wait for page to load
    await this.waitForPageLoad();
    
    // Extract job information
    this.jobData = await this.extractJobData();
    
    // Send to background script
    chrome.runtime.sendMessage({
      action: 'jobDetected',
      jobBoard: this.jobBoard,
      jobData: this.jobData,
      url: window.location.href
    });

    // Auto-apply if enabled
    const settings = await this.getSettings();
    if (settings.autoApply) {
      this.autoApply();
    }
  }

  async waitForPageLoad() {
    return new Promise(resolve => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', resolve);
      }
    });
  }


  async extractJobData() {
    // Modular extractor pattern for easy extension
    const extractors = {
      linkedin: this.extractLinkedInData,
      indeed: this.extractIndeedData,
      naukri: this.extractNaukriData,
      glassdoor: this.extractGlassdoorData,
      monster: this.extractMonsterData,
      ziprecruiter: this.extractZipRecruiterData,
      careerbuilder: this.extractCareerBuilderData,
      simplyhired: this.extractSimplyHiredData
    };
    const extractor = extractors[this.jobBoard];
    if (extractor) return extractor.call(this);
    return this.extractGenericData();
  }

  extractLinkedInData() {
    const title = document.querySelector('.top-card-layout__title')?.textContent?.trim();
    const company = document.querySelector('.topcard__org-name-link')?.textContent?.trim();
    const location = document.querySelector('.topcard__flavor--bullet')?.textContent?.trim();
    const description = document.querySelector('.description__text')?.textContent?.trim();
    
    return { title, company, location, description };
  }

  extractIndeedData() {
    const title = document.querySelector('h1.jobsearch-JobInfoHeader-title')?.textContent?.trim();
    const company = document.querySelector('.jobsearch-CompanyInfoContainer a')?.textContent?.trim();
    const location = document.querySelector('.jobsearch-JobInfoHeader-subtitle div')?.textContent?.trim();
    const description = document.querySelector('#jobDescriptionText')?.textContent?.trim();
    
    return { title, company, location, description };
  }

  extractNaukriData() {
    // Naukri.com selectors (may need updates based on site changes)
    const title = document.querySelector('h1.jd-header-title')?.textContent?.trim() ||
                  document.querySelector('[class*="job-title"]')?.textContent?.trim();
    const company = document.querySelector('a.jd-cp-name')?.textContent?.trim() ||
                    document.querySelector('[class*="company-name"]')?.textContent?.trim();
    const location = document.querySelector('.jd-loc')?.textContent?.trim() ||
                     document.querySelector('[class*="location"]')?.textContent?.trim();
    const description = document.querySelector('.jd-desc')?.textContent?.trim() ||
                        document.querySelector('[class*="job-description"]')?.textContent?.trim();
    
    return { title, company, location, description };
  }

  extractGenericData() {
    // Try to find common job posting elements
    const title = document.querySelector('h1, [class*="title"], [class*="job-title"]')?.textContent?.trim();
    const company = document.querySelector('[class*="company"], [class*="employer"]')?.textContent?.trim();
    const location = document.querySelector('[class*="location"], [class*="place"]')?.textContent?.trim();
    const description = document.querySelector('[class*="description"], [class*="details"], main')?.textContent?.trim();
    
    return { title, company, location, description };
  }

  async getSettings() {
    return new Promise(resolve => {
      chrome.storage.sync.get(['autoApply', 'resumeData'], resolve);
    });
  }


  async autoApply() {
    console.log('i@pply: Starting auto-application');
    // Use JobScanner to decide if we should apply (if available)
    if (typeof JobScanner?.shouldApply === 'function') {
      const should = await JobScanner.shouldApply(this.jobData || {});
      if (!should) {
        console.log('JobScanner: Skipping application based on rules');
        return;
      }
    }

    // More robust auto-apply with retries and waiting for form fields
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const applyButton = await this.findApplyButton();
        if (!applyButton) {
          console.log('No apply button found (attempt', attempt, ')');
          await this.wait(1000 * attempt);
          continue;
        }

        // Click the apply/start application control
        applyButton.scrollIntoView({ block: 'center', behavior: 'auto' });
        applyButton.click();

        // Wait for a form or input to appear
        const formSelector = 'form, input, textarea, [role="dialog"]';
        const appeared = await this.waitForSelector(formSelector, 8000 + (attempt * 2000));
        if (!appeared) {
          console.log('Application form did not appear (attempt', attempt, ')');
          await this.wait(1000);
          continue;
        }

        // Always prefer modular FormFiller for extensibility
        const { resumeData } = await this.getSettings();
        if (FormFiller && typeof FormFiller.fill === 'function') {
          await FormFiller.fill(resumeData || {});
        } else {
          await this.fillApplicationForm();
        }

        // Try to click submit/save if present
        const submitSelectors = ['button[type="submit"]', 'button:contains("Submit")', 'button:contains("Send")', 'input[type="submit"]', 'button:contains("Finish")'];
        for (const s of submitSelectors) {
          const el = document.querySelector(s);
          if (el) {
            el.click();
            break;
          }
        }

        // Log application if ApplicationTracker is available
        if (window.ApplicationTracker && typeof window.ApplicationTracker.log === 'function') {
          window.ApplicationTracker.log(this.jobData || {}, 'applied', { url: window.location.href });
        }

        console.log('Auto-apply attempted');
        break;
      } catch (err) {
        console.warn('autoApply attempt failed', attempt, err);
        await this.wait(1000 * attempt);
      }
    }
  }

  async waitForSelector(selector, timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const el = document.querySelector(selector);
      if (el) return el;
      await this.wait(250);
    }
    return null;
  }

  async findApplyButton() {
    const selectors = [
      'button[data-tracking-control-name="public_jobs_apply-link-offsite"]',
      '.apply-button',
      '[class*="apply"]',
      'a[href*="apply"]',
      'input[value*="Apply"]'
    ];

    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector);
        if (element) return element;
      } catch (e) {
        // ignore invalid selectors
      }
    }

    // Try XPath
    const xpath = "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'apply')]";
    const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    return result.singleNodeValue;
  }

  async fillApplicationForm() {
    // Get resume data from storage
    const { resumeData } = await this.getSettings();
    if (!resumeData) return;

    // Fill common form fields
    const fields = {
      'firstName': resumeData.firstName,
      'lastName': resumeData.lastName,
      'email': resumeData.email,
      'phone': resumeData.phone,
      'city': resumeData.city,
      'state': resumeData.state
    };

    for (const [field, value] of Object.entries(fields)) {
      const input = document.querySelector(`input[name*="${field}" i], input[id*="${field}" i]`);
      if (input && !input.value) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    // Upload resume if file input found
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput && resumeData.resumeFile) {
        // Convert base64 to file (use FileUtils if available)
        let file;
        try {
          if (typeof FileUtils !== 'undefined' && FileUtils.base64ToFile) {
            file = FileUtils.base64ToFile(resumeData.resumeFile, resumeData.resumeFileName || 'resume.pdf');
          } else {
            file = this.base64ToFile(resumeData.resumeFile, resumeData.resumeFileName || 'resume.pdf');
          }
        } catch (e) {
          console.warn('Failed to create File object, falling back to dataTransfer workaround', e);
        }
        try {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInput.files = dataTransfer.files;
        } catch (e) {
          console.warn('Unable to set file input programmatically', e);
        }
      }
  }

  base64ToFile(base64, filename) {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new JobHunterContent());
} else {
  new JobHunterContent();
}

// Listen for messages from popup/background
chrome.runtime && chrome.runtime.onMessage && chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!request || !request.action) return;

  if (request.action === 'optimizeResume') {
    // Very small local stub: pretend we optimized the resume. In a full build this would
    // call the resume optimizer in `resume-builder` via ApiConnector or background proxy.
    console.log('Job Hunter Pro: Received optimizeResume request');
    // Respond quickly so popup UI can update
    sendResponse({ success: true });
    return; // keep short-lived
  }

  if (request.action === 'startAutoApply') {
    console.log('Job Hunter Pro: startAutoApply message received');
    (async () => { try { await new JobHunterContent().autoApply(); } catch (e) { console.error(e); } })();
    sendResponse({ started: true });
    return;
  }

  if (request.action === 'getJobDescription') {
    // Return extracted job description (best-effort)
    const jd = (new JobHunterContent()).jobData?.description || document.querySelector('body')?.innerText?.slice(0, 3000) || '';
    sendResponse({ jobDescription: jd });
    return;
  }

  if (request.action === 'quickApply') {
    // Trigger a quick apply from popup/context menu
    (async () => { try { const c = new JobHunterContent(); await c.autoApply(); } catch (e) { console.error(e); } })();
    sendResponse({ started: true });
    return;
  }

  if (request.action === 'toggleJobHunter') {
    // Toggle UI state on the page (simple example: add a badge)
    const elId = 'job-hunter-pro-badge';
    let el = document.getElementById(elId);
    if (el) {
      el.remove();
      sendResponse({ toggled: 'off' });
    } else {
      el = document.createElement('div');
      el.id = elId;
      el.textContent = 'Job Hunter Active';
      el.style.position = 'fixed';
      el.style.right = '12px';
      el.style.bottom = '12px';
      el.style.background = '#1a73e8';
      el.style.color = 'white';
      el.style.padding = '6px 10px';
      el.style.borderRadius = '6px';
      el.style.zIndex = 999999;
      document.body.appendChild(el);
      sendResponse({ toggled: 'on' });
    }
    return;
  }
});


