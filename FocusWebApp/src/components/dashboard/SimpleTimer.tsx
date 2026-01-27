import React, { useState, useEffect } from 'react';
import { useTimer } from 'react-timer-hook';
import { Play, Pause, RotateCcw, Square, Target, Clock } from 'lucide-react';

interface SimpleTimerProps {
  session: {
    _id: string;
    title: string;
    goal: number;
    startTime: string;
  };
  onPause: (sessionId: string, duration: number) => Promise<void>;
  onResume: (sessionId: string) => Promise<void>;
  onComplete: (sessionId: string, actualTime: number) => Promise<void>;
  onAbandon: (sessionId: string, duration: number) => Promise<void>;
}

export const SimpleTimer: React.FC<SimpleTimerProps> = ({
  session,
  onPause,
  onResume,
  onComplete,
  onAbandon,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGoalReached, setShowGoalReached] = useState(false);
  const [hasReachedGoal, setHasReachedGoal] = useState(false);

  // Calculate goal time early to avoid hoisting issues
  const goalTime = session.goal * 60; // Convert minutes to seconds

  // State validation function
  const validateTimerState = () => {
    const isValid = !(isRunning && isPaused);
    if (!isValid) {
      console.warn('⚠️ Invalid timer state detected:', { isRunning, isPaused, totalElapsed });
      // Auto-correct invalid state
      if (isRunning && isPaused) {
        console.log('🔄 Auto-correcting invalid state: setting isPaused to false');
        setIsPaused(false);
      }
    }
    return isValid;
  };

  // Play goal reached sound
  const playGoalReachedSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Victory chime sound (ascending notes)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);
      oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.4);

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.6);
    } catch (error) {
      console.log('Audio not supported, using fallback');
    }
  };

  // Create a timer that expires in 24 hours (we'll control it manually)
  const expiryTimestamp = new Date();
  expiryTimestamp.setHours(expiryTimestamp.getHours() + 24);

  const {
    seconds,
    minutes,
    hours,
    isRunning,
    start,
    pause,
    resume,
    restart,
  } = useTimer({
    expiryTimestamp,
    onExpire: () => console.log('Timer expired'),
    autoStart: false,
  });

  // Load saved state on mount
  useEffect(() => {
    const savedState = localStorage.getItem(`timer_${session._id}`);
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.isPaused && state.totalElapsed > 0) {
          // Restore paused timer
          setTotalElapsed(state.totalElapsed);
          setIsPaused(true);
          // Set the timer to the saved elapsed time
          const newExpiry = new Date();
          newExpiry.setSeconds(newExpiry.getSeconds() + state.totalElapsed);
          restart(newExpiry, false);
        } else if (state.totalElapsed > 0) {
          // Restore running timer
          setTotalElapsed(state.totalElapsed);
          const newExpiry = new Date();
          newExpiry.setSeconds(newExpiry.getSeconds() + state.totalElapsed);
          restart(newExpiry, true);
        }
      } catch (error) {
        console.error('Error loading timer state:', error);
        localStorage.removeItem(`timer_${session._id}`);
      }
    }
  }, [session._id, restart]);

  // Save state whenever it changes
  useEffect(() => {
    if (totalElapsed > 0 || isPaused) {
      const state = {
        sessionId: session._id,
        totalElapsed: totalElapsed,
        isPaused: isPaused,
        timestamp: Date.now(),
      };
      localStorage.setItem(`timer_${session._id}`, JSON.stringify(state));
      
      // Log state changes for debugging
      console.log('💾 Timer state saved:', state);
    }
  }, [session._id, totalElapsed, isPaused]);

  // Update total elapsed time and check goal completion
  useEffect(() => {
    if (isRunning && !isPaused) {
      const interval = setInterval(() => {
        setTotalElapsed(prev => {
          const newTotal = prev + 1;
          
          // Check if goal is reached
          if (newTotal >= goalTime && !hasReachedGoal) {
            console.log('🎯 Goal reached! Stopping timer...');
            setHasReachedGoal(true);
            setShowGoalReached(true);
            pause(); // Stop the timer
            setIsPaused(false); // Reset pause state since we're stopping
            playGoalReachedSound();
          }
          
          // Validate state every 10 seconds
          if (newTotal % 10 === 0) {
            validateTimerState();
          }
          
          return newTotal;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRunning, isPaused, goalTime, hasReachedGoal]);

  const handleStart = () => {
    if (!isRunning) {
      start();
      setIsPaused(false);
    }
  };

  const handlePause = async () => {
    if (isProcessing) {
      console.log('Pause blocked - already processing');
      return;
    }
    
    console.log('🔄 Pause requested - Timer state:', {
      isRunning,
      isPaused,
      totalElapsed,
      sessionId: session._id
    });
    
    try {
      setIsProcessing(true);
      await onPause(session._id, totalElapsed);
      pause();
      setIsPaused(true);
      console.log('✅ Timer paused successfully - New state:', {
        isRunning: false,
        isPaused: true,
        totalElapsed
      });
    } catch (error) {
      console.error('❌ Error pausing session:', error);
      // Don't change timer state if backend call failed
      console.log('⚠️ Timer state unchanged due to backend error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResume = async () => {
    if (isProcessing) {
      console.log('Resume blocked - already processing');
      return;
    }
    
    console.log('🔄 Resume requested - Timer state:', {
      isRunning,
      isPaused,
      totalElapsed,
      sessionId: session._id
    });
    
    try {
      setIsProcessing(true);
      await onResume(session._id);
      resume();
      setIsPaused(false);
      console.log('✅ Timer resumed successfully - New state:', {
        isRunning: true,
        isPaused: false,
        totalElapsed
      });
    } catch (error) {
      console.error('❌ Error resuming session:', error);
      // Don't change timer state if backend call failed
      console.log('⚠️ Timer state unchanged due to backend error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      await onComplete(session._id, totalElapsed);
      localStorage.removeItem(`timer_${session._id}`);
      console.log('Session completed successfully');
    } catch (error) {
      console.error('Error completing session:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAbandon = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      await onAbandon(session._id, totalElapsed);
      localStorage.removeItem(`timer_${session._id}`);
      console.log('Session abandoned successfully');
    } catch (error) {
      console.error('Error abandoning session:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = Math.min((totalElapsed / goalTime) * 100, 100);

  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Target className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">{session.title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-400">Goal: {formatTime(goalTime)}</span>
        </div>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-6">
        <div className={`text-6xl font-bold font-mono mb-2 ${
          hasReachedGoal ? 'text-green-400' : 'text-white'
        }`}>
          {formatTime(totalElapsed)}
        </div>
        <div className="text-sm text-gray-400">
          {hasReachedGoal 
            ? '🎯 Goal Reached!' 
            : isPaused 
              ? 'Paused' 
              : isRunning 
                ? 'Running' 
                : 'Stopped'
          }
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              hasReachedGoal 
                ? 'bg-gradient-to-r from-green-500 to-green-600 animate-pulse' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        {hasReachedGoal && (
          <div className="text-center mt-2">
            <span className="text-green-400 text-sm font-medium">🎯 Goal Reached!</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center space-x-4">
        {!isRunning && !isPaused && (
          <button
            onClick={handleStart}
            disabled={isProcessing}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center space-x-2"
          >
            <Play className="w-5 h-5" />
            <span>Start</span>
          </button>
        )}

        {isRunning && !isPaused && (
          <button
            onClick={handlePause}
            disabled={isProcessing}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center space-x-2"
          >
            <Pause className="w-5 h-5" />
            <span>Pause</span>
          </button>
        )}

        {isPaused && (
          <button
            onClick={handleResume}
            disabled={isProcessing}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center space-x-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Resume</span>
          </button>
        )}

        <button
          onClick={handleComplete}
          disabled={isProcessing}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center space-x-2"
        >
          <Square className="w-5 h-5" />
          <span>Complete</span>
        </button>

        <button
          onClick={handleAbandon}
          disabled={isProcessing}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center space-x-2"
        >
          <Square className="w-5 h-5" />
          <span>Abandon</span>
        </button>
      </div>

      {/* Session Info */}
      <div className="mt-6 pt-4 border-t border-gray-800">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Started:</span>
            <p className="text-white">{new Date(session.startTime).toLocaleString()}</p>
          </div>
          <div>
            <span className="text-gray-400">Elapsed:</span>
            <p className="text-white">{formatTime(totalElapsed)}</p>
          </div>
        </div>
      </div>

      {/* Goal Reached Modal */}
      {showGoalReached && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-green-500 rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              {/* Success Icon */}
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🎯</span>
              </div>
              
              {/* Title */}
              <h3 className="text-2xl font-bold text-white mb-4">
                Goal Reached! 🎉
              </h3>
              
              {/* Message */}
              <p className="text-gray-300 mb-6">
                Congratulations! You've completed your {formatTime(goalTime)} goal in {formatTime(totalElapsed)}.
              </p>
              
              {/* Stats */}
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-400">Goal:</span>
                    <p className="text-white font-medium">{formatTime(goalTime)}</p>
                  </div>
                  <div>
                    <span className="text-green-400">Actual:</span>
                    <p className="text-white font-medium">{formatTime(totalElapsed)}</p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowGoalReached(false);
                    // Continue the session
                    console.log('🔄 Continuing session beyond goal...');
                  }}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200"
                >
                  Continue
                </button>
                <button
                  onClick={handleComplete}
                  disabled={isProcessing}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-200"
                >
                  Complete
                </button>
              </div>
              
              {/* Close button */}
              <button
                onClick={() => setShowGoalReached(false)}
                className="mt-4 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
