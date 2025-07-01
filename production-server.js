import { createServer } from 'http';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 10000;

// Create Express app for better static file handling
const app = express();

// Static files middleware for built React app
const staticPath = join(__dirname, 'dist', 'public');
console.log(`[server] Serving static files from: ${staticPath}`);

if (existsSync(staticPath)) {
  app.use(express.static(staticPath, {
    maxAge: '1y', // Cache static assets for 1 year
    etag: true,
    lastModified: true
  }));
  
  // List available files for debugging
  try {
    const files = readdirSync(staticPath);
    console.log('[server] Available static files:', files);
    
    const assetsPath = join(staticPath, 'assets');
    if (existsSync(assetsPath)) {
      const assetFiles = readdirSync(assetsPath);
      console.log('[server] Available assets:', assetFiles);
    }
  } catch (err) {
    console.error('[server] Error reading static directory:', err);
  }
} else {
  console.error('[server] Static directory not found:', staticPath);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'HitchBuddy',
    timestamp: new Date().toISOString(),
    region: 'EU-Frankfurt',
    deployment: 'render',
    staticPath: staticPath,
    staticExists: existsSync(staticPath)
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    api: 'HitchBuddy API',
    timestamp: new Date().toISOString()
  });
});

// Catch-all handler for React Router (SPA)
app.get('*', (req, res) => {
  const htmlPath = join(staticPath, 'index.html');
  
  if (existsSync(htmlPath)) {
    try {
      const html = readFileSync(htmlPath, 'utf8');
      res.set('Content-Type', 'text/html');
      res.send(html);
    } catch (err) {
      console.error('[server] Error reading HTML file:', err);
      res.status(500).send('Server Error: Unable to load application');
    }
  } else {
    // Fallback HTML with proper HitchBuddy branding
    const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HitchBuddy - Ride Sharing Platform</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }
        .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 2rem;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            max-width: 500px;
            width: 100%;
        }
        .logo { font-size: 2.5rem; margin-bottom: 1rem; }
        .tagline { font-size: 1.1rem; margin-bottom: 1.5rem; opacity: 0.9; }
        .features { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1.5rem 0; }
        .feature { background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px; font-size: 0.9rem; }
        .btn {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 2px solid white;
            padding: 0.8rem 1.5rem;
            border-radius: 30px;
            text-decoration: none;
            display: inline-block;
            margin: 0.3rem;
            font-size: 1rem;
            transition: background 0.3s;
        }
        .btn:hover { background: rgba(255, 255, 255, 0.3); }
        .status { margin-top: 1.5rem; font-size: 0.9rem; opacity: 0.8; }
        .loader { 
            border: 4px solid rgba(255,255,255,0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 2s linear infinite;
            margin: 1rem auto;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🚗 HitchBuddy</div>
        <div class="tagline">Share Your Journey, Save the Planet</div>
        <p>The affordable way to get to and from airports, stations, and beyond.</p>
        
        <div class="features">
            <div class="feature">
                <strong>Smart Matching</strong><br>
                Find compatible travel companions
            </div>
            <div class="feature">
                <strong>Real-time Chat</strong><br>
                Communicate safely with riders/drivers
            </div>
        </div>
        
        <div class="loader"></div>
        <p><strong>Loading Application...</strong></p>
        <div class="status">
            Server Status: Online | EU Region: Frankfurt<br>
            HTML Path: ${htmlPath}<br>
            Static Path: ${staticPath}
        </div>
        
        <script>
            // Auto-reload every 10 seconds to check for app
            setTimeout(() => {
                console.log('Reloading to check for React app...');
                window.location.reload();
            }, 10000);
        </script>
    </div>
</body>
</html>`;
    
    res.set('Content-Type', 'text/html');
    res.send(fallbackHtml);
  }
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] HitchBuddy production server running on port ${PORT}`);
  console.log(`[server] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[server] Static files: ${staticPath}`);
  console.log(`[server] Static exists: ${existsSync(staticPath)}`);
});

// Error handling
server.on('error', (err) => {
  console.error('[server] Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`[server] Port ${PORT} is already in use`);
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error('[server] Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[server] Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});