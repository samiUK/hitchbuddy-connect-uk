# Hitchbuddy - Zero Dependency Deployment

## Quick Start

1. **Create new GitHub repository**
2. **Upload these files:**
   - Rename `package.json.download` to `package.json`
   - Rename `app.js.download` to `app.js`
3. **Deploy on Render.com:**
   - Build Command: (leave empty)
   - Start Command: `node app.js`

## Features

- Zero external dependencies (uses only Node.js built-ins)
- Complete user authentication system
- Ride posting and booking APIs
- Interactive web interface with real-time testing
- Session management with HTTP-only cookies
- Comprehensive error handling

## API Endpoints

- `GET /api/health` - System status
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/rides` - Create ride
- `GET /api/rides` - List active rides

## Testing

Visit your deployed URL to access the interactive testing interface with:
- System health checks
- User registration and authentication
- Ride creation and management
- Real-time platform statistics

## Technical Details

- **Runtime:** Node.js 18+
- **Dependencies:** None (uses crypto, http, url built-ins)
- **Storage:** In-memory (resets on restart)
- **Authentication:** Session-based with secure cookies
- **CORS:** Enabled for cross-origin requests

This eliminates all npm dependency conflicts including the ERESOLVE errors with drizzle-orm and React Native packages.