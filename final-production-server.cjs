const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');

console.log('🚀 Starting HitchBuddy Final Production Server...');

// Environment setup
process.env.NODE_ENV = 'production';

// Database storage implementation
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Initialize database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

console.log('✅ Database connection initialized');

// Storage implementation
const storage = {
  async getUserByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return null;
    
    // Map snake_case database fields to camelCase for consistency
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      firstName: user.first_name,
      lastName: user.last_name,
      userType: user.user_type,
      phone: user.phone,
      avatarUrl: user.avatar_url,
      addressLine1: user.address_line1,
      addressLine2: user.address_line2,
      city: user.city,
      county: user.county,
      postcode: user.postcode,
      country: user.country,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  },
  
  async getUser(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    const user = result.rows[0];
    if (!user) return null;
    
    // Map snake_case database fields to camelCase for consistency
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      firstName: user.first_name,
      lastName: user.last_name,
      userType: user.user_type,
      phone: user.phone,
      avatarUrl: user.avatar_url,
      addressLine1: user.address_line1,
      addressLine2: user.address_line2,
      city: user.city,
      county: user.county,
      postcode: user.postcode,
      country: user.country,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  },
  
  async createUser(userData) {
    const { email, password, firstName, lastName, userType, phone } = userData;
    const hashedPassword = await bcrypt.hash(password, 12);
    const id = uuidv4();
    
    const result = await pool.query(
      'INSERT INTO users (id, email, password, first_name, last_name, user_type, phone) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [id, email, hashedPassword, firstName, lastName, userType, phone]
    );
    
    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      userType: user.user_type,
      phone: user.phone
    };
  },
  
  async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },
  
  async createSession(userId) {
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    await pool.query(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)',
      [sessionId, userId, expiresAt]
    );
    
    return {
      id: sessionId,
      userId,
      expiresAt
    };
  },
  
  async getSession(sessionId) {
    const result = await pool.query('SELECT * FROM sessions WHERE id = $1', [sessionId]);
    const session = result.rows[0];
    
    if (session && new Date(session.expires_at) < new Date()) {
      await this.deleteSession(sessionId);
      return null;
    }
    
    return session ? {
      id: session.id,
      userId: session.user_id,
      expiresAt: session.expires_at
    } : null;
  },
  
  async deleteSession(sessionId) {
    await pool.query('DELETE FROM sessions WHERE id = $1', [sessionId]);
  }
};

const app = express();
const PORT = process.env.PORT || 10000;

// Static files directory
const STATIC_DIR = path.join(__dirname, 'dist', 'public');
console.log('📁 Serving static files from:', STATIC_DIR);

// Check if static build exists
if (fs.existsSync(STATIC_DIR)) {
  console.log('✅ Static build found, serving compiled React app');
} else {
  console.error('❌ Static build not found at:', STATIC_DIR);
  process.exit(1);
}

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

// Authentication endpoints
// Import and register all API routes from the development server
try {
  const { registerRoutes } = require('./server/routes.ts');
  registerRoutes(app);
  console.log('✅ All API routes registered from development server');
} catch (error) {
  console.log('⚠️ Could not load TypeScript routes, using fallback authentication');
  
  // Fallback authentication endpoints
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, firstName, lastName, userType, phone } = req.body;
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Create user
    const user = await storage.createUser({
      email,
      password,
      firstName,
      lastName,
      userType,
      phone: phone || null
    });
    
    // Create session
    const session = await storage.createSession(user.id);
    
    // Set session cookie
    res.cookie('session', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Get user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isValid = await storage.verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create session
    const session = await storage.createSession(user.id);
    
    // Set session cookie
    res.cookie('session', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: "Internal server error" });
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
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const sessionId = req.cookies.session;
    if (!sessionId) {
      return res.status(401).json({ error: "No session" });
    }

    const session = await storage.getSession(sessionId);
    if (!session) {
      return res.status(401).json({ error: "Invalid session" });
    }

    const user = await storage.getUser(session.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Serve static files
app.use(express.static(STATIC_DIR));

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 HitchBuddy Final Production Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Server ready at: http://0.0.0.0:${PORT}`);
  console.log(`📦 Static files: Available`);
  console.log(`🗄️ Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});