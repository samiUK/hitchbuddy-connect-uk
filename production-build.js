import { build } from 'vite';
import express from 'express';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import { storage } from './server/storage.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Building HitchBuddy for production...');

// Build the React frontend
await build({
  root: './client',
  build: {
    outDir: '../dist/client',
    emptyOutDir: true,
  },
});

console.log('✅ Frontend build complete');

// Create production server
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
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

// Health endpoints
app.get(['/health', '/healthz', '/ready', '/ping', '/status'], (req, res) => {
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
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
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
    const sessionId = req.cookies.session;
    if (!sessionId) {
      return res.json({ user: null });
    }

    const session = await storage.getSession(sessionId);
    if (!session || session.expiresAt < new Date()) {
      res.clearCookie('session');
      return res.json({ user: null });
    }

    const user = await storage.getUser(session.userId);
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
    const sessionId = req.cookies.session;
    const session = await storage.getSession(sessionId);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const ride = await storage.createRide({
      ...req.body,
      driverId: session.userId
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

// Bookings API
app.post('/api/bookings', async (req, res) => {
  try {
    const sessionId = req.cookies.session;
    const session = await storage.getSession(sessionId);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const booking = await storage.createBooking({
      ...req.body,
      riderId: session.userId
    });
    res.json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const sessionId = req.cookies.session;
    const session = await storage.getSession(sessionId);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const bookings = await storage.getBookingsByUser(session.userId);
    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files from the built frontend
app.use(express.static(path.join(__dirname, 'dist/client')));

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/client/index.html'));
});

// Start server
const server = createServer(app);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎯 HitchBuddy production server running on port ${PORT}`);
  console.log(`🌐 Environment: production`);
  console.log(`🔗 Access at: http://localhost:${PORT}`);
  console.log(`✅ Full React application with authentication and ride-sharing features`);
});

// Error handling
server.on('error', (err) => {
  console.error('❌ Server error:', err.message);
});

process.on('SIGTERM', () => {
  console.log('🔄 Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;