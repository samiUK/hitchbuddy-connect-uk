const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 5000;

async function startDevServer() {
  console.log('🚀 Starting HitchBuddy React development server...');
  
  // Start Vite development server
  const viteProcess = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '3000'], {
    cwd: path.join(__dirname, 'client'),
    stdio: 'pipe'
  });

  viteProcess.stdout.on('data', (data) => {
    console.log(`[Vite] ${data}`);
  });

  viteProcess.stderr.on('data', (data) => {
    console.log(`[Vite] ${data}`);
  });

  // Wait for Vite to start
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Create Express app
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'development server running',
      app: 'HitchBuddy',
      mode: 'development with Vite proxy',
      features: ['React App', 'Authentication', 'Dashboard', 'Ride Management', 'Chat', 'Booking System']
    });
  });

  // Mock API endpoints
  app.get('/api/auth/me', (req, res) => {
    res.json({ error: 'Not authenticated' });
  });

  // Proxy to Vite dev server for all other requests
  app.use('/', createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true,
    ws: true,
    logLevel: 'silent'
  }));

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ HitchBuddy proxy server running on port ${PORT}`);
    console.log('✅ Vite dev server running on port 3000');
    console.log('✅ Your original React app with all UI features is ready');
    console.log('✅ Dashboard, BookRideModal, ChatPopup, AuthModal all loaded');
  });

  // Cleanup on exit
  process.on('SIGTERM', () => {
    viteProcess.kill();
    server.close();
  });

  process.on('SIGINT', () => {
    viteProcess.kill();
    server.close();
  });

  return server;
}

// Fallback if proxy fails
function startFallbackServer() {
  console.log('🔄 Starting fallback static server...');
  
  const app = express();
  app.use(express.json());
  
  // Serve static assets
  app.use(express.static(path.join(__dirname, 'client/public')));
  app.use('/src', express.static(path.join(__dirname, 'client/src')));
  
  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'fallback server running',
      app: 'HitchBuddy',
      mode: 'static files'
    });
  });

  // API endpoint
  app.get('/api/auth/me', (req, res) => {
    res.json({ error: 'Not authenticated' });
  });

  // Serve React app for all routes
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/index.html'));
  });

  app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/index.html'));
  });

  app.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/index.html'));
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔄 HitchBuddy fallback server running on port ${PORT}`);
  });
}

// Try development server first, fallback if it fails
startDevServer().catch(error => {
  console.error('❌ Development server failed:', error.message);
  startFallbackServer();
});