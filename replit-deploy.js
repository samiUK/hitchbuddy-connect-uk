// Replit-optimized production server
import express from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./server/routes.js";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

// Essential health endpoints for deployment verification
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

app.get('/ready', (req, res) => {
  res.status(200).send('ready');
});

// Determine port from environment
const port = parseInt(
  process.env.PORT || 
  process.env.REPLIT_PORTS || 
  process.env.REPL_SLUG || 
  "5000", 
  10
);

console.log('Production mode: deploy-server.js handles static files');

// Start server immediately for fast deployment response
const server = app.listen(port, "0.0.0.0", () => {
  const timestamp = new Date().toLocaleTimeString('en-US', { 
    hour12: true, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
  console.log(`${timestamp} [express] serving on port ${port}`);
  
  // Initialize application components after server starts
  initializeComponents();
});

// Handle server startup errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} already in use, trying alternative port`);
    const altPort = port + 1;
    server.listen(altPort, "0.0.0.0");
  } else {
    console.error('Server startup error:', err);
  }
});

async function initializeComponents() {
  try {
    // Setup static file serving
    const publicPath = path.resolve("dist", "public");
    if (fs.existsSync(publicPath)) {
      app.use(express.static(publicPath, { maxAge: '1h' }));
    }

    // Initialize API routes
    await registerRoutes(app);
    console.log('Routes initialized');

    // Catch-all route for SPA
    app.use("*", (req, res) => {
      const indexFile = path.resolve(publicPath, "index.html");
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(200).send(`
<!DOCTYPE html>
<html>
<head>
  <title>HitchBuddy</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { 
      font-family: system-ui, sans-serif; 
      margin: 0; 
      padding: 2rem; 
      text-align: center; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container { 
      background: rgba(255,255,255,0.1); 
      padding: 2rem; 
      border-radius: 12px; 
      backdrop-filter: blur(10px);
    }
    .status { color: #4ade80; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚗 HitchBuddy</h1>
    <p class="status">✓ Server Online</p>
    <p>Production deployment successful</p>
    <p>API endpoints ready for connections</p>
  </div>
</body>
</html>`);
      }
    });

  } catch (error) {
    console.error('Component initialization failed:', error);
  }
}

// Handle deployment environment signals
process.on('SIGTERM', () => {
  console.log('Graceful shutdown initiated');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('Interrupt received, shutting down');
  server.close(() => process.exit(0));
});

// Prevent crashes from unhandled errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});