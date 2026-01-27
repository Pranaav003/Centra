import React, { useState, useEffect } from 'react';
import { Palette, Maximize2, Eye, Zap, ZapOff } from 'lucide-react';
import { Toast } from '../../ui/Toast';

export const AppearanceSettings: React.FC = () => {
  const [compactMode, setCompactMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [reduceAnimations, setReduceAnimations] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = {
      compactMode: localStorage.getItem('focus-compact-mode') === 'true',
      highContrast: localStorage.getItem('focus-high-contrast') === 'true',
      reduceAnimations: localStorage.getItem('focus-reduce-animations') === 'true'
    };

    setCompactMode(savedSettings.compactMode);
    setHighContrast(savedSettings.highContrast);
    setReduceAnimations(savedSettings.reduceAnimations);

    // Apply settings to document
    applyAppearanceSettings(savedSettings);
  }, []);

  const applyAppearanceSettings = (settings: any) => {
    const root = document.documentElement;
    
    // Compact mode
    if (settings.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }

    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduce animations
    if (settings.reduceAnimations) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  };


  const handleCompactModeToggle = () => {
    const newValue = !compactMode;
    setCompactMode(newValue);
    localStorage.setItem('focus-compact-mode', newValue.toString());
    
    // Apply to document
    const root = document.documentElement;
    if (newValue) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
    
    setToast({ 
      message: newValue ? 'Compact mode enabled!' : 'Compact mode disabled!', 
      type: 'success' 
    });
  };


  const handleHighContrastToggle = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem('focus-high-contrast', newValue.toString());
    
    // Apply to document
    const root = document.documentElement;
    if (newValue) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    setToast({ 
      message: newValue ? 'High contrast enabled!' : 'High contrast disabled!', 
      type: 'success' 
    });
  };

  const handleReduceAnimationsToggle = () => {
    const newValue = !reduceAnimations;
    setReduceAnimations(newValue);
    localStorage.setItem('focus-reduce-animations', newValue.toString());
    
    // Apply to document
    const root = document.documentElement;
    if (newValue) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    setToast({ 
      message: newValue ? 'Animations reduced!' : 'Animations restored!', 
      type: 'success' 
    });
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
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Appearance Settings</h3>
            <p className="text-gray-400">Customize the look and feel of Focus</p>
          </div>
        </div>


        {/* Layout Options */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white">Layout</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <Maximize2 className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-white font-medium">Compact Mode</div>
                  <div className="text-sm text-gray-400">
                    Reduce spacing and padding for more content
                  </div>
                </div>
              </div>
              <button
                onClick={handleCompactModeToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  compactMode ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    compactMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

          </div>
        </div>

        {/* Accessibility */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white">Accessibility</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <Eye className="w-5 h-5 text-cyan-400" />
                <div>
                  <div className="text-white font-medium">High Contrast</div>
                  <div className="text-sm text-gray-400">
                    Enhanced dark mode with visual pop and depth
                  </div>
                </div>
              </div>
              <button
                onClick={handleHighContrastToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  highContrast ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    highContrast ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                {reduceAnimations ? (
                  <ZapOff className="w-5 h-5 text-red-400" />
                ) : (
                  <Zap className="w-5 h-5 text-yellow-400" />
                )}
                <div>
                  <div className="text-white font-medium">Reduce Animations</div>
                  <div className="text-sm text-gray-400">
                    Minimize motion for better accessibility
                  </div>
                </div>
              </div>
              <button
                onClick={handleReduceAnimationsToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  reduceAnimations ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    reduceAnimations ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white">Preview</h4>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-white font-medium mb-3">Current Settings</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Layout:</span>
                  <span className="text-white">{compactMode ? 'Compact' : 'Normal'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Contrast:</span>
                  <span className="text-white">{highContrast ? 'High' : 'Normal'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Animations:</span>
                  <span className="text-white">{reduceAnimations ? 'Reduced' : 'Normal'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};