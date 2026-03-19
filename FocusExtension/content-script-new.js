// Centra - New Content Script
(function() {
  'use strict';
  
  console.log('Centra Web Blocker NEW content script loaded on:', window.location.href);

  // Check if we're on the Centra web app
  const isFocusWebApp = window.location.hostname.includes('localhost') || 
                       window.location.hostname.includes('centra-web-blocker.com') ||
                       window.location.hostname.includes('centra.pranaaviyer.com');

if (isFocusWebApp) {
  // Create the communication bridge directly in the content script
  // This avoids CSP violations with inline scripts
  const communicationBridge = {
    sendMessage: function(payload) {
      return new Promise((resolve, reject) => {
        const messageId = Date.now() + Math.random();
        
        const listener = (event) => {
          if (event.data.type === 'FOCUS_EXTENSION_RESPONSE' && 
              event.data.id === messageId) {
            window.removeEventListener('message', listener);
            resolve(event.data.response);
          }
        };
        
        window.addEventListener('message', listener);
        
        window.postMessage({
          type: 'FOCUS_EXTENSION_MESSAGE',
          id: messageId,
          payload: payload
        }, '*');
        
        setTimeout(() => {
          window.removeEventListener('message', listener);
          reject(new Error('Extension communication timeout'));
        }, 5000);
      });
    },
    
    isAvailable: function() {
      return this.sendMessage({ action: 'ping' })
        .then(() => true)
        .catch(() => false);
    },
    
    getBlockedSites: function() {
      return this.sendMessage({ action: 'getBlockedSites' });
    },
    
    setBlockedSites: function(sites) {
      return this.sendMessage({ action: 'setBlockedSites', blockedSites: sites });
    },
    
    setBlockingEnabled: function(enabled) {
      return this.sendMessage({ action: 'setBlockingEnabled', enabled: enabled });
    },
    
    setSmartRedirectUrl: function(url) {
      return this.sendMessage({ action: 'setSmartRedirectUrl', url: url });
    }
  };

  // Make the bridge available to the web page by setting it on window
  // This bypasses CSP restrictions
  if (!window.focusExtension) {
    Object.defineProperty(window, 'focusExtension', {
      value: communicationBridge,
      writable: false,
      configurable: false
    });
  }

  console.log('Focus Web Blocker NEW communication bridge installed');
  console.log('window.focusExtension set to:', window.focusExtension);
  console.log('typeof window.focusExtension:', typeof window.focusExtension);
}

// Listen for messages from the web app (only on Focus web app)
if (isFocusWebApp) {
  window.addEventListener('message', (event) => {
    console.log('📨 Message event received:', {
      origin: event.origin,
      data: event.data,
      type: event.data?.type
    });
    
    // Accept messages only from our known web app origins.
    // We validate by hostname to tolerate variants like `www.*`.
    const allowedHosts = [
      'focus-web-blocker.com',
      'centra-web-blocker.com',
      'centra-app.onrender.com',
      'centra.pranaaviyer.com',
    ];
    let originHost = '';
    try {
      originHost = event.origin ? new URL(event.origin).hostname : '';
    } catch (e) {
      originHost = '';
    }
    const isLocalhostOrigin = !!originHost && originHost.includes('localhost');
    const isAllowedOrigin = allowedHosts.some((host) => originHost === host || originHost.endsWith(`.${host}`));
    if (!isAllowedOrigin && !isLocalhostOrigin) {
      console.log('❌ Rejecting message from non-allowed origin:', { origin: event.origin, originHost });
      return;
    }
    
    if (event.data.type === 'FOCUS_EXTENSION_MESSAGE') {
      console.log('✅ Valid message from web app received:', event.data);
      console.log('🔄 Forwarding to background script:', event.data.payload);
      // Context can be invalidated during extension reload/update. Guard for that so
      // this bridge doesn't crash and leave the web app disconnected.
      if (!chrome?.runtime?.id) {
        window.postMessage({
          type: 'FOCUS_EXTENSION_RESPONSE',
          id: event.data.id,
          response: { error: 'Extension context invalidated' }
        }, event.origin);
        return;
      }

      try {
        chrome.runtime.sendMessage(event.data.payload, (response) => {
          console.log('✅ Background script response received:', response);
          
          if (chrome.runtime.lastError) {
            const runtimeMsg = (chrome.runtime.lastError.message || '').toLowerCase();
            const isExpectedTransient =
              runtimeMsg.includes('extension context invalidated') ||
              runtimeMsg.includes('receiving end does not exist');
            if (isExpectedTransient) {
              console.warn('ℹ️ Extension transient state:', chrome.runtime.lastError.message);
            } else {
              console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
            }
            // Send error response back to web app
            window.postMessage({
              type: 'FOCUS_EXTENSION_RESPONSE',
              id: event.data.id,
              response: { error: chrome.runtime.lastError.message || 'Chrome runtime error' }
            }, event.origin);
            return;
          }
          
          console.log('📤 Sending response back to web app:', {
            type: 'FOCUS_EXTENSION_RESPONSE',
            id: event.data.id,
            response: response
          });
          
          window.postMessage({
            type: 'FOCUS_EXTENSION_RESPONSE',
            id: event.data.id,
            response: response
          }, event.origin);
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('ℹ️ sendMessage threw (likely transient extension reload):', msg);
        window.postMessage({
          type: 'FOCUS_EXTENSION_RESPONSE',
          id: event.data.id,
          response: { error: msg || 'Extension context invalidated' }
        }, event.origin);
      }
    } else if (event.data?.type === 'FOCUS_EXTENSION_RESPONSE' || 
               event.data?.type === 'EXTENSION_STORAGE_CHANGED' || 
               event.data?.type === 'BLOCKED_SITE_VISITED') {
      // These are messages we're forwarding, ignore them to prevent loops
      return;
    } else {
      console.log('❌ Message type not recognized:', event.data?.type);
    }
  });
}

console.log('Centra NEW content script setup complete');

// Check if we're on the redirect page
if (window.location.href.includes('/redirect')) {
  console.log('🔄 Redirect page detected, notifying web app');
  // Send notification to web app that a redirect occurred
  setTimeout(() => {
    const referrerUrl = document.referrer || 'unknown';
    console.log('📤 Sending redirect notification with URL:', referrerUrl);
    window.postMessage({
      type: 'BLOCKED_SITE_VISITED',
      url: referrerUrl
    }, '*');
  }, 100);
}

// Detect when user tries to visit a blocked site
// This will run on every page load
chrome.storage.local.get(['blockedSites', 'blockingEnabled'], (data) => {
  console.log('🔍 Checking blocked sites on:', window.location.href);
  console.log('📊 Extension data:', data);
  
  if (data.blockingEnabled && data.blockedSites && data.blockedSites.length > 0) {
    const currentUrl = window.location.href;
    const currentDomain = window.location.hostname;
    
    console.log('🌐 Current URL:', currentUrl);
    console.log('🌐 Current domain:', currentDomain);
    console.log('🚫 Blocked sites:', data.blockedSites);
    
    // Check if current site is blocked
    const isBlocked = data.blockedSites.some(site => {
      const normalizedSite = site.toLowerCase();
      const matches = currentDomain.includes(normalizedSite) || 
                     normalizedSite.includes(currentDomain) ||
                     currentUrl.includes(normalizedSite);
      console.log(`🔍 Checking ${site} against ${currentDomain}: ${matches}`);
      return matches;
    });
    
    console.log('🚫 Is blocked?', isBlocked);
    
    if (isBlocked) {
      console.log('🚫 Blocked site visit detected:', currentUrl);
      
      // Notify the web app about the blocked site visit (only if on Focus web app)
      if (isFocusWebApp) {
        window.postMessage({
          type: 'BLOCKED_SITE_VISITED',
          data: {
            url: currentUrl,
            timestamp: Date.now()
          }
        }, '*');
      }
      
      // Always notify background script
      chrome.runtime.sendMessage({
        type: 'BLOCKED_SITE_VISITED',
        url: currentUrl,
        timestamp: Date.now()
      });
    }
  } else {
    console.log('ℹ️ Blocking disabled or no blocked sites');
  }
});

// Listen for storage change notifications from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'STORAGE_CHANGED_NOTIFICATION') {
    console.log('📢 Storage change notification received from background script:', message);
    
    // Forward the notification to the web app
    window.postMessage({
      type: 'EXTENSION_STORAGE_CHANGED',
      data: message
    }, '*');
    
    console.log('📤 Storage change notification forwarded to web app');
    
    // Send response back to background script
    sendResponse({ received: true });
  } else if (message.type === 'BLOCKED_SITE_VISITED') {
    console.log('🚫 Blocked site visit notification received from background script:', message);
    
    // Forward the notification to the web app (forward the entire message)
    console.log('📤 Sending blocked site notification to web app:', message);
    window.postMessage(message, '*');
    
    console.log('📤 Blocked site visit notification forwarded to web app');
    
    // Send response back to background script
    sendResponse({ received: true });
  }
});

})(); // End of IIFE
