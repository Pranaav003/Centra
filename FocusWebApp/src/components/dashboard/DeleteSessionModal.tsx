import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, AlertCircle } from 'lucide-react';

interface FocusSession {
  _id: string;
  title: string;
  startTime: string;
  actualTime: number;
}

interface DeleteSessionModalProps {
  session: FocusSession | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (sessionId: string) => Promise<void>;
}

export const DeleteSessionModal: React.FC<DeleteSessionModalProps> = ({
  session,
  isOpen,
  onClose,
  onDelete,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (!session || confirmText !== 'DELETE') return;

    try {
      setIsLoading(true);
      setError(null);
      await onDelete(session._id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
    } finally {
      setIsLoading(false);
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

  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-red-800 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-red-800">
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Trash2 className="w-5 h-5 text-red-400" />
            <span>Delete Session</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Warning Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </div>

          {/* Warning Message */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-white mb-2">
              Are you sure you want to delete this session?
            </h3>
            <p className="text-gray-300 text-sm">
              This action cannot be undone. All session data will be permanently removed.
            </p>
          </div>

          {/* Session Details */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Session Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Title:</span>
                <span className="text-white font-medium">{session.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date:</span>
                <span className="text-white">
                  {new Date(session.startTime).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Focus Time:</span>
                <span className="text-white font-medium text-blue-400">
                  {formatTime(session.actualTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type <span className="text-red-400 font-mono">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-center"
              placeholder="DELETE"
            />
          </div>

          {/* Additional Warning */}
          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-3 mb-6">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-yellow-200 text-sm">
                <strong>Note:</strong> This will also remove this session from your focus statistics and charts.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-lg hover:border-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading || confirmText !== 'DELETE'}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isLoading ? 'Deleting...' : 'Delete Session'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
