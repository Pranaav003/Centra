import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900/20 border-green-800 text-green-200';
      case 'error':
        return 'bg-red-900/20 border-red-800 text-red-200';
      case 'info':
        return 'bg-blue-900/20 border-blue-800 text-blue-200';
      default:
        return 'bg-blue-900/20 border-blue-800 text-blue-200';
    }
  };

  return (
    <div className={`fixed top-20 right-4 z-40 animate-in slide-in-from-right-2 duration-300`}>
      <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg border ${getBackgroundColor()} shadow-lg max-w-sm`}>
        {getIcon()}
        <span className="flex-1 text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
