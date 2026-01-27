import React, { useState, useEffect } from 'react';
import { Crown, Check, X, ExternalLink, CreditCard, Calendar } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

interface SubscriptionManagerProps {
  token: string | null;
  onSubscriptionChange?: (isPro: boolean) => void;
}

interface SubscriptionStatus {
  isPro: boolean;
  subscriptionId?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  status?: string;
}

export default function SubscriptionManager({ token, onSubscriptionChange }: SubscriptionManagerProps) {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({ isPro: false });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [isCreatingPortal, setIsCreatingPortal] = useState(false);

  useEffect(() => {
    if (token) {
      checkSubscriptionStatus();
    }
  }, [token]);

  const checkSubscriptionStatus = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/subscription/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus(data);
        if (onSubscriptionChange) {
          onSubscriptionChange(data.isPro);
        }
      } else {
        setError('Failed to check subscription status');
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!token) return;

    try {
      setIsCreatingCheckout(true);
      const response = await fetch(`${API_BASE_URL}/subscription/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          priceId: 'price_1234567890', // Replace with actual Stripe price ID
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.open(url, '_blank');
      } else {
        setError('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setError('Network error occurred');
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  const handleManageBilling = async () => {
    if (!token) return;

    try {
      setIsCreatingPortal(true);
      const response = await fetch(`${API_BASE_URL}/subscription/create-portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const { url } = await response.json();
        window.open(url, '_blank');
      } else {
        setError('Failed to create billing portal session');
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
      setError('Network error occurred');
    } finally {
      setIsCreatingPortal(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <span className="ml-3 text-gray-400">Loading subscription status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
          <Crown className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Subscription Management</h2>
          <p className="text-gray-400 text-sm">Manage your Focus Pro subscription and billing</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <X className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {subscriptionStatus.isPro ? (
        // Pro User
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Crown className="w-6 h-6 text-purple-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Focus Pro</h3>
                  <p className="text-gray-400 text-sm">You're enjoying all Pro features</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded-full">
                Active
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                <Check className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">Unlimited Sites</p>
                  <p className="text-gray-400 text-sm">Block unlimited websites</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                <Check className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">Smart Redirect</p>
                  <p className="text-gray-400 text-sm">Redirect to productive sites</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                <Check className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">Advanced Analytics</p>
                  <p className="text-gray-400 text-sm">Detailed focus insights</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                <Check className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">Priority Support</p>
                  <p className="text-gray-400 text-sm">24/7 customer support</p>
                </div>
              </div>
            </div>

            {subscriptionStatus.currentPeriodEnd && (
              <div className="flex items-center space-x-2 text-gray-400 text-sm mb-4">
                <Calendar className="w-4 h-4" />
                <span>
                  {subscriptionStatus.cancelAtPeriodEnd 
                    ? `Subscription ends on ${formatDate(subscriptionStatus.currentPeriodEnd)}`
                    : `Next billing date: ${formatDate(subscriptionStatus.currentPeriodEnd)}`
                  }
                </span>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={handleManageBilling}
                disabled={isCreatingPortal}
                className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-medium rounded-lg transition-colors"
              >
                {isCreatingPortal ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Manage Billing</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Free User
        <div className="space-y-6">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Upgrade to Focus Pro</h3>
              <p className="text-gray-400">Unlock unlimited blocking and advanced features</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                <Check className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">Unlimited Sites</p>
                  <p className="text-gray-400 text-sm">Block unlimited websites</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                <Check className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">Smart Redirect</p>
                  <p className="text-gray-400 text-sm">Redirect to productive sites</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                <Check className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">Advanced Analytics</p>
                  <p className="text-gray-400 text-sm">Detailed focus insights</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                <Check className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">Priority Support</p>
                  <p className="text-gray-400 text-sm">24/7 customer support</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {/* Monthly Plan */}
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 hover:border-purple-500/50 transition-colors cursor-pointer">
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
              <div className="bg-gray-800 border-2 border-purple-500/50 rounded-xl p-3 hover:border-purple-500 transition-colors cursor-pointer relative">
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
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 hover:border-blue-500/50 transition-colors cursor-pointer">
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
                onClick={handleUpgrade}
                disabled={isCreatingCheckout}
                className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-purple-600/50 disabled:to-blue-600/50 text-white font-medium rounded-lg transition-colors"
              >
                {isCreatingCheckout ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4" />
                    <span>Upgrade to Pro</span>
                    <ExternalLink className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
