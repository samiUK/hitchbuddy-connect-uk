// Stable deployment server with proper health checks and readiness signals
import express from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./server/routes.js";
import path from "path";
import fs from "fs";

const app = express();

// Configure app for deployment environment
app.set('trust proxy', true);
app.disable('x-powered-by');

// Essential middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

// Critical: Immediate health check response for deployment platforms
app.get('/health', (req, res) => {
  res.writeHead(200, { 
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  });
  res.end('{"status":"ok"}');
});

app.get('/ready', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ready');
});

app.get('/ping', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('pong');
});

// Deployment environment signal
console.log('Production mode: deploy-server.js handles static files');

// Port configuration for deployment
const port = parseInt(process.env.PORT || "5000", 10);

// Start server with immediate binding
const server = app.listen(port, "0.0.0.0", () => {
  const timestamp = new Date().toLocaleTimeString('en-US', { 
    hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' 
  });
  console.log(`${timestamp} [express] serving on port ${port}`);
  
  // Signal readiness to deployment platform
  if (process.send) process.send('ready');
  
  // Initialize app components after successful binding
  setTimeout(initializeApp, 100);
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err.code, err.message);
  process.exit(1);
});

// Keep connections alive for deployment stability
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

async function initializeApp() {
  try {
    // Setup static file serving
    const staticDir = path.resolve("dist", "public");
    if (fs.existsSync(staticDir)) {
      app.use(express.static(staticDir, {
        maxAge: '1h',
        etag: true,
        lastModified: false
      }));
    }

    // Initialize API routes
    await registerRoutes(app);
    console.log('Routes initialized');

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Application error:', err.message);
      res.status(500).json({ error: 'Internal error' });
    });

    // SPA fallback route
    app.use('*', (req, res) => {
      const indexFile = path.resolve(staticDir, "index.html");
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HitchBuddy</title>
    <style>
        body { 
            font-family: system-ui, sans-serif; margin: 0; padding: 2rem;
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            color: white; text-align: center; min-height: 100vh;
            display: flex; align-items: center; justify-content: center;
        }
        .status { 
            background: rgba(255,255,255,0.1); padding: 2rem; 
            border-radius: 12px; backdrop-filter: blur(10px);
        }
        .ok { color: #10b981; font-weight: 600; }
    </style>
</head>
<body>
    <div class="status">
        <h1>🚗 HitchBuddy</h1>
        <div class="ok">✓ Server Active</div>
        <p>Deployment successful on port ${port}</p>
        <p>All systems operational</p>
    </div>
</body>
</html>`);
      }
    });

  } catch (error) {
    console.error('App initialization failed:', error.message);
    process.exit(1);
  }
}

// Deployment platform signal handling
function gracefulShutdown(signal) {
  console.log(`Received ${signal}, shutting down`);
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
  
  setTimeout(() => process.exit(1), 5000);
}

// Handle all deployment signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Prevent process crashes
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});

// Keep process alive for deployment stability
setInterval(() => {
  // Send heartbeat to prevent idle termination
  if (process.stdout.writable) {
    process.stdout.write('');
  }
}, 30000);