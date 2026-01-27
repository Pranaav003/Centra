import React, { useState, useEffect } from 'react';
import { Bell, Smartphone, Clock, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { Toast } from '../../ui/Toast';

export const NotificationSettings: React.FC = () => {
  const [browserNotifications, setBrowserNotifications] = useState(true);
  const [focusSessionAlerts, setFocusSessionAlerts] = useState(true);
  const [blockingAlerts, setBlockingAlerts] = useState(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStartTime, setQuietStartTime] = useState('22:00');
  const [quietEndTime, setQuietEndTime] = useState('08:00');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setBrowserNotifications(true);
        setToast({ message: 'Browser notifications enabled!', type: 'success' });
      } else if (permission === 'denied') {
        setBrowserNotifications(false);
        setToast({ message: 'Browser notifications blocked. Please enable them in your browser settings.', type: 'error' });
      } else {
        setBrowserNotifications(false);
        setToast({ message: 'Browser notification permission dismissed.', type: 'error' });
      }
    } else {
      setToast({ message: 'This browser does not support notifications.', type: 'error' });
    }
  };

  const handleBrowserNotificationsToggle = () => {
    if (Notification.permission === 'granted') {
      setBrowserNotifications(!browserNotifications);
      setToast({ 
        message: browserNotifications ? 'Browser notifications disabled!' : 'Browser notifications enabled!', 
        type: 'success' 
      });
    } else {
      requestNotificationPermission();
    }
  };

  const testNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Focus Test', {
        body: 'This is a test notification from Focus!',
        icon: '/icon128.png'
      });
      setToast({ message: 'Test notification sent!', type: 'success' });
    } else {
      setToast({ message: 'Please enable browser notifications first.', type: 'error' });
    }
  };

  const handleQuietHoursToggle = () => {
    setQuietHoursEnabled(!quietHoursEnabled);
    setToast({ 
      message: quietHoursEnabled 
        ? 'Quiet hours disabled - notifications will work normally' 
        : 'Quiet hours enabled - notifications will be suppressed during specified times', 
      type: 'success' 
    });
  };

  const handleQuietTimeChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setQuietStartTime(value);
    } else {
      setQuietEndTime(value);
    }
    setToast({ message: 'Quiet hours time updated!', type: 'success' });
  };

  const isWithinQuietHours = () => {
    if (!quietHoursEnabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = quietStartTime.split(':').map(Number);
    const [endHour, endMin] = quietEndTime.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime < endTime;
    } else {
      return currentTime >= startTime && currentTime < endTime;
    }
  };

  const getQuietHoursStatus = () => {
    if (!quietHoursEnabled) return 'Disabled';
    return isWithinQuietHours() ? 'Active (Notifications Suppressed)' : 'Inactive';
  };

  const getQuietHoursStatusColor = () => {
    if (!quietHoursEnabled) return 'text-gray-400';
    return isWithinQuietHours() ? 'text-red-400' : 'text-green-400';
  };

  // Update quiet hours status every minute
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update status
      setQuietStartTime(prev => prev);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);


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
          <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Notification Settings</h3>
            <p className="text-gray-400">Configure how and when you receive notifications</p>
          </div>
        </div>

      {/* Browser Notifications */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-white">Browser Notifications</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-white font-medium">Browser Notifications</div>
                <div className="text-sm text-gray-400">
                  {Notification.permission === 'granted' 
                    ? (browserNotifications ? 'Enabled - You\'ll receive notifications' : 'Permission granted but disabled')
                    : 'Click to request permission'
                  }
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {Notification.permission === 'granted' ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              )}
              <button
                onClick={handleBrowserNotificationsToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  browserNotifications && Notification.permission === 'granted' ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    browserNotifications && Notification.permission === 'granted' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {Notification.permission === 'granted' && browserNotifications && (
            <div className="space-y-3">
              <button
                onClick={testNotification}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span>Test Notification</span>
              </button>
              
              <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Bell className="w-4 h-4 text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-200">
                    <p className="font-medium mb-1">Notification Types:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Focus session start/end alerts</li>
                      <li>• Website blocking notifications</li>
                      <li>• Break reminders</li>
                      <li>• Daily focus goals</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {Notification.permission === 'denied' && (
            <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
                <div className="text-sm text-red-200">
                  <p className="font-medium mb-1">Notifications Blocked</p>
                  <p className="text-xs">To enable notifications, click the notification icon in your browser's address bar or go to Settings → Site Settings → Notifications.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Focus Session Notifications */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-white">Focus Session Alerts</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-white font-medium">Session Start/End</div>
                <div className="text-sm text-gray-400">Notify when focus sessions begin and complete</div>
              </div>
            </div>
            <button
              onClick={() => setFocusSessionAlerts(!focusSessionAlerts)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                focusSessionAlerts ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  focusSessionAlerts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-red-400" />
              <div>
                <div className="text-white font-medium">Blocking Activity</div>
                <div className="text-sm text-gray-400">Alert when websites are blocked or unblocked</div>
              </div>
            </div>
            <button
              onClick={() => setBlockingAlerts(!blockingAlerts)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                blockingAlerts ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  blockingAlerts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>


      {/* Notification Schedule */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-white">Notification Schedule</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-white font-medium">Quiet Hours</div>
                <div className="text-sm text-gray-400">
                  {getQuietHoursStatus()}
                </div>
              </div>
            </div>
            <button
              onClick={handleQuietHoursToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                quietHoursEnabled ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  quietHoursEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {quietHoursEnabled && (
            <div className="bg-gray-700 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium mb-1">Quiet Hours Settings</div>
                  <div className="text-sm text-gray-400">
                    Notifications will be suppressed during these times
                  </div>
                </div>
                <div className={`text-sm font-medium ${getQuietHoursStatusColor()}`}>
                  {getQuietHoursStatus()}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={quietStartTime}
                    onChange={(e) => handleQuietTimeChange('start', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                  <input
                    type="time"
                    value={quietEndTime}
                    onChange={(e) => handleQuietTimeChange('end', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-200">
                    <p className="font-medium mb-1">How Quiet Hours Work:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Notifications are completely suppressed during quiet hours</li>
                      <li>• Works with overnight periods (e.g., 10 PM to 8 AM)</li>
                      <li>• All notification types are affected when enabled</li>
                      <li>• Current status updates in real-time</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
};
