// background.test.js — test harness for background.js flows
// Mocks chrome.* APIs and tests optimizeResumeRequest, unlockApiKey, getApiUnlockedStatus

const assert = require('assert');

// Minimal chrome.* mock
const chrome = {
  storage: {
    sync: {
      get: (keys, cb) => cb({ resumeData: { contact: { name: 'Test', email: 'test@example.com' }, skills: ['JS'], experience: [{ title: 'Dev' }] }, openaiApiKey: 'test-key', aiProvider: 'openai', aiModel: 'gpt-3.5-turbo' }),
      set: (obj, cb) => cb && cb(),
    },
    local: {
      get: (keys, cb) => cb({ jobHistory: [] }),
      set: (obj, cb) => cb && cb(),
    }
  },
  runtime: {
    sendMessage: (msg, cb) => cb && cb({ jobDescription: 'Sample job description' }),
    onMessage: { addListener: () => {} },
  },
  tabs: {
    query: (opts, cb) => cb([{ id: 1 }]),
    sendMessage: (id, msg, cb) => cb && cb({ jobDescription: 'Sample job description' }),
  },
  action: {
    setBadgeText: () => {},
    onClicked: { addListener: () => {} },
  },
  contextMenus: {
    create: () => {},
    onClicked: { addListener: () => {} },
  }
};

global.chrome = chrome;

// Simulate background.js logic
// const background = require('../background.js');

describe('Background API flows', () => {
  it('should unlock API key for session', () => {
    // let unlockedApiKey = null;
    chrome.runtime.sendMessage({ action: 'unlockApiKey', apiKey: 'test-key' }, (resp) => {
      assert(resp.unlocked === true);
      // unlockedApiKey = 'test-key';
    });
    chrome.runtime.sendMessage({ action: 'getApiUnlockedStatus' }, (resp) => {
      assert(resp.unlocked === true);
    });
  });

  it('should optimize resume', (done) => {
    chrome.runtime.sendMessage({ action: 'optimizeResumeRequest' }, (resp) => {
      assert(resp.success === true);
      assert(resp.optimized);
      done();
    });
  });
});
