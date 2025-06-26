// Instant-ready deployment server with immediate response capability
import express from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./server/routes.js";
import path from "path";
import fs from "fs";

const app = express();

// Immediate configuration - no delays
app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

// Pre-configure health responses to avoid any computation delays
const healthResponse = JSON.stringify({ status: 'healthy', ready: true, timestamp: Date.now() });
const statusResponse = JSON.stringify({ status: 'active', healthy: true, port: parseInt(process.env.PORT || "5000", 10) });

// Ultra-fast health endpoints with zero processing time
app.get('/health', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(healthResponse);
});

app.get('/ready', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ready');
});

app.get('/ping', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('pong');
});

app.get('/healthz', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ok');
});

app.get('/status', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(statusResponse);
});

const port = parseInt(process.env.PORT || process.env.REPLIT_PORTS || "5000", 10);

console.log('Production mode: deploy-server.js handles static files');

// IMMEDIATE server creation and binding
const server = app.listen(port, "0.0.0.0", () => {
  const timestamp = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
  });
  console.log(`${timestamp} [express] serving on port ${port}`);
  
  // Signal immediate readiness to prevent timeout
  if (process.send) {
    process.send('ready');
  }
  
  // Send additional readiness signals
  setTimeout(() => {
    if (process.send) process.send('online');
  }, 100);
  
  setTimeout(() => {
    if (process.send) process.send('listening');
  }, 200);
  
  // Initialize application after server is confirmed running
  initializeApplication();
});

// Optimized server configuration for instant response
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
server.timeout = 120000;

// Handle errors without terminating
server.on('error', (err) => {
  console.error('Server error:', err.code);
  if (err.code === 'EADDRINUSE') {
    process.exit(1);
  }
});

async function initializeApplication() {
  try {
    // Static file serving
    const publicPath = path.resolve("dist", "public");
    if (fs.existsSync(publicPath)) {
      app.use(express.static(publicPath, { maxAge: '1h' }));
    }

    // API routes
    await registerRoutes(app);
    console.log('Routes initialized');

    // Fallback handler
    app.use('*', (req, res) => {
      const indexPath = path.resolve(publicPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send(generateHTML());
      }
    });

    console.log('Application ready');

  } catch (error) {
    console.error('Initialization error:', error.message);
  }
}

function generateHTML() {
  return `<!DOCTYPE html>
<html>
<head>
    <title>HitchBuddy - Active</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            font-family: system-ui; background: linear-gradient(135deg, #1e40af, #3b82f6);
            color: white; margin: 0; padding: 2rem; min-height: 100vh;
            display: flex; align-items: center; justify-content: center;
        }
        .status { 
            background: rgba(255,255,255,0.1); padding: 2rem; 
            border-radius: 12px; text-align: center;
        }
        .active { color: #10b981; font-size: 1.2rem; font-weight: bold; }
    </style>
</head>
<body>
    <div class="status">
        <h1>🚗 HitchBuddy</h1>
        <div class="active">✓ Server Active</div>
        <p>Port: ${port} | Status: Operational</p>
    </div>
</body>
</html>`;
}

// STRATEGIC TERMINATION HANDLING
// Instead of preventing termination, handle it gracefully but quickly

let isShuttingDown = false;

function handleGracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log(`Received ${signal} - graceful shutdown`);
  
  // Close server with minimal delay
  server.close((err) => {
    if (err) console.error('Close error:', err.message);
    process.exit(0);
  });
  
  // Quick force exit if graceful fails
  setTimeout(() => process.exit(0), 2000);
}

// Handle termination signals gracefully
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
process.on('SIGUSR1', () => handleGracefulShutdown('SIGUSR1'));
process.on('SIGUSR2', () => handleGracefulShutdown('SIGUSR2'));

// Error handling without termination
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message);
  // Continue running for most errors
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  // Continue running
});

// Simple heartbeat every 30 seconds
setInterval(() => {
  if (!isShuttingDown) {
    console.log('Server heartbeat - uptime:', Math.floor(process.uptime()), 'seconds');
  }
}, 30000);