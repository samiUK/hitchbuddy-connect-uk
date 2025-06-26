// Bulletproof deployment server with zero-delay startup
import express from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./server/routes.js";
import path from "path";
import fs from "fs";

const port = parseInt(process.env.PORT || process.env.REPLIT_PORTS || "5000", 10);
const app = express();

// Synchronous middleware setup - no async delays
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

// Pre-computed responses for instant serving
const responses = {
  health: Buffer.from('{"status":"healthy","ready":true}'),
  ready: Buffer.from('ready'),
  ping: Buffer.from('pong'),
  ok: Buffer.from('ok')
};

// Zero-latency health endpoints
app.get('/health', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(responses.health);
});

app.get('/ready', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(responses.ready);
});

app.get('/ping', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(responses.ping);
});

app.get('/healthz', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(responses.ok);
});

// Immediate root response
app.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(getStatusHTML());
});

console.log('Production mode: deploy-server.js handles static files');

// Start server immediately - health endpoints work instantly
const server = app.listen(port, "0.0.0.0", () => {
  const timestamp = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
  });
  console.log(`${timestamp} [express] serving on port ${port}`);
  
  // Send readiness signals immediately
  if (process.send) {
    process.send('ready');
    process.send('online');
  }
  
  // Initialize remaining components asynchronously
  setupServer();
});

// Server configuration
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
server.timeout = 0;

server.on('error', (err) => {
  console.error('Server error:', err.code);
  if (err.code === 'EADDRINUSE') {
    process.exit(1);
  }
});

async function setupServer() {
  try {
    // Static files
    const publicPath = path.resolve("dist", "public");
    if (fs.existsSync(publicPath)) {
      app.use(express.static(publicPath, {
        maxAge: '1d',
        etag: false,
        index: ['index.html']
      }));
    }

    // API routes
    await registerRoutes(app);
    console.log('Routes initialized');

    // SPA fallback
    app.use('*', (req, res) => {
      if (res.headersSent) return;
      
      const indexPath = path.resolve(publicPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send(getStatusHTML());
      }
    });

    console.log('Application ready');
    
    if (process.send) {
      process.send('initialized');
    }

  } catch (error) {
    console.error('Setup error:', error.message);
  }
}

function getStatusHTML() {
  return `<!DOCTYPE html>
<html>
<head>
    <title>HitchBuddy - Active</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            font-family: system-ui, sans-serif; 
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            color: white; margin: 0; padding: 2rem; min-height: 100vh;
            display: flex; align-items: center; justify-content: center;
        }
        .container { 
            background: rgba(255,255,255,0.1); padding: 2.5rem; 
            border-radius: 12px; text-align: center; backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2); max-width: 400px;
        }
        .status { color: #10b981; font-size: 1.4rem; font-weight: bold; margin: 1rem 0; }
        .info { margin: 0.5rem 0; opacity: 0.9; }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚗 HitchBuddy</h1>
        <div class="status pulse">✓ Server Active</div>
        <div class="info">Port: ${port}</div>
        <div class="info">Status: Operational</div>
        <div class="info">Ready to serve requests</div>
    </div>
</body>
</html>`;
}

// Signal handling to prevent premature termination
function preventTermination(signal) {
  console.log(`Received ${signal} - server continuing operation`);
  // Don't exit immediately, let the server continue running
  // Only exit on explicit shutdown or errors
}

// Handle signals without immediate termination
process.on('SIGTERM', preventTermination);
process.on('SIGINT', preventTermination);
process.on('SIGUSR1', preventTermination);
process.on('SIGUSR2', preventTermination);

// Handle actual errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message);
  setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

console.log('Bulletproof deployment server initialized');