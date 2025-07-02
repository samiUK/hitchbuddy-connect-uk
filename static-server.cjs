const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = parseInt(process.env.PORT || '10000', 10);

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml'
};

// Find React build directory
function findStaticDir() {
  const possibleDirs = [
    path.join(__dirname, 'dist'),
    path.join(__dirname, 'dist/public'),
    path.join(__dirname, 'client/dist'),
    path.join(__dirname, 'build'),
    path.join(__dirname, 'public')
  ];

  for (const dir of possibleDirs) {
    if (fs.existsSync(dir) && fs.existsSync(path.join(dir, 'index.html'))) {
      console.log(`[server] Found React app at: ${dir}`);
      return dir;
    }
  }
  
  console.log('[server] No React build directory found');
  return null;
}

const staticDir = findStaticDir();

const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname;

  // Health check
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      app: 'HitchBuddy',
      timestamp: new Date().toISOString(),
      staticDir: staticDir || 'none'
    }));
    return;
  }

  if (!staticDir) {
    // No React build found - show debug page
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head><title>HitchBuddy - Build Not Found</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>HitchBuddy</h1>
          <p>React build not found</p>
          <p>This means the Vite build process may have failed during deployment.</p>
          <h3>Checked directories:</h3>
          <ul style="text-align: left; display: inline-block;">
            <li>./dist</li>
            <li>./dist/public</li>
            <li>./client/dist</li>
            <li>./build</li>
            <li>./public</li>
          </ul>
        </body>
      </html>
    `);
    return;
  }

  // Determine file path
  let filePath = path.join(staticDir, pathname === '/' ? 'index.html' : pathname);

  // Check if file exists, if not serve index.html for SPA routing
  if (!fs.existsSync(filePath)) {
    filePath = path.join(staticDir, 'index.html');
  }

  // Read and serve file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] HitchBuddy running on port ${PORT}`);
  console.log(`[server] Static directory: ${staticDir || 'none found'}`);
  console.log(`[server] Health check: http://localhost:${PORT}/health`);
});