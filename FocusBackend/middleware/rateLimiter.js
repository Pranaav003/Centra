// Simple in-memory rate limiter
// For production, consider using redis-based rate limiting

const rateLimitMap = new Map();

// Helper to get client IP address (handles proxies and load balancers)
const getClientIP = (req) => {
  return req.ip || 
         req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         'unknown';
};

const rateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  return (req, res, next) => {
    const key = getClientIP(req);
    const now = Date.now();

    // Skip rate limiting for localhost in development
    if (process.env.NODE_ENV === 'development' && (key === '127.0.0.1' || key === '::1' || key === '::ffff:127.0.0.1')) {
      return next();
    }

    if (!rateLimitMap.has(key)) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const record = rateLimitMap.get(key);

    // Reset if window has passed
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      rateLimitMap.set(key, record);
      return next();
    }

    // Check if limit exceeded
    if (record.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }

    // Increment count
    record.count++;
    rateLimitMap.set(key, record);

    // Clean up old entries periodically (every 5 minutes)
    if (Math.random() < 0.01) {
      for (const [k, v] of rateLimitMap.entries()) {
        if (now > v.resetTime) {
          rateLimitMap.delete(k);
        }
      }
    }

    next();
  };
};

// Specific rate limiters for different endpoints
// Auth: 30 requests per 15 minutes (allows for login attempts, password resets, etc.)
const authRateLimiter = rateLimiter(15 * 60 * 1000, 30);

// General API: 200 requests per 15 minutes (allows for normal usage)
const generalRateLimiter = rateLimiter(15 * 60 * 1000, 200);

module.exports = {
  rateLimiter,
  authRateLimiter,
  generalRateLimiter
};

