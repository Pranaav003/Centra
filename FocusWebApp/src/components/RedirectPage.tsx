import React, { useState, useEffect } from 'react';

interface RedirectPageProps {
  blockedSite?: string;
  redirectUrl?: string;
}

const RedirectPage: React.FC<RedirectPageProps> = ({ blockedSite, redirectUrl }) => {
  const [timeSaved, setTimeSaved] = useState(0);
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load time saved from localStorage and refresh periodically
  useEffect(() => {
    const updateTimeSaved = () => {
      const today = new Date().toDateString();
      const lastResetDate = localStorage.getItem('timeSavedResetDate');
      
      // Reset time saved if it's a new day
      if (lastResetDate !== today) {
        localStorage.setItem('timeSavedByBlocking', '0');
        localStorage.setItem('timeSavedResetDate', today);
        setTimeSaved(0);
        return;
      }
      
      const savedTime = localStorage.getItem('timeSavedByBlocking');
      if (savedTime) {
        setTimeSaved(JSON.parse(savedTime));
      }
    };
    
    // Update immediately
    updateTimeSaved();
    
    // Update every 5 seconds to catch any changes
    const interval = setInterval(updateTimeSaved, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Generate motivational messages based on time of day
  useEffect(() => {
    const hour = currentTime.getHours();
    let message = '';

    if (hour >= 6 && hour < 12) {
      message = 'Good morning! Start your day with focus and purpose.';
    } else if (hour >= 12 && hour < 17) {
      message = 'Afternoon focus time! You\'re building momentum.';
    } else if (hour >= 17 && hour < 21) {
      message = 'Evening productivity! Finish strong today.';
    } else {
      message = 'Late night focus! Your dedication is inspiring.';
    }

    setMotivationalMessage(message);
  }, [currentTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleContinueFocus = () => {
    // Redirect to the main Focus app
    window.location.href = '/dashboard';
  };

  const handleTakeBreak = () => {
    // Redirect to a break page or allow temporary access
    window.location.href = '/break';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-red-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Header */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Site Blocked</h1>
          <p className="text-gray-300 text-lg">
            {blockedSite ? `"${blockedSite}" is blocked during focus time` : 'This site is blocked during focus time'}
          </p>
        </div>

        {/* Motivational Message */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
          <p className="text-white text-xl font-medium mb-2">{motivationalMessage}</p>
          <p className="text-gray-300">
            You're building better habits and protecting your focus time.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {formatTime(timeSaved)}
            </div>
            <div className="text-gray-300 text-sm">Time Saved Today</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {new Date().toLocaleDateString()}
            </div>
            <div className="text-gray-300 text-sm">Today's Date</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-gray-300 text-sm">Current Time</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleContinueFocus}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Continue Focusing
          </button>
          
          <button
            onClick={handleTakeBreak}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Take a Break
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-gray-400 text-sm">
          <p>Powered by Centra - Your productivity companion</p>
        </div>
      </div>
    </div>
  );
};

export default RedirectPage;
