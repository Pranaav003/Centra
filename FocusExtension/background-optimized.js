// Optimized background.js for better performance
// Performance improvements: reduced storage operations, optimized rule updates, memory management

// Configuration constants
const CONFIG = {
  MAX_RULES: 100, // Chrome's limit
  DEBOUNCE_DELAY: 300, // ms
  CACHE_DURATION: 5000 // ms
};

// Cache for frequently accessed data
const cache = {
  blockedSites: null,
  lastUpdate: 0,
  rules: null
};

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Optimized storage operations
async function getStorageData(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        console.error('Storage error:', chrome.runtime.lastError);
        resolve({});
      } else {
        resolve(result);
      }
    });
  });
}

async function setStorageData(data) {
  return new Promise((resolve) => {
    chrome.storage.local.set(data, () => {
      if (chrome.runtime.lastError) {
        console.error('Storage error:', chrome.runtime.lastError);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

// Initialize storage on install
chrome.runtime.onInstalled.addListener(async () => {
  const initialData = {
    blockingEnabled: false,
    blockedSites: [],
    smartRedirectUrl: '',
    isUpgraded: false,
    passwordEnabled: false,
    blockingPassword: ''
  };
  
  await setStorageData(initialData);
  console.log('✅ Extension initialized with default settings');
});

// Optimized rule matching handler
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((details) => {
  console.log('🚫 Redirect rule matched:', details);
  
  // Notify web app asynchronously to avoid blocking
  setTimeout(() => {
    notifyWebAppAboutBlockedSiteVisit(details.request.url);
  }, 0);
});

// Debounced storage change handler
const debouncedUpdateRules = debounce(updateBlockingRules, CONFIG.DEBOUNCE_DELAY);

chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (namespace === 'local') {
    const relevantChanges = changes.blockingEnabled || 
                           changes.blockedSites || 
                           changes.smartRedirectUrl || 
                           changes.isUpgraded;
    
    if (relevantChanges) {
      console.log('🔄 Storage changed, updating blocking rules:', changes);
      
      // Update cache
      if (changes.blockedSites) {
        cache.blockedSites = changes.blockedSites.newValue;
        cache.lastUpdate = Date.now();
      }
      
      // Debounce rule updates to avoid excessive API calls
      debouncedUpdateRules();
      
      // Check if current tab needs to be reloaded
      if (changes.blockedSites && changes.blockedSites.newValue) {
        checkAndReloadCurrentTab(changes.blockedSites.newValue);
      }
      
      // Notify web app asynchronously
      setTimeout(() => {
        notifyWebAppAboutStorageChange(changes);
      }, 0);
    }
  }
});

// Optimized tab reload check
function checkAndReloadCurrentTab(blockedSites) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;
    
    const currentTab = tabs[0];
    const url = currentTab.url;
    
    // Skip invalid URLs
    if (!url || 
        url.startsWith('chrome://') || 
        url.startsWith('chrome-extension://') ||
        url.startsWith('moz-extension://') ||
        url.startsWith('edge://') ||
        url.startsWith('about:') ||
        url.startsWith('data:') ||
        url.startsWith('file://')) {
      return;
    }
    
    // Check if current URL should be blocked
    const shouldBlock = blockedSites.some(site => {
      const domain = site.replace(/^www\./, '');
      return url.includes(domain);
    });
    
    if (shouldBlock) {
      console.log('🔄 Reloading current tab due to new blocking rule');
      chrome.tabs.reload(currentTab.id);
    }
  });
}

// Optimized blocking rules update
async function updateBlockingRules() {
  try {
    const data = await getStorageData(['blockingEnabled', 'blockedSites', 'smartRedirectUrl']);
    
    if (!data.blockingEnabled || !data.blockedSites || data.blockedSites.length === 0) {
      await clearAllRules();
      return;
    }
    
    const rules = generateRedirectRules(data.blockedSites, data.smartRedirectUrl);
    
    // Only update if rules have changed
    if (JSON.stringify(rules) !== JSON.stringify(cache.rules)) {
      await clearAllRules();
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: rules
      });
      cache.rules = rules;
      console.log(`✅ Updated ${rules.length} blocking rules`);
    }
  } catch (error) {
    console.error('❌ Error updating blocking rules:', error);
  }
}

// Generate redirect rules efficiently
function generateRedirectRules(blockedSites, redirectUrl) {
  const rules = [];
  const maxSites = Math.min(blockedSites.length, CONFIG.MAX_RULES);
  
  for (let i = 0; i < maxSites; i++) {
    const site = blockedSites[i];
    const domain = site.replace(/^www\./, '');
    
    rules.push({
      id: i + 1,
      priority: 1,
      action: {
        type: "redirect",
        redirect: {
          url: redirectUrl || chrome.runtime.getURL("blocked.html")
        }
      },
      condition: {
        urlFilter: `*://${domain}/*`,
        resourceTypes: ["main_frame"]
      }
    });
  }
  
  return rules;
}

// Clear all dynamic rules
async function clearAllRules() {
  try {
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const ruleIdsToRemove = existingRules.map(rule => rule.id);
    
    if (ruleIdsToRemove.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIdsToRemove
      });
      console.log(`🗑️ Cleared ${ruleIdsToRemove.length} existing rules`);
    }
  } catch (error) {
    console.error('❌ Error clearing rules:', error);
  }
}

// Optimized web app notification
function notifyWebAppAboutBlockedSiteVisit(url) {
  try {
    const message = {
      type: 'BLOCKED_SITE_VISIT',
      url: url,
      timestamp: Date.now()
    };
    
    // Send to all web app tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.url && (
          tab.url.includes('localhost:3001') || 
          tab.url.includes('centra-web-blocker.com') ||
          tab.url.includes('centra.pranaaviyer.com')
        )) {
          chrome.tabs.sendMessage(tab.id, message).catch(() => {
            // Ignore errors for tabs that don't have content script
          });
        }
      });
    });
  } catch (error) {
    console.error('❌ Error notifying web app:', error);
  }
}

// Optimized storage change notification
function notifyWebAppAboutStorageChange(changes) {
  try {
    const message = {
      type: 'STORAGE_CHANGED',
      changes: changes,
      timestamp: Date.now()
    };
    
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.url && (
          tab.url.includes('localhost:3001') || 
          tab.url.includes('centra-web-blocker.com') ||
          tab.url.includes('centra.pranaaviyer.com')
        )) {
          chrome.tabs.sendMessage(tab.id, message).catch(() => {
            // Ignore errors for tabs that don't have content script
          });
        }
      });
    });
  } catch (error) {
    console.error('❌ Error notifying web app about storage change:', error);
  }
}

// Message handling for communication with popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStorageData') {
    getStorageData(request.keys || ['blockingEnabled', 'blockedSites', 'isUpgraded'])
      .then(data => sendResponse(data))
      .catch(error => {
        console.error('Error getting storage data:', error);
        sendResponse({});
      });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'setStorageData') {
    setStorageData(request.data)
      .then(success => sendResponse({ success }))
      .catch(error => {
        console.error('Error setting storage data:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
  
  if (request.action === 'updateBlockingRules') {
    updateBlockingRules()
      .then(() => sendResponse({ success: true }))
      .catch(error => {
        console.error('Error updating blocking rules:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

// Periodic cleanup to prevent memory leaks
setInterval(() => {
  // Clear old cache entries
  if (Date.now() - cache.lastUpdate > CONFIG.CACHE_DURATION) {
    cache.blockedSites = null;
    cache.rules = null;
  }
}, CONFIG.CACHE_DURATION);

console.log('🚀 Optimized background script loaded');


