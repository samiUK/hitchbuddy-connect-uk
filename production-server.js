// Robust production server for deployment environments
import express from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./server/routes.js";
import path from "path";
import fs from "fs";

const app = express();

// Trust proxy for deployment environments
app.set('trust proxy', true);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

// Immediate health check - critical for deployment verification
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    pid: process.pid
  });
});

// Quick ping endpoint
app.get('/ping', (req, res) => res.send('pong'));

const port = parseInt(process.env.PORT || process.env.REPLIT_PORTS || "5000", 10);
const host = process.env.HOST || "0.0.0.0";

console.log(`Starting production server on ${host}:${port}`);

// Start server with robust error handling
const server = app.listen(port, host, () => {
  const address = server.address();
  console.log(`Production mode: deploy-server.js handles static files`);
  console.log(`Server listening on ${host}:${port}`);
  console.log(`Health check available at http://${host}:${port}/health`);
  
  // Initialize application after server is listening
  initializeApp();
});

server.on('error', (err) => {
  console.error('Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use`);
    process.exit(1);
  }
});

async function initializeApp() {
  try {
    // Setup static file serving
    const distPath = path.resolve(process.cwd(), "dist", "public");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath, {
        maxAge: '1d',
        etag: false
      }));
      console.log(`Serving static files from ${distPath}`);
    }

    // Initialize API routes
    await registerRoutes(app);
    console.log('API routes initialized');

    // SPA fallback route (must be last)
    app.use("*", (req, res) => {
      const indexPath = path.resolve(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        // Minimal fallback HTML
        res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HitchBuddy</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
               text-align: center; padding: 50px; background: #f5f5f5; }
        .container { max-width: 400px; margin: 0 auto; background: white; 
                     padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .status { color: #28a745; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>HitchBuddy</h1>
        <p class="status">Server Running</p>
        <p>Production deployment successful</p>
        <p><small>API endpoints are available</small></p>
    </div>
</body>
</html>`);
      }
    });

    // Global error handler
    app.use((err, req, res, next) => {
      console.error('Application error:', err);
      res.status(500).json({ 
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    });

    console.log('Application initialization complete');
    
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

// Graceful shutdown handling
function gracefulShutdown(signal) {
  console.log(`Received ${signal}, shutting down gracefully`);
  
  server.close((err) => {
    if (err) {
      console.error('Error during server shutdown:', err);
      process.exit(1);
    }
    console.log('Server closed successfully');
    process.exit(0);
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
}

// Handle various termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // Nodemon restart

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});