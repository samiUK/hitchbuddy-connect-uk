const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { createProxyMiddleware } = require('http-proxy-middleware');

console.log('🚀 Starting HitchBuddy Production Server...');

const app = express();
const PORT = process.env.PORT || 10000;

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
    port: PORT
  });
});

// API routes - proxy to backend server running on port 5000
const apiProxy = createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api'
  },
  onError: (err, req, res) => {
    console.error('API proxy error:', err.message);
    res.status(500).json({ error: 'Backend service unavailable' });
  }
});

app.use('/api', apiProxy);

// Serve static files from dist/public
const staticPath = path.join(__dirname, 'dist', 'public');
console.log('📁 Serving static files from:', staticPath);

// Check if static build exists
const fs = require('fs');
const indexPath = path.join(staticPath, 'index.html');

if (fs.existsSync(indexPath)) {
  console.log('✅ Static build found, serving compiled React app');
  app.use(express.static(staticPath));
  
  // Catch-all handler for SPA routing
  app.get('*', (req, res) => {
    res.sendFile(indexPath);
  });
} else {
  console.log('❌ Static build not found, serving fallback');
  app.get('*', (req, res) => {
    res.status(404).json({ 
      error: 'Static build not found',
      message: 'Run build process to generate static files'
    });
  });
}

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 HitchBuddy Production Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🌐 Server ready at: http://0.0.0.0:${PORT}`);
  console.log(`📦 Static files: ${fs.existsSync(indexPath) ? 'Available' : 'Missing'}`);
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