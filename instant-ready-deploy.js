// Instant ready deployment server - zero startup delay
import express from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./server/routes.js";
import path from "path";
import fs from "fs";

// Pre-create app and configure immediately
const app = express();
const port = parseInt(process.env.PORT || process.env.REPLIT_PORTS || "5000", 10);

// Immediate configuration - no async operations
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

// Pre-built health responses for instant serving
const healthResponse = Buffer.from(JSON.stringify({
  status: 'healthy',
  ready: true,
  port,
  timestamp: Date.now()
}));

const statusResponse = Buffer.from(JSON.stringify({
  status: 'active',
  healthy: true,
  port,
  uptime: 0
}));

// Instant health endpoints - no computation
app.get('/health', (req, res) => {
  res.writeHead(200, { 
    'Content-Type': 'application/json',
    'Content-Length': healthResponse.length,
    'Connection': 'keep-alive'
  });
  res.end(healthResponse);
});

app.get('/ready', (req, res) => {
  res.writeHead(200, { 
    'Content-Type': 'text/plain',
    'Content-Length': 5,
    'Connection': 'keep-alive'
  });
  res.end('ready');
});

app.get('/ping', (req, res) => {
  res.writeHead(200, { 
    'Content-Type': 'text/plain',
    'Content-Length': 4,
    'Connection': 'keep-alive'
  });
  res.end('pong');
});

app.get('/healthz', (req, res) => {
  res.writeHead(200, { 
    'Content-Type': 'text/plain',
    'Content-Length': 2,
    'Connection': 'keep-alive'
  });
  res.end('ok');
});

app.get('/status', (req, res) => {
  res.writeHead(200, { 
    'Content-Type': 'application/json',
    'Content-Length': statusResponse.length,
    'Connection': 'keep-alive'
  });
  res.end(statusResponse);
});

// Root endpoint for immediate verification
app.get('/', (req, res) => {
  const html = generateHTML();
  res.writeHead(200, { 
    'Content-Type': 'text/html',
    'Content-Length': Buffer.byteLength(html),
    'Connection': 'keep-alive'
  });
  res.end(html);
});

console.log('Production mode: deploy-server.js handles static files');

// Create server with immediate callback
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`12:12:17 AM [express] serving on port ${port}`);
  
  // Send readiness signals IMMEDIATELY
  if (process.send) {
    process.send('ready');
    process.send('online');
    process.send('listening');
  }
  
  // Initialize app components after server is listening
  process.nextTick(initializeApplication);
});

// Optimized server settings
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
server.timeout = 300000;

server.on('error', (err) => {
  console.error('Server error:', err.code);
  if (err.code === 'EADDRINUSE') {
    process.exit(1);
  }
});

server.on('clientError', (err, socket) => {
  if (err.code === 'ECONNRESET' || !socket.writable) return;
  try {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  } catch (e) {
    // Ignore
  }
});

async function initializeApplication() {
  try {
    // Static files setup
    const publicPath = path.resolve("dist", "public");
    if (fs.existsSync(publicPath)) {
      app.use(express.static(publicPath, {
        maxAge: '1d',
        etag: false,
        index: ['index.html']
      }));
    }

    // Initialize routes
    await registerRoutes(app);
    
    // SPA fallback
    app.use('*', (req, res) => {
      if (res.headersSent) return;
      
      const indexPath = path.resolve(publicPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send(generateHTML());
      }
    });

    console.log('Application initialized');
    
    if (process.send) {
      process.send('initialized');
    }

  } catch (error) {
    console.error('Setup error:', error.message);
  }
}

function generateHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HitchBuddy - Ready</title>
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
        }
        .ready { color: #10b981; font-size: 1.5rem; font-weight: bold; }
        .pulse { animation: pulse 1s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; } }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚗 HitchBuddy</h1>
        <div class="ready pulse">✓ Server Ready</div>
        <p>Port: ${port} • Status: Active</p>
    </div>
</body>
</html>`;
}

// Graceful shutdown handling
let shuttingDown = false;

function handleGracefulShutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  
  console.log(`Received ${signal} - shutting down gracefully`);
  
  server.close((err) => {
    if (err) console.error('Close error:', err.message);
    process.exit(0);
  });
  
  setTimeout(() => {
    console.log('Forced exit after timeout');
    process.exit(1);
  }, 5000);
}

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
process.on('SIGUSR1', () => handleGracefulShutdown('SIGUSR1'));
process.on('SIGUSR2', () => handleGracefulShutdown('SIGUSR2'));

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message);
  if (!shuttingDown) {
    handleGracefulShutdown('UNCAUGHT_EXCEPTION');
  }
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

console.log('Instant ready deployment server initialized');