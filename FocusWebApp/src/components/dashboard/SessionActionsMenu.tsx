import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Trash2, Copy, Eye } from 'lucide-react';

interface FocusSession {
  _id: string;
  title: string;
  description: string;
  goal: number;
  actualTime: number;
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed' | 'paused' | 'abandoned' | 'interrupted';
  tags: string[];
  productivity: number;
}

interface SessionActionsMenuProps {
  session: FocusSession;
  onEdit: (session: FocusSession) => void;
  onDelete: (session: FocusSession) => void;
  onView: (session: FocusSession) => void;
  onCopy?: () => void;
}

export const SessionActionsMenu: React.FC<SessionActionsMenuProps> = ({
  session,
  onEdit,
  onDelete,
  onView,
  onCopy,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  const copySessionInfo = () => {
    const sessionInfo = `
Focus Session: ${session.title}
Date: ${new Date(session.startTime).toLocaleDateString()}
Time: ${new Date(session.startTime).toLocaleTimeString()}${session.endTime ? ` - ${new Date(session.endTime).toLocaleTimeString()}` : ''}
Duration: ${Math.floor(session.actualTime / 3600)}h ${Math.floor((session.actualTime % 3600) / 60)}m
Status: ${session.status}
${session.description ? `Description: ${session.description}` : ''}
Goal: ${session.goal} minutes
${session.tags?.length ? `Tags: ${session.tags.join(', ')}` : ''}
Productivity: ${session.productivity || 'N/A'}
    `.trim();

    navigator.clipboard.writeText(sessionInfo);
    if (onCopy) {
      onCopy();
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        aria-label="Session actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-2xl z-40 py-1">
          {/* View Session */}
          <button
            onClick={() => handleAction(() => onView(session))}
            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </button>

          {/* Edit Session */}
          <button
            onClick={() => handleAction(() => onEdit(session))}
            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Session</span>
          </button>

          {/* Copy Session Info */}
          <button
            onClick={() => handleAction(copySessionInfo)}
            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <Copy className="w-4 h-4" />
            <span>Copy Info</span>
          </button>

          {/* Divider */}
          <div className="border-t border-gray-700 my-1" />

          {/* Delete Session */}
          <button
            onClick={() => handleAction(() => onDelete(session))}
            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Session</span>
          </button>
        </div>
      )}
    </div>
  );
};
