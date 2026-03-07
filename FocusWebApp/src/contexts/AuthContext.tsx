import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from '../config/api';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  subscription: {
    plan: 'free' | 'basic' | 'premium';
    status: string;
  };
  focusStats: {
    totalFocusTime: number;
    totalSessions: number;
    longestSession: number;
    currentStreak: number;
  };
  preferences: {
    dailyGoal: number;
    notifications: boolean;
    theme: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    // Check if user is logged in on app start
    if (token) {
      // Validate token with backend and keep user logged in
      validateToken();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsLoading(false);
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Token validation error:', error);
      // On network errors, clear the token to force re-authentication
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  // Debug logging
  useEffect(() => {
    console.log('AuthContext state changed:', { user, token, isLoading, error });
  }, [user, token, isLoading, error]);

  const login = async (email: string, password: string) => {
    try {
      // Removed console.log to avoid logging sensitive information
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      setError(null);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Pause all running timers before logging out
    pauseAllTimers();
    
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    setError(null);
  };

  const deleteAccount = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/auth/account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete account');
      }
      logout();
    } catch (err) {
      console.error('Delete account error:', err);
      throw err;
    }
  };

  const pauseAllTimers = () => {
    // Find all timer keys in localStorage and pause them
    const timerKeys = Object.keys(localStorage).filter(key => key.startsWith('timer_'));
    
    timerKeys.forEach(key => {
      try {
        const timerState = JSON.parse(localStorage.getItem(key) || '{}');
        if (timerState && !timerState.isPaused) {
          // Mark timer as paused
          timerState.isPaused = true;
          timerState.pausedTime = timerState.totalElapsed;
          localStorage.setItem(key, JSON.stringify(timerState));
        }
      } catch (error) {
        console.error('Error pausing timer:', error);
      }
    });
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    signup,
    logout,
    deleteAccount,
    isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
