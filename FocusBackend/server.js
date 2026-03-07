const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Trust proxy (important for rate limiting and IP detection behind proxies/load balancers)
// Set to true for single proxy, or specific IPs/network for multiple proxies
app.set('trust proxy', process.env.TRUST_PROXY === 'true' || process.env.NODE_ENV === 'production' ? 1 : false);

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
const connectDB = require('./config/database');
connectDB();

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { generalRateLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

// Apply general rate limiting
app.use(generalRateLimiter);

// Import routes
const authRoutes = require('./routes/auth');
const focusRoutes = require('./routes/focus');
const subscriptionRoutes = require('./routes/subscription');
const { verifySubscriptionHandler } = require('./routes/subscription');
const blockedSitesRoutes = require('./routes/blockedSites');
const analyticsRoutes = require('./routes/analytics');
const auth = require('./middleware/auth');

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Focus Backend API is running!',
    version: '1.0.0'
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/focus', focusRoutes);
// Explicit verify route so it always matches (avoids 404 with some Express 5 / router setups)
app.post('/api/subscription/verify', auth, verifySubscriptionHandler);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/blocked-sites', blockedSitesRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
