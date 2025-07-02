import express from "express";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const server = createServer(app);
const PORT = parseInt(process.env.PORT || '10000', 10);

// CRITICAL: Bind to port IMMEDIATELY to prevent connection refused
server.listen(PORT, "0.0.0.0", () => {
  console.log(`[express] serving on port ${PORT}`);
});

// Simple health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'HitchBuddy',
    timestamp: new Date().toISOString(),
    deployment: 'render'
  });
});

// Basic API fallback routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'HitchBuddy API Server Running' });
});

app.get('/api/auth/me', (req, res) => {
  res.status(401).json({ error: 'Not authenticated' });
});

app.post('/api/auth/signin', (req, res) => {
  res.status(503).json({ error: 'Authentication service starting up' });
});

app.post('/api/auth/signup', (req, res) => {
  res.status(503).json({ error: 'Authentication service starting up' });
});

app.get('/api/rides', (req, res) => {
  res.json([]);
});

app.get('/api/ride-requests', (req, res) => {
  res.json([]);
});

// Serve static files from dist/public directory (Vite build output)
const staticPaths = [
  join(__dirname, 'dist/public'),
  join(__dirname, 'dist'),
  join(__dirname, 'public')
];

let staticPath = null;
for (const path of staticPaths) {
  console.log(`[server] Checking for static files at: ${path}`);
  if (existsSync(path)) {
    staticPath = path;
    console.log(`[server] Found static files at: ${staticPath}`);
    break;
  }
}

if (staticPath) {
  console.log('[server] Serving static files from:', staticPath);
  app.use(express.static(staticPath, {
    maxAge: '1y',
    etag: true,
    lastModified: true
  }));
} else {
  console.error('[server] No static directory found in any expected location');
}

// Catch-all handler for React Router
app.get('*', (req, res) => {
  const indexPaths = [
    join(__dirname, 'dist/public', 'index.html'),
    join(__dirname, 'dist', 'index.html'),
    join(__dirname, 'public', 'index.html')
  ];
  
  let indexPath = null;
  for (const path of indexPaths) {
    console.log(`[server] Looking for index.html at: ${path}`);
    if (existsSync(path)) {
      indexPath = path;
      console.log(`[server] Found index.html at: ${indexPath}`);
      break;
    }
  }
  
  if (indexPath) {
    console.log('[server] Serving React app from index.html');
    res.sendFile(indexPath);
  } else {
    console.log('[server] index.html not found, serving fallback');
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>HitchBuddy</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: linear-gradient(135deg, #3b82f6, #10b981);
              color: white;
              margin: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container { 
              max-width: 600px; 
              background: white; 
              color: #333;
              padding: 40px; 
              border-radius: 12px; 
              box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
            .logo { 
              font-size: 2.5rem; 
              font-weight: bold; 
              color: #3b82f6; 
              margin-bottom: 1rem; 
            }
            .loader { 
              border: 4px solid #f3f3f3; 
              border-top: 4px solid #3b82f6; 
              border-radius: 50%; 
              width: 40px; 
              height: 40px; 
              animation: spin 2s linear infinite; 
              margin: 20px auto; 
            }
            @keyframes spin { 
              0% { transform: rotate(0deg); } 
              100% { transform: rotate(360deg); } 
            }
            .status { 
              background: #10b981; 
              color: white; 
              padding: 8px 16px; 
              border-radius: 6px; 
              display: inline-block; 
              margin: 1rem 0; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🚗 HitchBuddy</div>
            <h1>Share Your Journey, Save the Planet</h1>
            <p>The affordable way to get to and from airports, stations, and beyond.</p>
            <div class="loader"></div>
            <div class="status">Server Status: Online | EU Region: Frankfurt</div>
            <p><strong>Application Loading...</strong></p>
            <p><small>Static Path: ${staticPath || 'Not found'}<br>Index Paths Checked: ${indexPaths.join(', ')}</small></p>
            <script>
              // Auto-refresh to check if React app becomes available
              setTimeout(() => location.reload(), 5000);
            </script>
          </div>
        </body>
      </html>
    `);
  }
});

// Attempt to load full API routes if available
async function loadFullAPI() {
  const possiblePaths = [
    './server/routes.js',
    './dist/server/routes.js', 
    '/opt/render/project/src/server/routes.js',
    '/opt/render/project/src/dist/server/routes.js'
  ];

  for (const path of possiblePaths) {
    try {
      console.log(`[server] Trying to load routes from: ${path}`);
      const routes = await import(path);
      if (routes.registerRoutes) {
        console.log('[server] Loading full API routes...');
        await routes.registerRoutes(app);
        console.log('[server] Full API routes loaded successfully');
        break;
      }
    } catch (error) {
      console.log(`[server] Could not load from ${path}: ${error.message}`);
    }
  }

  // Try to start scheduler
  const schedulerPaths = [
    './server/scheduler.js',
    './dist/server/scheduler.js',
    '/opt/render/project/src/server/scheduler.js',
    '/opt/render/project/src/dist/server/scheduler.js'
  ];

  for (const path of schedulerPaths) {
    try {
      console.log(`[scheduler] Trying to load from: ${path}`);
      const scheduler = await import(path);
      if (scheduler.rideScheduler) {
        scheduler.rideScheduler.start();
        console.log('[scheduler] Started ride cancellation scheduler');
        break;
      }
    } catch (error) {
      console.log(`[scheduler] Could not load from ${path}: ${error.message}`);
    }
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[express] Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[express] SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('[express] Process terminated');
    process.exit(0);
  });
});

// Start the server and attempt to load full functionality
console.log('[server] HitchBuddy starting up...');
loadFullAPI();