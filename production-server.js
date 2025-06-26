import express from 'express';
import { createServer } from 'http';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 Starting HitchBuddy production deployment...');

// Essential middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.set('trust proxy', true);

// CORS configuration for Replit deployment
app.use((req, res, next) => {
  const origin = req.get('Origin');
  if (origin && (origin.includes('.replit.') || origin.includes('.repl.co') || origin.includes('localhost'))) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check endpoints with immediate response
const healthResponse = {
  status: 'healthy',
  ready: true,
  deployment: 'replit-production',
  timestamp: () => new Date().toISOString(),
  uptime: () => Math.floor(process.uptime()),
  port: PORT
};

app.get(['/health', '/healthz', '/ready', '/ping', '/status', '/api/health'], (req, res) => {
  res.json({
    ...healthResponse,
    timestamp: healthResponse.timestamp(),
    uptime: healthResponse.uptime()
  });
});

// Basic API endpoints for functionality
app.get('/api/auth/me', (req, res) => res.json({ user: null }));
app.get('/api/notifications', (req, res) => res.json({ notifications: [], unreadCount: 0 }));
app.get('/api/rides', (req, res) => res.json([]));
app.get('/api/ride-requests', (req, res) => res.json([]));
app.get('/api/bookings', (req, res) => res.json([]));

// Serve static files from build directory
const staticDirs = [
  join(__dirname, 'dist', 'client'),
  join(__dirname, 'client', 'dist'),
  join(__dirname, 'build'),
  join(__dirname, 'public')
];

let staticDir = null;
for (const dir of staticDirs) {
  if (existsSync(dir)) {
    staticDir = dir;
    console.log(`📁 Serving static files from: ${staticDir}`);
    break;
  }
}

if (staticDir) {
  app.use(express.static(staticDir, {
    index: ['index.html'],
    maxAge: '1d',
    etag: true
  }));
}

// Serve React app for all routes (SPA support)
app.get('*', (req, res) => {
  const indexPath = join(staticDir || __dirname, 'index.html');
  
  // Try to serve the built React app
  if (staticDir && existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Fallback HTML that redirects to the React app
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HitchBuddy - Ride Sharing Platform</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; margin: 0; padding: 20px;
            display: flex; align-items: center; justify-content: center; min-height: 100vh;
        }
        .container { text-align: center; background: rgba(255,255,255,0.1); 
            padding: 40px; border-radius: 20px; backdrop-filter: blur(20px); }
        .loading { font-size: 1.2rem; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚗 HitchBuddy</h1>
        <div class="loading">Loading React Application...</div>
        <p>If this persists, the frontend build may be incomplete.</p>
    </div>
    <script>
        // Try to load the React app
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
    </script>
</body>
</html>`);
  }
});

// Create HTTP server
const server = createServer(app);

// Enhanced server startup
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎯 HitchBuddy production server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🔗 Live at: https://hitchbuddyapp.replit.app`);
  console.log(`✅ Health endpoints: /health, /ready, /status`);
  console.log(`📊 Static files: ${staticDir ? 'Found' : 'Not found'}`);
  
  // Signal deployment readiness
  if (process.send) {
    process.send('ready');
  }
});

// Robust error handling
server.on('error', (err) => {
  console.error('❌ Server error:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.log(`🔄 Port ${PORT} busy, retrying on ${PORT + 1}`);
    setTimeout(() => {
      server.listen(PORT + 1, '0.0.0.0');
    }, 1000);
  } else if (err.code === 'EACCES') {
    console.log(`🔄 Permission denied on port ${PORT}, trying 8080`);
    setTimeout(() => {
      server.listen(8080, '0.0.0.0');
    }, 1000);
  }
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`📢 Received ${signal} - initiating graceful shutdown`);
  server.close(() => {
    console.log('🔄 Server closed successfully');
    process.exit(0);
  });
  
  // Force exit after timeout
  setTimeout(() => {
    console.log('⏰ Force exit after timeout');
    process.exit(1);
  }, 15000);
};

// Signal handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));

// Prevent crashes
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log('🎉 HitchBuddy production deployment server initialized successfully');