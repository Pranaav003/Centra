import React, { useState, useEffect } from 'react';
import { User, Mail, CreditCard, Crown, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { API_BASE_URL } from '../../../config/api';
import { Toast } from '../../ui/Toast';

const DELETE_REASONS = [
  'I don\'t use it anymore',
  'Found an alternative',
  'Too expensive',
  'Privacy concerns',
  'Technical issues',
  'Other',
];

interface AccountSettingsProps {
  sessions?: any[];
  blockedSites?: string[];
  isBlockingEnabled?: boolean;
  smartRedirectUrl?: string;
  redirectUrl?: string;
  isUpgraded?: boolean;
  onUpgradeClick?: () => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ 
  sessions = [], 
  blockedSites = [], 
  isBlockingEnabled = true,
  smartRedirectUrl = '',
  redirectUrl = `${import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/redirect`,
  isUpgraded: isUpgradedProp = false,
  onUpgradeClick
}) => {
  const { user, logout, deleteAccount, token } = useAuth();
  const [isUpgraded, setIsUpgraded] = useState(isUpgradedProp);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStep, setDeleteStep] = useState<'confirm' | 'feedback'>('confirm');
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteFeedback, setDeleteFeedback] = useState('');

  useEffect(() => {
    setIsUpgraded(isUpgradedProp);
  }, [isUpgradedProp]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberSince, setMemberSince] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load member since date on component mount
  useEffect(() => {
    const loadMemberSince = () => {
      // Try to get from localStorage first
      const savedMemberSince = localStorage.getItem('memberSince');
      if (savedMemberSince) {
        setMemberSince(savedMemberSince);
      } else {
        // If not found, set to current date (for demo purposes)
        // In a real app, this would come from the backend
        const currentDate = new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        });
        setMemberSince(currentDate);
        localStorage.setItem('memberSince', currentDate);
      }
    };

    loadMemberSince();
  }, []);

  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      setToast({ message: 'Go to Settings → Subscription to upgrade.', type: 'success' });
    }
  };


  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      if (token) {
        try {
          await fetch(`${API_BASE_URL}/auth/feedback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ reason: deleteReason, message: deleteFeedback }),
          });
        } catch (_) {
          // Continue with delete even if feedback fails
        }
      }
      await deleteAccount();
      setToast({ message: 'Account permanently deleted. You can sign up again with the same email anytime.', type: 'success' });
      setShowDeleteModal(false);
      setDeleteStep('confirm');
      setDeleteReason('');
      setDeleteFeedback('');
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Failed to delete account. Please try again.',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = () => {
    setDeleteStep('confirm');
    setDeleteReason('');
    setDeleteFeedback('');
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteStep('confirm');
    setDeleteReason('');
    setDeleteFeedback('');
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Account Settings</h3>
          <p className="text-gray-400">Manage your profile and subscription</p>
        </div>
      </div>

      {/* Profile Information */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-white">Profile Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-white">{user?.email || 'user@example.com'}</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Member Since</label>
            <div className="flex items-center space-x-3">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-white">{memberSince || 'Loading...'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Status */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-white">Subscription</h4>
        
        <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isUpgraded ? 'bg-gradient-to-r from-purple-500 to-blue-600' : 'bg-gray-600'
              }`}>
                <Crown className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-white font-medium">
                  {isUpgraded ? 'Pro Plan' : 'Free Plan'}
                </div>
                <div className="text-sm text-gray-400">
                  {isUpgraded ? 'Unlimited features' : 'Limited to 5 blocked sites'}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleUpgrade}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isUpgraded
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
              }`}
              disabled={isUpgraded}
            >
              {isUpgraded ? 'Current Plan' : 'Upgrade to Pro'}
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-white">Data Management</h4>
        
        <div className="space-y-3">
          <button
            onClick={openDeleteModal}
            className="w-full flex items-center space-x-3 px-4 py-3 bg-red-900/20 hover:bg-red-900/30 border border-red-800/30 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5 text-red-400" />
            <div className="text-left">
              <div className="text-red-300 font-medium">Delete Account</div>
              <div className="text-sm text-red-400">Permanently delete your account and data</div>
            </div>
          </button>
        </div>
      </div>

      {/* Sign Out */}
      <div className="pt-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <div className="text-white font-medium">Sign Out</div>
        </button>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
            {deleteStep === 'confirm' ? (
              <>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Delete Account</h3>
                    <p className="text-gray-400">This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete your account? This will permanently remove all your data (sessions, blocked sites, settings). You can create a new account with the same email afterward.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={closeDeleteModal}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setDeleteStep('feedback')}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    Continue
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Why are you leaving?</h3>
                    <p className="text-gray-400">Your feedback is sent to us and helps us improve.</p>
                  </div>
                </div>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Reason</label>
                    <select
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Select a reason...</option>
                      {DELETE_REASONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Additional feedback (optional)</label>
                    <textarea
                      value={deleteFeedback}
                      onChange={(e) => setDeleteFeedback(e.target.value)}
                      placeholder="Anything else you'd like to tell us?"
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setDeleteStep('confirm')}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting…' : 'Submit & Delete Account'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
};
