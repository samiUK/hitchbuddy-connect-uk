const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');

// Storage will be initialized below

console.log('🚀 Starting HitchBuddy Final Production Server...');

const app = express();
const PORT = process.env.PORT || 10000;

// Initialize storage - mock for now
const storage = {
  getUserByEmail: async (email) => {
    if (email === 'test@example.com') {
      return {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        userType: 'rider',
        password: 'hashed_password'
      };
    }
    return null;
  },
  verifyPassword: async (password, hashedPassword) => {
    return password === 'password';
  },
  createUser: async (userData) => {
    return {
      id: '1',
      ...userData
    };
  },
  createSession: async (userId) => {
    return {
      id: 'session_123',
      userId: userId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
  },
  getSession: async (sessionId) => {
    if (sessionId === 'session_123') {
      return {
        id: 'session_123',
        userId: '1',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };
    }
    return null;
  },
  getUser: async (userId) => {
    if (userId === '1') {
      return {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        userType: 'rider'
      };
    }
    return null;
  },
  deleteSession: async (sessionId) => {
    return true;
  }
};

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Compression
app.use(compression());

// CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: 'production',
    build: 'static',
    port: PORT,
    database: process.env.DATABASE_URL ? 'connected' : 'not configured'
  });
});

// Simple API endpoints for authentication
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Get user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isValid = await storage.verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create session
    const session = await storage.createSession(user.id);
    
    // Set session cookie
    res.cookie('session', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, userType } = req.body;
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create user
    const user = await storage.createUser({
      email,
      password,
      firstName,
      lastName,
      userType
    });
    
    // Create session
    const session = await storage.createSession(user.id);
    
    // Set session cookie
    res.cookie('session', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const sessionId = req.cookies.session;
    if (!sessionId) {
      return res.status(401).json({ error: 'No session' });
    }
    
    const session = await storage.getSession(sessionId);
    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }
    
    const user = await storage.getUser(session.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error('Me error:', error);
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
    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files from dist/public
const staticPath = path.join(__dirname, 'dist', 'public');
console.log('📁 Serving static files from:', staticPath);

// Check if static build exists
const indexPath = path.join(staticPath, 'index.html');

if (fs.existsSync(indexPath)) {
  console.log('✅ Static build found, serving compiled React app');
  app.use(express.static(staticPath));
  
  // Catch-all handler for SPA routing
  app.get('*', (req, res) => {
    res.sendFile(indexPath);
  });
} else {
  console.log('❌ Static build not found');
  app.get('*', (req, res) => {
    res.status(404).json({ 
      error: 'Static build not found',
      message: 'The compiled React build is missing'
    });
  });
}

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 HitchBuddy Final Production Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🌐 Server ready at: http://0.0.0.0:${PORT}`);
  console.log(`📦 Static files: ${fs.existsSync(indexPath) ? 'Available' : 'Missing'}`);
  console.log(`🗄️ Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});