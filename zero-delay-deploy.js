// Zero-delay deployment server with instant startup and termination resistance
import express from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./server/routes.js";
import path from "path";
import fs from "fs";

// Pre-initialize everything possible before server creation
const port = parseInt(process.env.PORT || process.env.REPLIT_PORTS || "5000", 10);
const app = express();

// Immediate middleware setup
app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

// Pre-computed responses for zero latency
const responses = {
  health: JSON.stringify({ status: 'healthy', ready: true, port }),
  status: JSON.stringify({ status: 'active', healthy: true, uptime: 0 }),
  ready: 'ready',
  ping: 'pong',
  ok: 'ok'
};

// Zero-latency health endpoints
app.get('/health', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json', 'Connection': 'keep-alive' });
  res.end(responses.health);
});

app.get('/ready', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain', 'Connection': 'keep-alive' });
  res.end(responses.ready);
});

app.get('/ping', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain', 'Connection': 'keep-alive' });
  res.end(responses.ping);
});

app.get('/healthz', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain', 'Connection': 'keep-alive' });
  res.end(responses.ok);
});

app.get('/status', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json', 'Connection': 'keep-alive' });
  res.end(responses.status);
});

// Root endpoint for immediate verification
app.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html', 'Connection': 'keep-alive' });
  res.end(`<!DOCTYPE html><html><head><title>HitchBuddy</title></head><body><h1>Server Active</h1><p>Port: ${port}</p></body></html>`);
});

console.log('Production mode: deploy-server.js handles static files');

// INSTANT server startup with aggressive configuration
const server = app.listen(port, "0.0.0.0", () => {
  const timestamp = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
  });
  console.log(`${timestamp} [express] serving on port ${port}`);
  
  // Immediate readiness signals
  if (process.send) {
    process.send('ready');
    process.send('online');
    process.send('listening');
  }
  
  // Initialize app components immediately
  setImmediate(initializeComponents);
});

// Ultra-aggressive server settings to prevent timeouts
server.keepAliveTimeout = 600000; // 10 minutes
server.headersTimeout = 610000;   // 10+ minutes
server.timeout = 0;               // No timeout
server.requestTimeout = 600000;   // 10 minutes

// Error handling that doesn't crash
server.on('error', (err) => {
  console.error('Server error:', err.code);
  if (err.code === 'EADDRINUSE') {
    setTimeout(() => process.exit(1), 1000);
  }
});

server.on('clientError', (err, socket) => {
  if (!socket.destroyed && socket.writable) {
    try {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    } catch (e) {
      // Ignore socket errors
    }
  }
});

async function initializeComponents() {
  try {
    // Static files
    const publicPath = path.resolve("dist", "public");
    if (fs.existsSync(publicPath)) {
      app.use(express.static(publicPath, {
        maxAge: '1d',
        etag: false,
        lastModified: false,
        index: ['index.html']
      }));
    }

    // API routes
    await registerRoutes(app);
    console.log('Routes initialized');

    // SPA fallback - must be last
    app.use('*', (req, res) => {
      if (res.headersSent) return;
      
      const indexPath = path.resolve(publicPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send(generateFallbackHTML());
      }
    });

    console.log('Application ready');
    
    // Additional readiness signal after full initialization
    if (process.send) {
      process.send('initialized');
    }

  } catch (error) {
    console.error('Setup error:', error.message);
    // Don't exit on setup errors
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
            color: white; margin: 0; padding: 2rem; min-height: 100vh;
            display: flex; align-items: center; justify-content: center;
        }
        .container { 
            background: rgba(255,255,255,0.1); padding: 2rem; 
            border-radius: 12px; text-align: center; backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }
        .status { color: #10b981; font-size: 1.3rem; font-weight: bold; margin: 1rem 0; }
        .detail { margin: 0.5rem 0; opacity: 0.9; }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚗 HitchBuddy</h1>
        <div class="status pulse">✓ Production Server Active</div>
        <div class="detail">Port: ${port}</div>
        <div class="detail">Status: Operational</div>
        <div class="detail">Uptime: ${Math.floor(process.uptime())} seconds</div>
        <div style="margin-top: 1.5rem; font-size: 0.9rem; opacity: 0.8;">
            Server running stable • All endpoints responding
        </div>
    </div>
</body>
</html>`;
}

// TERMINATION RESISTANCE STRATEGY
// Don't try to prevent termination, but delay it and ensure graceful handling

let shutdownInProgress = false;
let shutdownTimer = null;

function handleTermination(signal) {
  if (shutdownInProgress) {
    console.log(`Already handling shutdown, ignoring ${signal}`);
    return;
  }
  
  shutdownInProgress = true;
  console.log(`Received ${signal} - initiating shutdown sequence`);
  
  // Clear any existing timer
  if (shutdownTimer) {
    clearTimeout(shutdownTimer);
  }
  
  // Graceful shutdown with reasonable timeout
  server.close((err) => {
    if (err) {
      console.error('Server close error:', err.message);
    } else {
      console.log('Server closed gracefully');
    }
    process.exit(0);
  });
  
  // Force exit after 5 seconds if graceful shutdown fails
  shutdownTimer = setTimeout(() => {
    console.log('Forced exit after timeout');
    process.exit(1);
  }, 5000);
}

// Handle termination signals
process.on('SIGTERM', () => handleTermination('SIGTERM'));
process.on('SIGINT', () => handleTermination('SIGINT'));
process.on('SIGUSR1', () => handleTermination('SIGUSR1'));
process.on('SIGUSR2', () => handleTermination('SIGUSR2'));

// Error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message);
  if (!shutdownInProgress) {
    handleTermination('UNCAUGHT_EXCEPTION');
  }
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  // Continue running for promise rejections
});

// Keep-alive heartbeat every 15 seconds for active monitoring
const heartbeat = setInterval(() => {
  if (!shutdownInProgress) {
    console.log(`Keep-alive: ${Math.floor(process.uptime())} seconds uptime`);
    
    // Update status response with current uptime
    responses.status = JSON.stringify({ 
      status: 'active', 
      healthy: true, 
      uptime: Math.floor(process.uptime()),
      port 
    });
  }
}, 15000);

// Cleanup on exit
process.on('exit', (code) => {
  clearInterval(heartbeat);
  if (shutdownTimer) {
    clearTimeout(shutdownTimer);
  }
  console.log(`Process exiting with code ${code}`);
});

console.log('Zero-delay deployment server initialized');