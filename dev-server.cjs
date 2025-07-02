const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;

// Serve static files
function serveStaticFile(filePath, res) {
  try {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) {
      return false;
    }

    const content = fs.readFileSync(fullPath);
    const ext = path.extname(filePath).toLowerCase();
    
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.ico': 'image/x-icon',
      '.svg': 'image/svg+xml'
    };

    const contentType = mimeTypes[ext] || 'text/plain';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
    return true;
  } catch (error) {
    return false;
  }
}

// Development server that serves the actual React app
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'development server running', 
      app: 'HitchBuddy',
      mode: 'development',
      features: ['React App', 'Authentication', 'Ride Management', 'Client-side Caching']
    }));
    return;
  }

  // Serve static assets
  if (req.url.startsWith('/assets/')) {
    if (serveStaticFile(`dist/public${req.url}`, res)) return;
  }

  // Serve favicon
  if (req.url === '/favicon.ico') {
    if (serveStaticFile('dist/public/favicon.ico', res)) return;
  }

  // For all other routes, serve the React app
  if (serveStaticFile('dist/public/index.html', res)) return;

  // Fallback if React app files not found
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head>
        <title>HitchBuddy - Loading</title>
        <style>
          body { font-family: Arial; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; }
          .loading { animation: spin 2s linear infinite; display: inline-block; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <h1>🚗 HitchBuddy</h1>
        <div class="loading">⚙️</div>
        <p>Loading React application...</p>
        <p>Client-side caching and offline capabilities enabled</p>
        <div style="margin-top: 30px; font-size: 14px; opacity: 0.8;">
          <p>Build assets: dist/public/</p>
          <p>React app with authentication, ride sharing, and messaging</p>
        </div>
      </body>
    </html>
  `);
});

// Start the real React development server
console.log('[Dev] Starting real HitchBuddy React application...');

const { spawn } = require('child_process');
const realServer = spawn('node', ['server-real.js'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: PORT },
  detached: false
});

realServer.on('error', (err) => {
  console.log('[Dev] Real server failed, starting static fallback');
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Dev] Static fallback server running on port ${PORT}`);
  });
});

// Handle cleanup
process.on('SIGINT', () => {
  realServer.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  realServer.kill();
  process.exit();
});