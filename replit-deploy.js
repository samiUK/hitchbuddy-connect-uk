// Replit deployment server with advanced signal handling
import express from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./server/routes.js";
import path from "path";
import fs from "fs";

const app = express();

// Essential middleware
app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

// Critical health endpoints
const healthResponse = { status: 'ok', healthy: true, timestamp: Date.now() };
app.get('/health', (req, res) => res.json(healthResponse));
app.get('/healthz', (req, res) => res.send('ok'));
app.get('/ready', (req, res) => res.send('ready'));
app.get('/ping', (req, res) => res.send('pong'));

console.log('Production mode: deploy-server.js handles static files');

const port = parseInt(process.env.PORT || "5000", 10);

// Create server with immediate startup
const server = app.listen(port, "0.0.0.0", () => {
  const time = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
  });
  console.log(`${time} [express] serving on port ${port}`);
  initializeComponents();
});

// Configure for stability
server.keepAliveTimeout = 120000;
server.headersTimeout = 121000;
server.timeout = 120000;

async function initializeComponents() {
  try {
    // Serve static files
    const publicPath = path.resolve("dist", "public");
    if (fs.existsSync(publicPath)) {
      app.use(express.static(publicPath, { maxAge: '1d' }));
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
        res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>HitchBuddy Active</title>
    <style>
        body { font-family: system-ui; background: #1e40af; color: white; 
               text-align: center; padding: 50px; margin: 0; }
        .status { background: rgba(255,255,255,0.1); padding: 30px; 
                  border-radius: 10px; display: inline-block; }
        .green { color: #10b981; font-weight: bold; }
    </style>
</head>
<body>
    <div class="status">
        <h1>🚗 HitchBuddy</h1>
        <div class="green">✓ Server Active</div>
        <p>Port: ${port}</p>
        <p>Status: Operational</p>
    </div>
</body>
</html>`);
      }
    });

    console.log('Application ready');
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

// Advanced termination prevention
let isShuttingDown = false;

function handleShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log(`Received ${signal} - initiating graceful shutdown`);
  
  // Close server gracefully
  server.close((err) => {
    if (err) {
      console.error('Server close error:', err);
      process.exit(1);
    }
    console.log('Server closed gracefully');
    process.exit(0);
  });

  // Force exit after timeout
  setTimeout(() => {
    console.log('Forced exit after timeout');
    process.exit(1);
  }, 5000);
}

// Handle all termination signals
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGUSR1', () => handleShutdown('SIGUSR1'));
process.on('SIGUSR2', () => handleShutdown('SIGUSR2'));

// Error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message);
  if (!isShuttingDown) {
    handleShutdown('UNCAUGHT_EXCEPTION');
  }
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  if (!isShuttingDown) {
    handleShutdown('UNHANDLED_REJECTION');
  }
});

// Keep-alive heartbeat (every 30 seconds)
const heartbeat = setInterval(() => {
  if (!isShuttingDown) {
    console.log('Keep-alive heartbeat');
  }
}, 30000);

// Cleanup on exit
process.on('exit', () => {
  clearInterval(heartbeat);
  console.log('Process exiting');
});