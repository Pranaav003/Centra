// Simple logging utility

const logLevels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const currentLogLevel = process.env.LOG_LEVEL || 'INFO';

const shouldLog = (level) => {
  return logLevels[level] <= logLevels[currentLogLevel];
};

const formatMessage = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message
  };

  if (data) {
    logEntry.data = data;
  }

  return JSON.stringify(logEntry);
};

const logger = {
  error: (message, data = null) => {
    if (shouldLog('ERROR')) {
      console.error(formatMessage('ERROR', message, data));
    }
  },

  warn: (message, data = null) => {
    if (shouldLog('WARN')) {
      console.warn(formatMessage('WARN', message, data));
    }
  },

  info: (message, data = null) => {
    if (shouldLog('INFO')) {
      console.log(formatMessage('INFO', message, data));
    }
  },

  debug: (message, data = null) => {
    if (shouldLog('DEBUG')) {
      console.log(formatMessage('DEBUG', message, data));
    }
  }
};

module.exports = logger;


