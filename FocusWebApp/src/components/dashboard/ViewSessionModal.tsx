import React, { useState, useEffect } from 'react';
import { X, Clock, Target, FileText, Tag, Calendar, TrendingUp, CheckCircle, XCircle, Pause, Eye } from 'lucide-react';

interface FocusSession {
  _id: string;
  title: string;
  description?: string;
  goal: number;
  actualTime: number;
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed' | 'paused' | 'abandoned' | 'interrupted';
  tags?: string[];
  productivity: number;
}

interface ViewSessionModalProps {
  session: FocusSession | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ViewSessionModal: React.FC<ViewSessionModalProps> = ({
  session,
  isOpen,
  onClose,
}) => {
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if clicking on a tooltip label
      const target = event.target as HTMLElement;
      if (target.closest('[data-tooltip]')) {
        return;
      }
      setOpenTooltip(null);
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  if (!isOpen || !session) return null;

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

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    return formatTime(diffSeconds);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'paused':
        return <Pause className="w-5 h-5 text-yellow-400" />;
      case 'interrupted':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-900/20 border-green-800';
      case 'paused':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
      case 'interrupted':
        return 'text-red-400 bg-red-900/20 border-red-800';
      default:
        return 'text-blue-400 bg-blue-900/20 border-blue-800';
    }
  };

  const getProductivityColor = (productivity?: number) => {
    if (!productivity) return 'text-gray-400';
    if (productivity >= 80) return 'text-green-400';
    if (productivity >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Eye className="w-5 h-5 text-blue-400" />
            <span>Session Details</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title and Status */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-2">{session.title}</h1>
              {session.description && (
                <p className="text-gray-300 text-lg">{session.description}</p>
              )}
            </div>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(session.status)}`}>
              {getStatusIcon(session.status)}
              <span className="capitalize">{session.status}</span>
            </div>
          </div>

          {/* Goal */}
          {session.goal && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-medium text-white">Goal</h3>
              </div>
              <p className="text-gray-300">{session.goal}</p>
            </div>
          )}

          {/* Time Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-medium text-white">Time Details</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Start Time:</span>
                  <span className="text-white">{new Date(session.startTime).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">End Time:</span>
                  <span className="text-white">{new Date(session.endTime).toLocaleString()}</span>
                </div>
                <div className="flex justify-between group relative">
                  <div className="relative">
                    <span 
                      className="text-gray-400 cursor-pointer hover:text-gray-300 transition-colors"
                      data-tooltip="duration"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenTooltip(openTooltip === 'duration' ? null : 'duration');
                      }}
                    >
                      Total Duration:
                    </span>
                    {openTooltip === 'duration' && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10 border border-gray-700">
                        Start to finish time
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </div>
                  <span className="text-white font-medium">{formatDuration(session.startTime, session.endTime)}</span>
                </div>
                <div className="flex justify-between group relative">
                  <div className="relative">
                    <span 
                      className="text-gray-400 cursor-pointer hover:text-gray-300 transition-colors"
                      data-tooltip="focusTime"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenTooltip(openTooltip === 'focusTime' ? null : 'focusTime');
                      }}
                    >
                      Focus Time:
                    </span>
                    {openTooltip === 'focusTime' && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10 border border-gray-700">
                        Actual focused time
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </div>
                  <span className="text-white font-medium text-blue-400">{formatTime(session.actualTime)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-medium text-white">Performance</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between group relative">
                  <div className="relative">
                    <span 
                      className="text-gray-400 cursor-pointer hover:text-gray-300 transition-colors"
                      data-tooltip="productivity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenTooltip(openTooltip === 'productivity' ? null : 'productivity');
                      }}
                    >
                      Productivity:
                    </span>
                    {openTooltip === 'productivity' && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10 border border-gray-700">
                        Goal achievement (60%) + Efficiency (40%)
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </div>
                  <span className={`font-medium ${getProductivityColor(session.productivity)}`}>
                    {(() => {
                      // Calculate productivity based on goal achievement and efficiency
                      const goalAchievement = session.goal > 0 ? Math.min((session.actualTime / (session.goal * 60)) * 100, 100) : 0;
                      const totalDurationMs = new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
                      const totalDurationSeconds = totalDurationMs / 1000;
                      const efficiency = totalDurationSeconds > 0 ? (session.actualTime / totalDurationSeconds) * 100 : 0;
                      
                      // Productivity = 60% goal achievement + 40% efficiency
                      const calculatedProductivity = Math.round((goalAchievement * 0.6) + (efficiency * 0.4));
                      return `${calculatedProductivity}%`;
                    })()}
                  </span>
                </div>
                <div className="flex justify-between group relative">
                  <div className="relative">
                    <span 
                      className="text-gray-400 cursor-pointer hover:text-gray-300 transition-colors"
                      data-tooltip="efficiency"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenTooltip(openTooltip === 'efficiency' ? null : 'efficiency');
                      }}
                    >
                      Efficiency:
                    </span>
                    {openTooltip === 'efficiency' && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10 border border-gray-700">
                        Focus time ÷ Total session time
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </div>
                  <span className="text-white font-medium">
                    {(() => {
                      const totalDurationMs = new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
                      const totalDurationSeconds = totalDurationMs / 1000;
                      const efficiency = totalDurationSeconds > 0 ? (session.actualTime / totalDurationSeconds) * 100 : 0;
                      return `${Math.round(efficiency)}%`;
                    })()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Session ID:</span>
                  <span className="text-white font-mono text-xs">{session._id.slice(-8)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {session.tags && session.tags.length > 0 && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Tag className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-medium text-white">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {session.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-900/30 border border-blue-800 text-blue-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {session.notes && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-medium text-white">Notes</h3>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap">{session.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end pt-4 border-t border-gray-800">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
