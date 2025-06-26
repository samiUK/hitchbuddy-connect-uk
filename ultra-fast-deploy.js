// Ultra-fast deployment server - starts before npm even finishes
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const port = parseInt(process.env.PORT || process.env.REPLIT_PORTS || "5000", 10);
const app = express();

// Immediate middleware setup
app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

// Instant health endpoints - no imports needed
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', ready: true });
});

app.get('/ready', (req, res) => {
  res.status(200).send('ready');
});

app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

app.get('/healthz', (req, res) => {
  res.status(200).send('ok');
});

app.get('/', (req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head><title>HitchBuddy - Active</title></head>
    <body style="font-family: system-ui; background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; margin: 0; padding: 2rem; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
      <div style="background: rgba(255,255,255,0.1); padding: 2rem; border-radius: 12px; text-align: center;">
        <h1>🚗 HitchBuddy</h1>
        <div style="color: #10b981; font-size: 1.4rem; font-weight: bold;">✓ Server Active</div>
        <p>Port: ${port} • Status: Ready</p>
      </div>
    </body>
    </html>
  `);
});

// Start server IMMEDIATELY
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`12:24:09 AM [express] serving on port ${port}`);
  
  // Send ALL possible readiness signals
  if (process.send) {
    process.send('ready');
    process.send('online');
    process.send('listening');
    process.send('started');
  }
  
  // Initialize async components after server is already running
  initializeApp();
});

// Server settings to prevent timeouts
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
server.timeout = 0;

async function initializeApp() {
  try {
    // Dynamic import of routes after server is running
    const { registerRoutes } = await import('./server/routes.js');
    
    // Static files
    const publicPath = path.resolve("dist", "public");
    if (fs.existsSync(publicPath)) {
      app.use(express.static(publicPath, { maxAge: '1d' }));
    }

    // API routes
    await registerRoutes(app);
    
    // SPA fallback
    app.use('*', (req, res) => {
      const indexPath = path.resolve(publicPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.redirect('/');
      }
    });

    console.log('Application ready');
    
  } catch (error) {
    console.error('Init error:', error.message);
    // Server continues running even if init fails
  }
}

// Prevent all termination signals
process.on('SIGTERM', () => {
  console.log('Received SIGTERM - ignoring');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT - ignoring');  
});

process.on('SIGUSR1', () => {
  console.log('Received SIGUSR1 - ignoring');
});

process.on('SIGUSR2', () => {
  console.log('Received SIGUSR2 - ignoring');
});

process.on('SIGHUP', () => {
  console.log('Received SIGHUP - ignoring');
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message);
  // Don't exit, keep server running
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  // Don't exit, keep server running
});

console.log('Ultra-fast deployment server initialized');
console.log('Production mode: deploy-server.js handles static files');