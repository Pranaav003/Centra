const mongoose = require('mongoose');

const focusSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Session title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  goal: {
    type: Number, // in minutes
    required: [true, 'Focus goal is required'],
    min: [1, 'Goal must be at least 1 minute'],
    max: [480, 'Goal cannot exceed 8 hours (480 minutes)']
  },
  actualTime: {
    type: Number, // in minutes
    default: 0,
    min: [0, 'Actual time cannot be negative']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'abandoned'],
    default: 'active'
  },
  breaks: [{
    startTime: Date,
    endTime: Date,
    duration: Number, // in minutes
    reason: {
      type: String,
      enum: ['planned', 'emergency', 'distraction', 'other'],
      default: 'other'
    }
  }],
  interruptions: [{
    timestamp: Date,
    type: {
      type: String,
      enum: ['notification', 'phone_call', 'person', 'website', 'other'],
      default: 'other'
    },
    description: String,
    duration: Number // in minutes
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  productivity: {
    type: Number,
    min: [1, 'Productivity rating must be at least 1'],
    max: [10, 'Productivity rating cannot exceed 10'],
    default: 5
  }
}, {
  timestamps: true
});

// Index for efficient queries
focusSessionSchema.index({ userId: 1, startTime: -1 });
focusSessionSchema.index({ userId: 1, status: 1 });

// Virtual for session duration
focusSessionSchema.virtual('duration').get(function() {
  if (this.endTime && this.startTime) {
    return Math.round((this.endTime - this.startTime) / (1000 * 60)); // in minutes
  }
  return 0;
});

// Virtual for completion percentage
focusSessionSchema.virtual('completionPercentage').get(function() {
  if (this.goal > 0) {
    return Math.round((this.actualTime / this.goal) * 100);
  }
  return 0;
});

// Method to calculate total break time
focusSessionSchema.methods.getTotalBreakTime = function() {
  return this.breaks.reduce((total, break_) => {
    return total + (break_.duration || 0);
  }, 0);
};

// Method to calculate total interruption time
focusSessionSchema.methods.getTotalInterruptionTime = function() {
  return this.interruptions.reduce((total, interruption) => {
    return total + (interruption.duration || 0);
  }, 0);
};

// Method to pause session
focusSessionSchema.methods.pause = function() {
  if (this.status === 'active') {
    this.status = 'paused';
    return this.save();
  }
  throw new Error('Can only pause active sessions');
};

// Method to resume session
focusSessionSchema.methods.resume = function() {
  if (this.status === 'paused') {
    this.status = 'active';
    return this.save();
  }
  throw new Error('Can only resume paused sessions');
};

// Method to complete session
focusSessionSchema.methods.complete = function(actualTime, notes, productivity) {
  this.status = 'completed';
  this.endTime = new Date();
  this.actualTime = actualTime || this.actualTime;
  if (notes) this.notes = notes;
  if (productivity) this.productivity = productivity;
  return this.save();
};

module.exports = mongoose.model('FocusSession', focusSessionSchema);
