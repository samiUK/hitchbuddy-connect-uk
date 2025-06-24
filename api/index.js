const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { eq } = require('drizzle-orm');

// Import schema - use relative path for Vercel
const { users, sessions, rides, rideRequests, bookings, messages, notifications, ratings } = require('../shared/schema');

const app = express();

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { 
  schema: { users, sessions, rides, rideRequests, bookings, messages, notifications, ratings }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'hitchbuddy-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (process.env.NODE_ENV === 'production') {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Auth middleware
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, userType } = req.body;
    
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await db.insert(users).values({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      userType
    }).returning();

    req.session.userId = newUser[0].id;
    res.json({ user: { ...newUser[0], password: undefined } });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (user.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user[0].password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.userId = user[0].id;
    res.json({ user: { ...user[0], password: undefined } });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const user = await db.select().from(users).where(eq(users.id, req.session.userId)).limit(1);
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: { ...user[0], password: undefined } });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/signout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not sign out' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Signed out successfully' });
  });
});

// Rides routes
app.post('/api/rides', requireAuth, async (req, res) => {
  try {
    const rideData = { ...req.body, driverId: req.session.userId };
    const newRide = await db.insert(rides).values(rideData).returning();
    res.json({ ride: newRide[0] });
  } catch (error) {
    console.error('Create ride error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/rides', async (req, res) => {
  try {
    const availableRides = await db.select().from(rides).limit(50);
    res.json({ rides: availableRides });
  } catch (error) {
    console.error('Rides fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/rides/my', requireAuth, async (req, res) => {
  try {
    const userRides = await db.select().from(rides)
      .where(eq(rides.driverId, req.session.userId))
      .limit(20);
    res.json({ rides: userRides });
  } catch (error) {
    console.error('My rides fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ride requests
app.post('/api/ride-requests', requireAuth, async (req, res) => {
  try {
    const requestData = { ...req.body, riderId: req.session.userId };
    const newRequest = await db.insert(rideRequests).values(requestData).returning();
    res.json({ rideRequest: newRequest[0] });
  } catch (error) {
    console.error('Create ride request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/ride-requests', async (req, res) => {
  try {
    const requests = await db.select().from(rideRequests).limit(50);
    res.json({ rideRequests: requests });
  } catch (error) {
    console.error('Ride requests fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bookings
app.post('/api/bookings', requireAuth, async (req, res) => {
  try {
    const bookingData = { ...req.body, riderId: req.session.userId };
    const newBooking = await db.insert(bookings).values(bookingData).returning();
    res.json({ booking: newBooking[0] });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/bookings', requireAuth, async (req, res) => {
  try {
    const userBookings = await db.select().from(bookings)
      .where(eq(bookings.riderId, req.session.userId))
      .limit(20);
    res.json({ bookings: userBookings });
  } catch (error) {
    console.error('Bookings fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Notifications
app.get('/api/notifications', requireAuth, async (req, res) => {
  try {
    const userNotifications = await db.select().from(notifications)
      .where(eq(notifications.userId, req.session.userId))
      .limit(10);
    res.json({ notifications: userNotifications, unreadCount: 0 });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files from client/dist for Vercel
app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

module.exports = app;