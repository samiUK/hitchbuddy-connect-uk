// Standalone Express server with minimal dependencies
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Simple session store
const sessions = new Map();

// Create HTTP server
const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // API routes
  if (pathname.startsWith('/api/')) {
    handleAPI(req, res, pathname);
    return;
  }

  // Serve static files
  serveStatic(req, res, pathname);
});

function handleAPI(req, res, pathname) {
  res.setHeader('Content-Type', 'application/json');
  
  if (pathname === '/api/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'OK', message: 'Hitchbuddy API is running' }));
    return;
  }

  if (pathname === '/api/auth/signup') {
    res.writeHead(200);
    res.end(JSON.stringify({ message: 'Signup endpoint - connect database for full functionality' }));
    return;
  }

  // Default API response
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'API endpoint not found' }));
}

function serveStatic(req, res, pathname) {
  // Default to index.html for SPA routing
  if (pathname === '/' || pathname === '/dashboard' || pathname === '/auth') {
    pathname = '/index.html';
  }

  const filePath = path.join(__dirname, 'client/dist', pathname);
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }

    // Set content type
    const ext = path.extname(filePath);
    const contentTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml'
    };

    res.setHeader('Content-Type', contentTypes[ext] || 'text/plain');
    res.writeHead(200);
    res.end(data);
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Hitchbuddy server running on port ${PORT}`);
  console.log('Visit your deployed URL to see the ride-sharing platform');
});

module.exports = server;