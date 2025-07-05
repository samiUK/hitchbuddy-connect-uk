const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Import API routes
const { registerRoutes } = require('./server/routes.ts');

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
    build: 'static'
  });
});

// Register API routes
registerRoutes(app).then(() => {
  console.log('✅ API routes registered successfully');
}).catch(err => {
  console.error('❌ Failed to register API routes:', err);
});

// Serve static files from dist/public
const staticPath = path.join(__dirname, 'dist', 'public');
console.log('📁 Serving static files from:', staticPath);
app.use(express.static(staticPath));

// Catch-all handler for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 HitchBuddy Production Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🌐 Server ready at: http://0.0.0.0:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});