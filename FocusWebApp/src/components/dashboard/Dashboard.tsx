import React, { useState, useEffect } from 'react';

// Chrome extension types
declare global {
  interface Window {
    chrome?: {
      runtime?: {
        sendMessage: (message: any) => Promise<any>;
      };
    };
    focusExtension?: {
      isAvailable: () => Promise<boolean>;
      getBlockedSites: () => Promise<any>;
      setBlockedSites: (sites: string[]) => Promise<any>;
      setBlockingEnabled: (enabled: boolean) => Promise<any>;
    };
  }
}
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Target, Clock, TrendingUp, Calendar, CheckCircle, User, Settings, LogOut, ChevronDown, FileText, Lock, KeyRound, Check, LayoutDashboard } from 'lucide-react';
import { CreateSessionModal } from './CreateSessionModal';
import { SimpleTimer } from './SimpleTimer';
import { FocusTimeChart } from './FocusTimeChart';
import { EditSessionModal } from './EditSessionModal';
import { DeleteSessionModal } from './DeleteSessionModal';
import { ViewSessionModal } from './ViewSessionModal';
import { SettingsTab } from './SettingsTab';
import { Toast, ToastType } from '../ui/Toast';
import { TimerNotification } from './TimerNotification';
import { getTodaysTip } from '../../data/focusTips';
import { AnalyticsPage } from './AnalyticsPage';
import { SEO } from '../SEO';
import { API_BASE_URL, FRONTEND_URL } from '../../config/api';

interface FocusSession {
  _id: string;
  title: string;
  description: string;
  goal: number;
  actualTime: number;
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed' | 'paused' | 'abandoned' | 'interrupted';
  tags: string[];
  productivity: number;
}

export const Dashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<FocusSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setErrorCount] = useState(0);
  const [lastErrorTime, setLastErrorTime] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual' | 'lifetime' | null>(null);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  
  // Website blocker state
  const [blockedSites, setBlockedSites] = useState<string[]>([]);
  const [isBlockingEnabled, setIsBlockingEnabled] = useState(true);
  const [redirectUrl, setRedirectUrl] = useState(`${FRONTEND_URL}/redirect`);
  const [smartRedirectUrl, setSmartRedirectUrl] = useState('');
  const [newSiteInput, setNewSiteInput] = useState('');
  const [isUpgraded, setIsUpgraded] = useState(() => typeof window !== 'undefined' && localStorage.getItem('isUpgraded') === 'true');
  const [, setIsPro] = useState(false);
  const [isBlockedHistoryOpen, setIsBlockedHistoryOpen] = useState(false);
  const [totalBlockedSites, setTotalBlockedSites] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSessionsHistoryOpen, setIsSessionsHistoryOpen] = useState(false);
  
  // Session state management
  const [isSessionProcessing] = useState(false);
  
  // Site blocking state management
  const [isSiteOperationLoading, setIsSiteOperationLoading] = useState(false);
  const [siteInputError, setSiteInputError] = useState<string>('');
  const [siteInputValid, setSiteInputValid] = useState<boolean>(false);
  
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [timeFilter, setTimeFilter] = useState<string>('');

  const [editingSession, setEditingSession] = useState<FocusSession | null>(null);
  const [deletingSession, setDeletingSession] = useState<FocusSession | null>(null);
  const [viewingSession, setViewingSession] = useState<FocusSession | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean } | null>(null);
  const [timerNotification, setTimerNotification] = useState<{
    isVisible: boolean;
    sessionTitle: string;
    duration: number;
    type: 'completed' | 'paused' | 'interrupted';
  } | null>(null);
  
  // Dashboard tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'analytics' | 'settings'>('overview');
  
  // Profile dropdown state
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  // Dev unlock code (same key as Header)
  const DEV_UNLOCK_KEY = 'devUnlocked';
  const DEV_CODE = import.meta.env.VITE_DEV_UNLOCK_CODE || 'centradev';
  const PRO_TOGGLE_CODE = 'lifeofpranaav';
  const [devCode, setDevCode] = useState('');
  const [devUnlocked, setDevUnlocked] = useState(() => typeof window !== 'undefined' && localStorage.getItem(DEV_UNLOCK_KEY) === 'true');
  useEffect(() => {
    setDevUnlocked(localStorage.getItem(DEV_UNLOCK_KEY) === 'true');
  }, []);
  const handleDevCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = devCode.trim();
    if (!trimmed) return;
    if (trimmed === PRO_TOGGLE_CODE) {
      const newStatus = !isUpgraded;
      setIsUpgraded(newStatus);
      localStorage.setItem('isUpgraded', newStatus.toString());
      localStorage.setItem('devProOverride', newStatus.toString()); // Persist dev Pro so it survives reload
      syncSubscriptionStatusToExtension(newStatus);
      showToast(`Pro mode ${newStatus ? 'ON' : 'OFF'}`, 'success');
      setDevCode('');
      return;
    }
    if (trimmed === DEV_CODE) {
      localStorage.setItem(DEV_UNLOCK_KEY, 'true');
      setDevUnlocked(true);
      setDevCode('');
      showToast('Dev mode unlocked', 'success');
    }
  };
  
  // Password protection state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [pendingBlockingState, setPendingBlockingState] = useState<boolean | null>(null);
  const [pendingSiteToRemove, setPendingSiteToRemove] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState('');




  // Check subscription status
  const checkSubscriptionStatus = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/subscription/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isPro) {
          setIsPro(true);
          setIsUpgraded(true);
          localStorage.setItem('isUpgraded', 'true');
        } else {
          // Backend says free; respect dev Pro override (lifeofpranaav) so it persists across reload
          const devProOverride = typeof window !== 'undefined' && localStorage.getItem('devProOverride') === 'true';
          if (devProOverride) {
            setIsUpgraded(true);
            localStorage.setItem('isUpgraded', 'true');
          } else {
            setIsPro(false);
            setIsUpgraded(false);
            localStorage.setItem('isUpgraded', 'false');
          }
        }
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      console.log('useEffect triggered with token:', token ? 'Present' : 'Missing');
      if (token) {
        console.log('Fetching sessions...');
        await fetchSessions();
        // When returning from Stripe success, let the subscription=success effect run verify first
        // so its checkSubscriptionStatus() sets Pro state; avoid racing with an early GET /status here
        const urlParams = new URLSearchParams(window.location.search);
        const isStripeSuccessRedirect = urlParams.get('subscription') === 'success' && urlParams.get('session_id');
        if (!isStripeSuccessRedirect) {
          await checkSubscriptionStatus();
        }
      } else {
        console.log('No token, skipping session fetch');
      }
    };
    
    initializeData();
  }, [token]);

  // Check schedule blocking state periodically
  useEffect(() => {
    if (!token) return;
    
    const interval = setInterval(() => {
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [token, isBlockingEnabled]);

  // Load blocked sites from backend (if logged in) or localStorage, and sync with extension
  useEffect(() => {
    const loadBlockedSites = async () => {
      try {
        // If user is logged in, try to load from backend first
        if (token && user) {
          try {
            const response = await fetch(`${API_BASE_URL}/blocked-sites`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.blockedSites) {
                // Load from backend
                setBlockedSites(data.blockedSites);
                localStorage.setItem('blockedSites', JSON.stringify(data.blockedSites));
                
                // Load history from backend
                const historyResponse = await fetch(`${API_BASE_URL}/blocked-sites/history`, {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                
                if (historyResponse.ok) {
                  const historyData = await historyResponse.json();
                  if (historyData.success && historyData.history) {
                    // Merge backend history with localStorage history
                    const localHistory = JSON.parse(localStorage.getItem('blockedHistory') || '[]');
                    const backendHistory = historyData.history.map((entry: any) => ({
                      site: entry.site,
                      timestamp: entry.timestamp,
                      lastVisited: entry.lastVisited,
                      visits: entry.visits
                    }));
                    
                    // Merge and deduplicate
                    const mergedHistory = [...backendHistory];
                    localHistory.forEach((localEntry: any) => {
                      if (!mergedHistory.some((e: any) => e.site === localEntry.site)) {
                        mergedHistory.push(localEntry);
                      }
                    });
                    
                    localStorage.setItem('blockedHistory', JSON.stringify(mergedHistory));
                  }
                }
                
                console.log('✅ Loaded blocked sites from backend');
                return; // Successfully loaded from backend, skip localStorage
              }
            }
          } catch (backendError) {
            console.warn('⚠️ Failed to load from backend, falling back to localStorage:', backendError);
            // Fall through to localStorage
          }
        }
        
        // Fallback to localStorage (for non-logged-in users or if backend fails)
        const savedBlockedSites = localStorage.getItem('blockedSites');
        if (savedBlockedSites) {
          setBlockedSites(JSON.parse(savedBlockedSites));
        }
        
        const savedBlockingEnabled = localStorage.getItem('isBlockingEnabled');
        if (savedBlockingEnabled !== null) {
          setIsBlockingEnabled(JSON.parse(savedBlockingEnabled));
        }
        
        const savedRedirectUrl = localStorage.getItem('redirectUrl');
        if (savedRedirectUrl) {
          setRedirectUrl(savedRedirectUrl);
        }
        
        const savedSmartRedirectUrl = localStorage.getItem('smartRedirectUrl');
        if (savedSmartRedirectUrl) {
          setSmartRedirectUrl(savedSmartRedirectUrl);
        }
        
        // Initialize blocked history from localStorage
        const savedBlockedHistory = localStorage.getItem('blockedHistory');
        if (savedBlockedHistory) {
          // Blocked history is managed automatically when sites are added/removed
        }
        
        // Initialize total blocked sites counter (persistent, only goes up)
        const savedTotalBlockedSites = localStorage.getItem('totalBlockedSites');
        if (savedTotalBlockedSites) {
          setTotalBlockedSites(JSON.parse(savedTotalBlockedSites));
        }
        
        // Upgrade status is set from API in checkSubscriptionStatus (and by dev code); do not restore from localStorage here so new accounts always get Free until backend says Pro
        
        // Reset time saved if it's a new day
        const today = new Date().toDateString();
        const lastResetDate = localStorage.getItem('timeSavedResetDate');
        if (lastResetDate !== today) {
          localStorage.setItem('timeSavedByBlocking', '0');
          localStorage.setItem('timeSavedResetDate', today);
          console.log('🔄 Time saved reset for new day:', today);
        }
        
        // Auto-sync with extension on page load
        autoSyncWithExtension();
      } catch (error) {
        console.error('Error loading blocked sites:', error);
      }
    };
    
    loadBlockedSites();
  }, [token, user]);

  // After load, sync persisted Pro state to extension so it stays in sync after reload
  useEffect(() => {
    if (token && user) {
      syncSubscriptionStatusToExtension(isUpgraded);
    }
  }, [token, user, isUpgraded]);

  // Check subscription status when user data changes and sync blocked sites to backend
  useEffect(() => {
    const syncDataOnLogin = async () => {
      if (user && token) {
        // When returning from Stripe success, don't run checkSubscriptionStatus here so it
        // can't overwrite the Pro state set by the subscription=success verify effect
        const urlParams = new URLSearchParams(window.location.search);
        const isStripeSuccessRedirect = urlParams.get('subscription') === 'success' && urlParams.get('session_id');
        if (!isStripeSuccessRedirect) {
          await checkSubscriptionStatus();
        }

        // Sync existing localStorage blocked sites to backend (one-time migration)
        const localBlockedSites = JSON.parse(localStorage.getItem('blockedSites') || '[]');
        if (localBlockedSites.length > 0) {
          try {
            // Get current backend sites
            const response = await fetch(`${API_BASE_URL}/blocked-sites`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              const backendSites = data.success ? (data.blockedSites || []) : [];
              
              // Find sites that exist locally but not in backend
              const sitesToSync = localBlockedSites.filter((site: string) => !backendSites.includes(site));
              
              if (sitesToSync.length > 0) {
                // Bulk sync missing sites to backend
                const syncResponse = await fetch(`${API_BASE_URL}/blocked-sites/bulk`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({ domains: sitesToSync })
                });
                
                if (syncResponse.ok) {
                  console.log(`✅ Synced ${sitesToSync.length} blocked sites to backend`);
                }
              }
            }
          } catch (error) {
            console.warn('Error syncing blocked sites to backend:', error);
          }
        }
      }
    };
    
    syncDataOnLogin();
  }, [user, token]);

  // When user returns to dashboard tab (e.g. from Stripe Portal), re-sync subscription from Stripe
  useEffect(() => {
    if (!token) return;
    const onFocus = () => {
      checkSubscriptionStatus();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [token]);

  // Handle Stripe checkout redirects
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const subscriptionStatus = urlParams.get('subscription');
    const sessionId = urlParams.get('session_id'); // Stripe adds this via {CHECKOUT_SESSION_ID} in success URL
    
    if (subscriptionStatus === 'success') {
      showToast('Payment successful! Verifying subscription...', 'success');
      const verifySubscription = async () => {
        if (!token) return;

        console.log('🔄 Stripe success: verifying with session_id=', sessionId || '(none)');
        try {
          const response = await fetch(`${API_BASE_URL}/subscription/verify`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(sessionId ? { session_id: sessionId } : {}),
          });

          const data = response.ok ? await response.json() : null;
          console.log('🔄 Verify response:', { ok: response.ok, status: response.status, isPro: data?.isPro, data });

          if (response.ok && data) {
            if (data.isPro) {
              showToast('Payment successful! Welcome to Focus Pro!', 'success');
              // Set Pro state immediately; do not call checkSubscriptionStatus() here so
              // a late GET /status response cannot overwrite with stale isPro: false
              setIsPro(true);
              setIsUpgraded(() => true);
              localStorage.setItem('isUpgraded', 'true');
              syncSubscriptionStatusToExtension(true);
              console.log('✅ Pro state set and synced to extension');
              // Backup: re-apply Pro after a tick in case another effect overwrote state (e.g. loadBlockedSites)
              setTimeout(() => {
                setIsUpgraded(prev => prev || true);
              }, 0);
            } else {
              showToast('Payment received. Subscription will be activated shortly.', 'info');
              await checkSubscriptionStatus();
            }
          } else {
            showToast('Payment received. Verifying subscription...', 'info');
            await checkSubscriptionStatus();
          }
        } catch (error) {
          console.error('Error verifying subscription:', error);
          showToast('Payment received. Subscription will be activated shortly.', 'info');
          await checkSubscriptionStatus();
        } finally {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };
      
      verifySubscription();
    } else if (subscriptionStatus === 'cancelled') {
      showToast('Payment cancelled', 'info');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [token]);

  // Listen for navigation events to detect blocked site visits
  useEffect(() => {
    const handleBeforeUnload = (_event: BeforeUnloadEvent) => {
      // This will be called when the user navigates away from the page
      // We can't directly detect the destination URL here, but we can set up
      // a mechanism for the extension to notify us
      console.log('🚀 User navigating away from Focus app');
    };

    // Listen for messages from the extension about blocked site visits
    const handleBlockedSiteVisit = (event: MessageEvent) => {
      if (event.data.type === 'BLOCKED_SITE_VISITED') {
        // Handle both nested and direct URL structures
        const url = event.data.data?.url || event.data.url;
        console.log('🚫 Blocked site visit detected:', url);
        console.log('🔍 Full event.data:', event.data);
        
        // Extract domain from URL and add to blocked history
        if (url && typeof url === 'string') {
          try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname.replace(/^www\./, '');
            addToBlockedHistory(domain);
          } catch (error) {
            console.error('Error parsing blocked site URL:', url, error);
          }
        } else {
          console.warn('Invalid URL received for blocked site visit:', url);
          console.warn('Event data structure:', JSON.stringify(event.data, null, 2));
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('message', handleBlockedSiteVisit);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('message', handleBlockedSiteVisit);
    };
  }, []);

  // Helper function to sync blocked sites to extension (non-blocking)
  const syncBlockedSitesToExtension = (sites: string[]) => {
    // Fire and forget - don't wait for response
    try {
      const messageId = Date.now() + Math.random();
      
      const message = {
        type: 'FOCUS_EXTENSION_MESSAGE',
        id: messageId,
        payload: { action: 'setBlockedSites', blockedSites: sites }
      };
      
      console.log('🚀 Sending message to extension:', message);
      console.log('📍 Current origin:', window.location.origin);
      
      // Set up a listener to catch the response
      const responseListener = (event: MessageEvent) => {
        if (event.data.type === 'FOCUS_EXTENSION_RESPONSE' && 
            event.data.id === messageId) {
          console.log('🎯 Extension response received for setBlockedSites:', event.data);
          window.removeEventListener('message', responseListener);
          
          // No more sync notifications - just log for debugging
          console.log('✅ Extension sync completed successfully');
        }
      };
      
      window.addEventListener('message', responseListener);
      
      // Remove listener after 5 seconds to prevent memory leaks
      setTimeout(() => {
        window.removeEventListener('message', responseListener);
      }, 5000);
      
      window.postMessage(message, '*');
      
      console.log('✅ Message sent to extension, sites:', sites);
      
      // Show brief sync indicator
      showToast('Syncing with extension...', 'info');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to sync blocked sites to extension:', errorMessage);
    }
  };

  // Helper function to sync subscription status to extension (non-blocking)
  const syncSubscriptionStatusToExtension = (isUpgraded: boolean) => {
    try {
      const messageId = Date.now() + Math.random();
      
      const message = {
        type: 'FOCUS_EXTENSION_MESSAGE',
        id: messageId,
        payload: { action: 'setSubscriptionStatus', isUpgraded: isUpgraded }
      };
      
      window.postMessage(message, '*');
      console.log('📤 Synced subscription status to extension:', isUpgraded);
    } catch (error) {
      console.error('❌ Error syncing subscription status to extension:', error);
    }
  };

  // Helper function to sync blocking state to extension (non-blocking)
  const syncBlockingStateToExtension = (enabled: boolean) => {
    // Fire and forget - don't wait for response
    try {
      const messageId = Date.now() + Math.random();
      
      window.postMessage({
        type: 'FOCUS_EXTENSION_MESSAGE',
        id: messageId,
        payload: { action: 'setBlockingEnabled', enabled: enabled }
      }, '*');
      
      console.log('Syncing blocking state to extension:', enabled);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to sync blocking state to extension:', errorMessage);
    }
  };

  // Helper function to sync smart redirect URL to extension (non-blocking)
  const syncSmartRedirectUrlToExtension = (url: string) => {
    // Fire and forget - don't wait for response
    try {
      const messageId = Date.now() + Math.random();
      
      console.log('📤 About to sync smart redirect URL to extension:', url);
      console.log('📤 Message ID:', messageId);
      
      window.postMessage({
        type: 'FOCUS_EXTENSION_MESSAGE',
        id: messageId,
        payload: { action: 'setSmartRedirectUrl', url: url }
      }, '*');
      
      console.log('📤 Synced smart redirect URL to extension:', url);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to sync smart redirect URL to extension:', errorMessage);
    }
  };

  // Function to add site to blocked history
  const addToBlockedHistory = async (site: string) => {
    const history = JSON.parse(localStorage.getItem('blockedHistory') || '[]');
    const timestamp = new Date().toISOString();
    
    // Add to history if not already there
    if (!history.some((entry: any) => entry.site === site)) {
      history.push({ site, timestamp, visits: 1 });
      
      // Increment total blocked sites counter (persistent, only goes up)
      setTotalBlockedSites(prevTotal => {
        const newTotal = prevTotal + 1;
        localStorage.setItem('totalBlockedSites', JSON.stringify(newTotal));
        console.log('📈 Total blocked sites counter incremented to:', newTotal);
        return newTotal;
      });
    } else {
      // Increment visit count if already in history
      const entry = history.find((entry: any) => entry.site === site);
      if (entry) {
        entry.visits = (entry.visits || 1) + 1;
        entry.lastVisited = timestamp;
      }
    }
    
    localStorage.setItem('blockedHistory', JSON.stringify(history));
    console.log('📝 Added to blocked history:', site);
    
    // Sync history to backend if logged in (backend tracks this automatically via BlockedSite model)
    // The backend already tracks visits and timestamps, so we don't need to sync manually
    
    // Increment time saved counter (estimate 5 minutes saved per blocked visit)
    const timeSavedPerVisit = 5 * 60; // 5 minutes in seconds
    const currentTimeSaved = JSON.parse(localStorage.getItem('timeSavedByBlocking') || '0');
    const newTimeSaved = currentTimeSaved + timeSavedPerVisit;
    localStorage.setItem('timeSavedByBlocking', JSON.stringify(newTimeSaved));
    console.log('⏰ Time saved incremented by 5 minutes. Total:', Math.floor(newTimeSaved / 60), 'minutes');
  };

  // Function to get blocked history from localStorage
  const getBlockedHistory = () => {
    return JSON.parse(localStorage.getItem('blockedHistory') || '[]');
  };

  // Function to validate if input looks like a website domain
  const isValidWebsiteDomain = (input: string) => {
    if (!input || typeof input !== 'string') return false;
    
    const trimmed = input.trim().toLowerCase();
    
    // Must not contain spaces
    if (trimmed.includes(' ')) return false;
    
    // Must not contain special characters except dots and hyphens
    if (!/^[a-z0-9.-]+$/.test(trimmed)) return false;
    
    // Must not start or end with dot or hyphen
    if (trimmed.startsWith('.') || trimmed.endsWith('.') || 
        trimmed.startsWith('-') || trimmed.endsWith('-')) return false;
    
    // If it contains a dot, validate as full domain (e.g., youtube.com)
    if (trimmed.includes('.')) {
      // Must have at least 2 parts (domain.tld)
      const parts = trimmed.split('.');
      if (parts.length < 2) return false;
      
      // Each part must not be empty
      if (parts.some(part => part.length === 0)) return false;
      
      // TLD must be at least 2 characters
      const tld = parts[parts.length - 1];
      if (tld.length < 2) return false;
      
      // Common TLDs
      const commonTlds = ['com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'co', 'uk', 'ca', 'au', 'de', 'fr', 'jp', 'cn', 'in', 'br', 'ru', 'it', 'es', 'nl', 'se', 'no', 'dk', 'fi', 'pl', 'cz', 'hu', 'ro', 'bg', 'hr', 'si', 'sk', 'lt', 'lv', 'ee', 'ie', 'pt', 'gr', 'cy', 'mt', 'lu', 'be', 'at', 'ch', 'li', 'is', 'fo', 'gl', 'ax', 'ad', 'mc', 'sm', 'va', 'gi', 'je', 'gg', 'im', 'io', 'me', 'tv', 'cc', 'ws', 'tk', 'ml', 'ga', 'cf', 'app', 'dev', 'tech', 'online', 'site', 'website', 'blog', 'store', 'shop', 'news', 'info', 'biz', 'name', 'pro', 'mobi', 'asia', 'tel', 'travel', 'jobs', 'cat', 'aero', 'coop', 'museum', 'arpa', 'xxx', 'post', 'mil', 'gov', 'edu'];
      
      // If it's a common TLD, it's likely valid
      if (commonTlds.includes(tld)) return true;
      
      // If TLD is 2-4 characters and contains only letters, it's likely valid
      if (tld.length >= 2 && tld.length <= 4 && /^[a-z]+$/.test(tld)) return true;
      
      return false;
    }
    
    // If no dot, validate as domain name only (e.g., youtube) - will be normalized later
    // Must be at least 2 characters and only alphanumeric/hyphens
    if (trimmed.length >= 2 && /^[a-z0-9-]+$/.test(trimmed)) {
      // Accept any valid domain name format, normalization will handle it
      return true;
    }
    
    return false;
  };

  // Function to normalize and autocorrect website URLs (same as extension)
  const normalizeWebsiteUrl = (input: string) => {
    if (!input || typeof input !== 'string') return '';
    
    let normalized = input.trim().toLowerCase();
    
    // Remove protocol if present
    normalized = normalized.replace(/^https?:\/\//, '');
    normalized = normalized.replace(/^www\./, '');
    
    // Remove trailing slash
    normalized = normalized.replace(/\/$/, '');
    
    // Remove path and query parameters (keep only domain)
    const domainMatch = normalized.match(/^([^\/\?#]+)/);
    if (domainMatch) {
      normalized = domainMatch[1];
    }
    
    // Common autocorrect mappings
    const autocorrectMap: { [key: string]: string } = {
      'fb.com': 'facebook.com',
      'fb': 'facebook.com',
      'facebook': 'facebook.com',
      'ig.com': 'instagram.com',
      'ig': 'instagram.com',
      'instagram': 'instagram.com',
      'tw': 'twitter.com',
      'twitter': 'twitter.com',
      'x.com': 'twitter.com',
      'yt': 'youtube.com',
      'youtube': 'youtube.com',
      'reddit': 'reddit.com',
      'rd': 'reddit.com',
      'tiktok': 'tiktok.com',
      'tt': 'tiktok.com',
      'snapchat': 'snapchat.com',
      'sc': 'snapchat.com',
      'discord': 'discord.com',
      'dc': 'discord.com',
      'netflix': 'netflix.com',
      'nf': 'netflix.com',
      'amazon': 'amazon.com',
      'amz': 'amazon.com',
      'ebay': 'ebay.com',
      'pinterest': 'pinterest.com',
      'pin': 'pinterest.com',
      'linkedin': 'linkedin.com',
      'li': 'linkedin.com',
      'github': 'github.com',
      'gh': 'github.com',
      'stackoverflow': 'stackoverflow.com',
      'so': 'stackoverflow.com',
      'wikipedia': 'wikipedia.org',
      'wiki': 'wikipedia.org',
      'google': 'google.com',
      'bing': 'bing.com',
      'yahoo': 'yahoo.com'
    };
    
    // Apply autocorrect if exact match
    if (autocorrectMap[normalized]) {
      return autocorrectMap[normalized];
    }
    
    // Validate that it looks like a website domain
    if (!isValidWebsiteDomain(normalized)) {
      return '';
    }
    
    return normalized;
  };

  // Function to generate suggestions based on input and history
  const generateSuggestions = (input: string) => {
    if (!input.trim()) return [];
    
    const inputLower = input.toLowerCase().trim();
    const allSuggestions: string[] = [];
    
    // Common website suggestions (same as extension)
    const commonSites = [
      'facebook.com', 'instagram.com', 'twitter.com', 'youtube.com', 'reddit.com',
      'tiktok.com', 'snapchat.com', 'discord.com', 'netflix.com', 'amazon.com',
      'ebay.com', 'pinterest.com', 'linkedin.com', 'github.com', 'stackoverflow.com',
      'wikipedia.org', 'google.com', 'bing.com', 'yahoo.com', 'twitch.tv',
      'spotify.com', 'soundcloud.com', 'vimeo.com', 'dailymotion.com', '9gag.com',
      'imgur.com', 'flickr.com', 'deviantart.com', 'behance.net', 'dribbble.com'
    ];
    
    // Previously blocked sites (from history)
    const previousSites = blockedSites;
    
    // Add common sites that match input
    commonSites.forEach(site => {
      if (site.includes(inputLower) || inputLower.includes(site.split('.')[0])) {
        allSuggestions.push(site);
      }
    });
    
    // Add previous sites that match input
    previousSites.forEach(site => {
      if (site.includes(inputLower) || inputLower.includes(site.split('.')[0])) {
        allSuggestions.push(site);
      }
    });
    
    // Remove duplicates and limit to 8 suggestions
    return [...new Set(allSuggestions)].slice(0, 8);
  };

  // Function to handle input changes and show suggestions
  const handleSiteInputChange = (value: string) => {
    setNewSiteInput(value);
    
    // Real-time validation
    if (!value.trim()) {
      setSiteInputError('');
      setSiteInputValid(false);
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    // Check if site is already blocked
    const normalized = normalizeWebsiteUrl(value);
    if (normalized && blockedSites.includes(normalized)) {
      setSiteInputError('This site is already blocked');
      setSiteInputValid(false);
    } else if (!normalized || !isValidWebsiteDomain(value)) {
      setSiteInputError('Please enter a valid website (e.g., youtube.com, facebook, reddit)');
      setSiteInputValid(false);
    } else {
      setSiteInputError('');
      setSiteInputValid(true);
    }
    
    // Show suggestions
    if (value.trim()) {
      const newSuggestions = generateSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Function to select a suggestion
  const selectSuggestion = (suggestion: string) => {
    setNewSiteInput(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
  };


  // Auto-sync function
  const autoSyncWithExtension = async () => {
    try {
      console.log('Auto-syncing with extension...');
      
      const response = await new Promise<{ blockedSites: string[], blockingEnabled: boolean }>((resolve, reject) => {
        const messageId = Date.now() + Math.random();
        
        const listener = (event: MessageEvent) => {
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
          payload: { action: 'getBlockedSites' }
        }, '*');
        
        setTimeout(() => {
          window.removeEventListener('message', listener);
          reject(new Error('Extension communication timeout'));
        }, 5000);
      });
      
      if (response && 'blockedSites' in response && response.blockedSites) {
        setBlockedSites(response.blockedSites);
        setIsBlockingEnabled(response.blockingEnabled || false);
        console.log('Auto-sync successful:', response);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('Auto-sync failed (extension may not be available):', errorMessage);
    }
  };

  // Set up periodic auto-sync every 2 minutes
  useEffect(() => {
    const interval = setInterval(autoSyncWithExtension, 2 * 60 * 1000); // 2 minutes
    
    return () => clearInterval(interval);
  }, []);

  // Listen for responses from the extension and storage change notifications
  useEffect(() => {
    const handleExtensionMessage = (event: MessageEvent) => {
      if (event.data.type === 'FOCUS_EXTENSION_RESPONSE') {
        console.log('🎯 Extension response received:', event.data);
      }
      
      if (event.data.type === 'EXTENSION_STORAGE_CHANGED') {
        console.log('🔄 Extension storage changed notification received:', event.data);
        
        const { currentState, changes } = event.data.data;
        
        // Auto-sync the web app with the extension's current state
        if (currentState) {
          console.log('🔄 Auto-syncing web app with extension state:', currentState);
          
          // Update blocked sites if they changed
          if (changes.blockedSites) {
            const newBlockedSites = currentState.blockedSites || [];
            console.log('🔄 Updating blocked sites from extension:', {
              old: blockedSites,
              new: newBlockedSites
            });
            
            setBlockedSites(newBlockedSites);
            localStorage.setItem('blockedSites', JSON.stringify(newBlockedSites));
            
            console.log('✅ Extension data synced automatically');
          }
          
          // Update blocking state if it changed
          if (changes.blockingEnabled !== undefined) {
            const newBlockingState = currentState.blockingEnabled;
            console.log('🔄 Updating blocking state from extension:', {
              old: isBlockingEnabled,
              new: newBlockingState
            });
            
            setIsBlockingEnabled(newBlockingState);
            localStorage.setItem('isBlockingEnabled', JSON.stringify(newBlockingState));
            
            console.log('✅ Extension data synced automatically');
          }
        }
      }
    };

    window.addEventListener('message', handleExtensionMessage);
    
    return () => {
      window.removeEventListener('message', handleExtensionMessage);
    };
  }, [blockedSites, isBlockingEnabled]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-profile-dropdown]')) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  // Apply search and filters
  useEffect(() => {
    // Validate and sanitize sessions data
    const validSessions = sessions.filter(session => {
      // Basic validation
      if (!session._id || !session.title || typeof session.goal !== 'number') {
        console.warn('Invalid session data:', session);
        return false;
      }
      
      // Sanitize session data
      session.title = session.title.trim();
      if (session.description) {
        session.description = session.description.trim();
      }
      
      return true;
    });
    
    let filtered = validSessions.filter(s => s.status !== 'active');
    
    // Apply search query
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(session => 
        session.title.toLowerCase().includes(searchTerm) ||
        session.description?.toLowerCase().includes(searchTerm) ||
        session.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(session => session.status === statusFilter);
    }
    
    // Apply time filter
    if (timeFilter) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      filtered = filtered.filter(session => {
        try {
          const sessionDate = new Date(session.startTime);
          if (isNaN(sessionDate.getTime())) {
            console.warn('Invalid session date:', session.startTime);
            return false;
          }
          
          switch (timeFilter) {
            case 'today':
              return sessionDate >= today;
            case 'week':
              return sessionDate >= weekStart;
            case 'month':
              return sessionDate >= monthStart;
            default:
              return true;
          }
        } catch (error) {
          console.warn('Error processing session date:', error);
          return false;
        }
      });
    }
    
    // Sort by most recent first
    filtered.sort((a, b) => {
      try {
        const dateA = new Date(a.startTime);
        const dateB = new Date(b.startTime);
        return dateB.getTime() - dateA.getTime();
      } catch (error) {
        console.warn('Error sorting sessions:', error);
        return 0;
      }
    });
    
    setFilteredSessions(filtered);
  }, [sessions, searchQuery, statusFilter, timeFilter]);



  const fetchSessions = async (showLoading = false) => {
    console.log('fetchSessions called with token:', token ? 'Present' : 'Missing');
    
    if (showLoading) {
      setIsRefreshing(true);
    }
    
    try {
      console.log('Making API request to fetch sessions...');
      const response = await fetch(`${API_BASE_URL}/focus/sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('API response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to fetch sessions (${response.status})`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Sessions data received:', data);
      
      if (data.sessions && Array.isArray(data.sessions)) {
        setSessions(data.sessions);
        setError(null); // Clear any previous errors
      } else {
        console.warn('Invalid sessions data format:', data);
        setSessions([]);
        setError('Invalid data format received from server');
      }
          } catch (err) {
        console.error('Error fetching sessions:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sessions';
        handleError(errorMessage, 'fetchSessions');
        showToast(errorMessage, 'error');
      } finally {
      console.log('Setting loading to false');
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };


  const createSession = async (sessionData: any) => {
    try {
      console.log('Creating session with data:', sessionData);
      
      // Enhanced validation
      if (!sessionData.title || sessionData.title.trim().length === 0) {
        throw new Error('Session title is required');
      }
      
      if (!sessionData.goal || sessionData.goal < 1 || sessionData.goal > 480) {
        throw new Error('Goal time must be between 1 and 480 minutes');
      }
      
      if (sessionData.title.length > 100) {
        throw new Error('Session title must be less than 100 characters');
      }

      // Check if there's already an active session
      const activeSession = sessions.find(s => s.status === 'active');
      if (activeSession) {
        throw new Error('You already have an active session. Please complete or pause it first.');
      }

      const sessionPayload = {
        ...sessionData,
        title: sessionData.title.trim(),
        startTime: new Date().toISOString(),
        status: 'active',
        actualTime: 0,
        productivity: 0,
        tags: Array.isArray(sessionData.tags) ? sessionData.tags : []
      };

      console.log('Sending session payload:', sessionPayload);

      const response = await fetch(`${API_BASE_URL}/focus/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(sessionPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to create session (${response.status})`;
        throw new Error(errorMessage);
      }

      const newSession = await response.json();
      console.log('Session created successfully:', newSession);
      
      showToast(`"${sessionData.title}" session started!`, 'success');
      await fetchSessions(); // Refresh sessions
      
      return newSession;
    } catch (err) {
      console.error('Error creating session:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw err;
    }
  };

  const pauseSession = async (sessionId: string, duration: number) => {
    try {
      console.log('Attempting to pause session:', sessionId, 'with duration:', duration);
      
      // Validate inputs
      if (!sessionId) {
        throw new Error('Session ID is required');
      }
      
      if (duration < 0) {
        throw new Error('Duration cannot be negative');
      }

      const response = await fetch(`${API_BASE_URL}/focus/session/${sessionId}/pause`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Pause response not ok:', response.status, errorData);
        const errorMessage = errorData.message || `Failed to pause session (${response.status})`;
        throw new Error(errorMessage);
      }

      const sessionTitle = sessions.find(s => s._id === sessionId)?.title || 'Session';
      showTimerNotification(sessionTitle, duration, 'paused');
      showToast(`"${sessionTitle}" paused successfully`, 'success');

      console.log('Session paused successfully');
      await fetchSessions(); // Refresh sessions
    } catch (err) {
      console.error('Pause session error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to pause session';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw err;
    }
  };

  const resumeSession = async (sessionId: string) => {
    try {
      console.log('Attempting to resume session:', sessionId);
      
      // Validate inputs
      if (!sessionId) {
        throw new Error('Session ID is required');
      }

      // Check if there's already an active session
      const activeSession = sessions.find(s => s.status === 'active');
      if (activeSession && activeSession._id !== sessionId) {
        throw new Error('You already have an active session. Please pause or complete it first.');
      }

      const response = await fetch(`${API_BASE_URL}/focus/session/${sessionId}/resume`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Resume response not ok:', response.status, errorData);
        const errorMessage = errorData.message || `Failed to resume session (${response.status})`;
        throw new Error(errorMessage);
      }

      const sessionTitle = sessions.find(s => s._id === sessionId)?.title || 'Session';
      showToast(`"${sessionTitle}" resumed successfully`, 'success');

      console.log('Session resumed successfully');
      await fetchSessions(); // Refresh sessions
    } catch (err) {
      console.error('Resume session error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to resume session';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw err;
    }
  };

  const completeSession = async (sessionId: string, actualTime: number) => {
    try {
      console.log('Completing session:', sessionId, 'with actual time:', actualTime);
      
      // Validate inputs
      if (!sessionId) {
        throw new Error('Session ID is required');
      }
      
      if (actualTime < 0) {
        throw new Error('Actual time cannot be negative');
      }

      const response = await fetch(`${API_BASE_URL}/focus/session/${sessionId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ actualTime }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to complete session (${response.status})`;
        throw new Error(errorMessage);
      }

      const sessionTitle = sessions.find(s => s._id === sessionId)?.title || 'Session';
      showTimerNotification(sessionTitle, actualTime, 'completed');
      showToast(`"${sessionTitle}" completed successfully!`, 'success');

      console.log('Session completed successfully');
      await fetchSessions(); // Refresh sessions
    } catch (err) {
      console.error('Complete session error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete session';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw err;
    }
  };

  const abandonSession = async (sessionId: string, duration: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/focus/session/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to abandon session');
      }

      // Use the actual duration from the timer, not from the session
      showTimerNotification(sessions.find(s => s._id === sessionId)?.title || 'Session', duration, 'interrupted');

      await fetchSessions(); // Refresh sessions
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to abandon session');
      throw err;
    }
  };

  const handleEditSession = async (sessionId: string, updatedData: any) => {
    try {
      console.log('Updating session:', sessionId, 'with data:', updatedData);
      
      // Validate update data
      if (!updatedData.title || !updatedData.goal) {
        throw new Error('Title and goal are required');
      }

      const response = await fetch(`${API_BASE_URL}/focus/session/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update session');
      }

      const updatedSession = await response.json();
      console.log('Session updated successfully:', updatedSession);
      
      setSessions(prev => prev.map(s => s._id === sessionId ? updatedSession : s));
      setEditingSession(null);
      showToast('Session updated successfully!', 'success');
    } catch (err) {
      console.error('Error updating session:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update session';
      showToast(errorMessage, 'error');
      throw err;
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      console.log('Deleting session:', sessionId);
      
      const response = await fetch(`${API_BASE_URL}/focus/session/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete session');
      }

      console.log('Session deleted successfully');
      
      setSessions(prev => prev.filter(s => s._id !== sessionId));
      setDeletingSession(null);
      showToast('Session deleted successfully!', 'success');
    } catch (err) {
      console.error('Error deleting session:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete session';
      showToast(errorMessage, 'error');
      throw err;
    }
  };

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(null);
  };

  const showTimerNotification = (sessionTitle: string, duration: number, type: 'completed' | 'paused' | 'interrupted') => {
    // Hide any existing notification before showing a new one
    hideTimerNotification();
    
    setTimerNotification({
      isVisible: true,
      sessionTitle,
      duration,
      type,
    });
  };

  const exportSessions = () => {
    try {
      const exportData = sessions.map(session => ({
        title: session.title,
        description: session.description,
        goal: session.goal,
        status: session.status,
        startTime: new Date(session.startTime).toLocaleString(),
        endTime: session.endTime ? new Date(session.endTime).toLocaleString() : 'N/A',
        actualTime: Math.floor(getActualElapsedTime(session) / 60),
        tags: session.tags?.join(', ') || 'N/A',
        productivity: session.productivity || 'N/A'
      }));

      const csvContent = [
        Object.keys(exportData[0]).join(','),
        ...exportData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `focus-sessions-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast('Sessions exported successfully!', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showToast('Failed to export sessions', 'error');
    }
  };

  const hideTimerNotification = () => {
    setTimerNotification(null);
  };

  const handleEditSessionClick = (session: FocusSession) => {
    setEditingSession(session);
    setIsSessionsHistoryOpen(false);
  };

  const handleViewSessionClick = (session: FocusSession) => {
    setViewingSession(session);
    setIsSessionsHistoryOpen(false);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getActualElapsedTime = (session: FocusSession) => {
    // For completed sessions, use the database value
    if (session.status === 'completed') {
      return session.actualTime || 0;
    }
    
    // For active/paused sessions, try to get the time from localStorage
    try {
      const savedState = localStorage.getItem(`timer_${session._id}`);
      if (savedState) {
        const state = JSON.parse(savedState);
        return state.totalElapsed || 0;
      }
    } catch (error) {
      console.error('Error reading timer state:', error);
    }
    
    // Fallback to database value
    return session.actualTime || 0;
  };

  // Calculate real-time statistics from sessions data
  const calculateTotalFocusTime = () => {
    return sessions.reduce((total, session) => {
      if (session.status === 'completed') {
        return total + (session.actualTime || 0);
      }
      // For active/paused sessions, include current timer state
      return total + getActualElapsedTime(session);
    }, 0);
  };

  const canStartNewSession = () => {
    return !sessions.some(s => s.status === 'active') && !isSessionProcessing;
  };

  const handleError = (errorMessage: string, context?: string) => {
    const now = Date.now();
    const timeSinceLastError = lastErrorTime ? now - lastErrorTime : Infinity;
    
    // Rate limit error messages
    if (timeSinceLastError < 5000) { // 5 seconds
      setErrorCount(prev => prev + 1);
    } else {
      setErrorCount(1);
    }
    
    setLastErrorTime(now);
    setError(errorMessage);
    
    console.error(`Error in ${context || 'unknown context'}:`, errorMessage);
    
    // Auto-recover from certain errors
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      setTimeout(() => {
        console.log('Attempting to recover from network error...');
        fetchSessions(true);
      }, 3000);
    }
  };

  // Website blocker functions
  const addBlockedSite = async (site: string) => {
    if (!site.trim() || isSiteOperationLoading) {
      return;
    }
    
    setIsSiteOperationLoading(true);
    
    try {
      // Apply normalization (remove protocols, www, paths, etc.)
      const normalizedSite = normalizeWebsiteUrl(site);
      
      if (!normalizedSite) {
        showToast('Invalid website URL', 'error');
        return;
      }
      
      if (!blockedSites.includes(normalizedSite)) {
        // Check site limit (5 for free users, unlimited for upgraded users)
        if (!isUpgraded && blockedSites.length >= 5) {
          showToast('Free users can only block 5 websites. Upgrade for unlimited blocking!', 'error');
          return;
        }
        
        const newBlockedSites = [...blockedSites, normalizedSite];
        
        // Update UI immediately for instant feedback
        setBlockedSites(newBlockedSites);
        localStorage.setItem('blockedSites', JSON.stringify(newBlockedSites));
        
        // Save to backend if logged in
        if (token) {
          try {
            const response = await fetch(`${API_BASE_URL}/blocked-sites`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ domain: normalizedSite })
            });
            
            if (!response.ok) {
              console.warn('Failed to save blocked site to backend, but continuing with local storage');
            }
          } catch (error) {
            console.warn('Error saving blocked site to backend:', error);
            // Continue anyway - localStorage is already updated
          }
        }
        
        // Auto-enable blocking when adding a site
        if (!isBlockingEnabled) {
          setIsBlockingEnabled(true);
          localStorage.setItem('isBlockingEnabled', 'true');
          showToast('Blocking automatically enabled', 'success');
          
          // Sync blocking state to extension
          syncBlockingStateToExtension(true);
        }
        
        // Add to blocked history
        addToBlockedHistory(normalizedSite);
        
        // Show success feedback
        showToast(`"${normalizedSite}" added to blocked sites`, 'success');
        
        // Clear input and validation
        setNewSiteInput('');
        setSiteInputError('');
        setSiteInputValid(false);
        setShowSuggestions(false);
        
        // Sync with Chrome extension immediately (non-blocking)
        syncBlockedSitesToExtension(newBlockedSites);
      } else {
        showToast(`"${normalizedSite}" is already blocked`, 'info');
        setSiteInputError('This site is already blocked');
        setSiteInputValid(false);
      }
    } finally {
      setIsSiteOperationLoading(false);
    }
  };

  const removeBlockedSite = async (site: string) => {
    console.log('🗑️ removeBlockedSite called with:', site);
    
    // Check if password protection is enabled
    const passwordEnabled = localStorage.getItem('passwordEnabled') === 'true';
    if (passwordEnabled) {
      // Password protection is enabled, show password modal
      setPendingSiteToRemove(site);
      setPasswordInput(''); // Clear password input
      setPasswordError(''); // Clear any previous errors
      setIsPasswordModalOpen(true);
      return;
    }
    
    // Proceed with normal removal
    performSiteRemoval(site);
  };

  const performSiteRemoval = async (site: string) => {
    const newBlockedSites = blockedSites.filter(s => s !== site);
    
    console.log('🔄 Removing blocked site:', {
      removedSite: site,
      currentBlockedSites: blockedSites,
      newBlockedSites: newBlockedSites
    });
    
    // Update UI immediately for instant feedback
    setBlockedSites(newBlockedSites);
    localStorage.setItem('blockedSites', JSON.stringify(newBlockedSites));
    
    // Remove from backend if logged in
    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}/blocked-sites/domain/${encodeURIComponent(site)}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          console.warn('Failed to remove blocked site from backend, but continuing with local storage');
        }
      } catch (error) {
        console.warn('Error removing blocked site from backend:', error);
        // Continue anyway - localStorage is already updated
      }
    }
    
    // Auto-disable blocking when removing the last site
    if (newBlockedSites.length === 0 && isBlockingEnabled) {
      setIsBlockingEnabled(false);
      localStorage.setItem('isBlockingEnabled', 'false');
      showToast('Blocking automatically disabled - no sites to block', 'info');
      
      // Sync blocking state to extension
      syncBlockingStateToExtension(false);
    }
    
    // Show immediate success feedback
    showToast(`"${site}" removed from blocked sites`, 'success');
    
    console.log('🔄 Calling syncBlockedSitesToExtension with:', newBlockedSites);
    
    // Sync with Chrome extension immediately (non-blocking)
    syncBlockedSitesToExtension(newBlockedSites);
    
    console.log('✅ removeBlockedSite completed successfully');
  };

  const toggleBlocking = async () => {
    const newState = !isBlockingEnabled;
    
    // Check if password protection is enabled and we're trying to disable blocking
    const passwordEnabled = localStorage.getItem('passwordEnabled') === 'true';
    if (passwordEnabled && !newState) {
      // Password protection is enabled and we're trying to disable blocking
      setPendingBlockingState(newState);
      setPasswordInput(''); // Clear password input
      setPasswordError(''); // Clear any previous errors
      setIsPasswordModalOpen(true);
      return;
    }
    
    // Proceed with normal toggle
    performBlockingToggle(newState);
  };

  const performBlockingToggle = async (newState: boolean) => {
    // Update UI immediately for instant feedback
    setIsBlockingEnabled(newState);
    localStorage.setItem('isBlockingEnabled', JSON.stringify(newState));
    
    // Show immediate success feedback
    showToast(
      newState ? 'Website blocking enabled' : 'Website blocking disabled',
      newState ? 'success' : 'info'
    );
    
    // Sync with Chrome extension immediately (non-blocking)
    syncBlockingStateToExtension(newState);
  };

  const handlePasswordSubmit = () => {
    const savedPassword = localStorage.getItem('blockingPassword');
    if (passwordInput === savedPassword) {
      // Password is correct, proceed with the pending action
      if (pendingBlockingState !== null) {
        performBlockingToggle(pendingBlockingState);
      } else if (pendingSiteToRemove !== null) {
        performSiteRemoval(pendingSiteToRemove);
      }
      setIsPasswordModalOpen(false);
      setPasswordInput('');
      setPendingBlockingState(null);
      setPendingSiteToRemove(null);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
      setPasswordInput('');
    }
  };

  const handlePasswordCancel = () => {
    setIsPasswordModalOpen(false);
    setPasswordInput('');
    setPendingBlockingState(null);
    setPendingSiteToRemove(null);
    setPasswordError('');
  };

  // Helper function to sync password settings to extension (non-blocking)
  const syncPasswordSettingsToExtension = (passwordEnabled: boolean, password: string) => {
    try {
      const messageId = Date.now() + Math.random();
      
      console.log('📤 About to sync password settings to extension:', passwordEnabled ? 'Enabled' : 'Disabled');
      console.log('📤 Message ID:', messageId);
      
      window.postMessage({
        type: 'FOCUS_EXTENSION_MESSAGE',
        id: messageId,
        payload: { 
          action: 'setPasswordSettings', 
          passwordEnabled: passwordEnabled,
          blockingPassword: password
        }
      }, '*');
      
      console.log('📤 Synced password settings to extension:', passwordEnabled ? 'Enabled' : 'Disabled');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to sync password settings to extension:', errorMessage);
    }
  };

  const updateSmartRedirectUrl = (url: string) => {
    console.log('🔧 updateSmartRedirectUrl called with:', url);
    
    // Allow empty string to clear smart redirect
    if (!url.trim()) {
      console.log('🧹 Clearing smart redirect URL');
      setSmartRedirectUrl('');
      localStorage.setItem('smartRedirectUrl', '');
      syncSmartRedirectUrlToExtension('');
      showToast('Smart redirect cleared', 'info');
      return;
    }
    
    // Basic URL validation
    try {
      // Add protocol if missing
      let normalizedUrl = url.trim();
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }
      
      new URL(normalizedUrl);
      console.log('✅ Valid URL, setting smart redirect to:', normalizedUrl);
      setSmartRedirectUrl(normalizedUrl);
      localStorage.setItem('smartRedirectUrl', normalizedUrl);
      syncSmartRedirectUrlToExtension(normalizedUrl);
      showToast('Smart redirect URL updated', 'success');
    } catch (error) {
      console.log('❌ Invalid URL format:', error);
      showToast('Invalid URL format', 'error');
    }
  };

  // Handle subscription checkout
  const handleCheckout = async (planType: 'monthly' | 'annual' | 'lifetime') => {
    console.log('handleCheckout called with planType:', planType);
    
    if (!token) {
      showToast('Please log in to continue', 'error');
      return;
    }

    try {
      setIsCreatingCheckout(true);
      
      // Map plan types to price IDs (these should be set in environment variables)
      // Note: Vite uses import.meta.env instead of process.env
      const priceIdMap: Record<string, string> = {
        monthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || 'price_monthly',
        annual: import.meta.env.VITE_STRIPE_PRICE_ANNUAL || 'price_annual',
        lifetime: import.meta.env.VITE_STRIPE_PRICE_LIFETIME || 'price_lifetime'
      };

      console.log('Price IDs:', priceIdMap);
      const priceId = priceIdMap[planType];
      console.log('Selected price ID:', priceId);
      
      if (!priceId || priceId.startsWith('price_') === false) {
        console.error('Invalid price ID:', priceId);
        showToast('Invalid plan selected. Please check configuration.', 'error');
        return;
      }

      console.log('Calling checkout API:', `${API_BASE_URL}/subscription/create-checkout-session`);
      
      const response = await fetch(`${API_BASE_URL}/subscription/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          priceId,
          planType, // Pass plan type to backend to determine payment mode
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Checkout error:', errorData);
        if (response.status === 409 && errorData.code === 'ALREADY_SUBSCRIBED' && errorData.portalUrl) {
          showToast(errorData.message || 'You already have an active plan.', 'info');
          window.location.href = errorData.portalUrl;
          return;
        }
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const data = await response.json();
      console.log('Checkout response:', data);
      
      if (data.success && data.url) {
        // Redirect to Stripe checkout
        console.log('Redirecting to Stripe checkout:', data.url);
        window.location.href = data.url;
      } else {
        console.error('Invalid checkout response:', data);
        showToast('Failed to create checkout session', 'error');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
      showToast(errorMessage, 'error');
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  // State to force re-renders for real-time updates
  const [statsUpdateTrigger, setStatsUpdateTrigger] = useState(0);

  // Update statistics in real-time for active sessions
  useEffect(() => {
    const interval = setInterval(() => {
      // Only update if there are active sessions
      if (sessions.some(s => s.status === 'active')) {
        setStatsUpdateTrigger(prev => prev + 1);
      }
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [sessions]);

  const calculateCompletedSessions = () => {
    return sessions.filter(session => session.status === 'completed').length;
  };

  const calculateLongestSession = () => {
    const completedSessions = sessions.filter(session => session.status === 'completed');
    if (completedSessions.length === 0) return 0;
    
    return Math.max(...completedSessions.map(session => session.actualTime || 0));
  };



  const handleTabChange = (tab: 'overview' | 'sessions' | 'analytics' | 'settings') => {
    setActiveTab(tab);
  };

  const handleAnalyticsClick = () => {
    setActiveTab('analytics');
  };

  const handleSettingsClick = () => {
    setActiveTab('settings');
  };

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const calculateCurrentStreak = () => {
    // Get all completed sessions
    const completedSessions = sessions.filter(session => 
      session.status === 'completed'
    );
    
    if (completedSessions.length === 0) return 0;
    
    // Helper function to get date string in local timezone
    const getDateString = (date: Date) => {
      return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    };
    
    // Get today's date in local timezone
    const today = new Date();
    const todayStr = getDateString(today);
    
    // Create a map of dates that have sessions
    const sessionDates = new Set<string>();
    completedSessions.forEach(session => {
      const sessionDate = new Date(session.startTime);
      const dateStr = getDateString(sessionDate);
      sessionDates.add(dateStr);
    });
    
    // Check if today has sessions
    if (!sessionDates.has(todayStr)) {
      // If no sessions today, start from yesterday
      today.setDate(today.getDate() - 1);
    }
    
    let streak = 0;
    let currentDate = new Date(today);
    
    // Count consecutive days backwards
    for (let i = 0; i < 30; i++) {
      const dateStr = getDateString(currentDate);
      
      if (sessionDates.has(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    // Debug logging
    console.log('Streak calculation:', {
      totalSessions: completedSessions.length,
      todayStr,
      sessionDates: Array.from(sessionDates).slice(0, 5), // Show first 5 dates
      calculatedStreak: streak
    });
    
    return streak;
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a]">
        <div className="flex h-screen">
          {/* Sidebar Skeleton */}
          <div className="w-64 bg-gray-900 border-r border-gray-800 p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-700 rounded w-3/4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Main Content Skeleton */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
              {/* Header Skeleton */}
              <div className="h-12 bg-gray-800 rounded-xl w-1/3"></div>
              
              {/* Quick Actions Skeleton */}
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-gray-700 rounded-lg"></div>
                  ))}
                </div>
              </div>
              
              {/* Content Cards Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-700 rounded w-4/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user data is available
  if (!user) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Authentication Required</h3>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Please log in to access your dashboard and start tracking your focus sessions.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
            >
              Go to Login
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-all duration-200"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0f0f0f] overflow-x-hidden">
      <SEO
        title="Dashboard | Centra"
        description="Manage your focus sessions, blocked websites, and productivity analytics. Track your progress and stay focused with Centra."
        noindex={true}
      />


      <div className="flex h-screen bg-[#1a1a1a] min-w-0 overflow-x-hidden">
        
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}
        
        {/* Left Sidebar Navigation */}
        <div className={`fixed lg:static inset-y-0 left-0 w-72 bg-gray-900 border-r border-gray-800 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          {/* Logo Section */}
          <div className="p-8 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden p-2.5 hover:bg-gray-800 rounded-xl transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Navigation Menu - spread to fill space */}
          <nav className="flex-1 flex flex-col justify-center py-8 px-5 gap-4">
            <button
              onClick={() => {
                handleTabChange('overview');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-200 text-left ${
                activeTab === 'overview' 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                activeTab === 'overview' ? 'bg-white/20' : 'bg-gray-800'
              }`}>
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className="text-base font-semibold">Overview</span>
            </button>
            
            <button
              onClick={() => {
                handleTabChange('sessions');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-200 text-left ${
                activeTab === 'sessions' 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                activeTab === 'sessions' ? 'bg-white/20' : 'bg-gray-800'
              }`}>
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-base font-semibold">Focus Sessions</span>
            </button>
            
            <button
              onClick={() => {
                handleAnalyticsClick();
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-200 text-left relative overflow-hidden ${
                activeTab === 'analytics' 
                  ? isUpgraded 
                    ? 'bg-purple-800 text-white shadow-lg shadow-purple-900/30' 
                    : 'bg-purple-600 text-white shadow-lg shadow-purple-900/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800 hover:shadow-lg'
              }`}
            >
              {activeTab !== 'analytics' && !isUpgraded && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 opacity-80"></div>
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10 ${
                activeTab === 'analytics' ? 'bg-white/20' : 'bg-gray-800'
              }`}>
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-base font-semibold relative z-10">Analytics</span>
              {!isUpgraded && (
                <div className="absolute top-2 right-3 animate-pulse relative z-10">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                    PRO
                  </span>
                </div>
              )}
            </button>
            
            <button
              onClick={() => {
                handleSettingsClick();
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-200 text-left ${
                activeTab === 'settings' 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                activeTab === 'settings' ? 'bg-white/20' : 'bg-gray-800'
              }`}>
                <Settings className="w-5 h-5" />
              </div>
              <span className="text-base font-semibold">Settings and More</span>
            </button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          
          {/* Profile Section */}
          <div className="bg-gray-900 border-b border-gray-800 overflow-x-hidden">
            <div className="flex flex-wrap justify-between items-center p-4 gap-3 min-w-0">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-200 border border-gray-700/50"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              {/* Dev code input - leftmost (visible on all screens) */}
              <form onSubmit={handleDevCodeSubmit} className="flex items-center flex-1 min-w-0 max-w-[9rem] sm:max-w-36">
                <input
                  type="password"
                  value={devCode}
                  onChange={(e) => setDevCode(e.target.value)}
                  placeholder="Password..."
                  className="w-full min-w-0 px-2 sm:px-3 py-2 text-sm bg-gray-800 border-2 border-gray-500 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
                  aria-label="Developer unlock code"
                />
                <button
                  type="submit"
                  className="ml-2 p-2 rounded-lg bg-gray-700 border-2 border-gray-500 text-gray-300 hover:text-white hover:border-gray-400 transition-colors"
                  title="Submit dev code"
                  aria-label="Submit dev code"
                >
                  {devUnlocked ? <Check className="w-4 h-4 text-green-400" /> : <KeyRound className="w-4 h-4" />}
                </button>
              </form>
              {/* Quick Actions - next to profile */}
              <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg transition-all duration-200 text-sm font-medium text-white shrink-0"
                  title="Start Session"
                >
                  <Plus className="w-4 h-4 text-red-400" />
                  <span className="hidden sm:inline">Start</span>
                </button>
                <button
                  onClick={() => setIsSessionsHistoryOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-all duration-200 text-sm font-medium text-white shrink-0"
                  title="View Progress"
                >
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="hidden sm:inline">Progress</span>
                </button>
                <button
                  onClick={handleAnalyticsClick}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium text-white shrink-0 ${
                    isUpgraded
                      ? 'bg-purple-700/40 hover:bg-purple-700/50 border border-purple-600/50'
                      : 'bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30'
                  }`}
                  title="Analytics"
                >
                  <TrendingUp className={`w-4 h-4 ${isUpgraded ? 'text-purple-300' : 'text-purple-400'}`} />
                  <span className="hidden sm:inline">Analytics</span>
                </button>
              </div>
              <div className="relative shrink-0" data-profile-dropdown>
                <button
                  onClick={handleProfileClick}
                  className="flex items-center space-x-3 p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-200 border border-gray-700/50 hover:border-gray-600/50"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50">
                    <div className="p-4 border-b border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
                          <p className="text-xs text-gray-400">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <button
                        onClick={() => {
                          handleTabChange('settings');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto overflow-x-hidden min-w-0">
            
            {/* Conditional Tab Content */}
                        {activeTab === 'overview' && (
              <div className="space-y-6 min-w-0">

                {/* Enhanced Blocked Websites Section */}
                <div className="w-full min-w-0">
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                          <Target className="w-6 h-6 text-red-400" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xl font-bold text-white truncate">Website Blocker: {blockedSites.length}/5</h3>
                          <p className="text-gray-400 text-sm sm:text-base break-words">Block distracting websites and maintain focus during work sessions</p>
                        </div>
                      </div>
                      
                      {/* Smart Redirect Icon - Pro Feature */}
                      <div className="text-center">
                        <button 
                          onClick={() => setIsRedirectModalOpen(true)}
                          className="group relative p-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 hover:border-purple-500/50 rounded-xl transition-all duration-200 mb-2"
                          title="Smart Redirect - Configure where blocked pages redirect to productive alternatives"
                        >
                          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <Target className="w-4 h-4 text-white" />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        </button>
                        <p className="text-xs text-purple-300 font-medium">Smart Redirect</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                            <span className="text-white font-medium">Sites Currently Blocked</span>
                          </div>
                          <span className="text-2xl font-bold text-red-400">{blockedSites.length}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                            <span className="text-white font-medium">Focus Time Protected</span>
                          </div>
                          <span className="text-2xl font-bold text-green-400">0h</span>
                        </div>
                        
                        <div 
                          className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-600/50 transition-colors"
                          onClick={() => setIsBlockedHistoryOpen(true)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                            <span className="text-white font-medium">Blocked History</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-blue-400">{totalBlockedSites}</span>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-red-300 font-semibold">Website Blocker</h4>
                            <div className="flex items-center space-x-3">
                              <span className={`text-sm font-medium ${isBlockingEnabled ? 'text-green-400' : 'text-gray-400'}`}>
                                {isBlockingEnabled ? 'Blocking ON' : 'Blocking OFF'}
                              </span>
                              <button
                                onClick={toggleBlocking}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                                  isBlockingEnabled ? 'bg-red-600' : 'bg-gray-600'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    isBlockingEnabled ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                              <div className="relative">
                              <div className="flex space-x-2">
                                <div className="flex-1">
                                  <input 
                                    type="text" 
                                    placeholder={!isUpgraded && blockedSites.length >= 5 ? "Pro feature - Upgrade to add more sites" : "Enter website URL (e.g., facebook, youtube, reddit)"}
                                    value={newSiteInput}
                                    onChange={(e) => handleSiteInputChange(e.target.value)}
                                    onFocus={() => {
                                      if (newSiteInput.trim()) {
                                        const newSuggestions = generateSuggestions(newSiteInput);
                                        setSuggestions(newSuggestions);
                                        setShowSuggestions(newSuggestions.length > 0);
                                      }
                                    }}
                                    onBlur={() => {
                                      // Delay hiding suggestions to allow clicking on them
                                      setTimeout(() => setShowSuggestions(false), 200);
                                    }}
                                    disabled={!isUpgraded && blockedSites.length >= 5}
                                    readOnly={!isUpgraded && blockedSites.length >= 5}
                                    className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                                      !isUpgraded && blockedSites.length >= 5 
                                        ? 'cursor-not-allowed opacity-60 border-gray-600' 
                                        : siteInputError
                                          ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                          : siteInputValid
                                            ? 'border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                                            : 'border-gray-600 focus:border-red-500'
                                    }`}
                                    style={!isUpgraded && blockedSites.length >= 5 ? { pointerEvents: 'none' } : {}}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter' && !(!isUpgraded && blockedSites.length >= 5) && siteInputValid && !siteInputError) {
                                        addBlockedSite(newSiteInput);
                                        setNewSiteInput('');
                                        setSiteInputError('');
                                        setSiteInputValid(false);
                                        setShowSuggestions(false);
                                      }
                                    }}
                                  />
                                  {siteInputError && (
                                    <p className="mt-1 text-xs text-red-400 flex items-center">
                                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                      </svg>
                                      {siteInputError}
                                    </p>
                                  )}
                                  {siteInputValid && !siteInputError && newSiteInput.trim() && (
                                    <p className="mt-1 text-xs text-green-400 flex items-center">
                                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                      Valid website
                                    </p>
                                  )}
                                </div>
                                {!isUpgraded && blockedSites.length >= 5 ? (
                                  <button 
                                    onClick={() => setIsSubscriptionModalOpen(true)}
                                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-colors"
                                  >
                                    Upgrade to Pro
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => {
                                      if (newSiteInput.trim() && !isSiteOperationLoading && siteInputValid && !siteInputError) {
                                        addBlockedSite(newSiteInput);
                                      }
                                    }}
                                    disabled={!newSiteInput.trim() || isSiteOperationLoading || (!isUpgraded && blockedSites.length >= 5) || !siteInputValid || !!siteInputError}
                                    className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-200 ${
                                      (!newSiteInput.trim() || isSiteOperationLoading || (!isUpgraded && blockedSites.length >= 5) || !siteInputValid || !!siteInputError)
                                        ? 'opacity-50 cursor-not-allowed' 
                                        : 'hover:shadow-lg hover:shadow-red-500/25'
                                    }`}
                                  >
                                    {isSiteOperationLoading ? (
                                      <span className="flex items-center">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Adding...
                                      </span>
                                    ) : (
                                      'Block'
                                    )}
                                  </button>
                                )}
                              </div>
                              
                              {/* Suggestions Dropdown */}
                              {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                                  {suggestions.map((suggestion, index) => (
                                    <div
                                      key={index}
                                      onClick={() => selectSuggestion(suggestion)}
                                      className="px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <span className="text-blue-400">🌐</span>
                                        <span>{suggestion}</span>
                                        {blockedSites.includes(suggestion) && (
                                          <span className="text-xs text-green-400">(blocked)</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Site Limit and Upgrade Info */}
                          <div className="mt-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/50">
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-300">
                                {!isUpgraded ? (
                                  <span className="text-yellow-400">
                                    {blockedSites.length}/5 sites blocked
                                  </span>
                                ) : (
                                  <span className="text-green-400">
                                    {blockedSites.length} sites blocked
                                  </span>
                                )}
                              </div>
                              {!isUpgraded && (
                                <button 
                                  onClick={() => setIsSubscriptionModalOpen(true)}
                                  className="px-3 py-1 text-xs bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-200"
                                  title="Upgrade to Pro for unlimited website blocking"
                                >
                                  Upgrade to Pro
                                </button>
                              )}
                            </div>
                            {!isUpgraded && (
                              <div className="mt-2 text-xs text-gray-400 text-center">
                                Pro subscription required for unlimited blocking
                              </div>
                            )}
                          </div>
                        </div>
                        

                      </div>
                    </div>
                    
                    {/* Blocked Sites List */}
                    {blockedSites.length > 0 ? (
                      <div className="mb-6">
                        <h4 className="text-white font-semibold mb-3">Currently Blocked Sites</h4>
                        <div className="space-y-2">
                          {blockedSites.map((site, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                              <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 bg-red-500/20 rounded-lg flex items-center justify-center">
                                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                                  </svg>
                                </div>
                                <span className="text-white font-medium">{site}</span>
                              </div>
                              <button
                                onClick={() => removeBlockedSite(site)}
                                className="px-2 py-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-6 text-center py-8 bg-gray-700/30 rounded-lg border border-gray-600/50">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Target className="w-8 h-8 text-red-400" />
                        </div>
                        <h4 className="text-white font-semibold mb-2">No Sites Blocked Yet</h4>
                        <p className="text-gray-400 text-sm mb-4">
                          Add websites above to start blocking distractions and improve your focus.
                        </p>
                      </div>
                    )}
                    
                    {/* Sync button removed - auto-sync is now active */}
                  </div>
                </div>





                {/* Focus Tip */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-xl">
                      {getTodaysTip().icon}
                    </div>
                    <h3 className="text-lg font-bold text-white">Focus Tip</h3>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-blue-100 text-sm leading-relaxed">
                      {getTodaysTip().text}
                    </p>
                  </div>
                </div>
                

              </div>
            )}

            {activeTab === 'sessions' && (
              <div className="space-y-6 min-w-0">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-white mb-4">Focus Sessions</h2>
                  <p className="text-gray-400">Manage and track all your focus sessions</p>
                </div>
                
                {/* Enhanced Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-red-500/30 transition-all duration-300 group">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Clock className="w-6 h-6 text-red-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-400 uppercase tracking-wide">Total Focus Time</p>
                        <p className="text-2xl font-bold text-white group-hover:text-red-400 transition-colors duration-300">
                          {formatTime(calculateTotalFocusTime())}
                          <span className="hidden">{statsUpdateTrigger}</span>
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min((calculateTotalFocusTime() / (8 * 60 * 60)) * 100, 100)}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-green-500/30 transition-all duration-300 group">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-400 uppercase tracking-wide">Sessions Completed</p>
                        <p className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors duration-300">
                          {calculateCompletedSessions()}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min((calculateCompletedSessions() / 100) * 100, 100)}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 group">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <TrendingUp className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-400 uppercase tracking-wide">Longest Session</p>
                        <p className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">
                          {formatTime(calculateLongestSession())}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min((calculateLongestSession() / (4 * 60 * 60)) * 100, 100)}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-orange-500/30 transition-all duration-300 group">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Calendar className="w-6 h-6 text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-400 uppercase tracking-wide">Current Streak</p>
                        <p className="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors duration-300">
                          {calculateCurrentStreak()} days
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min((calculateCurrentStreak() / 30) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Focus Time Chart */}
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Focus Time Trends</h3>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
                        Week
                      </button>
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg transition-colors">
                        Month
                      </button>
                    </div>
                  </div>
                  <FocusTimeChart sessions={sessions} />
                </div>
                
                {/* Session Insights */}
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">Session Insights</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-800/50 border border-gray-700/30 rounded-xl p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400 mb-1">
                          {sessions.length > 0 ? Math.round((sessions.filter(s => s.status === 'completed').length / sessions.length) * 100) : 0}%
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">Completion Rate</div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/50 border border-gray-700/30 rounded-xl p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400 mb-1">
                          {sessions.length > 0 ? Math.round(calculateTotalFocusTime() / (sessions.length * 60)) : 0}m
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">Avg Session Length</div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/50 border border-gray-700/30 rounded-xl p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400 mb-1">
                          {sessions.length > 0 ? Math.round((sessions.filter(s => s.status === 'paused').length / sessions.length) * 100) : 0}%
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">Pause Rate</div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/50 border border-gray-700/30 rounded-xl p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-400 mb-1">
                          {calculateCurrentStreak()}
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">Day Streak</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions Section */}
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl flex items-center justify-center">
                      <Target className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Quick Actions</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="group p-4 bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 rounded-xl hover:border-red-500/40 transition-all duration-200 hover:scale-105"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <Target className="w-5 h-5 text-red-400" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold text-white group-hover:text-red-400 transition-colors duration-200">Start Session</h4>
                          <p className="text-sm text-gray-400">Begin a new focus session</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setIsSessionsHistoryOpen(true)}
                      className="group p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl hover:border-purple-500/40 transition-all duration-200 hover:scale-105"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <FileText className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold text-white group-hover:text-purple-400 transition-colors duration-200">View History</h4>
                          <p className="text-sm text-gray-400">See all past sessions</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleTabChange('analytics')}
                      className="group p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl hover:border-blue-500/40 transition-all duration-200 hover:scale-105"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <TrendingUp className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors duration-200">Analytics</h4>
                          <p className="text-sm text-gray-400">View detailed insights</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
                
                {/* Active Session */}
                {sessions.find(s => s.status === 'active') && (
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <Target className="w-4 h-4 text-red-400" />
                      </div>
                      <span>Active Focus Session</span>
                    </h3>
                    <SimpleTimer
                      session={sessions.find(s => s.status === 'active')!}
                      onPause={pauseSession}
                      onResume={resumeSession}
                      onComplete={completeSession}
                      onAbandon={abandonSession}
                    />
                  </div>
                )}

                {/* Create Session Button */}
                <div className="text-center">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    disabled={!canStartNewSession()}
                    className={`px-8 py-4 font-semibold rounded-xl transition-all duration-300 transform ${
                      canStartNewSession()
                        ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white hover:scale-105 shadow-lg'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed scale-100 shadow-none'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <Plus className="w-5 h-5" />
                      <span>
                        {canStartNewSession() 
                          ? 'Create New Focus Session' 
                          : sessions.some(s => s.status === 'active')
                            ? 'Complete Active Session First'
                            : 'Processing...'
                        }
                      </span>
                    </div>
                  </button>
                  
                  {!canStartNewSession() && sessions.some(s => s.status === 'active') && (
                    <p className="mt-2 text-sm text-gray-400">
                      You have an active session. Complete or pause it to start a new one.
                    </p>
                  )}
                </div>


              </div>
            )}

            {activeTab === 'analytics' && (
              isUpgraded ? (
                <div className="min-w-0">
                  <AnalyticsPage sessions={sessions} blockedSites={blockedSites} />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Pro Feature - Modern Blurred Content */}
                  <div className="relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 overflow-hidden shadow-2xl">
                    {/* Blurred Content */}
                    <div className="filter blur-sm pointer-events-none">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Productivity Insights */}
                        <div className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30 shadow-lg">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
                              <div className="w-5 h-5 bg-emerald-400 rounded-full"></div>
                            </div>
                            <h3 className="text-lg font-bold text-white">Productivity Insights</h3>
                          </div>
                          <div className="space-y-3">
                            <div className="h-3 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-full"></div>
                            <div className="h-3 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-full w-3/4"></div>
                            <div className="h-3 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-full w-1/2"></div>
                          </div>
                        </div>
                        
                        {/* Focus Patterns */}
                        <div className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30 shadow-lg">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center">
                              <div className="w-5 h-5 bg-blue-400 rounded-full"></div>
                            </div>
                            <h3 className="text-lg font-bold text-white">Focus Patterns</h3>
                          </div>
                          <div className="space-y-3">
                            <div className="h-3 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-full"></div>
                            <div className="h-3 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-full w-4/5"></div>
                            <div className="h-3 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-full w-2/3"></div>
                          </div>
                        </div>

                        {/* AI Recommendations */}
                        <div className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30 shadow-lg">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                              <div className="w-5 h-5 bg-purple-400 rounded-full"></div>
                            </div>
                            <h3 className="text-lg font-bold text-white">AI Recommendations</h3>
                          </div>
                          <div className="space-y-3">
                            <div className="h-3 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full"></div>
                            <div className="h-3 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full w-5/6"></div>
                            <div className="h-3 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full w-3/4"></div>
                          </div>
                        </div>

                        {/* Burnout Analysis */}
                        <div className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30 shadow-lg">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl flex items-center justify-center">
                              <div className="w-5 h-5 bg-orange-400 rounded-full"></div>
                            </div>
                            <h3 className="text-lg font-bold text-white">Burnout Analysis</h3>
                          </div>
                          <div className="space-y-3">
                            <div className="h-3 bg-gradient-to-r from-orange-500/30 to-red-500/30 rounded-full"></div>
                            <div className="h-3 bg-gradient-to-r from-orange-500/30 to-red-500/30 rounded-full w-1/4"></div>
                            <div className="h-3 bg-gradient-to-r from-orange-500/30 to-red-500/30 rounded-full w-1/3"></div>
                          </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30 shadow-lg">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                              <div className="w-5 h-5 bg-cyan-400 rounded-full"></div>
                            </div>
                            <h3 className="text-lg font-bold text-white">Performance Metrics</h3>
                          </div>
                          <div className="space-y-3">
                            <div className="h-3 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full"></div>
                            <div className="h-3 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full w-4/5"></div>
                            <div className="h-3 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full w-3/5"></div>
                          </div>
                        </div>

                        {/* Time Optimization */}
                        <div className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30 shadow-lg">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center">
                              <div className="w-5 h-5 bg-yellow-400 rounded-full"></div>
                            </div>
                            <h3 className="text-lg font-bold text-white">Time Optimization</h3>
                          </div>
                          <div className="space-y-3">
                            <div className="h-3 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-full"></div>
                            <div className="h-3 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-full w-3/4"></div>
                            <div className="h-3 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-full w-5/6"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pro Upgrade Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm flex items-center justify-center rounded-3xl">
                      <div className="text-center max-w-md px-6">
                        <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                          <TrendingUp className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Unlock Advanced Analytics</h3>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                          Get AI-powered insights into your productivity patterns, burnout detection, 
                          and personalized recommendations to maximize your focus potential.
                        </p>
                        <button 
                          onClick={() => setIsSubscriptionModalOpen(true)}
                          className="group relative px-10 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 hover:scale-105"
                        >
                          <span className="relative z-10">Unlock Analytics</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}

            {activeTab === 'settings' && (
            <div className="min-w-0">
            <SettingsTab
              sessions={sessions}
              blockedSites={blockedSites}
              isBlockingEnabled={isBlockingEnabled}
              smartRedirectUrl={smartRedirectUrl}
              redirectUrl={redirectUrl}
              token={token}
              isUpgraded={isUpgraded}
              syncPasswordSettingsToExtension={syncPasswordSettingsToExtension}
              onSubscriptionChange={(isPro) => {
                setIsPro(isPro);
                setIsUpgraded(isPro);
              }}
              onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
            />
            </div>
            )}
          </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-300 px-6 py-4 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                <span className="text-red-400">⚠️</span>
              </div>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Create Session Modal */}
      <CreateSessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSession={createSession}
      />

      {/* Edit Session Modal */}
      <EditSessionModal
        session={editingSession}
        isOpen={!!editingSession}
        onClose={() => setEditingSession(null)}
        onSave={handleEditSession}
      />

      {/* Delete Session Modal */}
      <DeleteSessionModal
        session={deletingSession}
        isOpen={!!deletingSession}
        onClose={() => setDeletingSession(null)}
        onDelete={handleDeleteSession}
      />

      {/* View Session Modal */}
      <ViewSessionModal
        session={viewingSession}
        isOpen={!!viewingSession}
        onClose={() => setViewingSession(null)}
      />

      {/* Subscription Modal */}
      {isSubscriptionModalOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsSubscriptionModalOpen(false)}
        >
          <div 
            className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Unlock Unlimited Possibilities</h2>
              <p className="text-gray-400">Get unlimited website blocks, detailed AI-based analytics on where you burn out and how to manage procrastination, and more!</p>
            </div>
            
            {/* Pro Features List */}
            <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Pro Features Include:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Unlimited website blocking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300 text-sm">AI-powered productivity analytics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Smart redirect customization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Advanced focus session tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Priority customer support</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              {/* Monthly Plan */}
              <div 
                onClick={() => setSelectedPlan('monthly')}
                className={`bg-gray-800 border rounded-xl p-3 transition-all cursor-pointer ${
                  selectedPlan === 'monthly' 
                    ? 'border-purple-500 ring-2 ring-purple-500/20' 
                    : 'border-gray-700 hover:border-purple-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h3 className="text-base font-semibold text-white">Monthly Plan</h3>
                    <p className="text-xs text-gray-400">Perfect for trying out</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">$4.99</div>
                    <div className="text-xs text-gray-400">per month</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">Cancel anytime</div>
              </div>
              
              {/* Annual Plan */}
              <div 
                onClick={() => setSelectedPlan('annual')}
                className={`bg-gray-800 border-2 rounded-xl p-3 transition-all cursor-pointer relative ${
                  selectedPlan === 'annual' 
                    ? 'border-purple-500 ring-2 ring-purple-500/20' 
                    : 'border-purple-500/50 hover:border-purple-500'
                }`}
              >
                <div className="absolute -top-2 left-4 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                  BEST VALUE
                </div>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h3 className="text-base font-semibold text-white">Annual Plan</h3>
                    <p className="text-xs text-gray-400">Save 40%</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">$2.99</div>
                    <div className="text-xs text-gray-400">per month</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">Billed annually ($35.88)</div>
              </div>
              
              {/* Lifetime Plan */}
              <div 
                onClick={() => setSelectedPlan('lifetime')}
                className={`bg-gray-800 border rounded-xl p-3 transition-all cursor-pointer ${
                  selectedPlan === 'lifetime' 
                    ? 'border-blue-500 ring-2 ring-blue-500/20' 
                    : 'border-gray-700 hover:border-blue-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h3 className="text-base font-semibold text-white">Lifetime Access</h3>
                    <p className="text-xs text-gray-400">One-time payment</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">$50.00</div>
                    <div className="text-xs text-gray-400">forever</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">Never pay again</div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => {
                  setIsSubscriptionModalOpen(false);
                  setSelectedPlan(null);
                }}
                className="flex-1 py-2.5 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  console.log('Upgrade button clicked, selectedPlan:', selectedPlan);
                  if (!selectedPlan) {
                    showToast('Please select a plan', 'error');
                    return;
                  }
                  console.log('Calling handleCheckout with:', selectedPlan);
                  handleCheckout(selectedPlan);
                }}
                disabled={!selectedPlan || isCreatingCheckout}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-purple-600/50 disabled:to-blue-600/50 text-white font-medium rounded-xl transition-colors text-sm disabled:cursor-not-allowed"
              >
                {isCreatingCheckout ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </span>
                ) : (
                  'Upgrade to Pro'
                )}
              </button>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Redirect Modal */}
      {isRedirectModalOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setIsRedirectModalOpen(false)}
        >
          <div 
            className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Smart Redirect Setup</h2>
              <p className="text-gray-400">Customize where blocked sites redirect to. Set your own destination URL instead of the default page.</p>
            </div>
            
            <div className="space-y-4 mb-6">
              {isUpgraded ? (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Redirect Website</label>
                  <input 
                    type="text" 
                    value={smartRedirectUrl}
                    onChange={(e) => setSmartRedirectUrl(e.target.value)}
                    placeholder="https://example.com or leave empty for defaults" 
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Redirect Website</label>
                  <input 
                    type="text" 
                    value=""
                    placeholder="Pro feature - Upgrade to unlock"
                    disabled
                    readOnly
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-400 placeholder-gray-500 cursor-not-allowed"
                    style={{ pointerEvents: 'none' }}
                  />
                </div>
              )}
              
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <h4 className="text-purple-300 font-semibold mb-2">How It Works:</h4>
                <ul className="text-sm text-purple-200 space-y-1">
                  <li>• Set one redirect destination for all blocked websites</li>
                  <li>• When any blocked site is accessed, you'll be redirected</li>
                  <li>• Perfect for staying productive and focused</li>
                  <li>• Works automatically with your existing blocked sites</li>
                </ul>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => setIsRedirectModalOpen(false)}
                className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              {isUpgraded ? (
                <button 
                  onClick={() => {
                    console.log('🔍 Save Redirect button clicked with URL:', smartRedirectUrl);
                    updateSmartRedirectUrl(smartRedirectUrl);
                    setIsRedirectModalOpen(false);
                  }}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-xl transition-colors"
                >
                  Save Redirect
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setIsRedirectModalOpen(false);
                    setIsSubscriptionModalOpen(true);
                  }}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-xl transition-colors"
                >
                  Upgrade to Pro
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
      )}

      {/* Sessions History Modal */}
      {isSessionsHistoryOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setIsSessionsHistoryOpen(false)}
        >
          <div 
            className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-6xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white">Focus Sessions History</h2>
                <p className="text-gray-400 mt-2">
                  Complete overview of all your focus sessions with advanced filtering and export options
                </p>
              </div>
              <button
                onClick={() => setIsSessionsHistoryOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search sessions..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">All</option>
                  <option value="completed">Completed</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="abandoned">Abandoned</option>
                  <option value="interrupted">Interrupted</option>
                </select>

                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>

                <div className="flex items-center justify-center px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg">
                  <span className="text-gray-300">
                    {filteredSessions.length} of {sessions.length} sessions
                  </span>
                </div>
              </div>
            </div>

            {/* Sessions Table */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Session</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Progress</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredSessions.map((session) => (
                      <tr key={session._id} className="hover:bg-gray-700/30 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-white">{session.title}</div>
                            <div className="text-sm text-gray-400 max-w-xs truncate">{session.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-white">{session.goal}m</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                            session.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            session.status === 'active' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                            session.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            session.status === 'abandoned' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            'bg-gray-500/20 text-gray-400 border-gray-500/30'
                          }`}>
                            <span className="capitalize">{session.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min((session.actualTime / session.goal) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-400">
                              {session.goal > 0 ? 
                                (() => {
                                  const percentage = Math.round((session.actualTime / session.goal) * 100);
                                  return percentage > 100 ? '100%' : `${percentage}%`;
                                })() 
                                : '0%'
                              }
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300">
                            {new Date(session.startTime).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewSessionClick(session)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleEditSessionClick(session)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredSessions.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-10 h-10 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Sessions Found</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    {filteredSessions.length === 0 && sessions.length > 0
                      ? "No sessions match your current filters. Try adjusting your search or filter criteria."
                      : "Start your first focus session to track your productivity and build better focus habits."}
                  </p>
                  {filteredSessions.length === 0 && sessions.length === 0 && (
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                    >
                      Start Your First Session
                    </button>
                  )}
                </div>
              )}
            </div>



            {/* Export Button */}
            <div className="mt-6 text-center">
              <button
                onClick={() => exportSessions()}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-200"
              >
                Export to CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blocked History Modal */}
      {isBlockedHistoryOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Blocked History</h3>
              <button
                onClick={() => setIsBlockedHistoryOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {getBlockedHistory().length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Target className="w-10 h-10 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Blocked Sites Yet</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Start blocking distracting websites to maintain focus during your work sessions.
                  </p>
                  <button
                    onClick={() => {
                      setIsBlockedHistoryOpen(false);
                      // Scroll to website blocker section
                      setTimeout(() => {
                        const blockerSection = document.querySelector('[data-section="website-blocker"]');
                        blockerSection?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-red-500/25"
                  >
                    Add Your First Blocked Site
                  </button>
                </div>
              ) : (
                getBlockedHistory().map((entry: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div>
                        <p className="text-white font-medium">{entry.site}</p>
                        <p className="text-gray-400 text-sm">
                          Added: {new Date(entry.timestamp).toLocaleDateString()}
                          {entry.visits > 1 && (
                            <span className="ml-2">• Visited {entry.visits} times</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {entry.visits > 1 && (
                        <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                          {entry.visits} visits
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Currently blocked: {blockedSites.length}</span>
                <span>Total ever blocked: {totalBlockedSites}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Protection Modal */}
      {isPasswordModalOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handlePasswordCancel}
        >
          <div 
            className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full min-w-0 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Password Required</h2>
                <p className="text-gray-400 mb-2">
                  {pendingBlockingState !== null 
                    ? 'Enter your password to disable website blocking'
                    : pendingSiteToRemove !== null
                    ? `Enter your password to remove "${pendingSiteToRemove}" from block list`
                    : 'Enter your password to continue'
                  }
                </p>
                <p className="text-orange-400 font-medium">Stay focused! 🔒</p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (passwordError) setPasswordError(''); // Clear error when typing
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    passwordError ? 'border-red-500' : 'border-gray-600'
                  }`}
                  autoFocus
                />
                {passwordError && (
                  <p className="mt-2 text-sm text-red-400">{passwordError}</p>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handlePasswordCancel}
                  className="flex-1 py-2.5 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePasswordSubmit}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-medium rounded-xl transition-colors text-sm"
                >
                  Disable Blocking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timer Notifications */}
      {timerNotification && timerNotification.isVisible && (
        <TimerNotification
          isVisible={timerNotification.isVisible}
          onClose={hideTimerNotification}
          sessionTitle={timerNotification.sessionTitle}
          duration={timerNotification.duration}
          type={timerNotification.type}
        />
      )}
    </div>
  );
};

export default Dashboard;
