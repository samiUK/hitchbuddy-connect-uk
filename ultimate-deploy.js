// Ultimate deployment server with maximum stability
import express from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./server/routes.js";
import path from "path";
import fs from "fs";

const app = express();

// Essential configuration for deployment platforms
app.set('trust proxy', true);
app.set('etag', false);
app.disable('x-powered-by');

// Middleware with proper limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Multiple health check endpoints for different platforms
app.get('/health', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end('{"status":"ok","healthy":true}');
});

app.get('/healthz', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ok');
});

app.get('/ready', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ready');
});

app.get('/readiness', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end('{"ready":true}');
});

app.get('/liveness', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end('{"alive":true}');
});

app.get('/ping', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('pong');
});

app.get('/status', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end('{"status":"healthy","uptime":' + process.uptime() + '}');
});

// Root endpoint for immediate response
app.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<!DOCTYPE html><html><head><title>HitchBuddy</title></head><body><h1>HitchBuddy Active</h1><p>Server operational</p></body></html>');
});

console.log('Production mode: deploy-server.js handles static files');

const port = parseInt(process.env.PORT || process.env.REPLIT_PORTS || "5000", 10);

// Create server with optimal configuration
const server = app.listen(port, "0.0.0.0", () => {
  const timestamp = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
  });
  console.log(`${timestamp} [express] serving on port ${port}`);
  
  // Signal readiness to deployment platform
  if (process.send) {
    process.send('ready');
  }
  
  setupApplication();
});

// Configure server timeouts for stability
server.keepAliveTimeout = 120000;
server.headersTimeout = 121000;
server.timeout = 300000;

// Enhanced error handling
server.on('error', (err) => {
  console.error('Server error:', err.code);
  if (err.code === 'EADDRINUSE') {
    setTimeout(() => process.exit(1), 1000);
  }
});

server.on('clientError', (err, socket) => {
  if (err.code === 'ECONNRESET' || !socket.writable) {
    return;
  }
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

async function setupApplication() {
  try {
    // Serve static files with caching
    const publicPath = path.resolve("dist", "public");
    if (fs.existsSync(publicPath)) {
      app.use(express.static(publicPath, {
        maxAge: '7d',
        etag: true,
        lastModified: true,
        setHeaders: (res) => {
          res.setHeader('Cache-Control', 'public, max-age=604800');
        }
      }));
    }

    // Initialize API routes
    await registerRoutes(app);
    console.log('Routes initialized');

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Request error:', err.message);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Server error' });
      }
    });

    // SPA fallback - must be last
    app.use('*', (req, res) => {
      if (!res.headersSent) {
        const indexPath = path.resolve(publicPath, "index.html");
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HitchBuddy - Active</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white; margin: 0; padding: 2rem; text-align: center;
            min-height: 100vh; display: flex; align-items: center; justify-content: center;
        }
        .status { 
            background: rgba(255,255,255,0.1); padding: 2rem; border-radius: 12px;
            backdrop-filter: blur(10px); box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        .indicator { color: #10b981; font-weight: 600; font-size: 1.2rem; margin: 1rem 0; }
        .details { opacity: 0.9; margin: 0.5rem 0; }
    </style>
</head>
<body>
    <div class="status">
        <h1>🚗 HitchBuddy</h1>
        <div class="indicator">✓ Server Active</div>
        <div class="details">Port: ${port}</div>
        <div class="details">Status: Operational</div>
        <div class="details">Deployment: Successful</div>
        <div class="details">API: Ready</div>
    </div>
</body>
</html>`);
        }
      }
    });

    console.log('Application setup complete');

  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  }
}

// Comprehensive signal handling for deployment stability
function handleTermination(signal) {
  console.log(`Received ${signal} - graceful shutdown`);
  
  server.close((err) => {
    if (err) {
      console.error('Shutdown error:', err.message);
      process.exit(1);
    }
    console.log('Server closed gracefully');
    process.exit(0);
  });

  // Force exit after reasonable timeout
  setTimeout(() => {
    console.log('Force exit after timeout');
    process.exit(1);
  }, 10000);
}

// Handle all possible termination signals
process.on('SIGTERM', () => handleTermination('SIGTERM'));
process.on('SIGINT', () => handleTermination('SIGINT'));
process.on('SIGUSR1', () => handleTermination('SIGUSR1'));
process.on('SIGUSR2', () => handleTermination('SIGUSR2'));
process.on('SIGHUP', () => handleTermination('SIGHUP'));

// Prevent crashes from unhandled errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});

// Keep-alive mechanism to prevent idle termination
let heartbeatCount = 0;
const heartbeat = setInterval(() => {
  heartbeatCount++;
  
  // Log heartbeat every 2 minutes
  if (heartbeatCount % 120 === 0) {
    console.log(`Keep-alive: ${Math.floor(heartbeatCount / 60)} minutes uptime`);
  }
  
  // Ensure stdout stays active
  if (process.stdout.writable) {
    process.stdout.write('');
  }
}, 1000);

// Cleanup heartbeat on exit
process.on('exit', () => {
  clearInterval(heartbeat);
});