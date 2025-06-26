const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');

// Import storage (will need to be adapted for production)
const { storage } = require('./server/storage.js');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('trust proxy', true);

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Helper function to get user from session
async function getUserFromSession(req) {
  const sessionId = req.cookies.session;
  if (!sessionId) return null;
  
  const session = await storage.getSession(sessionId);
  if (!session || session.expiresAt < new Date()) return null;
  
  return await storage.getUser(session.userId);
}

// Health endpoints
app.get(['/health', '/healthz', '/ready', '/ping', '/status', '/api/health'], (req, res) => {
  res.json({
    status: 'healthy',
    service: 'HitchBuddy',
    environment: 'production',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: PORT
  });
});

// Authentication API
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, userType } = req.body;
    
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await storage.hashPassword(password);
    const user = await storage.createUser({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      userType
    });

    const session = await storage.createSession(user.id);
    res.cookie('session', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ user: { ...user, password: undefined } });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isValid = await storage.verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const session = await storage.createSession(user.id);
    res.cookie('session', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ user: { ...user, password: undefined } });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/signout', async (req, res) => {
  try {
    const sessionId = req.cookies.session;
    if (sessionId) {
      await storage.deleteSession(sessionId);
    }
    res.clearCookie('session');
    res.json({ success: true });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const user = await getUserFromSession(req);
    if (!user) {
      res.clearCookie('session');
      return res.json({ user: null });
    }
    res.json({ user: { ...user, password: undefined } });
  } catch (error) {
    console.error('Me error:', error);
    res.json({ user: null });
  }
});

// Rides API
app.post('/api/rides', async (req, res) => {
  try {
    const user = await getUserFromSession(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const ride = await storage.createRide({
      ...req.body,
      driverId: user.id
    });
    res.json(ride);
  } catch (error) {
    console.error('Create ride error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/rides', async (req, res) => {
  try {
    const rides = await storage.getRides();
    res.json(rides);
  } catch (error) {
    console.error('Get rides error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/rides/my', async (req, res) => {
  try {
    const user = await getUserFromSession(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const rides = await storage.getRidesByDriver(user.id);
    res.json(rides);
  } catch (error) {
    console.error('Get my rides error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ride Requests API
app.post('/api/ride-requests', async (req, res) => {
  try {
    const user = await getUserFromSession(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const rideRequest = await storage.createRideRequest({
      ...req.body,
      riderId: user.id
    });
    res.json(rideRequest);
  } catch (error) {
    console.error('Create ride request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/ride-requests', async (req, res) => {
  try {
    const rideRequests = await storage.getRideRequests();
    res.json(rideRequests);
  } catch (error) {
    console.error('Get ride requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/ride-requests/my', async (req, res) => {
  try {
    const user = await getUserFromSession(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const rideRequests = await storage.getRideRequestsByRider(user.id);
    res.json(rideRequests);
  } catch (error) {
    console.error('Get my ride requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bookings API
app.post('/api/bookings', async (req, res) => {
  try {
    const user = await getUserFromSession(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const booking = await storage.createBooking({
      ...req.body,
      riderId: user.id
    });
    res.json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const user = await getUserFromSession(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const bookings = await storage.getBookingsByUser(user.id);
    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Notifications API
app.get('/api/notifications', async (req, res) => {
  try {
    const user = await getUserFromSession(req);
    if (!user) {
      return res.json({ notifications: [], unreadCount: 0 });
    }

    const notifications = await storage.getNotifications(user.id);
    const unreadCount = await storage.getUnreadNotificationCount(user.id);
    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.json({ notifications: [], unreadCount: 0 });
  }
});

// Messages API
app.get('/api/messages/:bookingId', async (req, res) => {
  try {
    const user = await getUserFromSession(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const messages = await storage.getMessagesByBooking(req.params.bookingId);
    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const user = await getUserFromSession(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const message = await storage.createMessage({
      ...req.body,
      senderId: user.id
    });
    res.json(message);
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files (this will be the built React app)
app.use(express.static(path.join(__dirname, 'dist')));

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`HitchBuddy production server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`Complete React application with authentication and ride-sharing features`);
});

module.exports = app;