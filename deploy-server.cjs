const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');

console.log('🚀 Starting HitchBuddy Deploy Server...');

const app = express();
// Set PORT for Cloud Run deployment (PORT environment variable or default to 8080 for Cloud Run)
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression());

// CORS middleware
app.use(cors({
  origin: true,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint for Cloud Run
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'production'
  });
});

// Check if dist directory exists and serve static files
const distPath = path.join(__dirname, 'dist', 'public');
if (fs.existsSync(distPath)) {
  console.log('📁 Serving static files from:', distPath);
  app.use(express.static(distPath));
} else {
  console.log('⚠️  dist/public directory not found, serving basic response');
  
  // Basic response when dist is not available
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HitchBuddy - Share Your Journey, Save the Planet</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-800 mb-4">HitchBuddy</h1>
          <p class="text-gray-600 mb-8">Share Your Journey, Save the Planet</p>
          <div class="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <h2 class="text-2xl font-semibold mb-4">Server Status</h2>
            <p class="text-green-600">✅ Deploy server is running</p>
            <p class="text-blue-600">🚀 Ready for deployment</p>
          </div>
        </div>
      </body>
      </html>
    `);
  });
}

// Basic API endpoints for health checking
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    server: 'deploy-server',
    timestamp: new Date().toISOString()
  });
});

// Catch-all handler for client-side routing
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Page not found');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Deploy server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('👋 Received SIGINT, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});