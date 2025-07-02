const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5000;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.jsx': 'application/javascript',
  '.ts': 'application/javascript',
  '.tsx': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
};

const server = http.createServer((req, res) => {
  const pathname = url.parse(req.url).pathname;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'pure server running',
      app: 'HitchBuddy React App',
      mode: 'development',
      files: 'serving React components'
    }));
    return;
  }

  // API endpoints - simple responses for now
  if (pathname.startsWith('/api/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (pathname === '/api/auth/me') {
      res.end(JSON.stringify({ error: 'Not authenticated' }));
    } else {
      res.end(JSON.stringify({ message: 'API endpoint', path: pathname }));
    }
    return;
  }

  // Serve static files from client directory
  if (pathname.startsWith('/src/') || pathname.startsWith('/public/')) {
    const filePath = path.join(__dirname, 'client', pathname);
    
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'text/plain';
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        res.writeHead(200, { 'Content-Type': contentType + '; charset=utf-8' });
        res.end(content);
        return;
      } catch (err) {
        console.log('Error reading file:', filePath, err.message);
      }
    }
  }

  // Serve favicon
  if (pathname === '/favicon.ico') {
    const faviconPath = path.join(__dirname, 'client/public/favicon.ico');
    if (fs.existsSync(faviconPath)) {
      const content = fs.readFileSync(faviconPath);
      res.writeHead(200, { 'Content-Type': 'image/x-icon' });
      res.end(content);
      return;
    }
  }

  // For all other routes, serve the React app
  const indexPath = path.join(__dirname, 'client/index.html');
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(content);
    return;
  }

  // Final fallback
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end('<h1>File not found</h1><p>Your React app is being served...</p>');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚗 HitchBuddy server running on port ${PORT}`);
  console.log('📁 Serving React components from client/src/');
  console.log('🔗 Visit: http://localhost:' + PORT);
});