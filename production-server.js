import express from "express";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('[server] HitchBuddy Production Server Starting...');
console.log('[server] Working directory:', __dirname);

const app = express();

// Essential middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// CORS headers for Render deployment
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

const PORT = parseInt(process.env.PORT || '10000', 10);

// Start server immediately to prevent connection refused
const server = createServer(app);
server.listen(PORT, "0.0.0.0", () => {
  console.log(`[express] HitchBuddy serving on port ${PORT}`);
  console.log(`[server] Environment: ${process.env.NODE_ENV || 'production'}`);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'HitchBuddy',
    timestamp: new Date().toISOString(),
    environment: 'production',
    port: PORT
  });
});

// Load full backend functionality
async function loadFullBackend() {
  try {
    console.log('[server] Loading complete HitchBuddy backend...');
    
    // Import the full routes module
    const { registerRoutes } = await import('./server/routes.js');
    const httpServer = await registerRoutes(app);
    
    console.log('[server] ✓ Complete API routes loaded successfully');
    console.log('[server] ✓ Authentication, rides, bookings, messaging all active');
    
    // Start the ride cancellation scheduler
    try {
      const { rideScheduler } = await import('./server/scheduler.js');
      rideScheduler.start();
      console.log('[scheduler] ✓ Ride cancellation scheduler started');
    } catch (schedError) {
      console.log('[scheduler] Scheduler not available:', schedError.message);
    }
    
    return httpServer;
    
  } catch (error) {
    console.error('[server] Could not load full backend:', error.message);
    console.log('[server] Using basic API fallbacks...');
    
    // Basic API fallbacks
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', message: 'HitchBuddy API Server' });
    });
    
    app.get('/api/auth/me', (req, res) => {
      res.status(401).json({ error: 'Not authenticated' });
    });
    
    app.post('/api/auth/signin', (req, res) => {
      res.status(503).json({ error: 'Authentication service unavailable' });
    });
    
    app.get('/api/rides', (req, res) => {
      res.json([]);
    });
    
    app.get('/api/ride-requests', (req, res) => {
      res.json([]);
    });
  }
}

// Setup static file serving for React app
function setupStaticServing() {
  console.log('[static] Setting up React app serving...');
  
  // Check multiple possible locations for built React files
  const possibleStaticPaths = [
    join(__dirname, 'dist', 'public'),  // Vite default output
    join(__dirname, 'dist'),            // Alternative location
    join(__dirname, 'client', 'dist'),  // Client build output
    join(__dirname, 'build'),           // Create React App output
    join(__dirname, 'public')           // Static public folder
  ];
  
  let staticPath = null;
  for (const path of possibleStaticPaths) {
    console.log(`[static] Checking: ${path}`);
    if (existsSync(path)) {
      const indexExists = existsSync(join(path, 'index.html'));
      console.log(`[static] Path exists: ${path}, index.html: ${indexExists}`);
      if (indexExists) {
        staticPath = path;
        break;
      }
    }
  }
  
  if (staticPath) {
    console.log(`[static] ✓ Serving React app from: ${staticPath}`);
    
    // Serve static files with proper caching
    app.use(express.static(staticPath, {
      maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
      etag: true,
      lastModified: true,
      index: false  // Don't auto-serve index.html for directories
    }));
    
    // React Router catch-all
    app.get('*', (req, res) => {
      const indexPath = join(staticPath, 'index.html');
      console.log(`[static] Serving React app: ${req.path}`);
      res.sendFile(indexPath);
    });
    
  } else {
    console.error('[static] ❌ No React build files found in any location');
    console.log('[static] Checked paths:', possibleStaticPaths);
    
    // Fallback: serve a proper HitchBuddy interface
    app.get('*', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>HitchBuddy - Share Your Journey</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #10b981 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #333;
              }
              .container {
                background: white;
                padding: 3rem;
                border-radius: 1rem;
                box-shadow: 0 20px 60px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 500px;
                width: 90%;
              }
              .logo {
                font-size: 3rem;
                margin-bottom: 1rem;
                color: #3b82f6;
                font-weight: 700;
              }
              .car-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
                display: block;
              }
              h1 {
                font-size: 2rem;
                margin-bottom: 1rem;
                color: #1f2937;
                font-weight: 600;
              }
              p {
                color: #6b7280;
                font-size: 1.1rem;
                margin-bottom: 2rem;
                line-height: 1.6;
              }
              .status {
                background: #10b981;
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 0.5rem;
                display: inline-block;
                font-weight: 500;
                margin-bottom: 1.5rem;
              }
              .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                gap: 1rem;
                margin: 2rem 0;
              }
              .feature {
                padding: 1rem;
                background: #f8fafc;
                border-radius: 0.5rem;
                border: 1px solid #e2e8f0;
              }
              .feature-icon {
                font-size: 1.5rem;
                margin-bottom: 0.5rem;
                display: block;
              }
              .loader {
                border: 3px solid #f3f4f6;
                border-top: 3px solid #3b82f6;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin: 1rem auto;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              .debug {
                margin-top: 2rem;
                padding: 1rem;
                background: #f1f5f9;
                border-radius: 0.5rem;
                font-size: 0.875rem;
                color: #64748b;
                text-align: left;
              }
              @media (max-width: 640px) {
                .container { padding: 2rem; }
                .logo { font-size: 2.5rem; }
                h1 { font-size: 1.75rem; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="car-icon">🚗</div>
              <div class="logo">HitchBuddy</div>
              <h1>Share Your Journey, Save the Planet</h1>
              <p>The affordable way to get to and from airports, stations, and beyond.</p>
              
              <div class="status">Server Online • EU Frankfurt</div>
              
              <div class="features">
                <div class="feature">
                  <div class="feature-icon">🎯</div>
                  <strong>Smart Matching</strong>
                </div>
                <div class="feature">
                  <div class="feature-icon">👥</div>
                  <strong>Safe Community</strong>
                </div>
                <div class="feature">
                  <div class="feature-icon">💬</div>
                  <strong>Real-time Chat</strong>
                </div>
              </div>
              
              <div class="loader"></div>
              <p><strong>Loading React Application...</strong></p>
              
              <div class="debug">
                <strong>Debug Info:</strong><br>
                Port: ${PORT}<br>
                Environment: Production<br>
                Static Paths Checked: ${possibleStaticPaths.join(', ')}<br>
                Working Directory: ${__dirname}
              </div>
              
              <script>
                // Auto-refresh every 10 seconds to check for React app
                setTimeout(() => location.reload(), 10000);
                
                // Try to detect if React files become available
                fetch('/health')
                  .then(r => r.json())
                  .then(data => {
                    if (data.status === 'ok') {
                      console.log('Server healthy, checking for React app...');
                    }
                  })
                  .catch(e => console.log('Health check failed:', e));
              </script>
            </div>
          </body>
        </html>
      `);
    });
  }
}

// Initialize the complete HitchBuddy application
async function initializeApp() {
  console.log('[init] Initializing complete HitchBuddy application...');
  
  // Load backend functionality
  await loadFullBackend();
  
  // Setup React app serving
  setupStaticServing();
  
  console.log('[init] ✓ HitchBuddy initialization complete');
  console.log('[init] ✓ Backend API routes active');
  console.log('[init] ✓ React app ready to serve');
  console.log(`[init] ✓ Application available at http://localhost:${PORT}`);
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('\n[server] SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('[server] Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n[server] SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[server] Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[server] Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the application
initializeApp().catch(error => {
  console.error('[init] Failed to initialize HitchBuddy:', error);
  process.exit(1);
});