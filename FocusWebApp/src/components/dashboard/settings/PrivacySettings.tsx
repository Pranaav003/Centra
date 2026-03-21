import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, Key, Database, FileText } from 'lucide-react';

interface PrivacySettingsProps {
  syncPasswordSettingsToExtension?: (passwordEnabled: boolean, password: string) => void;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({ 
  syncPasswordSettingsToExtension 
}) => {
  const [passwordEnabled, setPasswordEnabled] = useState(
    localStorage.getItem('passwordEnabled') === 'true'
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordToggle = () => {
    const newPasswordEnabled = !passwordEnabled;
    setPasswordEnabled(newPasswordEnabled);
    
    if (newPasswordEnabled) {
      // If enabling password, check if one exists
      const existingPassword = localStorage.getItem('blockingPassword');
      if (!existingPassword) {
        // No existing password, user needs to set one
        setPassword('');
        setConfirmPassword('');
      }
    } else {
      // If disabling password, clear it
      localStorage.removeItem('blockingPassword');
      setPassword('');
      setConfirmPassword('');
      setPasswordError('');
    }
    
    localStorage.setItem('passwordEnabled', newPasswordEnabled.toString());
    
    // Sync with extension
    if (syncPasswordSettingsToExtension) {
      const currentPassword = localStorage.getItem('blockingPassword') || '';
      syncPasswordSettingsToExtension(newPasswordEnabled, currentPassword);
    }
  };

  const handlePasswordSave = () => {
    if (!password || !confirmPassword) {
      setPasswordError('Please fill in both password fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (password.length < 4) {
      setPasswordError('Password must be at least 4 characters long');
      return;
    }
    
    // Save password
    localStorage.setItem('blockingPassword', password);
    localStorage.setItem('passwordEnabled', 'true');
    setPasswordEnabled(true);
    setPassword('');
    setConfirmPassword('');
    setPasswordError('');
    
    // Sync with extension
    if (syncPasswordSettingsToExtension) {
      syncPasswordSettingsToExtension(true, password);
    }
  };

  const handlePasswordChange = () => {
    if (!password || !confirmPassword) {
      setPasswordError('Please fill in both password fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (password.length < 4) {
      setPasswordError('Password must be at least 4 characters long');
      return;
    }
    
    // Update password
    localStorage.setItem('blockingPassword', password);
    setPassword('');
    setConfirmPassword('');
    setPasswordError('');
    
    // Sync with extension
    if (syncPasswordSettingsToExtension) {
      syncPasswordSettingsToExtension(true, password);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Privacy & Security</h2>
          <p className="text-gray-400 text-sm">Manage your privacy settings and security preferences</p>
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Privacy Policy</h3>
            <p className="text-gray-400 text-sm">
              Read how Centra collects, uses, and protects your data.
            </p>
          </div>
        </div>
        <Link
          to="/privacy"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors whitespace-nowrap"
        >
          View full policy
        </Link>
      </div>

      {/* Password Protection Section */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Lock className="w-5 h-5 text-orange-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Password Protection</h3>
              <p className="text-gray-400 text-sm">Require password to disable blocking or remove sites</p>
            </div>
          </div>
          <button
            onClick={handlePasswordToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              passwordEnabled ? 'bg-orange-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                passwordEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {passwordEnabled && (
          <div className="space-y-4">
            {!localStorage.getItem('blockingPassword') ? (
              // Set new password
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Set Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <p className="text-red-400 text-sm">{passwordError}</p>
                )}

                <button
                  onClick={handlePasswordSave}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                >
                  Save Password
                </button>
              </div>
            ) : (
              // Change existing password
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-green-400">
                  <Key className="w-4 h-4" />
                  <span className="text-sm">Password protection is active</span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <p className="text-red-400 text-sm">{passwordError}</p>
                )}

                <button
                  onClick={handlePasswordChange}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                >
                  Update Password
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Data Privacy Section */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Database className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">Data Privacy</h3>
            <p className="text-gray-400 text-sm">Manage your data and privacy preferences</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Local Storage Only</h4>
              <p className="text-gray-400 text-sm">Your blocking data is stored locally in your browser</p>
            </div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
            <div>
              <h4 className="text-white font-medium">No Tracking</h4>
              <p className="text-gray-400 text-sm">We don't track your browsing habits or collect personal data</p>
            </div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Secure Sync</h4>
              <p className="text-gray-400 text-sm">Data syncs securely between your devices when logged in</p>
            </div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

