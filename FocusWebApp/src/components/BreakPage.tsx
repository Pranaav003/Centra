import React, { useState, useEffect } from 'react';

const BreakPage: React.FC = () => {
  const [breakTime, setBreakTime] = useState(0);
  const [isBreakActive, setIsBreakActive] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (isBreakActive) {
        setBreakTime(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isBreakActive]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startBreak = () => {
    setIsBreakActive(true);
    setBreakTime(0);
  };

  const endBreak = () => {
    setIsBreakActive(false);
    // Redirect back to dashboard
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-gray-900 to-green-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Header */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Break Time</h1>
          <p className="text-gray-300 text-lg">
            Take a well-deserved break and recharge your focus
          </p>
        </div>

        {/* Break Timer */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-8">
          <div className="text-6xl font-bold text-green-400 mb-4">
            {formatTime(breakTime)}
          </div>
          <p className="text-gray-300">
            {isBreakActive ? 'Break in progress...' : 'Ready to start your break?'}
          </p>
        </div>

        {/* Break Tips */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
          <h3 className="text-white font-semibold mb-4">Break Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="text-gray-300">
              <div className="font-medium text-white mb-1">• Stretch your body</div>
              <div className="text-sm">Take a short walk or do some light stretching</div>
            </div>
            <div className="text-gray-300">
              <div className="font-medium text-white mb-1">• Hydrate</div>
              <div className="text-sm">Drink some water to stay refreshed</div>
            </div>
            <div className="text-gray-300">
              <div className="font-medium text-white mb-1">• Look away from screen</div>
              <div className="text-sm">Give your eyes a rest from the screen</div>
            </div>
            <div className="text-gray-300">
              <div className="font-medium text-white mb-1">• Breathe deeply</div>
              <div className="text-sm">Take a few deep breaths to relax</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {!isBreakActive ? (
            <button
              onClick={startBreak}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Start Break
            </button>
          ) : (
            <button
              onClick={endBreak}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              End Break & Return to Focus
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-gray-400 text-sm">
          <p>Remember: Breaks are essential for sustained productivity</p>
        </div>
      </div>
    </div>
  );
};

export default BreakPage;
