const mongoose = require('mongoose');

const blockedSiteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  domain: {
    type: String,
    required: [true, 'Domain is required'],
    trim: true,
    lowercase: true
  },
  url: {
    type: String,
    required: [true, 'URL is required'],
    trim: true
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  category: {
    type: String,
    enum: ['social_media', 'entertainment', 'shopping', 'news', 'gaming', 'other'],
    default: 'other'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  schedule: {
    enabled: {
      type: Boolean,
      default: false
    },
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    startTime: String, // Format: "HH:MM" (24-hour)
    endTime: String,   // Format: "HH:MM" (24-hour)
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  focusSessions: [{
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FocusSession'
    },
    blockedAt: {
      type: Date,
      default: Date.now
    },
    attempts: {
      type: Number,
      default: 0
    }
  }],
  stats: {
    totalBlocks: {
      type: Number,
      default: 0
    },
    lastBlocked: Date,
    totalTimeSaved: {
      type: Number,
      default: 0 // in minutes
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Index for efficient queries
blockedSiteSchema.index({ userId: 1, domain: 1 });
blockedSiteSchema.index({ userId: 1, isActive: 1 });
blockedSiteSchema.index({ userId: 1, category: 1 });

// Virtual for full domain
blockedSiteSchema.virtual('fullDomain').get(function() {
  if (this.domain.startsWith('www.')) {
    return this.domain;
  }
  return `www.${this.domain}`;
});

// Method to check if site should be blocked based on schedule
blockedSiteSchema.methods.shouldBlockNow = function() {
  if (!this.schedule.enabled) {
    return this.isActive;
  }

  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const currentTime = now.toTimeString().slice(0, 5); // Format: "HH:MM"

  // Check if current day is in allowed days
  if (!this.schedule.days.includes(currentDay)) {
    return false;
  }

  // Check if current time is within allowed time range
  if (this.schedule.startTime && this.schedule.endTime) {
    return currentTime >= this.schedule.startTime && currentTime <= this.schedule.endTime;
  }

  return this.isActive;
};

// Method to record a block attempt
blockedSiteSchema.methods.recordBlock = function(sessionId) {
  this.stats.totalBlocks += 1;
  this.stats.lastBlocked = new Date();
  
  // Add to focus sessions if sessionId provided
  if (sessionId) {
    const existingSession = this.focusSessions.find(s => s.sessionId.toString() === sessionId.toString());
    if (existingSession) {
      existingSession.attempts += 1;
    } else {
      this.focusSessions.push({ sessionId, attempts: 1 });
    }
  }
  
  return this.save();
};

// Method to calculate time saved (estimate)
blockedSiteSchema.methods.estimateTimeSaved = function(averageTimePerVisit = 15) {
  return this.stats.totalBlocks * averageTimePerVisit;
};

// Pre-save middleware to normalize domain
blockedSiteSchema.pre('save', function(next) {
  if (this.isModified('domain')) {
    // Remove protocol and path, keep only domain
    this.domain = this.domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  }
  next();
});

module.exports = mongoose.model('BlockedSite', blockedSiteSchema);
