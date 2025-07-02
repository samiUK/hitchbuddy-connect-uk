const express = require("express");
const { createServer } = require("http");
const cookieParser = require("cookie-parser");
const { join } = require('path');
const { existsSync } = require('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const PORT = parseInt(process.env.PORT || '10000', 10);

// Start server immediately
const server = createServer(app);
server.listen(PORT, "0.0.0.0", () => {
  console.log(`[express] HitchBuddy serving on port ${PORT}`);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'HitchBuddy' });
});

// Load full backend if available
async function loadBackend() {
  try {
    // Try to import and run the TypeScript server using tsx
    const path = require('path');
    const serverPath = path.join(process.cwd(), 'server', 'routes.ts');
    
    // Use dynamic import to load ES modules from CommonJS
    const { createRequire } = require('module');
    const require2 = createRequire(import.meta.url || require.resolve(__filename));
    
    // For now, just skip backend loading and serve static files
    console.log('[express] Backend loading skipped - serving static files only');
  } catch (error) {
    console.log('[express] Backend not available, serving static files only:', error.message);
  }
}

// Configure static file serving
function setupStaticFiles() {
  // CORS headers for cross-origin requests
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Serve static files from multiple possible locations
  const staticPaths = [
    join(process.cwd(), 'dist'),
    join(process.cwd(), 'dist/public'),
    join(process.cwd(), 'client/dist'),
    join(process.cwd(), 'build'),
    join(process.cwd(), 'public')
  ];

  let staticDir = null;
  for (const path of staticPaths) {
    if (existsSync(path)) {
      staticDir = path;
      console.log(`[express] Found static files at: ${path}`);
      break;
    }
  }

  if (staticDir) {
    app.use(express.static(staticDir));
    
    // Handle React routing - serve index.html for all non-API routes
    app.get('*', (req, res) => {
      if (!req.url.startsWith('/api/')) {
        const indexPath = join(staticDir, 'index.html');
        if (existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(404).send('React app not found');
        }
      }
    });
  } else {
    console.log('[express] No static files found, serving basic response');
    app.get('*', (req, res) => {
      if (!req.url.startsWith('/api/')) {
        res.send(`
          <html>
            <head><title>HitchBuddy</title></head>
            <body>
              <h1>HitchBuddy</h1>
              <p>Server is running but React app not found</p>
              <p>Build the app with: npm run build</p>
            </body>
          </html>
        `);
      }
    });
  }
}

// Initialize the server
async function initialize() {
  // Load backend routes first
  await loadBackend();
  
  // Setup static file serving
  setupStaticFiles();
  
  console.log('[express] Server initialization complete');
}

// Start initialization
initialize().catch(console.error);