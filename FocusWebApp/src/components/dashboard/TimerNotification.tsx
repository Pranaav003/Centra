import React, { useEffect, useState } from 'react';
import { Bell, X, CheckCircle, Clock, Target } from 'lucide-react';

interface TimerNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  sessionTitle: string;
  duration: number;
  type: 'completed' | 'paused' | 'interrupted';
}

export const TimerNotification: React.FC<TimerNotificationProps> = ({
  isVisible,
  onClose,
  sessionTitle,
  duration,
  type,
}) => {

  useEffect(() => {
    if (isVisible) {
      playNotificationSound();
      
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const playNotificationSound = () => {
    try {
      // Create a gentle notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Gentle chime sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio not supported, using fallback');
    }
  };

  const getNotificationContent = () => {
    switch (type) {
      case 'completed':
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-400" />,
          title: 'Session Completed! 🎉',
          message: `Great job completing "${sessionTitle}"!`,
          bgColor: 'bg-green-900/20 border-green-800',
          textColor: 'text-green-200',
        };
      case 'paused':
        return {
          icon: <Clock className="w-6 h-6 text-yellow-400" />,
          title: 'Session Paused ⏸️',
          message: `"${sessionTitle}" has been paused. Take a break!`,
          bgColor: 'bg-yellow-900/20 border-yellow-800',
          textColor: 'text-yellow-200',
        };
      case 'interrupted':
        return {
          icon: <Target className="w-6 h-6 text-red-400" />,
          title: 'Session Interrupted ⚠️',
          message: `"${sessionTitle}" was interrupted. Don't worry, you can resume later!`,
          bgColor: 'bg-red-900/20 border-red-800',
          textColor: 'text-red-200',
        };
      default:
        return {
          icon: <Bell className="w-6 h-6 text-blue-400" />,
          title: 'Timer Finished',
          message: `"${sessionTitle}" timer has finished.`,
          bgColor: 'bg-blue-900/20 border-blue-800',
          textColor: 'text-blue-200',
        };
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds === 0) return '0s';
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

  if (!isVisible) return null;

  const content = getNotificationContent();

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-2 duration-300">
      <div className={`${content.bgColor} border rounded-2xl shadow-2xl p-6 max-w-sm`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {content.icon}
            <h3 className={`text-lg font-semibold ${content.textColor}`}>
              {content.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className={`text-sm ${content.textColor} mb-3`}>
            {content.message}
          </p>
          <div className="bg-black/20 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Session Duration:</span>
              <span className="font-medium text-white">{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-2 ${content.textColor} border border-current rounded-lg hover:bg-white/10 transition-colors text-sm font-medium`}
          >
            Dismiss
          </button>
          {type === 'completed' && (
            <button
              onClick={() => {
                // TODO: Navigate to session summary or start new session
                onClose();
              }}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Start New
            </button>
          )}
        </div>

        {/* Auto-dismiss indicator */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="text-xs text-gray-400 text-center">
            This notification will auto-dismiss in 5 seconds
          </div>
        </div>
      </div>
    </div>
  );
};
