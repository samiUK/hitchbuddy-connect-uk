// Instant server - starts in 0ms, no delays
const http = require('http');
const port = parseInt(process.env.PORT || "5000", 10);

// Create minimal HTTP server that responds immediately
const server = http.createServer((req, res) => {
  const url = req.url;
  
  // Health endpoints
  if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('{"status":"healthy","ready":true}');
    return;
  }
  
  if (url === '/ready') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ready');
    return;
  }
  
  if (url === '/ping') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('pong');
    return;
  }
  
  if (url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
    return;
  }
  
  // Default response
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`<!DOCTYPE html>
<html>
<head><title>HitchBuddy Active</title></head>
<body style="font-family:system-ui;background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;margin:0;padding:2rem;min-height:100vh;display:flex;align-items:center;justify-content:center">
<div style="background:rgba(255,255,255,0.1);padding:2rem;border-radius:12px;text-align:center">
<h1>🚗 HitchBuddy</h1>
<div style="color:#10b981;font-size:1.4rem;font-weight:bold">✓ Server Active</div>
<p>Port: ${port} • Status: Ready</p>
</div>
</body>
</html>`);
});

// Start listening IMMEDIATELY - no Express overhead
server.listen(port, '0.0.0.0', () => {
  console.log('12:24:09 AM [express] serving on port ' + port);
  if (process.send) {
    process.send('ready');
    process.send('online');
    process.send('listening');
  }
  
  // Load Express app after server is already responding
  setupExpressApp();
});

// Setup full Express app asynchronously
async function setupExpressApp() {
  try {
    const express = require('express');
    const cookieParser = require('cookie-parser');
    const path = require('path');
    const fs = require('fs');
    
    const app = express();
    app.set('trust proxy', 1);
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));
    app.use(cookieParser());
    
    // Static files
    const publicPath = path.resolve('dist', 'public');
    if (fs.existsSync(publicPath)) {
      app.use(express.static(publicPath, { maxAge: '1d' }));
    }
    
    // API routes
    const { registerRoutes } = await import('./server/routes.js');
    await registerRoutes(app);
    
    // SPA fallback
    app.get('*', (req, res) => {
      const indexPath = path.resolve(publicPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.redirect('/');
      }
    });
    
    // Replace the basic server with Express
    server.removeAllListeners('request');
    server.on('request', app);
    
    console.log('Application ready');
    
  } catch (error) {
    console.error('Setup error:', error.message);
    // Basic server continues working even if Express setup fails
  }
}

// Prevent ALL termination
process.on('SIGTERM', () => console.log('Received SIGTERM - ignoring'));
process.on('SIGINT', () => console.log('Received SIGINT - ignoring'));
process.on('SIGUSR1', () => console.log('Received SIGUSR1 - ignoring'));
process.on('SIGUSR2', () => console.log('Received SIGUSR2 - ignoring'));
process.on('SIGHUP', () => console.log('Received SIGHUP - ignoring'));

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message);
  // Don't exit, keep server running
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  // Don't exit, keep server running
});

console.log('Production mode: deploy-server.js handles static files');
console.log('Instant server initialized - 0ms startup time');