const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const FocusSession = require('../models/FocusSession');
const BlockedSite = require('../models/BlockedSite');
const auth = require('../middleware/auth');
const { validateSignup, validateLogin } = require('../middleware/validation');
const { authRateLimiter } = require('../middleware/rateLimiter');
const logger = require('../utils/logger');
const { sendFeedbackEmail } = require('../services/feedbackEmail');
const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', authRateLimiter, validateSignup, async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists (match schema lowercase)
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      });
    }

    // Create new user
    const user = new User({
      email: normalizedEmail,
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim()
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    logger.info('User created successfully', { userId: user._id, email: user.email });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    logger.error('Signup error', { error: error.message, stack: error.stack });
    next(error);
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authRateLimiter, validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      logger.warn('Login attempt with invalid email', { email: email.toLowerCase().trim() });
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      logger.warn('Login attempt for deactivated account', { userId: user._id });
      return res.status(400).json({ 
        success: false,
        message: 'Account is deactivated' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn('Login attempt with invalid password', { userId: user._id });
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    logger.info('User logged in successfully', { userId: user._id });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    logger.error('Login error', { error: error.message, stack: error.stack });
    next(error);
  }
});

// @route   GET /api/auth/validate
// @desc    Validate JWT token and return user data
// @access  Private
router.get('/validate', auth, async (req, res, next) => {
  try {
    // User is already validated by auth middleware
    // Just return the user data
    res.json({
      success: true,
      message: 'Token is valid',
      user: req.user.getPublicProfile()
    });
  } catch (error) {
    logger.error('Token validation error', { error: error.message, stack: error.stack });
    next(error);
  }
});

// @route   DELETE /api/auth/account
// @desc    Permanently delete account and all associated data. Email can be used again for a new signup.
// @access  Private
router.delete('/account', auth, async (req, res, next) => {
  try {
    const userId = req.user._id;

    await FocusSession.deleteMany({ userId });
    await BlockedSite.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    logger.info('Account permanently deleted', { userId, email: req.user.email });

    res.json({
      success: true,
      message: 'Account and all data have been permanently deleted. You can sign up again with the same email anytime.'
    });
  } catch (error) {
    logger.error('Account deletion error', { error: error.message, userId: req.user?._id });
    next(error);
  }
});

// @route   POST /api/auth/feedback
// @desc    Send account-deletion feedback to configured email (e.g. before deleting account)
// @access  Private
router.post('/feedback', auth, async (req, res, next) => {
  try {
    const { reason, message } = req.body || {};
    const userEmail = req.user.email;

    await sendFeedbackEmail({
      reason: typeof reason === 'string' ? reason.trim() : '',
      message: typeof message === 'string' ? message.trim() : '',
      userEmail: userEmail || '',
    });

    res.json({ success: true, message: 'Feedback sent.' });
  } catch (error) {
    logger.error('Feedback send error', { error: error.message, userId: req.user?._id });
    next(error);
  }
});

module.exports = router;
