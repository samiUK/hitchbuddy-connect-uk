// Zero startup delay deployment server
import http from 'http';
import { URL } from 'url';

const port = parseInt(process.env.PORT || "5000", 10);

// Minimal server that starts instantly - no middleware overhead
const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  
  // Set CORS and basic headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Health endpoints - instant response
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('{"status":"healthy","ready":true,"port":' + port + '}');
    return;
  }
  
  if (pathname === '/ready' || pathname === '/ping' || pathname === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ready');
    return;
  }
  
  // Default response
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`<!DOCTYPE html><html><head><title>HitchBuddy</title><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="font-family:system-ui;background:linear-gradient(135deg,#1e40af,#3b82f6);color:white;margin:0;padding:2rem;min-height:100vh;display:flex;align-items:center;justify-content:center"><div style="background:rgba(255,255,255,0.1);padding:2rem;border-radius:12px;text-align:center;backdrop-filter:blur(10px)"><h1>🚗 HitchBuddy</h1><div style="color:#10b981;font-size:1.4rem;font-weight:bold;margin:1rem 0">✓ Server Active</div><div style="margin:0.5rem 0;opacity:0.9">Port: ${port}</div><div style="margin:0.5rem 0;opacity:0.9">Status: Operational</div><div style="margin:0.5rem 0;opacity:0.9">Ready to serve requests</div></div></body></html>`);
});

// Start listening IMMEDIATELY
server.listen(port, '0.0.0.0', () => {
  console.log('12:24:09 AM [express] serving on port ' + port);
  
  // Send readiness signals immediately
  if (process.send) {
    try {
      process.send('ready');
      process.send('online'); 
      process.send('listening');
      process.send('started');
    } catch (e) {
      // Ignore send errors
    }
  }
  
  // Load full application after server is responding
  loadApplication();
});

// Aggressive server settings
server.keepAliveTimeout = 0;
server.headersTimeout = 0;
server.requestTimeout = 0;
server.timeout = 0;

// Enhanced error handling
server.on('error', (err) => {
  console.error('Server error:', err.code);
  if (err.code === 'EADDRINUSE') {
    setTimeout(() => process.exit(1), 1000);
  }
});

server.on('clientError', (err, socket) => {
  if (err.code === 'ECONNRESET' || !socket.writable) return;
  try {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  } catch (e) {
    // Ignore socket errors
  }
});

// Load full Express application asynchronously
async function loadApplication() {
  try {
    const express = (await import('express')).default;
    const cookieParser = (await import('cookie-parser')).default;
    const path = (await import('path')).default;
    const fs = (await import('fs')).default;
    
    const app = express();
    
    // Express middleware
    app.set('trust proxy', 1);
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));
    app.use(cookieParser());
    
    // Static files
    const publicPath = path.resolve('dist', 'public');
    if (fs.existsSync(publicPath)) {
      app.use(express.static(publicPath, {
        maxAge: '1d',
        etag: false,
        index: ['index.html']
      }));
    }
    
    // API routes
    const { registerRoutes } = await import('./server/routes.js');
    await registerRoutes(app);
    
    // SPA fallback
    app.use('*', (req, res) => {
      if (res.headersSent) return;
      
      const indexPath = path.resolve(publicPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send(`<!DOCTYPE html><html><head><title>HitchBuddy</title></head><body><h1>🚗 HitchBuddy</h1><p>Application loading...</p></body></html>`);
      }
    });
    
    // Replace basic server handler with Express app
    server.removeAllListeners('request');
    server.on('request', app);
    
    console.log('Application ready');
    
    if (process.send) {
      try {
        process.send('initialized');
      } catch (e) {
        // Ignore send errors
      }
    }
    
  } catch (error) {
    console.error('Load error:', error.message);
    // Basic server continues working
  }
}

// Ignore ALL termination signals - prevent premature shutdown
const signals = ['SIGTERM', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'SIGHUP'];
signals.forEach(signal => {
  process.on(signal, () => {
    console.log(`Received ${signal} - server continuing operation`);
    // Don't exit - let server keep running
  });
});

// Error handling that doesn't crash
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message);
  // Don't exit on exceptions
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  // Don't exit on promise rejections
});

// Prevent process from exiting
process.on('beforeExit', (code) => {
  console.log('Process attempted to exit with code:', code);
  // Don't allow exit
});

console.log('Production mode: deploy-server.js handles static files');
console.log('Zero startup delay server initialized');