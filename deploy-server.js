import express from "express";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// CORS headers for production
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'HitchBuddy',
    timestamp: new Date().toISOString(),
    region: 'EU-Frankfurt',
    deployment: 'render-full',
    version: '2.0'
  });
});

// Import and register API routes
async function setupRoutes() {
  try {
    // Dynamically import the routes module
    const { registerRoutes } = await import('./server/routes.js');
    const server = createServer(app);
    await registerRoutes(app);
    console.log('[server] API routes registered successfully');
    return server;
  } catch (error) {
    console.error('[server] Error setting up routes:', error);
    // Fallback API routes for basic functionality
    setupFallbackRoutes();
    return createServer(app);
  }
}

// Fallback routes if main routes fail to load
function setupFallbackRoutes() {
  app.get('/api/auth/me', (req, res) => {
    res.status(401).json({ error: 'Authentication service unavailable' });
  });
  
  app.post('/api/auth/signin', (req, res) => {
    res.status(503).json({ error: 'Authentication service unavailable' });
  });
  
  app.post('/api/auth/signup', (req, res) => {
    res.status(503).json({ error: 'Authentication service unavailable' });
  });
  
  app.get('/api/rides', (req, res) => {
    res.json([]);
  });
  
  app.get('/api/ride-requests', (req, res) => {
    res.json([]);
  });
}

// Serve static files from dist directory
const staticPath = join(__dirname, 'dist');
if (existsSync(staticPath)) {
  console.log('[server] Serving static files from:', staticPath);
  app.use(express.static(staticPath, {
    maxAge: '1y',
    etag: true,
    lastModified: true
  }));
} else {
  console.error('[server] Static directory not found:', staticPath);
}

// Catch-all handler for React Router
app.get('*', (req, res) => {
  const indexPath = join(__dirname, 'dist', 'index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>HitchBuddy</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
            .container { max-width: 600px; margin: 0 auto; }
            .logo { font-size: 2rem; font-weight: bold; color: #3b82f6; margin-bottom: 1rem; }
            .status { background: #10b981; color: white; padding: 8px 16px; border-radius: 6px; display: inline-block; margin: 1rem 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🚗 HitchBuddy</div>
            <h1>Share Your Journey, Save the Planet</h1>
            <p>The affordable way to get to and from airports, stations, and beyond.</p>
            <div class="status">Server Status: Online | EU Region: Frankfurt</div>
            <p><strong>Application Loading...</strong></p>
            <p><small>Build Path: ${staticPath}<br>Index Path: ${indexPath}</small></p>
          </div>
        </body>
      </html>
    `);
  }
});

// Start server
async function startServer() {
  try {
    const server = await setupRoutes();
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`[server] HitchBuddy production server running on port ${PORT}`);
      console.log(`[server] Environment: ${process.env.NODE_ENV || 'production'}`);
      console.log(`[server] Database URL: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('[server] SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('[server] Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('[server] Failed to start server:', error);
    process.exit(1);
  }
}

// Initialize server
startServer();