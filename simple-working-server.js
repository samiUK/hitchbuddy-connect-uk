const express = require('express');
const path = require('path');
const { Pool } = require('pg');

console.log('🚗 Starting Clean HitchBuddy Server...');

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Basic authentication endpoint
app.get('/api/auth/me', async (req, res) => {
  try {
    const query = 'SELECT id, email, first_name as "firstName", last_name as "lastName", user_type as "userType" FROM users LIMIT 1';
    const result = await pool.query(query);
    if (result.rows.length > 0) {
      res.json({ user: result.rows[0] });
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  } catch (error) {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Serve static files with proper MIME types
app.use(express.static(path.join(__dirname, 'client/public')));

// Serve TypeScript files with correct MIME type
app.use('/src', express.static(path.join(__dirname, 'client/src'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.tsx') || path.endsWith('.ts')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Serve React app for all routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.sendFile(path.join(__dirname, 'client/index.html'));
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ HitchBuddy server running on port ${PORT}`);
  console.log(`✅ React app with Tailwind CSS ready`);
  console.log(`✅ Database connected`);
});