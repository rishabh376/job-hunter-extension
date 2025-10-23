// Job detection and auto-application logic
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
    if (hostname.includes('glassdoor.com')) return 'glassdoor';
    if (hostname.includes('monster.com')) return 'monster';
    if (hostname.includes('ziprecruiter.com')) return 'ziprecruiter';
    if (hostname.includes('careerbuilder.com')) return 'careerbuilder';
    if (hostname.includes('simplyhired.com')) return 'simplyhired';
    return 'unknown';
  }

  async init() {
    console.log('Job Hunter Pro: Detected', this.jobBoard);
    
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
    const extractors = {
      linkedin: this.extractLinkedInData,
      indeed: this.extractIndeedData,
      glassdoor: this.extractGlassdoorData,
      monster: this.extractMonsterData,
      ziprecruiter: this.extractZipRecruiterData,
      careerbuilder: this.extractCareerBuilderData,
      simplyhired: this.extractSimplyHiredData
    };

    const extractor = extractors[this.jobBoard];
    return extractor ? extractor.call(this) : this.extractGenericData();
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
    console.log('Job Hunter Pro: Starting auto-application');
    
    // Find apply button
    const applyButton = await this.findApplyButton();
    if (applyButton) {
      // Click apply button
      applyButton.click();
      
      // Wait for application form
      await this.wait(2000);
      
      // Fill application form
      await this.fillApplicationForm();
    }
  }

  async findApplyButton() {
    const selectors = [
      'button[data-tracking-control-name="public_jobs_apply-link-offsite"]',
      '.apply-button',
      '[class*="apply"]',
      'a[href*="apply"]',
      'button:contains("Apply")',
      'input[value*="Apply"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) return element;
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
      // Convert base64 to file
      const file = this.base64ToFile(resumeData.resumeFile, 'resume.pdf');
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;
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

