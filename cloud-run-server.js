const express = require('express');
const path = require('path');
const fs = require('fs');
const { createServer } = require('http');
const compression = require('compression');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

console.log('🚗 Starting HitchBuddy Cloud Run Server...');

// Set up production environment
process.env.NODE_ENV = 'production';
process.env.IS_PRODUCTION_DEPLOYMENT = 'true';
process.env.SERVER_DIRNAME = __dirname;

// Load polyfill for import.meta.dirname compatibility
const { setupPolyfill } = require('./server/polyfill.js');
setupPolyfill();

const app = express();

// Security and performance middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Health check endpoint for Cloud Run
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    platform: 'Cloud Run',
    port: process.env.PORT || '80'
  });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// API routes - simple fallback for production
async function setupRoutes() {
  try {
    // Simple API endpoints for cloud run
    app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: 'production',
        platform: 'Cloud Run'
      });
    });
    
    app.get('/api/auth/me', (req, res) => {
      res.json({ error: 'Authentication service not available in production build' });
    });
    
    app.get('/api/*', (req, res) => {
      res.status(503).json({ 
        error: 'API service temporarily unavailable',
        message: 'This is a simplified Cloud Run deployment'
      });
    });
    
    console.log('✅ Fallback API routes registered successfully');
  } catch (error) {
    console.error('❌ Failed to setup routes:', error);
  }
}

// Serve React app for all non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
    return next();
  }
  
  const indexPath = path.join(__dirname, 'client', 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application not found');
  }
});

// Start server
async function startServer() {
  await setupRoutes();
  
  const PORT = parseInt(process.env.PORT || '80', 10);
  const server = createServer(app);
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ HitchBuddy Cloud Run server listening on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('💤 Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('💤 Server closed');
      process.exit(0);
    });
  });
}

startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});