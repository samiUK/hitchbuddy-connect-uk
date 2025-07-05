const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');

// Enhanced production server for HitchBuddy
// Addresses path resolution issues and supports both static and dynamic serving

const app = express();
const PORT = process.env.PORT || 3000;

// Environment configuration
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.FORCE_DEV_MODE === 'true';
const hasStaticBuild = require('fs').existsSync(path.join(__dirname, 'dist'));

console.log('🚗 HitchBuddy Enhanced Production Server');
console.log('Environment:', isDevelopment ? 'Development' : 'Production');
console.log('Static build available:', hasStaticBuild);

// Security and performance middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true
}));

// Parse JSON and form data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: isDevelopment ? 'development' : 'production',
    staticBuild: hasStaticBuild
  });
});

// API routes placeholder (would be imported from backend)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'HitchBuddy API Ready'
  });
});

// Serve static files if available
if (hasStaticBuild) {
  console.log('📦 Serving static build from dist/');
  app.use(express.static(path.join(__dirname, 'dist')));
  
  // React app fallback for static build
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  console.log('⚠️  No static build found, serving development mode');
  
  // Development mode - serve basic HTML
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HitchBuddy - Sustainable Ride Sharing</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            text-align: center;
            max-width: 600px;
            padding: 2rem;
          }
          .logo {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          .title {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            background: linear-gradient(45deg, #3b82f6, #10b981);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .subtitle {
            font-size: 1.25rem;
            margin-bottom: 2rem;
            opacity: 0.9;
          }
          .status {
            background: rgba(255,255,255,0.1);
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 2rem;
          }
          .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: linear-gradient(45deg, #3b82f6, #10b981);
            color: white;
            text-decoration: none;
            border-radius: 0.5rem;
            font-weight: 600;
            transition: transform 0.2s;
          }
          .btn:hover {
            transform: translateY(-2px);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🚗</div>
          <h1 class="title">HitchBuddy</h1>
          <p class="subtitle">Sustainable Ride Sharing Platform</p>
          <div class="status">
            <p><strong>Status:</strong> Server Running</p>
            <p><strong>Mode:</strong> ${isDevelopment ? 'Development' : 'Production'}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <a href="/health" class="btn">Health Check</a>
        </div>
      </body>
      </html>
    `);
  });
}

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 HitchBuddy server running on port ${PORT}`);
  console.log(`🌐 Access at: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;