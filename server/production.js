import express from 'express';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import { storage } from './storage.js';

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

// Helper function
async function getUserFromSession(req) {
  try {
    const sessionId = req.cookies.session;
    if (!sessionId) return null;
    
    const session = await storage.getSession(sessionId);
    if (!session || session.expiresAt < new Date()) return null;
    
    return await storage.getUser(session.userId);
  } catch (error) {
    return null;
  }
}

// Health endpoints
app.get(['/health', '/healthz', '/ready', '/ping', '/status', '/api/health'], (req, res) => {
  res.json({
    status: 'healthy',
    service: 'HitchBuddy',
    environment: 'production',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/rides', async (req, res) => {
  try {
    const rides = await storage.getRides();
    res.json(rides);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bookings API
app.get('/api/bookings', async (req, res) => {
  try {
    const user = await getUserFromSession(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const bookings = await storage.getBookingsByUser(user.id);
    res.json(bookings);
  } catch (error) {
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
    res.json({ notifications: [], unreadCount: 0 });
  }
});

// Serve the original React app by using existing client build or Vite
import { setupVite } from './vite.js';

const server = createServer(app);

async function startServer() {
  // Set up Vite to serve the original React application
  await setupVite(app, server);
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`HitchBuddy server running on port ${PORT}`);
    console.log(`Original React application with full functionality`);
  });
}

startServer().catch(console.error);

export default app;