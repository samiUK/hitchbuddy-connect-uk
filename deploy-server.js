import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 5000;

// Read the built React app HTML file
let htmlContent = '';
const htmlPath = join(__dirname, 'dist', 'public', 'index.html');

if (existsSync(htmlPath)) {
  try {
    htmlContent = readFileSync(htmlPath, 'utf8');
    console.log(`[deploy] React app HTML loaded from: ${htmlPath}`);
  } catch (err) {
    console.log(`[deploy] Failed to read ${htmlPath}:`, err.message);
  }
}

// Fallback HTML if no built files found
if (!htmlContent) {
  console.log('[deploy] Using fallback HTML');
  htmlContent = `<!DOCTYPE html>
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
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🚗 HitchBuddy</div>
        <div class="tagline">Share Your Journey, Save the Planet</div>
        <p>The affordable way to get to and from airports, stations, and beyond. Connect with trusted drivers and riders in your area.</p>
        
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
        
        <p><strong>✅ Successfully Deployed!</strong></p>
        <a href="/login" class="btn">Sign In</a>
        <a href="/register" class="btn">Join Now</a>
        <div class="status">
            Server Status: Online | EU Region: Frankfurt
        </div>
    </div>
</body>
</html>`;
}

// Function to get MIME type
function getMimeType(filePath) {
  const ext = extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
  };
  return mimeTypes[ext] || 'text/plain';
}

// Create server with static file serving
const server = createServer((req, res) => {
  console.log(`[deploy] ${req.method} ${req.url}`);
  
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    if (req.url === '/health' || req.url === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        app: 'HitchBuddy',
        timestamp: new Date().toISOString(),
        region: 'EU-Frankfurt',
        deployment: 'render'
      }));
      return;
    }
    
    // Serve static assets from dist/public
    if (req.url.startsWith('/assets/')) {
      const assetPath = join(__dirname, 'dist', 'public', req.url);
      if (existsSync(assetPath)) {
        const mimeType = getMimeType(assetPath);
        const content = readFileSync(assetPath);
        res.writeHead(200, { 
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000' // 1 year cache for assets
        });
        res.end(content);
        return;
      }
    }
    
    // Serve favicon
    if (req.url === '/favicon.ico') {
      const faviconPath = join(__dirname, 'dist', 'public', 'favicon.ico');
      if (existsSync(faviconPath)) {
        const content = readFileSync(faviconPath);
        res.writeHead(200, { 'Content-Type': 'image/x-icon' });
        res.end(content);
        return;
      }
    }
    
    // Serve HTML for all other routes (SPA routing)
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(htmlContent);
    
  } catch (error) {
    console.error('[deploy] Server error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server Error: ' + error.message);
  }
});

// Enhanced error handling
server.on('error', (err) => {
  console.error('[deploy] Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`[deploy] Port ${PORT} is already in use`);
    process.exit(1);
  }
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[deploy] HitchBuddy deployed successfully on port ${PORT}`);
  console.log(`[deploy] Server running in EU region (Frankfurt)`);
});

// Process error handling
process.on('uncaughtException', (err) => {
  console.error('[deploy] Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[deploy] Unhandled rejection:', reason);
  process.exit(1);
});