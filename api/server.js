const express = require('express');
const cookieParser = require('cookie-parser');
const { createServer } = require('http');

// Import the compiled server from dist
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// CORS for Vercel
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

// Import routes from the built application
try {
  const { registerRoutes } = require('../dist/index.js');
  registerRoutes(app);
} catch (error) {
  console.error('Failed to load routes:', error);
  
  // Basic health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  app.get('/api/*', (req, res) => {
    res.status(500).json({ 
      error: 'Server configuration error',
      message: error.message,
      path: req.path
    });
  });
}

// Export for Vercel
module.exports = app;