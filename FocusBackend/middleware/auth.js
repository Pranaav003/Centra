const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token, authorization denied' 
      });
    }

    // Verify token - JWT_SECRET is required, no fallback for security
    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET not configured');
      return res.status(500).json({ 
        success: false,
        message: 'Server configuration error' 
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      logger.warn('Auth failed: User not found', { userId: decoded.userId });
      return res.status(401).json({ 
        success: false,
        message: 'Token is not valid' 
      });
    }

    if (!user.isActive) {
      logger.warn('Auth failed: Account deactivated', { userId: user._id });
      return res.status(401).json({ 
        success: false,
        message: 'Account is deactivated' 
      });
    }

    // Add user to request object
    req.user = user;
    next();
    
  } catch (error) {
    logger.error('Auth middleware error', { 
      error: error.message, 
      name: error.name,
      stack: error.stack 
    });
    res.status(401).json({ 
      success: false,
      message: 'Token is not valid' 
    });
  }
};

module.exports = auth;
