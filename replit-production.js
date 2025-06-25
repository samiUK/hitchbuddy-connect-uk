// Replit production server optimized to prevent termination
import express from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./server/routes.js";
import path from "path";
import fs from "fs";

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

// Critical health endpoints that respond immediately
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: Date.now() });
});

app.get('/ready', (req, res) => {
  res.status(200).send('ready');
});

app.get('/', (req, res) => {
  res.status(200).send(`<!DOCTYPE html>
<html><head><title>HitchBuddy</title></head>
<body><h1>HitchBuddy Server Running</h1><p>Status: Active</p></body></html>`);
});

console.log('Production mode: deploy-server.js handles static files');

const port = parseInt(process.env.PORT || "5000", 10);

// Start server with immediate response
const server = app.listen(port, "0.0.0.0", () => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
  });
  console.log(`${timeStr} [express] serving on port ${port}`);
  
  // Initialize after binding
  initializeServer();
});

// Configure server for stability
server.keepAliveTimeout = 120000;
server.headersTimeout = 121000;
server.timeout = 120000;

async function initializeServer() {
  try {
    // Static files
    const publicPath = path.resolve("dist", "public");
    if (fs.existsSync(publicPath)) {
      app.use(express.static(publicPath, { maxAge: '1d' }));
    }

    // API routes
    await registerRoutes(app);
    console.log('Routes initialized');

    // Fallback
    app.use('*', (req, res) => {
      const indexPath = path.resolve(publicPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>HitchBuddy</title>
    <style>
        body { font-family: system-ui; background: #1e40af; color: white; 
               text-align: center; padding: 50px; }
        .container { background: rgba(255,255,255,0.1); padding: 30px; 
                     border-radius: 10px; display: inline-block; }
    </style>
</head>
<body>
    <div class="container">
        <h1>HitchBuddy</h1>
        <p>Server running on port ${port}</p>
        <p>Status: Operational</p>
    </div>
</body>
</html>`);
      }
    });

  } catch (error) {
    console.error('Initialization error:', error);
  }
}

// Handle deployment signals gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received');
  server.close(() => process.exit(0));
});

// Keep alive mechanism
let keepAliveCounter = 0;
setInterval(() => {
  keepAliveCounter++;
  if (keepAliveCounter % 120 === 0) {
    console.log('Keep-alive heartbeat');
  }
}, 1000);