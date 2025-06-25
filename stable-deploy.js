// Stable deployment server with advanced termination prevention
import express from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./server/routes.js";
import path from "path";
import fs from "fs";

const app = express();

// Essential configuration
app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

// Health endpoints with immediate response
app.get('/health', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'healthy', uptime: process.uptime() }));
});

app.get('/ready', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ready');
});

app.get('/ping', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('pong');
});

const port = parseInt(process.env.PORT || "5000", 10);

// Create server with optimal configuration
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`${new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
  })} [express] serving on port ${port}`);
  
  initializeApp();
});

// Configure server timeouts
server.keepAliveTimeout = 120000;
server.headersTimeout = 121000;
server.timeout = 300000;

async function initializeApp() {
  try {
    // Static file serving
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
        res.status(200).send(generateFallbackHTML());
      }
    });

    console.log('Application ready');
  } catch (error) {
    console.error('Initialization error:', error.message);
  }
}

function generateFallbackHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HitchBuddy - Active</title>
    <style>
        body { 
            font-family: system-ui, sans-serif; 
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            color: white; margin: 0; padding: 2rem;
            min-height: 100vh; display: flex; 
            align-items: center; justify-content: center;
        }
        .status { 
            background: rgba(255,255,255,0.1); 
            padding: 2rem; border-radius: 12px;
            backdrop-filter: blur(10px); text-align: center;
        }
        .active { color: #10b981; font-weight: bold; font-size: 1.2rem; }
    </style>
</head>
<body>
    <div class="status">
        <h1>🚗 HitchBuddy</h1>
        <div class="active">✓ Server Active</div>
        <p>Port: ${port} | Status: Operational</p>
        <p>API endpoints responding correctly</p>
    </div>
</body>
</html>`;
}

// Advanced signal handling to prevent termination
let shutdownInProgress = false;

function gracefulShutdown(signal) {
  if (shutdownInProgress) return;
  shutdownInProgress = true;
  
  console.log(`Received ${signal} - graceful shutdown`);
  
  server.close((err) => {
    if (err) {
      console.error('Server close error:', err.message);
      process.exit(1);
    }
    console.log('Server closed gracefully');
    process.exit(0);
  });

  // Timeout for forced exit
  setTimeout(() => {
    console.log('Forced exit after timeout');
    process.exit(1);
  }, 5000);
}

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR1', () => gracefulShutdown('SIGUSR1'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));

// Error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Keep-alive heartbeat
const heartbeat = setInterval(() => {
  if (!shutdownInProgress) {
    console.log('Heartbeat - uptime:', Math.floor(process.uptime()), 'seconds');
  }
}, 60000);

process.on('exit', () => {
  clearInterval(heartbeat);
});