// Optimized popup.js for better performance
// Performance improvements: DOM caching, debouncing, memory management

// DOM element cache - query once, reuse everywhere
const DOM = {
  powerButton: document.getElementById("power-button"),
  statusText: document.getElementById("status"),
  blockedList: document.getElementById("blocked-list"),
  newSiteInput: document.getElementById("new-site"),
  addSiteBtn: document.getElementById("add-site"),
  blockedWebsitesSection: document.getElementById("blocked-websites-section"),
  suggestionsContainer: document.getElementById("suggestions"),
  websiteCounter: document.getElementById("website-counter"),
  passwordContainer: document.getElementById("password-container"),
  passwordInput: document.getElementById("password-input"),
  passwordCancel: document.getElementById("password-cancel"),
  passwordSubmit: document.getElementById("password-submit"),
  passwordError: document.getElementById("password-error"),
  passwordMessage: document.getElementById("password-message")
};

// State management with optimized structure
const state = {
  blockedSites: [],
  selectedSuggestionIndex: -1,
  isUpgraded: false,
  passwordEnabled: false,
  blockingPassword: '',
  pendingSiteToRemove: null,
  isInitialized: false
};

// Optimized common websites - reduced from 25 to 15 most popular
const COMMON_WEBSITES = [
  'youtube.com', 'facebook.com', 'twitter.com', 'instagram.com', 'tiktok.com',
  'reddit.com', 'netflix.com', 'amazon.com', 'github.com', 'linkedin.com',
  'pinterest.com', 'discord.com', 'spotify.com', 'google.com', 'wikipedia.org'
];

// Debounce utility for input events
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

// Optimized DOM manipulation with document fragments
function renderList() {
  // Clear existing content efficiently
  DOM.blockedList.innerHTML = "";
  
  if (state.blockedSites.length === 0) {
    return;
  }
  
  // Use document fragment for better performance
  const fragment = document.createDocumentFragment();
  
  state.blockedSites.forEach((site, index) => {
    const li = document.createElement("li");
    li.textContent = site;
    
    const delBtn = document.createElement("button");
    delBtn.className = "delete-button";
    delBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="delete-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>';
    delBtn.onclick = () => removeSite(site, index);
    
    li.appendChild(delBtn);
    fragment.appendChild(li);
  });
  
  DOM.blockedList.appendChild(fragment);
}

// Optimized suggestion filtering
function filterSuggestions(query) {
  if (!query || query.length < 2) {
    DOM.suggestionsContainer.innerHTML = "";
    return;
  }
  
  const filtered = COMMON_WEBSITES.filter(site => 
    site.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5); // Limit to 5 suggestions for performance
  
  if (filtered.length === 0) {
    DOM.suggestionsContainer.innerHTML = "";
    return;
  }
  
  const fragment = document.createDocumentFragment();
  filtered.forEach((site, index) => {
    const div = document.createElement("div");
    div.className = `suggestion ${index === state.selectedSuggestionIndex ? 'selected' : ''}`;
    div.textContent = site;
    div.onclick = () => selectSuggestion(site);
    fragment.appendChild(div);
  });
  
  DOM.suggestionsContainer.innerHTML = "";
  DOM.suggestionsContainer.appendChild(fragment);
}

// Debounced suggestion filtering
const debouncedFilterSuggestions = debounce(filterSuggestions, 150);

// Optimized site removal with password protection
function removeSite(site, index) {
  console.log('🗑️ removeSite called with:', site);
  
  if (state.passwordEnabled) {
    state.pendingSiteToRemove = { site, index };
    showPasswordContainer();
    return;
  }
  
  performSiteRemoval(site, index);
}

function performSiteRemoval(site, index) {
  state.blockedSites.splice(index, 1);
  
  // Batch storage operations
  const updates = { blockedSites: state.blockedSites };
  
  if (state.blockedSites.length === 0 && state.isBlockingEnabled) {
    updates.blockingEnabled = false;
  }
  
  chrome.storage.local.set(updates, () => {
    if (chrome.runtime.lastError) {
      console.error('Error setting storage:', chrome.runtime.lastError);
      return;
    }
    
    // Update UI after storage confirmation
    renderList();
    updateBlockedWebsitesVisibility();
    updateWebsiteCounter();
    updateAddButtonState();
    
    if (state.blockedSites.length === 0) {
      updatePowerButtonState(false);
    }
  });
}

// Optimized password container management
function showPasswordContainer() {
  DOM.powerButton.style.display = 'none';
  DOM.passwordContainer.style.display = 'block';
  DOM.passwordInput.focus();
  DOM.passwordInput.value = '';
  DOM.passwordError.style.display = 'none';
  
  if (state.pendingSiteToRemove) {
    DOM.passwordMessage.textContent = `Enter password to remove "${state.pendingSiteToRemove.site}" from block list`;
  } else {
    DOM.passwordMessage.textContent = 'Enter password to disable blocking';
  }
}

function hidePasswordContainer() {
  DOM.powerButton.style.display = 'block';
  DOM.passwordContainer.style.display = 'none';
  DOM.passwordInput.value = '';
  state.pendingSiteToRemove = null;
  DOM.passwordError.style.display = 'none';
}

// Optimized storage operations
function loadInitialData() {
  chrome.storage.local.get([
    "blockingEnabled", 
    "blockedSites", 
    "isUpgraded", 
    "passwordEnabled", 
    "blockingPassword"
  ], (data) => {
    state.blockedSites = data.blockedSites || [];
    state.isUpgraded = data.isUpgraded || false;
    state.passwordEnabled = data.passwordEnabled || false;
    state.blockingPassword = data.blockingPassword || '';
    
    // Update UI in batch
    renderList();
    updateBlockedWebsitesVisibility();
    updateWebsiteCounter();
    updateAddButtonState();
    updatePowerButtonState(data.blockingEnabled || false);
    
    state.isInitialized = true;
  });
}

// Optimized event listeners with cleanup
const eventListeners = {
  addSite: null,
  newSiteInput: null,
  passwordSubmit: null,
  passwordCancel: null,
  passwordInput: null
};

function setupEventListeners() {
  // Add site button
  eventListeners.addSite = () => {
    const site = DOM.newSiteInput.value.trim();
    if (!site.includes(".")) {
      alert("Please enter a valid domain (e.g., youtube.com)");
      return;
    }
    if (state.blockedSites.includes(site)) {
      alert("This website is already blocked.");
      return;
    }
    if (state.blockedSites.length >= 5) {
      alert("You can block a maximum of 5 websites. Please remove one before adding another.");
      return;
    }
    
    state.blockedSites.push(site);
    chrome.storage.local.set({ blockedSites: state.blockedSites }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error setting storage:', chrome.runtime.lastError);
        return;
      }
      renderList();
      updateBlockedWebsitesVisibility();
      updateWebsiteCounter();
      updateAddButtonState();
      DOM.newSiteInput.value = "";
    });
  };
  
  // Input event with debouncing
  eventListeners.newSiteInput = (e) => {
    const query = e.target.value.trim();
    debouncedFilterSuggestions(query);
    
    if (e.key === "Enter") {
      eventListeners.addSite();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      state.selectedSuggestionIndex = Math.min(state.selectedSuggestionIndex + 1, 4);
      updateSuggestions();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      state.selectedSuggestionIndex = Math.max(state.selectedSuggestionIndex - 1, -1);
      updateSuggestions();
    } else if (e.key === "Escape") {
      DOM.suggestionsContainer.innerHTML = "";
      state.selectedSuggestionIndex = -1;
    }
  };
  
  // Password handlers
  eventListeners.passwordSubmit = () => {
    const enteredPassword = DOM.passwordInput.value.trim();
    if (enteredPassword === state.blockingPassword) {
      if (state.pendingSiteToRemove) {
        performSiteRemoval(state.pendingSiteToRemove.site, state.pendingSiteToRemove.index);
        state.pendingSiteToRemove = null;
      } else {
        chrome.storage.local.set({ blockingEnabled: false });
        updatePowerButtonState(false);
      }
      hidePasswordContainer();
    } else {
      DOM.passwordError.textContent = "Incorrect password. Please try again.";
      DOM.passwordError.style.display = 'block';
      DOM.passwordInput.value = '';
    }
  };
  
  eventListeners.passwordCancel = () => {
    state.pendingSiteToRemove = null;
    hidePasswordContainer();
  };
  
  eventListeners.passwordInput = (e) => {
    if (e.key === "Enter") {
      eventListeners.passwordSubmit();
    }
  };
  
  // Attach listeners
  DOM.addSiteBtn.addEventListener("click", eventListeners.addSite);
  DOM.newSiteInput.addEventListener("input", eventListeners.newSiteInput);
  DOM.newSiteInput.addEventListener("keydown", eventListeners.newSiteInput);
  DOM.passwordSubmit.addEventListener("click", eventListeners.passwordSubmit);
  DOM.passwordCancel.addEventListener("click", eventListeners.passwordCancel);
  DOM.passwordInput.addEventListener("keypress", eventListeners.passwordInput);
}

// Cleanup function for memory management
function cleanup() {
  if (eventListeners.addSite) {
    DOM.addSiteBtn.removeEventListener("click", eventListeners.addSite);
  }
  if (eventListeners.newSiteInput) {
    DOM.newSiteInput.removeEventListener("input", eventListeners.newSiteInput);
    DOM.newSiteInput.removeEventListener("keydown", eventListeners.newSiteInput);
  }
  if (eventListeners.passwordSubmit) {
    DOM.passwordSubmit.removeEventListener("click", eventListeners.passwordSubmit);
  }
  if (eventListeners.passwordCancel) {
    DOM.passwordCancel.removeEventListener("click", eventListeners.passwordCancel);
  }
  if (eventListeners.passwordInput) {
    DOM.passwordInput.removeEventListener("keypress", eventListeners.passwordInput);
  }
}

// Initialize the popup
function init() {
  loadInitialData();
  setupEventListeners();
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanup);
}

// Start the application
init();


