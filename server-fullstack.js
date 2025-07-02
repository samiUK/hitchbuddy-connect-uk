const http = require('http');
const path = require('path');
const fs = require('fs');
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

function parseRequestBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
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

  // Health check endpoint
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'HitchBuddy React App Running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }));
    return;
  }

  // Mock API endpoints for development
  if (pathname === '/api/auth/me') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      user: {
        id: 'user123',
        email: 'coolsami_uk@yahoo.com',
        firstName: 'Sami',
        lastName: 'Rahman',
        userType: 'both'
      }
    }));
    return;
  }

  if (pathname === '/api/auth/signin' && req.method === 'POST') {
    const body = await parseRequestBody(req);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true,
      user: {
        id: 'user123',
        email: body.email || 'coolsami_uk@yahoo.com',
        firstName: 'Sami',
        lastName: 'Rahman',
        userType: 'both'
      }
    }));
    return;
  }

  if (pathname === '/api/rides') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([
      {
        id: 'ride1',
        driverId: 'user123',
        fromLocation: 'Manchester',
        toLocation: 'Liverpool',
        departureDate: '2025-01-15',
        departureTime: '10:00',
        availableSeats: 3,
        price: '15.00',
        vehicleInfo: 'Blue Honda Civic',
        status: 'active'
      }
    ]));
    return;
  }

  if (pathname.startsWith('/api/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'API endpoint', method: req.method, path: pathname }));
    return;
  }

  // Serve static files from client directory - PRIORITY for module scripts
  if (pathname.startsWith('/src/') || pathname.startsWith('/public/') || pathname.startsWith('/node_modules/')) {
    const filePath = path.join(__dirname, 'client', pathname);
    
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      let contentType = mimeTypes[ext] || 'text/plain';
      
      // Force correct MIME types for modules
      if (ext === '.tsx' || ext === '.ts' || ext === '.jsx' || ext === '.js') {
        contentType = 'application/javascript';
      }
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        res.writeHead(200, { 
          'Content-Type': contentType + '; charset=utf-8',
          'Cache-Control': 'no-cache'
        });
        res.end(content);
        return;
      } catch (err) {
        console.log('Error reading file:', filePath, err.message);
      }
    } else {
      // Try without client prefix for node_modules
      const altPath = path.join(__dirname, pathname);
      if (fs.existsSync(altPath)) {
        const ext = path.extname(altPath);
        let contentType = mimeTypes[ext] || 'text/plain';
        
        if (ext === '.tsx' || ext === '.ts' || ext === '.jsx' || ext === '.js') {
          contentType = 'application/javascript';
        }
        
        try {
          const content = fs.readFileSync(altPath, 'utf8');
          res.writeHead(200, { 
            'Content-Type': contentType + '; charset=utf-8',
            'Cache-Control': 'no-cache'
          });
          res.end(content);
          return;
        } catch (err) {
          console.log('Error reading alt file:', altPath, err.message);
        }
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

  // Check if we have a built version, otherwise serve development
  const buildPath = path.join(__dirname, 'dist/public');
  const clientPath = path.join(__dirname, 'client');
  
  let indexPath;
  if (fs.existsSync(buildPath) && fs.existsSync(path.join(buildPath, 'index.html'))) {
    indexPath = path.join(buildPath, 'index.html');
    console.log('Serving built React app');
  } else {
    indexPath = path.join(clientPath, 'index.html');
    console.log('Serving development React app');
  }

  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(content);
    return;
  }

  // Final fallback
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end('<h1>HitchBuddy</h1><p>React app loading...</p>');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚗 HitchBuddy Complete Server running on port ${PORT}`);
  console.log(`📱 React TypeScript Application`);
  console.log(`🔧 Mock API endpoints available`);
  console.log(`🌐 Access: http://localhost:${PORT}`);
});