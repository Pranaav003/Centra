import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Square, RotateCcw, CheckCircle } from 'lucide-react';

interface FocusSession {
  _id: string;
  title: string;
  description?: string;
  goal: number;
  actualTime: number;
  startTime: string;
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  tags: string[];
}

interface ActiveSessionTimerProps {
  session: FocusSession;
  onPause: (sessionId: string) => Promise<void>;
  onResume: (sessionId: string) => Promise<void>;
  onComplete: (sessionId: string, actualTime: number) => Promise<void>;
  onAbandon: (sessionId: string) => Promise<void>;
}

export const ActiveSessionTimer: React.FC<ActiveSessionTimerProps> = ({
  session,
  onPause,
  onResume,
  onComplete,
  onAbandon,
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isAbandoning, setIsAbandoning] = useState(false);

  // Calculate progress
  const progress = Math.min((timeElapsed / session.goal) * 100, 100);
  const remainingTime = Math.max(session.goal - timeElapsed, 0);

  // Format time display
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes % 1) * 60);
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer effect
  useEffect(() => {
    if (!isPaused && session.status === 'active') {
      const interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1/60); // Increment by 1 second (1/60 minute)
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPaused, session.status]);

  // Handle pause/resume
  const handlePauseResume = useCallback(async () => {
    try {
      if (isPaused) {
        await onResume(session._id);
        setIsPaused(false);
      } else {
        await onPause(session._id);
        setIsPaused(true);
      }
    } catch (error) {
      console.error('Failed to pause/resume session:', error);
    }
  }, [isPaused, onPause, onResume, session._id]);

  // Handle complete
  const handleComplete = useCallback(async () => {
    try {
      setIsCompleting(true);
      await onComplete(session._id, timeElapsed);
    } catch (error) {
      console.error('Failed to complete session:', error);
      setIsCompleting(false);
    }
  }, [onComplete, session._id, timeElapsed]);

  // Handle abandon
  const handleAbandon = useCallback(async () => {
    try {
      setIsAbandoning(true);
      await onAbandon(session._id);
    } catch (error) {
      console.error('Failed to abandon session:', error);
      setIsAbandoning(false);
    }
  }, [onAbandon, session._id]);

  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 shadow-2xl">
      {/* Session Info */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{session.title}</h3>
            {session.description && (
              <p className="text-gray-400 text-sm mb-3">{session.description}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {session.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-800 text-gray-300 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-400">
              {formatTime(remainingTime)}
            </div>
            <div className="text-sm text-gray-500">remaining</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-white bg-[#1a1a1a] px-2">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-6">
        <div className="text-6xl font-bold text-white mb-2 font-mono">
          {formatTime(timeElapsed)}
        </div>
        <div className="text-gray-400 text-sm">
          of {session.goal} minutes
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        {/* Pause/Resume Button */}
        <button
          onClick={handlePauseResume}
          disabled={isCompleting || isAbandoning}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100"
        >
          {isPaused ? (
            <>
              <Play className="w-5 h-5" />
              <span>Resume</span>
            </>
          ) : (
            <>
              <Pause className="w-5 h-5" />
              <span>Pause</span>
            </>
          )}
        </button>

        {/* Complete Button */}
        <button
          onClick={handleComplete}
          disabled={isCompleting || isAbandoning}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100"
        >
          {isCompleting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Completing...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Complete</span>
            </>
          )}
        </button>

        {/* Abandon Button */}
        <button
          onClick={handleAbandon}
          disabled={isCompleting || isAbandoning}
          className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100"
        >
          {isAbandoning ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Abandoning...</span>
            </>
          ) : (
            <>
              <Square className="w-5 h-5" />
              <span>Abandon</span>
            </>
          )}
        </button>
      </div>

      {/* Session Stats */}
      <div className="mt-6 pt-6 border-t border-gray-800">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{Math.round(progress)}%</div>
            <div className="text-xs text-gray-500">Progress</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">{formatTime(timeElapsed)}</div>
            <div className="text-xs text-gray-500">Elapsed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{formatTime(remainingTime)}</div>
            <div className="text-xs text-gray-500">Remaining</div>
          </div>
        </div>
      </div>
    </div>
  );
};
