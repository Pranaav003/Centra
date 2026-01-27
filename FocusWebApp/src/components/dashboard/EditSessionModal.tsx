import React, { useState, useEffect } from 'react';
import { X, Save, Clock, Target, FileText, Tag, Edit } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const editSessionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  goal: z.number().min(1, 'Goal must be at least 1 minute').max(480, 'Goal cannot exceed 8 hours'),
  actualTime: z.number().min(1, 'Actual time must be at least 1 minute').max(480, 'Actual time cannot exceed 8 hours'),
  tags: z.string().max(200, 'Tags must be less than 200 characters').optional(),
});

type EditSessionFormData = z.infer<typeof editSessionSchema>;

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

interface EditSessionModalProps {
  session: FocusSession | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (sessionId: string, updatedData: Partial<EditSessionFormData>) => Promise<void>;
}

export const EditSessionModal: React.FC<EditSessionModalProps> = ({
  session,
  isOpen,
  onClose,
  onSave,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditSessionFormData>({
    resolver: zodResolver(editSessionSchema),
    defaultValues: {
      title: '',
      description: '',
      goal: 0,
      actualTime: 0,
      tags: '',
    },
  });

  // Reset form when session changes
  useEffect(() => {
    if (session) {
      reset({
        title: session.title,
        description: session.description || '',
        goal: session.goal || 0,
        actualTime: session.actualTime,
        tags: session.tags?.join(', ') || '',
      });
      setError(null);
    }
  }, [session, reset]);

  const onSubmit = async (data: EditSessionFormData) => {
    if (!session) return;

    try {
      setIsLoading(true);
      setError(null);

      // Convert tags string back to array
      const updatedData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      };

      await onSave(session._id, updatedData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        reset();
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Edit className="w-5 h-5 text-blue-400" />
            <span>Edit Focus Session</span>
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Session Title *
            </label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                {...register('title')}
                type="text"
                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What are you focusing on?"
              />
            </div>
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <textarea
                {...register('description')}
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Brief description of your focus session..."
              />
            </div>
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
            )}
          </div>

          {/* Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Goal (minutes) *
            </label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                {...register('goal', { valueAsNumber: true })}
                type="number"
                min="1"
                max="480"
                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="How many minutes do you want to focus?"
              />
            </div>
            {errors.goal && (
              <p className="mt-1 text-sm text-red-400">{errors.goal.message}</p>
            )}
          </div>

          {/* Actual Time */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Actual Time (minutes) *
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                {...register('actualTime', { valueAsNumber: true })}
                type="number"
                min="1"
                max="480"
                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="How long did you actually focus?"
              />
            </div>
            {errors.actualTime && (
              <p className="mt-1 text-sm text-red-400">{errors.actualTime.message}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                {...register('tags')}
                type="text"
                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="work, coding, study (comma separated)"
              />
            </div>
            {errors.tags && (
              <p className="mt-1 text-sm text-red-400">{errors.tags.message}</p>
            )}
          </div>



          {/* Session Info (Read-only) */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Session Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Start Time:</span>
                <p className="text-white">{new Date(session.startTime).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-400">End Time:</span>
                <p className="text-white">{new Date(session.endTime).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-400">Status:</span>
                <p className="text-white capitalize">{session.status}</p>
              </div>
              <div>
                <span className="text-gray-400">Session ID:</span>
                <p className="text-white font-mono text-xs">{session._id.slice(-8)}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-lg hover:border-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !isDirty}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
