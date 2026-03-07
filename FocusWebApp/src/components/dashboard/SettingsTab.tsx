import React, { useState } from 'react';
import { User, Shield, Bell, Palette, Crown } from 'lucide-react';
import { AccountSettings } from './settings/AccountSettings';
import { PrivacySettings } from './settings/PrivacySettings';
import { NotificationSettings } from './settings/NotificationSettings';
import { AppearanceSettings } from './settings/AppearanceSettings';
import SubscriptionManager from './SubscriptionManager';
import { FRONTEND_URL } from '../../config/api';

type SettingsSection = 'account' | 'subscription' | 'privacy' | 'notifications' | 'appearance';

interface SettingsTabProps {
  sessions?: any[];
  blockedSites?: string[];
  isBlockingEnabled?: boolean;
  smartRedirectUrl?: string;
  redirectUrl?: string;
  token?: string | null;
  isUpgraded?: boolean;
  syncPasswordSettingsToExtension?: (passwordEnabled: boolean, password: string) => void;
  onSubscriptionChange?: (isPro: boolean) => void;
  onOpenSubscriptionModal?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ 
  sessions = [], 
  blockedSites = [], 
  isBlockingEnabled = true,
  smartRedirectUrl = '',
  redirectUrl = `${FRONTEND_URL}/redirect`,
  token = null,
  isUpgraded = false,
  syncPasswordSettingsToExtension,
  onSubscriptionChange,
  onOpenSubscriptionModal
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');

  const settingsSections = [
    {
      id: 'account' as const,
      title: 'Account',
      description: 'Manage your profile and data',
      icon: User,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'subscription' as const,
      title: 'Subscription',
      description: 'Manage your membership and billing',
      icon: Crown,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'privacy' as const,
      title: 'Privacy',
      description: 'Control your data and privacy',
      icon: Shield,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'notifications' as const,
      title: 'Notifications',
      description: 'Configure alerts and notifications',
      icon: Bell,
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 'appearance' as const,
      title: 'Appearance',
      description: 'Customize theme and layout',
      icon: Palette,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'account':
        return <AccountSettings 
          sessions={sessions}
          blockedSites={blockedSites}
          isBlockingEnabled={isBlockingEnabled}
          smartRedirectUrl={smartRedirectUrl}
          redirectUrl={redirectUrl}
          isUpgraded={isUpgraded}
          onUpgradeClick={onOpenSubscriptionModal}
        />;
      case 'subscription':
        return <SubscriptionManager 
          token={token}
          isUpgraded={isUpgraded}
          onSubscriptionChange={onSubscriptionChange}
        />;
      case 'privacy':
        return <PrivacySettings syncPasswordSettingsToExtension={syncPasswordSettingsToExtension} />;
      case 'notifications':
        return <NotificationSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      default:
        return <AccountSettings 
          sessions={sessions}
          blockedSites={blockedSites}
          isBlockingEnabled={isBlockingEnabled}
          smartRedirectUrl={smartRedirectUrl}
          redirectUrl={redirectUrl}
          isUpgraded={isUpgraded}
          onUpgradeClick={onOpenSubscriptionModal}
        />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Settings</h2>
        <p className="text-gray-400">Customize your Focus experience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Settings</h3>
            <nav className="space-y-2">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                      isActive
                        ? `bg-gradient-to-r ${section.color} text-white shadow-lg`
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{section.title}</div>
                      <div className="text-xs opacity-75">{section.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  );
};
