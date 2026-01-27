import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Clock, Tag, FileText, Target, TrendingUp } from 'lucide-react';

const sessionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  goal: z.number().min(5, 'Minimum session time is 5 minutes').max(480, 'Maximum session time is 8 hours'),
  tags: z.array(z.string().min(1, 'Tag cannot be empty').max(20, 'Tag cannot exceed 20 characters')).max(5, 'Maximum 5 tags allowed'),
});

type SessionFormData = z.infer<typeof sessionSchema>;

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSession: (data: SessionFormData) => Promise<void>;
}

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  isOpen,
  onClose,
  onCreateSession,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      title: '',
      description: '',
      goal: 25,
      tags: [],
    },
  });

  const watchedTags = watch('tags');

  const addTag = () => {
    if (tagInput.trim() && watchedTags.length < 5) {
      setValue('tags', [...watchedTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setValue('tags', watchedTags.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const onSubmit = async (data: SessionFormData) => {
    try {
      setIsSubmitting(true);
      await onCreateSession(data);
      reset();
      setShowCustomInput(false);
      onClose();
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset custom input when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setShowCustomInput(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#1a1a1a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create Focus Session</h2>
              <p className="text-sm text-gray-400">Set your goals and get focused</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Session Title *
            </label>
            <div className="relative">
              <input
                {...register('title')}
                type="text"
                className={`w-full px-4 py-3 bg-gray-900 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.title ? 'border-red-500' : 'border-gray-700'
                }`}
                placeholder="What will you focus on?"
              />
              <FileText className="absolute right-3 top-3 w-5 h-5 text-gray-500" />
            </div>
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Add more details about your session..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
            )}
          </div>

          {/* Quick Session Templates */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Quick Templates
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <button
                type="button"
                onClick={() => {
                  setValue('goal', 25);
                  setShowCustomInput(false);
                }}
                className={`group p-3 border rounded-xl transition-all duration-200 hover:scale-105 ${
                  watch('goal') === 25 && !showCustomInput
                    ? 'border-red-500 bg-red-500/10' 
                    : 'border-gray-600 bg-gray-800/50 hover:border-red-500/30'
                }`}
              >
                <div className="text-center">
                  <div className={`w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                    watch('goal') === 25 
                      ? 'bg-red-500/20' 
                      : 'bg-gray-700/50 group-hover:bg-red-500/20'
                  }`}>
                    <Target className={`w-4 h-4 ${
                      watch('goal') === 25 ? 'text-red-400' : 'text-gray-400 group-hover:text-red-400'
                    }`} />
                  </div>
                  <div className={`font-medium text-sm ${
                    watch('goal') === 25 ? 'text-red-400' : 'text-gray-300 group-hover:text-red-400'
                  }`}>
                    Pomodoro
                  </div>
                  <div className="text-xs text-gray-500">25 minutes</div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setValue('goal', 90);
                  setShowCustomInput(false);
                }}
                className={`group p-3 border rounded-xl transition-all duration-200 hover:scale-105 ${
                  watch('goal') === 90 && !showCustomInput
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-gray-600 bg-gray-800/50 hover:border-blue-500/30'
                }`}
              >
                <div className="text-center">
                  <div className={`w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                    watch('goal') === 90 
                      ? 'bg-blue-500/20' 
                      : 'bg-gray-700/50 group-hover:bg-blue-500/20'
                  }`}>
                    <Clock className={`w-4 h-4 ${
                      watch('goal') === 90 ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400'
                    }`} />
                  </div>
                  <div className={`font-medium text-sm ${
                    watch('goal') === 90 ? 'text-blue-400' : 'text-gray-300 group-hover:text-blue-400'
                  }`}>
                    Deep Work
                  </div>
                  <div className="text-xs text-gray-500">90 minutes</div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setValue('goal', 25); // Reset to default
                  setShowCustomInput(true); // Show custom input
                }}
                className={`group p-3 border rounded-xl transition-all duration-200 hover:scale-105 ${
                  showCustomInput 
                    ? 'border-green-500 bg-green-500/10' 
                    : 'border-gray-600 bg-gray-800/50 hover:border-green-500/30'
                }`}
              >
                <div className="text-center">
                  <div className={`w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                    showCustomInput 
                      ? 'bg-green-500/20' 
                      : 'bg-gray-700/50 group-hover:bg-green-500/20'
                  }`}>
                    <TrendingUp className={`w-4 h-4 ${
                      showCustomInput ? 'text-green-400' : 'text-gray-400 group-hover:text-green-400'
                    }`} />
                  </div>
                  <div className={`font-medium text-sm ${
                    showCustomInput ? 'text-green-400' : 'text-gray-300 group-hover:text-green-400'
                  }`}>
                    Custom
                  </div>
                  <div className="text-xs text-gray-500">Set your own time</div>
                </div>
              </button>
            </div>
          </div>

          {/* Goal Time */}
          {showCustomInput && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Focus Goal *
              </label>
              <div className="relative">
                <input
                  {...register('goal', { valueAsNumber: true })}
                  type="number"
                  min="5"
                  max="480"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="25"
                />
                <Clock className="absolute right-3 top-3 w-5 h-5 text-gray-500" />
              </div>
              <p className="mt-1 text-xs text-gray-500">Minutes (5-480) • Set your custom focus time</p>
              {errors.goal && (
                <p className="mt-1 text-sm text-red-400">{errors.goal.message}</p>
              )}
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags (Optional)
            </label>
            <div className="space-y-3">
              {/* Tag Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Add a tag..."
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!tagInput.trim() || watchedTags.length >= 5}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium"
                >
                  Add
                </button>
              </div>
              
              {/* Tags Display */}
              {watchedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {watchedTags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="ml-1 text-gray-400 hover:text-red-400 transition-colors duration-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                {watchedTags.length}/5 tags • Press Enter to add
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Session...</span>
              </div>
            ) : (
              'Start Focus Session'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
