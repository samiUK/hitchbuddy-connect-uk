const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Simple in-memory storage
const users = new Map();
const sessions = new Map();
const rides = new Map();

// MIME types for static files
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml'
};

// Simple password hashing
function hashPassword(password) {
  return Buffer.from(password + 'salt').toString('base64');
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

// Generate session ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Parse cookies
function parseCookies(cookieHeader) {
  const cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) cookies[name] = value;
    });
  }
  return cookies;
}

// Serve static files
function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'text/plain';
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // For SPA routing, serve index.html for non-API routes
      if (err.code === 'ENOENT' && !filePath.includes('/api/')) {
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (indexErr, indexData) => {
          if (!indexErr) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(indexData);
          } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
          }
        });
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
}

// API handlers
const apiRoutes = {
  '/api/health': (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
  },
  
  '/api/auth/signup': (req, res, body) => {
    try {
      const { email, password, firstName, lastName, userType } = JSON.parse(body);
      
      if (users.has(email)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User already exists' }));
        return;
      }
      
      const user = {
        id: generateId(),
        email,
        firstName,
        lastName,
        userType,
        password: hashPassword(password),
        createdAt: new Date().toISOString()
      };
      
      users.set(email, user);
      
      const sessionId = generateId();
      sessions.set(sessionId, { userId: user.id, email });
      
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Set-Cookie': `sessionId=${sessionId}; HttpOnly; Path=/; Max-Age=86400`
      });
      res.end(JSON.stringify({ user: { ...user, password: undefined } }));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request' }));
    }
  },
  
  '/api/auth/signin': (req, res, body) => {
    try {
      const { email, password } = JSON.parse(body);
      const user = users.get(email);
      
      if (!user || !verifyPassword(password, user.password)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid credentials' }));
        return;
      }
      
      const sessionId = generateId();
      sessions.set(sessionId, { userId: user.id, email });
      
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Set-Cookie': `sessionId=${sessionId}; HttpOnly; Path=/; Max-Age=86400`
      });
      res.end(JSON.stringify({ user: { ...user, password: undefined } }));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request' }));
    }
  },
  
  '/api/auth/me': (req, res, body, session) => {
    if (!session) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not authenticated' }));
      return;
    }
    
    const user = Array.from(users.values()).find(u => u.id === session.userId);
    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'User not found' }));
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ user: { ...user, password: undefined } }));
  }
};

// Create server
const server = http.createServer((req, res) => {
  try {
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
    
    console.log(`${req.method} ${pathname}`);
    
    // Handle API routes
    if (pathname.startsWith('/api/')) {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const cookies = parseCookies(req.headers.cookie);
          const session = cookies.sessionId ? sessions.get(cookies.sessionId) : null;
          
          const handler = apiRoutes[pathname];
          if (handler) {
            handler(req, res, body, session);
          } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'API endpoint not found' }));
          }
        } catch (error) {
          console.error('API Error:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      });
      
      req.on('error', (error) => {
        console.error('Request Error:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad request' }));
      });
      return;
    }
    
    // Serve static files from public directory
    let filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);
    serveFile(res, filePath);
  } catch (error) {
    console.error('Server Error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

// Create public directory with basic HTML
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create basic index.html
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hitchbuddy - Ride Sharing Platform</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; color: #333; }
        .status { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .api-test { background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
        button:hover { background: #0056b3; }
        .form-group { margin: 10px 0; }
        input { padding: 8px; margin: 5px; border: 1px solid #ddd; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚗 Hitchbuddy</h1>
        <p>Ride Sharing Platform</p>
    </div>
    
    <div class="status">
        <h3>✅ Server Status: Online</h3>
        <p>Node.js server is running successfully!</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
    </div>
    
    <div class="api-test">
        <h3>API Test</h3>
        <button onclick="testAPI()">Test Health Check</button>
        <div id="api-result"></div>
    </div>
    
    <div class="api-test">
        <h3>User Registration Test</h3>
        <div class="form-group">
            <input type="email" id="email" placeholder="Email" value="test@example.com">
            <input type="password" id="password" placeholder="Password" value="password123">
        </div>
        <div class="form-group">
            <input type="text" id="firstName" placeholder="First Name" value="John">
            <input type="text" id="lastName" placeholder="Last Name" value="Doe">
        </div>
        <div class="form-group">
            <select id="userType">
                <option value="rider">Rider</option>
                <option value="driver">Driver</option>
            </select>
        </div>
        <button onclick="testSignup()">Test Signup</button>
        <div id="signup-result"></div>
    </div>
    
    <script>
        async function testAPI() {
            try {
                const response = await fetch('/api/health');
                const data = await response.json();
                document.getElementById('api-result').innerHTML = 
                    '<p style="color: green;">✅ API Health Check: ' + JSON.stringify(data, null, 2) + '</p>';
            } catch (error) {
                document.getElementById('api-result').innerHTML = 
                    '<p style="color: red;">❌ API Error: ' + error.message + '</p>';
            }
        }
        
        async function testSignup() {
            try {
                const userData = {
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value,
                    firstName: document.getElementById('firstName').value,
                    lastName: document.getElementById('lastName').value,
                    userType: document.getElementById('userType').value
                };
                
                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });
                
                const data = await response.json();
                document.getElementById('signup-result').innerHTML = 
                    '<p style="color: ' + (response.ok ? 'green' : 'red') + ';">' +
                    (response.ok ? '✅' : '❌') + ' Signup Response: ' + JSON.stringify(data, null, 2) + '</p>';
            } catch (error) {
                document.getElementById('signup-result').innerHTML = 
                    '<p style="color: red;">❌ Signup Error: ' + error.message + '</p>';
            }
        }
        
        // Auto-test on load
        window.onload = function() {
            testAPI();
        };
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(publicDir, 'index.html'), indexHtml);

const PORT = process.env.PORT || 3000;

// Add error handling for server
server.on('error', (error) => {
  console.error('Server Error:', error);
  if (error.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is busy, trying ${PORT + 1}`);
    server.listen(PORT + 1, '0.0.0.0');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Hitchbuddy server running on port ${PORT}`);
  console.log(`Platform: ${process.platform}`);
  console.log(`Directory: ${__dirname}`);
  console.log(`Node.js version: ${process.version}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
});