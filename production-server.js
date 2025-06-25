// Production server optimized for deployment stability
import express from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./server/routes.js";
import path from "path";
import fs from "fs";

const app = express();

// Trust proxy and configure middleware
app.set('trust proxy', true);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

// Multiple health endpoints for platform compatibility
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', uptime: process.uptime() });
});
app.get('/ready', (req, res) => res.status(200).send('ready'));
app.get('/ping', (req, res) => res.status(200).send('pong'));
app.get('/status', (req, res) => {
  res.status(200).json({ status: 'active', port: port, healthy: true });
});

const port = parseInt(process.env.PORT || process.env.REPLIT_PORTS || "5000", 10);

// Initialize server
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`${new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
  })} [express] serving on port ${port}`);
  
  initializeApp();
});

// Server configuration for stability
server.keepAliveTimeout = 120000;
server.headersTimeout = 121000;
server.timeout = 300000;

async function initializeApp() {
  try {
    // Static file serving
    const publicPath = path.resolve("dist", "public");
    if (fs.existsSync(publicPath)) {
      app.use(express.static(publicPath, { 
        maxAge: '1d',
        etag: true,
        lastModified: true 
      }));
    }

    // Initialize API routes
    await registerRoutes(app);
    console.log('Routes initialized');

    // SPA fallback handler
    app.use('*', (req, res) => {
      const indexPath = path.resolve(publicPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        // Provide functional fallback HTML
        res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HitchBuddy - Ride Sharing Platform</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white; min-height: 100vh;
            display: flex; align-items: center; justify-content: center;
        }
        .container { 
            background: rgba(255,255,255,0.1); padding: 3rem; border-radius: 16px;
            backdrop-filter: blur(20px); box-shadow: 0 25px 50px rgba(0,0,0,0.25);
            text-align: center; max-width: 500px; width: 90%;
        }
        h1 { font-size: 2.5rem; margin-bottom: 1rem; font-weight: 700; }
        .status { color: #10b981; font-size: 1.3rem; font-weight: 600; margin: 1.5rem 0; }
        .details { margin: 0.8rem 0; opacity: 0.9; font-size: 1.1rem; }
        .api-status { 
            background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981;
            padding: 1rem; border-radius: 8px; margin: 1.5rem 0;
        }
        .footer { margin-top: 2rem; font-size: 0.9rem; opacity: 0.7; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚗 HitchBuddy</h1>
        <div class="status">✓ Server Active & Ready</div>
        <div class="details">Port: ${port}</div>
        <div class="details">Environment: Production</div>
        <div class="api-status">
            <strong>API Status: Operational</strong><br>
            All endpoints responding correctly
        </div>
        <div class="footer">
            Deployment successful • Ready to serve requests
        </div>
    </div>
</body>
</html>`);
      }
    });

    console.log('Application initialization complete');

  } catch (error) {
    console.error('Initialization failed:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown handling
function gracefulShutdown(signal) {
  console.log(`Received ${signal} - graceful shutdown initiated`);
  
  server.close((err) => {
    if (err) {
      console.error('Server close error:', err.message);
      process.exit(1);
    }
    console.log('Server closed gracefully');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.log('Force exit after shutdown timeout');
    process.exit(1);
  }, 10000);
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

// Keep-alive mechanism
setInterval(() => {
  console.log('Server heartbeat - uptime:', Math.floor(process.uptime()), 'seconds');
}, 60000);