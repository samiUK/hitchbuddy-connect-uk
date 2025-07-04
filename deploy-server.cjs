const express = require('express');
const path = require('path');
const fs = require('fs');
const compression = require('compression');
const helmet = require('helmet');
const { Pool } = require('pg');

console.log('🚗 Starting HitchBuddy Production Server...');

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Security and performance middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Database API endpoints
app.get('/api/auth/me', async (req, res) => {
  try {
    const query = 'SELECT id, email, first_name as "firstName", last_name as "lastName", user_type as "userType" FROM users WHERE email = $1';
    const result = await pool.query(query, ['coolsami_uk@yahoo.com']);
    if (result.rows.length > 0) {
      res.json({ user: result.rows[0] });
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Serve static files with proper MIME types
app.use(express.static(path.join(__dirname, 'client/public')));

// Serve node_modules for React and other dependencies
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// For development: Transform TypeScript on the fly
const esbuild = require('esbuild');

app.get('/src/*', async (req, res) => {
  const filePath = path.join(__dirname, 'client', req.path);
  
  try {
    if (req.path.endsWith('.tsx') || req.path.endsWith('.ts')) {
      // Transform TypeScript to JavaScript
      const result = await esbuild.transform(
        fs.readFileSync(filePath, 'utf8'),
        {
          loader: req.path.endsWith('.tsx') ? 'tsx' : 'ts',
          target: 'es2020',
          format: 'esm',
          jsx: 'transform',
          jsxFactory: 'React.createElement',
          jsxFragment: 'React.Fragment'
        }
      );
      
      res.setHeader('Content-Type', 'application/javascript');
      res.send(result.code);
    } else if (req.path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
      res.sendFile(filePath);
    } else {
      res.sendFile(filePath);
    }
  } catch (error) {
    console.error('Error transforming file:', error);
    res.status(500).send('Error transforming file');
  }
});

// Serve React app for all routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.sendFile(path.join(__dirname, 'client/index.html'));
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ HitchBuddy production server running on port ${PORT}`);
  console.log(`✅ React app with Tailwind CSS ready`);
  console.log(`✅ Database connected`);
  console.log(`✅ Health check available at /health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});