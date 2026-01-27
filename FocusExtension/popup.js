const powerButton = document.getElementById("power-button");
const statusText = document.getElementById("status");
const blockedList = document.getElementById("blocked-list");
const newSiteInput = document.getElementById("new-site");
const addSiteBtn = document.getElementById("add-site");
const blockedWebsitesSection = document.getElementById("blocked-websites-section");
const suggestionsContainer = document.getElementById("suggestions");
const websiteCounter = document.getElementById("website-counter");
const passwordContainer = document.getElementById("password-container");
const passwordInput = document.getElementById("password-input");
const passwordCancel = document.getElementById("password-cancel");
const passwordSubmit = document.getElementById("password-submit");
const passwordError = document.getElementById("password-error");
const passwordMessage = document.getElementById("password-message");
let blockedSites = [];
let selectedSuggestionIndex = -1;
let isUpgraded = false;
let passwordEnabled = false;
let blockingPassword = '';
let pendingSiteToRemove = null;

// Common websites for suggestions
const commonWebsites = [
  'youtube.com', 'facebook.com', 'twitter.com', 'instagram.com', 'tiktok.com',
  'reddit.com', 'netflix.com', 'hulu.com', 'disneyplus.com', 'amazon.com',
  'ebay.com', 'wikipedia.org', 'stackoverflow.com', 'github.com', 'linkedin.com',
  'pinterest.com', 'snapchat.com', 'twitch.tv', 'discord.com', 'spotify.com',
  'apple.com', 'microsoft.com', 'google.com', 'yahoo.com', 'bing.com'
];



function renderList() {
  blockedList.innerHTML = "";
  blockedSites.forEach((site, index) => {
    const li = document.createElement("li");
    li.textContent = site;
    const delBtn = document.createElement("button");
    delBtn.className = "delete-button";
    delBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="delete-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>';
    delBtn.onclick = () => removeSite(site, index);
    li.appendChild(delBtn);
    blockedList.appendChild(li);
  });
}

function updateBlockedWebsitesVisibility() {
  if (blockedSites.length > 0) {
    blockedWebsitesSection.classList.add('visible');
  } else {
    blockedWebsitesSection.classList.remove('visible');
  }
}

function updateWebsiteCounter() {
  if (isUpgraded) {
    websiteCounter.textContent = `${blockedSites.length} sites blocked`;
  } else {
    websiteCounter.textContent = `${blockedSites.length}/5`;
  }
}

function updateAddButtonState() {
  if (!isUpgraded && blockedSites.length >= 5) {
    addSiteBtn.disabled = true;
    addSiteBtn.textContent = "Limit Reached (5/5)";
    addSiteBtn.style.opacity = "0.6";
    addSiteBtn.style.cursor = "not-allowed";
  } else {
    addSiteBtn.disabled = false;
    addSiteBtn.textContent = "Block Website";
    addSiteBtn.style.opacity = "1";
    addSiteBtn.style.cursor = "pointer";
  }
}

function updatePowerButtonState(enabled) {
  if (enabled) {
    powerButton.classList.add('active');
    statusText.classList.add('active');
    
    // Smooth transition for status text
    const statusSpan = statusText.querySelector('.status-toggle');
    statusSpan.style.opacity = '0';
    setTimeout(() => {
      statusSpan.innerHTML = "<strong>ACTIVE</strong>";
      statusSpan.style.opacity = '1';
    }, 150);
  } else {
    powerButton.classList.remove('active');
    statusText.classList.remove('active');
    
    // Smooth transition for status text
    const statusSpan = statusText.querySelector('.status-toggle');
    statusSpan.style.opacity = '0';
    setTimeout(() => {
      statusSpan.innerHTML = "<strong>INACTIVE</strong>";
      statusSpan.style.opacity = '1';
    }, 150);
  }
}

function showPasswordContainer() {
  powerButton.style.display = 'none';
  passwordContainer.style.display = 'block';
  passwordInput.focus();
  passwordInput.value = '';
  passwordError.style.display = 'none';
  
  // Set appropriate message based on pending action
  if (pendingSiteToRemove) {
    passwordMessage.textContent = `Enter password to remove "${pendingSiteToRemove.site}" from block list`;
  } else {
    passwordMessage.textContent = 'Enter password to disable blocking';
  }
}

function hidePasswordContainer() {
  powerButton.style.display = 'block';
  passwordContainer.style.display = 'none';
  passwordInput.value = '';
  passwordError.style.display = 'none';
}

function showPasswordError(message) {
  passwordError.textContent = message;
  passwordError.style.display = 'block';
  passwordInput.style.borderColor = '#ef4444';
}

function clearPasswordError() {
  passwordError.style.display = 'none';
  passwordInput.style.borderColor = '#2a2a2a';
}

// Function to handle site removal with password protection
function removeSite(site, index) {
  console.log('🗑️ removeSite called with:', site);
  
  // Check if password protection is enabled
  if (passwordEnabled) {
    // Password protection is enabled, show password modal
    pendingSiteToRemove = { site, index };
    showPasswordContainer();
    return;
  }
  
  // Proceed with normal removal
  performSiteRemoval(site, index);
}

// Function to actually perform the site removal
function performSiteRemoval(site, index) {
  blockedSites.splice(index, 1);
  
  // Auto-disable blocking if no sites remain
  if (blockedSites.length === 0) {
    // Update both blockedSites and blockingEnabled atomically
    chrome.storage.local.set({ 
      blockedSites: blockedSites,
      blockingEnabled: false 
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error setting storage:', chrome.runtime.lastError);
        return;
      }
      
      console.log('✅ Last site removed and blocking disabled');
      
      // Update UI after storage is confirmed
      renderList();
      updateBlockedWebsitesVisibility();
      updateWebsiteCounter();
      updateAddButtonState();
      updatePowerButtonState(false);
    });
  } else {
    // Just update blockedSites, keep current blocking state
    chrome.storage.local.set({ blockedSites: blockedSites }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error setting storage:', chrome.runtime.lastError);
        return;
      }
      
      console.log('✅ Site removed, blocking state unchanged');
      
      // Update UI after storage is confirmed
      renderList();
      updateBlockedWebsitesVisibility();
      updateWebsiteCounter();
      updateAddButtonState();
    });
  }
}

function addSiteDirectly(site) {
  console.log('📝 addSiteDirectly called with:', site);
  
  // Validate the site
  if (!site || !site.includes(".")) {
    console.log('❌ Invalid site:', site);
    alert("Please enter a valid domain (e.g., youtube.com)");
    return;
  }
  
  // Check if site is already blocked
  if (blockedSites.includes(site)) {
    alert("This website is already blocked.");
    return;
  }
  
  // Check if we've reached the limit (5 for free users, unlimited for pro users)
  if (!isUpgraded && blockedSites.length >= 5) {
    alert("Free users can block a maximum of 5 websites. Upgrade to Pro for unlimited blocking!");
    return;
  }
  
  // Add the site to the blocked list
  blockedSites.push(site);
  
  // Update both blockedSites and blockingEnabled atomically
  chrome.storage.local.set({ 
    blockedSites: blockedSites,
    blockingEnabled: true 
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error setting storage:', chrome.runtime.lastError);
      return;
    }
    
    console.log('✅ Site added from dropdown and blocking enabled:', site);
    
    // Update UI after storage is confirmed
    renderList();
    updateBlockedWebsitesVisibility();
    updateWebsiteCounter();
    updateAddButtonState();
    updatePowerButtonState(true);
    newSiteInput.value = "";
  });
}

function showSuggestions(input) {
  const value = input.value.toLowerCase().trim();
  if (value.length < 2) {
    hideSuggestions();
    return;
  }

  // Combine common websites with previously used sites
  const allSuggestions = [...new Set([...commonWebsites, ...blockedSites])];
  
  const suggestions = allSuggestions.filter(site => 
    site.toLowerCase().includes(value) || 
    site.toLowerCase().replace('.com', '').includes(value) ||
    site.toLowerCase().replace('.org', '').includes(value) ||
    site.toLowerCase().replace('.tv', '').includes(value) ||
    site.toLowerCase().replace('.net', '').includes(value) ||
    site.toLowerCase().replace('.io', '').includes(value)
  ).slice(0, 8); // Show more suggestions since we have more options

  if (suggestions.length === 0) {
    hideSuggestions();
    return;
  }

  suggestionsContainer.innerHTML = '';
  suggestions.forEach((site, index) => {
    const div = document.createElement('div');
    div.className = 'suggestion-item';
    div.textContent = site;
    
    div.onclick = () => {
      console.log('🎯 Dropdown item clicked:', site);
      
      // Add visual feedback
      div.style.background = 'rgba(244, 63, 94, 0.2)';
      div.textContent = 'Adding...';
      
      // Directly add the site and enable blocking
      console.log('🚀 Calling addSiteDirectly with:', site);
      addSiteDirectly(site);
      hideSuggestions();
    };
    suggestionsContainer.appendChild(div);
  });

  suggestionsContainer.style.display = 'block';
  selectedSuggestionIndex = -1;
}

function hideSuggestions() {
  suggestionsContainer.style.display = 'none';
  selectedSuggestionIndex = -1;
}

function selectSuggestion(direction) {
  const items = suggestionsContainer.querySelectorAll('.suggestion-item');
  if (items.length === 0) return;

  // Remove previous selection
  items.forEach(item => item.classList.remove('selected'));

  if (direction === 'down') {
    selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, items.length - 1);
  } else if (direction === 'up') {
    selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
  }

  if (selectedSuggestionIndex >= 0) {
    items[selectedSuggestionIndex].classList.add('selected');
  }
}

chrome.storage.local.get(["blockingEnabled", "blockedSites", "isUpgraded", "passwordEnabled", "blockingPassword"], (data) => {
  const enabled = data.blockingEnabled || false;
  blockedSites = data.blockedSites || [];
  isUpgraded = data.isUpgraded || false;
  passwordEnabled = data.passwordEnabled || false;
  blockingPassword = data.blockingPassword || '';
  
  // Enforce the 5-site limit if someone had more stored and is not upgraded
  if (!isUpgraded && blockedSites.length > 5) {
    blockedSites = blockedSites.slice(0, 5);
    chrome.storage.local.set({ blockedSites });
  }
  
  updatePowerButtonState(enabled);
  renderList();
  updateBlockedWebsitesVisibility();
  updateWebsiteCounter();
  updateAddButtonState();
});

// Listen for storage changes to update subscription status and password settings
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    if (changes.isUpgraded) {
      isUpgraded = changes.isUpgraded.newValue || false;
      console.log('🔄 Subscription status updated in popup:', isUpgraded ? 'Pro' : 'Free');
      updateAddButtonState();
    }
    
    if (changes.passwordEnabled) {
      passwordEnabled = changes.passwordEnabled.newValue || false;
      console.log('🔐 Password protection updated in popup:', passwordEnabled ? 'Enabled' : 'Disabled');
    }
    
    if (changes.blockingPassword) {
      blockingPassword = changes.blockingPassword.newValue || '';
      console.log('🔐 Password updated in popup');
    }
  }
});

powerButton.addEventListener("click", () => {
  chrome.storage.local.get(["blockingEnabled", "passwordEnabled", "blockingPassword"], (data) => {
    const newStatus = !(data.blockingEnabled || false);
    
    // Check if password protection is enabled and we're trying to disable blocking
    if (data.passwordEnabled && !newStatus) {
      // Password protection is enabled and we're trying to disable blocking
      pendingSiteToRemove = null; // Clear any pending site removal
      showPasswordContainer();
    } else {
      // No password protection or enabling blocking
      chrome.storage.local.set({ blockingEnabled: newStatus });
      updatePowerButtonState(newStatus);
    }
  });
});

// Password container event listeners
passwordCancel.addEventListener("click", () => {
  pendingSiteToRemove = null;
  hidePasswordContainer();
});

passwordSubmit.addEventListener("click", () => {
  const enteredPassword = passwordInput.value.trim();
  chrome.storage.local.get(["blockingPassword"], (data) => {
    if (enteredPassword === data.blockingPassword) {
      // Correct password, proceed with the pending action
      if (pendingSiteToRemove) {
        // Remove the site
        performSiteRemoval(pendingSiteToRemove.site, pendingSiteToRemove.index);
        pendingSiteToRemove = null;
      } else {
        // Disable blocking
        chrome.storage.local.set({ blockingEnabled: false });
        updatePowerButtonState(false);
      }
      hidePasswordContainer();
    } else {
      // Incorrect password
      showPasswordError("Incorrect password. Please try again.");
      passwordInput.value = '';
    }
  });
});

// Handle Enter key in password input
passwordInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    passwordSubmit.click();
  }
});

// Clear error when typing
passwordInput.addEventListener("input", () => {
  clearPasswordError();
});

addSiteBtn.addEventListener("click", () => {
  const site = newSiteInput.value.trim();
  if (!site.includes(".")) {
    alert("Please enter a valid domain (e.g., youtube.com)");
    return;
  }
  if (blockedSites.includes(site)) {
    alert("This website is already blocked.");
    return;
  }
  if (blockedSites.length >= 5) {
    alert("You can block a maximum of 5 websites. Please remove one before adding another.");
    return;
  }
  blockedSites.push(site);
  
  // Update both blockedSites and blockingEnabled atomically
  chrome.storage.local.set({ 
    blockedSites: blockedSites,
    blockingEnabled: true 
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error setting storage:', chrome.runtime.lastError);
      return;
    }
    
    console.log('✅ Site added and blocking enabled:', site);
    
    // Update UI after storage is confirmed
    renderList();
    updateBlockedWebsitesVisibility();
    updateWebsiteCounter();
    updateAddButtonState();
    updatePowerButtonState(true);
    newSiteInput.value = "";
    hideSuggestions();
  });
});

// Input event for suggestions
newSiteInput.addEventListener("input", () => {
  showSuggestions(newSiteInput);
});

// Focus events
newSiteInput.addEventListener("focus", () => {
  showSuggestions(newSiteInput);
});

// Click outside to hide suggestions
document.addEventListener("click", (e) => {
  if (!newSiteInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
    hideSuggestions();
  }
});

// Keyboard navigation
newSiteInput.addEventListener("keydown", (e) => {
  if (suggestionsContainer.style.display === 'block') {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectSuggestion('down');
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectSuggestion('up');
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selectedItem = suggestionsContainer.querySelector('.suggestion-item.selected');
      if (selectedItem) {
        // Directly add the selected site from dropdown
        addSiteDirectly(selectedItem.textContent);
        hideSuggestions();
      } else {
        // Add the manually typed site
        addSiteBtn.click();
      }
    } else if (e.key === "Escape") {
      hideSuggestions();
    }
  } else if (e.key === "Enter") {
    addSiteBtn.click();
  }
});

