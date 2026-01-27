const express = require('express');
const FocusSession = require('../models/FocusSession');
const auth = require('../middleware/auth');
const { validateSession, validateSessionUpdate, validateObjectId } = require('../middleware/validation');
const logger = require('../utils/logger');
const router = express.Router();

// @route   POST /api/focus/session
// @desc    Create a new focus session
// @access  Private
router.post('/session', auth, validateSession, async (req, res, next) => {
  try {
    const { title, description, goal, tags } = req.body;
    
    const session = new FocusSession({
      userId: req.user._id,
      title: title.trim(),
      description: description?.trim() || '',
      goal: goal || 25,
      tags: tags || [],
      startTime: new Date()
    });

    await session.save();

    logger.info('Focus session created', { sessionId: session._id, userId: req.user._id });

    res.status(201).json({
      success: true,
      message: 'Focus session created successfully',
      session
    });

  } catch (error) {
    logger.error('Create session error', { error: error.message, stack: error.stack, userId: req.user._id });
    next(error);
  }
});

// @route   GET /api/focus/sessions
// @desc    Get user's focus sessions
// @access  Private
router.get('/sessions', auth, async (req, res, next) => {
  try {
    const { status, limit = 20, page = 1, sortBy = 'startTime', sortOrder = 'desc' } = req.query;
    
    // Validate pagination parameters
    const limitNum = Math.min(parseInt(limit) || 20, 100); // Max 100 per page
    const pageNum = Math.max(parseInt(page) || 1, 1);
    
    const query = { userId: req.user._id };
    if (status && ['active', 'completed', 'paused', 'cancelled', 'interrupted', 'abandoned'].includes(status)) {
      query.status = status;
    }

    const sortOptions = {};
    const allowedSortFields = ['startTime', 'endTime', 'goal', 'actualTime', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'startTime';
    sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;

    const sessions = await FocusSession.find(query)
      .sort(sortOptions)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .populate('userId', 'firstName lastName email');

    const total = await FocusSession.countDocuments(query);

    res.json({
      success: true,
      sessions,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalSessions: total,
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1
      }
    });

  } catch (error) {
    logger.error('Get sessions error', { error: error.message, stack: error.stack, userId: req.user._id });
    next(error);
  }
});

// @route   GET /api/focus/session/:id
// @desc    Get specific focus session
// @access  Private
router.get('/session/:id', auth, validateObjectId, async (req, res, next) => {
  try {
    const session = await FocusSession.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('userId', 'firstName lastName email');

    if (!session) {
      return res.status(404).json({ 
        success: false,
        message: 'Session not found' 
      });
    }

    res.json({ 
      success: true,
      session 
    });

  } catch (error) {
    logger.error('Get session error', { error: error.message, stack: error.stack, sessionId: req.params.id, userId: req.user._id });
    next(error);
  }
});

// @route   PUT /api/focus/session/:id/pause
// @desc    Pause a focus session
// @access  Private
router.put('/session/:id/pause', auth, validateObjectId, async (req, res, next) => {
  try {
    const session = await FocusSession.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({ 
        success: false,
        message: 'Session not found' 
      });
    }

    await session.pause();
    logger.info('Session paused', { sessionId: session._id, userId: req.user._id });

    res.json({
      success: true,
      message: 'Session paused successfully',
      session
    });

  } catch (error) {
    logger.error('Pause session error', { error: error.message, stack: error.stack, sessionId: req.params.id, userId: req.user._id });
    next(error);
  }
});

// @route   PUT /api/focus/session/:id/resume
// @desc    Resume a paused focus session
// @access  Private
router.put('/session/:id/resume', auth, validateObjectId, async (req, res, next) => {
  try {
    const session = await FocusSession.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({ 
        success: false,
        message: 'Session not found' 
      });
    }

    await session.resume();
    logger.info('Session resumed', { sessionId: session._id, userId: req.user._id });

    res.json({
      success: true,
      message: 'Session resumed successfully',
      session
    });

  } catch (error) {
    logger.error('Resume session error', { error: error.message, stack: error.stack, sessionId: req.params.id, userId: req.user._id });
    next(error);
  }
});

// @route   PUT /api/focus/session/:id/complete
// @desc    Complete a focus session
// @access  Private
router.put('/session/:id/complete', auth, validateObjectId, validateSessionUpdate, async (req, res, next) => {
  try {
    const { actualTime, notes, productivity } = req.body;
    
    const session = await FocusSession.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({ 
        success: false,
        message: 'Session not found' 
      });
    }

    await session.complete(actualTime, notes, productivity);
    logger.info('Session completed', { sessionId: session._id, userId: req.user._id });

    res.json({
      success: true,
      message: 'Session completed successfully',
      session
    });

  } catch (error) {
    logger.error('Complete session error', { error: error.message, stack: error.stack, sessionId: req.params.id, userId: req.user._id });
    next(error);
  }
});

// @route   DELETE /api/focus/session/:id
// @desc    Delete a focus session
// @access  Private
router.delete('/session/:id', auth, validateObjectId, async (req, res, next) => {
  try {
    const session = await FocusSession.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({ 
        success: false,
        message: 'Session not found' 
      });
    }

    logger.info('Session deleted', { sessionId: req.params.id, userId: req.user._id });

    res.json({ 
      success: true,
      message: 'Session deleted successfully' 
    });

  } catch (error) {
    logger.error('Delete session error', { error: error.message, stack: error.stack, sessionId: req.params.id, userId: req.user._id });
    next(error);
  }
});

// @route   GET /api/focus/stats
// @desc    Get user's focus statistics
// @access  Private
router.get('/stats', auth, async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    
    // Validate period
    const validPeriods = ['7d', '30d', '90d', 'all'];
    const selectedPeriod = validPeriods.includes(period) ? period : '30d';
    
    let startDate = null;
    if (selectedPeriod !== 'all') {
      startDate = new Date();
      if (selectedPeriod === '7d') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (selectedPeriod === '30d') {
        startDate.setDate(startDate.getDate() - 30);
      } else if (selectedPeriod === '90d') {
        startDate.setDate(startDate.getDate() - 90);
      }
    }

    const matchQuery = { userId: req.user._id };
    if (startDate) {
      matchQuery.startTime = { $gte: startDate };
    }

    const stats = await FocusSession.aggregate([
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalFocusTime: { $sum: '$actualTime' },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          averageProductivity: { $avg: '$productivity' }
        }
      }
    ]);

    const result = stats[0] || {
      totalSessions: 0,
      totalFocusTime: 0,
      completedSessions: 0,
      averageProductivity: 0
    };

    res.json({ 
      success: true,
      stats: result 
    });

  } catch (error) {
    logger.error('Get stats error', { error: error.message, stack: error.stack, userId: req.user._id });
    next(error);
  }
});

module.exports = router;
