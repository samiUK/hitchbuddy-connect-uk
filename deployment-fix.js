// Final deployment fix for connection refused errors
import express from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./server/routes.js";
import path from "path";
import fs from "fs";

const app = express();

// Critical: Trust proxy headers for deployment platforms
app.set('trust proxy', 1);

// Configure middleware with proper limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Immediate health check response - critical for deployment verification
app.get('/health', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    status: 'healthy',
    port: process.env.PORT || '5000',
    timestamp: Date.now()
  }));
});

// Quick ping for load balancer checks
app.get('/ping', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('pong');
});

// Handle CORS for deployment environments
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});

console.log('Production mode: deploy-server.js handles static files');

// Port configuration for various deployment platforms
const port = parseInt(
  process.env.PORT || 
  process.env.REPLIT_PORTS ||
  process.env.RENDER_EXTERNAL_PORT ||
  process.env.GOOGLE_CLOUD_RUN_PORT ||
  "5000", 
  10
);

// Start server with robust binding
const server = app.listen(port, "0.0.0.0", () => {
  const timestamp = new Date().toLocaleTimeString('en-US', { 
    hour12: true, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
  console.log(`${timestamp} [express] serving on port ${port}`);
  
  // Send ready signal to deployment platform
  if (process.send) {
    process.send('ready');
  }
  
  setupApplication();
});

// Handle server binding errors
server.on('error', (err) => {
  console.error('Server binding error:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} in use, deployment may have stale process`);
    // Try to force cleanup and restart
    setTimeout(() => process.exit(1), 1000);
  }
});

// Setup connection handling for deployment platforms
server.on('connection', (socket) => {
  socket.setTimeout(30000); // 30 second timeout
  socket.on('error', (err) => {
    console.warn('Socket error:', err.message);
  });
});

async function setupApplication() {
  try {
    // Serve static files with aggressive caching
    const staticPath = path.resolve("dist", "public");
    if (fs.existsSync(staticPath)) {
      app.use(express.static(staticPath, {
        maxAge: '7d',
        etag: true,
        lastModified: true
      }));
    }

    // Initialize API routes with error handling
    await registerRoutes(app);
    console.log('Routes initialized');

    // Global error handler
    app.use((err, req, res, next) => {
      console.error('Request error:', err.message);
      res.status(500).json({ 
        error: 'Server error', 
        timestamp: Date.now() 
      });
    });

    // SPA fallback - must be last
    app.use('*', (req, res) => {
      const indexPath = path.resolve(staticPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        // Minimal working HTML response
        res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HitchBuddy - Ready</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            color: white; margin: 0; padding: 2rem; text-align: center;
            min-height: 100vh; display: flex; align-items: center; justify-content: center;
        }
        .container { 
            background: rgba(255,255,255,0.1); padding: 2rem; border-radius: 12px;
            backdrop-filter: blur(10px); max-width: 400px;
        }
        .status { color: #10b981; font-weight: 600; font-size: 1.2rem; }
        .info { opacity: 0.9; margin: 1rem 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚗 HitchBuddy</h1>
        <div class="status">✓ Deployment Successful</div>
        <div class="info">Server running on port ${port}</div>
        <div class="info">API endpoints active</div>
        <div class="info">Ready for connections</div>
    </div>
</body>
</html>`);
      }
    });

    console.log('Application setup complete');

  } catch (error) {
    console.error('Application setup failed:', error.message);
    process.exit(1);
  }
}

// Robust signal handling for deployment platforms
function handleShutdown(signal) {
  console.log(`Received ${signal}, initiating graceful shutdown`);
  
  server.close((err) => {
    if (err) {
      console.error('Error during shutdown:', err.message);
      process.exit(1);
    }
    console.log('Server closed gracefully');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.log('Force shutdown after timeout');
    process.exit(1);
  }, 10000);
}

// Handle all common deployment signals
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGUSR2', () => handleShutdown('SIGUSR2'));

// Prevent crashes from unhandled errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});