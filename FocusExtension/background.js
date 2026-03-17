// Initialize storage on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ 
    blockingEnabled: false, 
    blockedSites: [], 
    smartRedirectUrl: '', 
    isUpgraded: false,
    passwordEnabled: false,
    blockingPassword: ''
  });
});

// Listen for when redirect rules are matched (when user tries to visit blocked sites)
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((details) => {
  console.log('🚫 Redirect rule matched:', details);
  
  // Notify the web app that a blocked site was visited
  notifyWebAppAboutBlockedSiteVisit(details.request.url);
});

// Listen for storage changes to update blocking rules and notify web app
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && (changes.blockingEnabled || changes.blockedSites || changes.smartRedirectUrl || changes.isUpgraded)) {
    console.log('🔄 Storage changed, updating blocking rules:', changes);
    updateBlockingRules();
    
    // Check if current tab needs to be reloaded when sites are added
    if (changes.blockedSites && changes.blockedSites.newValue) {
      checkAndReloadCurrentTab(changes.blockedSites.newValue);
    }
    
    // Notify all web app tabs about the storage change
    notifyWebAppAboutStorageChange(changes);
  }
});

// Function to check if current tab should be reloaded
function checkAndReloadCurrentTab(blockedSites) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const currentTab = tabs[0];
      
      // Check if the tab has a valid URL that can be blocked
      if (!currentTab.url || 
          currentTab.url.startsWith('chrome://') || 
          currentTab.url.startsWith('chrome-extension://') ||
          currentTab.url.startsWith('moz-extension://') ||
          currentTab.url.startsWith('edge://') ||
          currentTab.url.startsWith('about:') ||
          currentTab.url.startsWith('data:') ||
          currentTab.url.startsWith('file://')) {
        return; // Skip invalid or special URLs
      }
      
      try {
        // Additional validation to ensure URL is valid before creating URL object
        if (!currentTab.url || typeof currentTab.url !== 'string' || currentTab.url.trim() === '') {
          console.log('Invalid or empty URL, skipping:', currentTab.url);
          return;
        }
        
        const currentUrl = new URL(currentTab.url);
        const currentDomain = currentUrl.hostname;
        
        // Check if current domain is in the blocked list
        const isBlocked = blockedSites.some(site => {
          const cleanedSite = site.replace(/^https?:\/\//, "").replace(/^www\./, "").trim();
          return currentDomain.includes(cleanedSite) || cleanedSite.includes(currentDomain);
        });
        
        if (isBlocked) {
          console.log('Current tab is on a blocked site, reloading...');
          chrome.tabs.reload(currentTab.id);
        }
      } catch (error) {
        console.log('Invalid URL encountered, skipping:', currentTab.url, 'Error:', error.message);
      }
    }
  });
}

// Function to update blocking rules
function updateBlockingRules() {
  console.log('🔄 updateBlockingRules called');
  
  chrome.storage.local.get(['blockingEnabled', 'blockedSites', 'smartRedirectUrl'], (data) => {
    const enabled = data.blockingEnabled || false;
    const blockedSites = data.blockedSites || [];
    const smartRedirectUrl = data.smartRedirectUrl || '';
    
    console.log('📊 Current state:', { enabled, blockedSites, smartRedirectUrl });
    
    if (!enabled || blockedSites.length === 0) {
      console.log('🚫 Blocking disabled or no sites, clearing all rules');
      // Remove all dynamic rules when disabled or no sites
      chrome.declarativeNetRequest.getDynamicRules((rules) => {
        if (chrome.runtime.lastError) {
          console.error('❌ Error getting rules for removal:', chrome.runtime.lastError.message || chrome.runtime.lastError);
          return;
        }
        
        const ruleIds = rules.map(rule => rule.id);
        console.log('🗑️ Removing existing rules:', ruleIds);
        chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: ruleIds,
          addRules: []
        }, () => {
          if (chrome.runtime.lastError) {
            console.error('❌ Error removing rules:', chrome.runtime.lastError.message || chrome.runtime.lastError);
          } else {
            console.log('✅ Rules removed successfully');
          }
        });
      });
      return;
    }

    const rules = [];
    let nextRuleId = 1000; // Start with a higher base ID to avoid conflicts
    console.log('🔢 Starting rule ID generation from:', nextRuleId);
    
    // Determine redirect URL - use smart redirect if available, otherwise default
    let redirectUrl = smartRedirectUrl || "http://localhost:3000/redirect";
    
    // Ensure the redirect URL is properly formatted for Chrome's declarativeNetRequest
    if (smartRedirectUrl && smartRedirectUrl.trim()) {
      // If it's a domain without protocol, add https://
      if (!smartRedirectUrl.startsWith('http://') && !smartRedirectUrl.startsWith('https://')) {
        redirectUrl = 'https://' + smartRedirectUrl;
      } else {
        redirectUrl = smartRedirectUrl;
      }
    }
    
    console.log('🎯 Smart redirect URL from storage:', smartRedirectUrl);
    console.log('🎯 Final redirect URL being used:', redirectUrl);
    
    const YOUTUBE_DOMAINS = [
      'youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 
      'googlevideo.com', 'youtube.googleapis.com', 'youtubei.googleapis.com', 
      'youtube-nocookie.com', 'ytimg.com', 'ytimg.l.google.com',
      'music.youtube.com', 'studio.youtube.com', 'creator.youtube.com'
    ];

    blockedSites.forEach((site, siteIndex) => {
      console.log(`🌐 Processing site ${siteIndex}: "${site}"`);
      
      // Validate site before processing
      if (!site || typeof site !== 'string' || site.trim() === '') {
        console.log('❌ Invalid site entry, skipping:', site);
        return;
      }
      
      const cleaned = site.replace(/^https?:\/\//, "").replace(/^www\./, "").trim();
      console.log(`🧹 Cleaned site: "${cleaned}"`);
      
      // Skip empty sites after cleaning
      if (!cleaned) {
        console.log('❌ Empty site after cleaning, skipping:', site);
        return;
      }
      
      // Special handling for YouTube
      if (cleaned === "youtube.com" || cleaned.includes("youtube")) {
        console.log('🎥 YouTube site detected, creating multiple domain rules');
        YOUTUBE_DOMAINS.forEach((domain, domainIndex) => {
          const ruleId = nextRuleId++;
          console.log(`📋 Creating YouTube rule ${domainIndex}: ID ${ruleId} for domain "${domain}"`);
          
          // Redirect all resources for YouTube domains
          rules.push({
            id: ruleId,
            priority: 1,
            action: { 
              type: "redirect",
              redirect: { url: redirectUrl }
            },
            condition: {
              urlFilter: `||${domain}^`,
              resourceTypes: ["main_frame"]
            }
          });
        });
      } else {
        // Regular domain blocking
        const ruleId = nextRuleId++;
        console.log(`📋 Creating regular rule: ID ${ruleId} for domain "${cleaned}"`);
        
        rules.push({
          id: ruleId,
          priority: 1,
          action: { 
            type: "redirect",
            redirect: { url: redirectUrl }
          },
          condition: {
            urlFilter: `||${cleaned}^`,
            resourceTypes: ["main_frame"]
          }
        });
      }
    });

    console.log('📋 Final rules array:', rules);

    // Validate rule IDs are unique
    const ruleIds = rules.map(rule => rule.id);
    const uniqueIds = new Set(ruleIds);
    console.log('🔍 Rule ID validation:', {
      totalRules: ruleIds.length,
      uniqueIds: uniqueIds.size,
      ruleIds: ruleIds,
      isUnique: ruleIds.length === uniqueIds.size
    });
    
    if (ruleIds.length !== uniqueIds.size) {
      console.error('❌ Duplicate rule IDs detected:', ruleIds);
      console.error('❌ This should not happen with the new ID generation!');
      return;
    }

    console.log('✅ Rule ID validation passed, proceeding with update');

    // Update the rules
    chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
      if (chrome.runtime.lastError) {
        console.error('❌ Error getting existing rules:', chrome.runtime.lastError.message || chrome.runtime.lastError);
        return;
      }
      
      const allIds = existingRules.map((r) => r.id);
      console.log('🗑️ Removing existing rules:', allIds);
      console.log('➕ Adding new rules with IDs:', ruleIds);
      
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: allIds,
        addRules: rules
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('❌ Error updating rules:', chrome.runtime.lastError.message || chrome.runtime.lastError);
          console.error('❌ Error details:', chrome.runtime.lastError);
        } else {
          console.log('✅ Rules updated successfully');
          console.log('🎯 All rules now redirect to:', redirectUrl);
          console.log('📋 Rules created:', rules.length);
          rules.forEach((rule, index) => {
            console.log(`  Rule ${index + 1}: ID ${rule.id}, redirects to ${rule.action.redirect.url}`);
          });
        }
      });
    });
  });
}

// Function to clear all blocking rules (for recovery)
function clearAllBlockingRules() {
  console.log('🧹 clearAllBlockingRules called');
  
  chrome.declarativeNetRequest.getDynamicRules((rules) => {
    if (chrome.runtime.lastError) {
      console.error('❌ Error getting rules for clearing:', chrome.runtime.lastError.message || chrome.runtime.lastError);
      return;
    }
    
    const ruleIds = rules.map(rule => rule.id);
    if (ruleIds.length > 0) {
      console.log('🗑️ Clearing all blocking rules:', ruleIds);
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIds,
        addRules: []
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('❌ Error clearing rules:', chrome.runtime.lastError.message || chrome.runtime.lastError);
        } else {
          console.log('✅ All blocking rules cleared successfully');
        }
      });
    } else {
      console.log('ℹ️ No rules to clear');
    }
  });
}

// Function to check for rule conflicts and fix them
function checkAndFixRuleConflicts() {
  console.log('🔍 checkAndFixRuleConflicts called');
  
  chrome.declarativeNetRequest.getDynamicRules((rules) => {
    if (chrome.runtime.lastError) {
      console.error('❌ Error getting rules for conflict check:', chrome.runtime.lastError.message || chrome.runtime.lastError);
      return;
    }
    
    if (rules.length === 0) {
      console.log('ℹ️ No existing rules to check');
      return;
    }
    
    console.log('🔍 Checking existing rules for conflicts:', rules.map(r => r.id));
    
    // Check for duplicate IDs in existing rules
    const ruleIds = rules.map(rule => rule.id);
    const uniqueIds = new Set(ruleIds);
    
    if (ruleIds.length !== uniqueIds.size) {
      console.warn('⚠️ Duplicate rule IDs found in existing rules, clearing all rules');
      clearAllBlockingRules();
    } else {
      console.log('✅ No rule conflicts found in existing rules');
    }
  });
}

// Function to notify web app tabs about storage changes
function notifyWebAppAboutStorageChange(changes) {
  console.log('📢 Notifying web app about storage changes:', changes);
  
  // Get current storage state
  chrome.storage.local.get(['blockedSites', 'blockingEnabled', 'smartRedirectUrl'], (data) => {
    if (chrome.runtime.lastError) {
      console.error('❌ Error getting storage for notification:', chrome.runtime.lastError.message || chrome.runtime.lastError);
      return;
    }
    
    const notificationData = {
      type: 'STORAGE_CHANGED_NOTIFICATION',
      changes: changes,
      currentState: {
        blockedSites: data.blockedSites || [],
        blockingEnabled: data.blockingEnabled || false,
        smartRedirectUrl: data.smartRedirectUrl || ''
      }
    };
    
    console.log('📤 Sending storage change notification:', notificationData);
    
    // Send notification to all tabs that might be running the web app
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        // Only send to tabs that might be running our web app
        if (tab.url && (
          tab.url.includes('localhost') || 
          tab.url.includes('focus-web-blocker.com') ||
          tab.url.includes('centra-web-blocker.com') ||
          tab.url.includes('centra-app.onrender.com') ||
          tab.url.includes('127.0.0.1')
        )) {
          try {
            chrome.tabs.sendMessage(tab.id, notificationData, (response) => {
              if (chrome.runtime.lastError) {
                // Tab might not have our content script, that's okay
                console.log('ℹ️ Could not send notification to tab:', tab.url, chrome.runtime.lastError.message);
              } else {
                console.log('✅ Notification sent to tab:', tab.url);
              }
            });
          } catch (error) {
            console.log('ℹ️ Error sending notification to tab:', tab.url, error.message);
          }
        }
      });
    });
  });
}

// Helper function to detect API calls and resource requests
function isApiCallOrResource(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    const searchParams = urlObj.search.toLowerCase();
    
    // Skip API endpoints - more comprehensive patterns
    if (pathname.includes('/api/') || 
        pathname.includes('/ajax/') ||  // Instagram uses /ajax/
        pathname.includes('/v1/') || 
        pathname.includes('/v2/') ||
        pathname.includes('/youtubei/') ||
        pathname.includes('/browse') ||
        pathname.includes('/guide') ||
        pathname.includes('/att/') ||
        pathname.includes('/notification/') ||
        pathname.includes('/get_unseen_count') ||
        pathname.includes('/RotateCookiesPage') ||
        pathname.includes('/bootloader-endpoint') ||  // Instagram bootloader
        pathname.includes('/static_resources/') ||    // Instagram static resources
        pathname.includes('/graphql') ||              // GraphQL endpoints
        pathname.includes('/rest/') ||                // REST APIs
        pathname.includes('/_next/') ||               // Next.js APIs
        pathname.includes('/__api/') ||               // Custom API paths
        searchParams.includes('__a=1') ||             // Instagram AJAX indicator
        searchParams.includes('__ccg=') ||            // Instagram parameters
        searchParams.includes('jazoest=') ||          // Instagram parameters
        searchParams.includes('lsd=')) {              // Instagram parameters
      return true;
    }
    
    // Skip resource files
    if (pathname.endsWith('.js') || 
        pathname.endsWith('.css') || 
        pathname.endsWith('.png') || 
        pathname.endsWith('.jpg') || 
        pathname.endsWith('.jpeg') || 
        pathname.endsWith('.gif') || 
        pathname.endsWith('.svg') || 
        pathname.endsWith('.ico') || 
        pathname.endsWith('.woff') || 
        pathname.endsWith('.woff2') || 
        pathname.endsWith('.ttf') || 
        pathname.endsWith('.mp3') || 
        pathname.endsWith('.mp4') || 
        pathname.endsWith('.webmanifest') ||
        pathname.endsWith('.webp') ||
        pathname.includes('/generate_204') ||
        pathname.includes('/sw.js') ||
        pathname.includes('/www-service-worker.js') ||
        pathname.includes('/manifest.webmanifest')) {
      return true;
    }
    
    // Skip service worker and other technical endpoints
    if (pathname.includes('service-worker') || 
        pathname.includes('sw.js') ||
        pathname.includes('manifest') ||
        pathname.includes('generate_204')) {
      return true;
    }
    
    // Only count visits to main pages (root or simple paths)
    // Skip if path has multiple segments or looks like an API
    const pathSegments = pathname.split('/').filter(segment => segment.length > 0);
    
    // Allow root domain (no path segments)
    if (pathSegments.length === 0) {
      return false; // This is a main page visit
    }
    
    // Allow simple single-level paths like /login, /home, /feed
    if (pathSegments.length === 1 && !pathSegments[0].includes('.') && pathSegments[0].length < 20) {
      return false; // This is likely a main page visit
    }
    
    // Everything else is likely an API call or resource
    return true;
    
  } catch (error) {
    console.error('Error parsing URL:', url, error);
    return false;
  }
}

// Function to notify web app about blocked site visits
function notifyWebAppAboutBlockedSiteVisit(url) {
  console.log('🚫 Notifying web app about blocked site visit:', url);
  
  // Filter out API calls, resource requests, and other non-main page visits
  if (isApiCallOrResource(url)) {
    console.log('🚫 Skipping API call or resource request:', url);
    return;
  }
  
  const notificationData = {
    type: 'BLOCKED_SITE_VISITED',
    url: url,
    timestamp: Date.now()
  };
  
  console.log('📤 Sending blocked site visit notification:', notificationData);
  
  // Send notification to all tabs that might be running the web app
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      // Only send to tabs that might be running our web app
      if (tab.url && (
        tab.url.includes('localhost') || 
        tab.url.includes('focus-web-blocker.com') ||
        tab.url.includes('centra-web-blocker.com') ||
        tab.url.includes('centra-app.onrender.com') ||
        tab.url.includes('127.0.0.1')
      )) {
        try {
          chrome.tabs.sendMessage(tab.id, notificationData, (response) => {
            if (chrome.runtime.lastError) {
              // Tab might not have our content script, that's okay
              console.log('ℹ️ Could not send blocked site notification to tab:', tab.url, chrome.runtime.lastError.message);
            } else {
              console.log('✅ Blocked site notification sent to tab:', tab.url);
            }
          });
        } catch (error) {
          console.log('ℹ️ Error sending blocked site notification to tab:', tab.url, error.message);
        }
      }
    });
  });
}

// Initialize blocking rules on startup
console.log('🚀 Extension starting up, checking for rule conflicts...');
checkAndFixRuleConflicts();

// Wait a moment for any cleanup to complete, then update rules
setTimeout(() => {
  console.log('⏰ Startup delay completed, updating blocking rules...');
  updateBlockingRules();
}, 1000);

// Listen for messages from web app
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Message received from web app:', request);
  console.log('👤 Sender:', sender);
  
  try {
    if (request.action === 'getBlockedSites') {
      chrome.storage.local.get(['blockedSites', 'blockingEnabled', 'smartRedirectUrl', 'isUpgraded'], (data) => {
        if (chrome.runtime.lastError) {
          console.error('Error getting blocked sites:', chrome.runtime.lastError.message || chrome.runtime.lastError);
          sendResponse({ error: 'Failed to get blocked sites' });
        } else {
          sendResponse({
            blockedSites: data.blockedSites || [],
            blockingEnabled: data.blockingEnabled || false,
            smartRedirectUrl: data.smartRedirectUrl || '',
            isUpgraded: data.isUpgraded || false
          });
        }
      });
      return true; // Keep message channel open for async response
    }
    
    if (request.action === 'setBlockedSites') {
      chrome.storage.local.set({ blockedSites: request.blockedSites }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error setting blocked sites:', chrome.runtime.lastError.message || chrome.runtime.lastError);
          sendResponse({ error: 'Failed to set blocked sites' });
        } else {
          sendResponse({ success: true });
        }
      });
      return true;
    }
    
    if (request.action === 'setBlockingEnabled') {
      chrome.storage.local.set({ blockingEnabled: request.enabled }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error setting blocking enabled:', chrome.runtime.lastError.message || chrome.runtime.lastError);
          sendResponse({ error: 'Failed to set blocking enabled' });
        } else {
          sendResponse({ success: true });
        }
      });
      return true;
    }
    
    if (request.action === 'setSmartRedirectUrl') {
      chrome.storage.local.set({ smartRedirectUrl: request.url }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error setting smart redirect URL:', chrome.runtime.lastError.message || chrome.runtime.lastError);
          sendResponse({ error: 'Failed to set smart redirect URL' });
        } else {
          console.log('✅ Smart redirect URL set:', request.url);
          // Force update blocking rules to use the new redirect URL
          console.log('🔄 Forcing rule update with new smart redirect URL...');
          updateBlockingRules();
          sendResponse({ success: true });
        }
      });
      return true;
    }
    
    if (request.action === 'setSubscriptionStatus') {
      chrome.storage.local.set({ isUpgraded: request.isUpgraded }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error setting subscription status:', chrome.runtime.lastError.message || chrome.runtime.lastError);
          sendResponse({ error: 'Failed to set subscription status' });
        } else {
          console.log('✅ Subscription status set:', request.isUpgraded ? 'Pro (Unlimited)' : 'Free (5 sites max)');
          sendResponse({ success: true });
        }
      });
      return true;
    }
    
    if (request.action === 'ping') {
      sendResponse({ status: 'active', version: '1.34.37' });
      return true;
    }
    
    if (request.action === 'clearAllRules') {
      clearAllBlockingRules();
      sendResponse({ success: true, message: 'All blocking rules cleared' });
      return true;
    }
    
    if (request.action === 'getCurrentRules') {
      chrome.declarativeNetRequest.getDynamicRules((rules) => {
        if (chrome.runtime.lastError) {
          console.error('Error getting current rules:', chrome.runtime.lastError.message || chrome.runtime.lastError);
          sendResponse({ error: 'Failed to get current rules' });
        } else {
          console.log('📋 Current rules:', rules);
          const ruleInfo = rules.map(rule => ({
            id: rule.id,
            redirectUrl: rule.action?.redirect?.url || 'No redirect',
            condition: rule.condition
          }));
          sendResponse({ success: true, rules: ruleInfo });
        }
      });
      return true;
    }
    
    if (request.action === 'forceUpdateRules') {
      console.log('🔄 Force updating rules requested');
      updateBlockingRules();
      sendResponse({ success: true, message: 'Rules force updated' });
      return true;
    }
    
    // Handle blocked site visit notifications from content script
    if (request.type === 'BLOCKED_SITE_VISITED') {
      console.log('🚫 Blocked site visit notification from content script:', request);
      notifyWebAppAboutBlockedSiteVisit(request.url);
      sendResponse({ received: true });
      return true;
    }
    
    // Handle password settings from web app
    if (request.action === 'setPasswordSettings') {
      console.log('🔐 Setting password settings:', request.passwordEnabled ? 'Enabled' : 'Disabled');
      chrome.storage.local.set({
        passwordEnabled: request.passwordEnabled,
        blockingPassword: request.blockingPassword || ''
      });
      sendResponse({ success: true, message: 'Password settings updated' });
      return true;
    }
    
    // Unknown action
    console.warn('Unknown action received:', request.action);
    sendResponse({ error: 'Unknown action' });
    
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({ error: 'Internal error' });
  }
});