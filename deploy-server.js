// Production server optimized for deployment environments
import express from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./server/routes.js";
import path from "path";
import fs from "fs";

console.log('Production mode: deploy-server.js handles static files');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve static files first for faster response
const distPath = path.resolve(process.cwd(), "dist", "public");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Initialize routes
let routesReady = false;
registerRoutes(app).then(() => {
  routesReady = true;
  console.log('Routes initialized');
}).catch(err => {
  console.error('Route initialization failed:', err);
  process.exit(1);
});

// Fallback route for SPA
app.use("*", (req, res) => {
  if (!routesReady && req.path.startsWith('/api/')) {
    return res.status(503).json({ error: 'Server starting up' });
  }
  
  const indexPath = path.resolve(distPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send(`
<!DOCTYPE html>
<html>
<head><title>HitchBuddy</title></head>
<body>
  <h1>HitchBuddy</h1>
  <p>Server is running in production mode</p>
  <script>setTimeout(() => location.reload(), 2000);</script>
</body>
</html>
    `);
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server with proper configuration
const port = parseInt(process.env.PORT || process.env.REPLIT_PORTS || "5000", 10);
const host = "0.0.0.0";

const server = app.listen(port, host, () => {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  });
  console.log(`${timeString} [express] serving on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});