// API Configuration
// Use environment variable or fallback to localhost for development
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Frontend URL for redirects
export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000';
