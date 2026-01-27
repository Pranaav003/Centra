# Focus Backend

Backend server for the Focus Web Blocker Chrome extension. This provides user authentication, data storage, and subscription management.

## Features

- User authentication (signup/login)
- JWT-based authentication
- MongoDB database integration
- Subscription management with Stripe
- Focus session tracking
- Blocked sites management
- RESTful API endpoints

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy the example environment file and configure it:
```bash
cp env.example .env
```

Edit `.env` with your configuration:
- Set your MongoDB connection string
- Add your JWT secret
- Configure Stripe keys (if using payments)

### 3. Database Setup
Make sure MongoDB is running locally, or update `MONGODB_URI` in your `.env` file to point to your MongoDB instance.

### 4. Run the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on port 5000 (or the port specified in your `.env` file).

## API Endpoints

- `GET /` - API status
- `GET /health` - Health check
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/user/profile` - Get user profile
- `POST /api/focus/session` - Create focus session
- `GET /api/focus/sessions` - Get user's focus sessions
- `POST /api/sites/block` - Block a website
- `GET /api/sites/blocked` - Get blocked sites

## Project Structure

```
FocusBackend/
├── models/          # Database models
├── routes/          # API route handlers
├── middleware/      # Custom middleware
├── config/          # Configuration files
├── utils/           # Utility functions
├── server.js        # Main server file
├── package.json     # Dependencies
└── env.example      # Environment variables template
```

## Next Steps

1. Set up MongoDB (local or cloud)
2. Configure environment variables
3. Test the basic server
4. Add authentication routes
5. Implement user models
6. Add focus session tracking
7. Integrate Stripe for payments
