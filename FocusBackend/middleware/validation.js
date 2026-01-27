// Validation middleware for request body validation

const validateSignup = (req, res, next) => {
  const { email, password, firstName, lastName } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required and must be a valid string');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Email must be a valid email address');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!firstName || typeof firstName !== 'string' || !firstName.trim()) {
    errors.push('First name is required');
  }

  if (!lastName || typeof lastName !== 'string' || !lastName.trim()) {
    errors.push('Last name is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateSession = (req, res, next) => {
  const { title, description, goal, tags } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push('Title is required');
  } else if (title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (description && typeof description !== 'string') {
    errors.push('Description must be a string');
  } else if (description && description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }

  if (goal && (typeof goal !== 'number' || goal <= 0 || goal > 1440)) {
    errors.push('Goal must be a positive number in minutes (max 1440)');
  }

  if (tags && !Array.isArray(tags)) {
    errors.push('Tags must be an array');
  } else if (tags && tags.length > 10) {
    errors.push('Maximum 10 tags allowed');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateSessionUpdate = (req, res, next) => {
  const { actualTime, notes, productivity } = req.body;
  const errors = [];

  if (actualTime !== undefined) {
    if (typeof actualTime !== 'number' || actualTime < 0 || actualTime > 1440) {
      errors.push('Actual time must be a positive number in minutes (max 1440)');
    }
  }

  if (notes !== undefined && typeof notes !== 'string') {
    errors.push('Notes must be a string');
  } else if (notes && notes.length > 2000) {
    errors.push('Notes must be less than 2000 characters');
  }

  if (productivity !== undefined) {
    if (typeof productivity !== 'number' || productivity < 0 || productivity > 10) {
      errors.push('Productivity must be a number between 0 and 10');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid session ID format'
    });
  }

  next();
};

module.exports = {
  validateSignup,
  validateLogin,
  validateSession,
  validateSessionUpdate,
  validateObjectId
};


