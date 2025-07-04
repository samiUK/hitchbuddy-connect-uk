const express = require('express');
const { createServer } = require('http');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');

// Import database and storage
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Database connection
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/hitchbuddy';
const queryClient = postgres(DATABASE_URL);

// Simple schema definitions for production
const users = {
  id: 'text',
  email: 'text',
  password: 'text',
  firstName: 'text',
  lastName: 'text',
  phone: 'text',
  userType: 'text',
  avatarUrl: 'text',
  addressLine1: 'text',
  addressLine2: 'text',
  city: 'text',
  county: 'text',
  postcode: 'text',
  country: 'text',
  profileCompletedAt: 'timestamp',
  createdAt: 'timestamp',
  updatedAt: 'timestamp'
};

const schema = { users };
const db = drizzle(queryClient, { schema });

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'hitchbuddy-api',
    version: '1.0.0'
  });
});

// Authentication helper functions
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// API Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, userType } = req.body;
    
    // Check if user exists
    const existingUser = await queryClient`
      SELECT id FROM users WHERE email = ${email}
    `;
    
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create new user
    const hashedPassword = await hashPassword(password);
    const userId = uuidv4();
    const now = new Date();
    
    await queryClient`
      INSERT INTO users (id, email, password, "firstName", "lastName", "userType", "createdAt", "updatedAt")
      VALUES (${userId}, ${email}, ${hashedPassword}, ${firstName}, ${lastName}, ${userType}, ${now}, ${now})
    `;
    
    // Create session
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await queryClient`
      INSERT INTO sessions (id, "userId", "expiresAt", "createdAt")
      VALUES (${sessionId}, ${userId}, ${expiresAt}, ${now})
    `;
    
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const users = await queryClient`
      SELECT * FROM users WHERE email = ${email}
    `;
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create session
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const now = new Date();
    
    await queryClient`
      INSERT INTO sessions (id, "userId", "expiresAt", "createdAt")
      VALUES (${sessionId}, ${user.id}, ${expiresAt}, ${now})
    `;
    
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    res.json({ message: 'Login successful' });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const sessionId = req.cookies.sessionId;
    
    if (!sessionId) {
      return res.status(401).json({ error: 'No session' });
    }
    
    // Find session
    const sessions = await queryClient`
      SELECT s.*, u.* FROM sessions s
      JOIN users u ON s."userId" = u.id
      WHERE s.id = ${sessionId} AND s."expiresAt" > NOW()
    `;
    
    if (sessions.length === 0) {
      return res.status(401).json({ error: 'Invalid session' });
    }
    
    const user = sessions[0];
    delete user.password;
    
    res.json(user);
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/signout', async (req, res) => {
  try {
    const sessionId = req.cookies.sessionId;
    
    if (sessionId) {
      await queryClient`
        DELETE FROM sessions WHERE id = ${sessionId}
      `;
    }
    
    res.clearCookie('sessionId');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Default API endpoints for other functionality
app.get('/api/rides', (req, res) => {
  res.json({ rides: [] });
});

app.get('/api/ride-requests', (req, res) => {
  res.json({ rideRequests: [] });
});

app.get('/api/bookings', (req, res) => {
  res.json({ bookings: [] });
});

app.get('/api/notifications', (req, res) => {
  res.json({ notifications: [] });
});

app.get('/api/messages/:bookingId', (req, res) => {
  res.json({ messages: [] });
});

// Serve static files - HitchBuddy React App
app.use(express.static(path.join(__dirname, 'client/dist')));

// HitchBuddy React App catch-all
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'client/dist/index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Fallback HTML for HitchBuddy
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>HitchBuddy - Ride Sharing Platform</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            .gradient-bg {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .logo-gradient {
              background: linear-gradient(45deg, #3b82f6, #10b981);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
          </style>
        </head>
        <body class="gradient-bg min-h-screen flex items-center justify-center">
          <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div class="text-center mb-8">
              <div class="flex items-center justify-center mb-4">
                <div class="bg-gradient-to-br from-blue-600 to-green-600 rounded-lg w-12 h-12 flex items-center justify-center text-white font-bold text-lg mr-3">
                  H
                </div>
                <h1 class="text-3xl font-bold logo-gradient">HitchBuddy</h1>
              </div>
              <p class="text-gray-600 text-lg">Share Your Journey, Save the Planet</p>
            </div>
            
            <div class="space-y-6">
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 class="font-semibold text-blue-800 mb-2">🚗 Smart Route Matching</h3>
                <p class="text-blue-700 text-sm">Connect with travelers going your way</p>
              </div>
              
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 class="font-semibold text-green-800 mb-2">🤝 Trusted Community</h3>
                <p class="text-green-700 text-sm">Verified profiles and secure payments</p>
              </div>
              
              <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 class="font-semibold text-purple-800 mb-2">💬 Real-time Communication</h3>
                <p class="text-purple-700 text-sm">Stay connected throughout your journey</p>
              </div>
            </div>
            
            <div class="mt-8 text-center">
              <p class="text-gray-500 text-sm">HitchBuddy Ride Sharing Platform</p>
              <p class="text-gray-400 text-xs mt-2">Connecting eco-conscious travelers</p>
            </div>
          </div>
        </body>
      </html>
    `);
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 HitchBuddy server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});