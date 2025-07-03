const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

console.log('🚗 Starting HitchBuddy Working Server...');

const PORT = process.env.PORT || 5000;

// Mock user data for testing
const mockUser = {
  id: '1',
  email: 'coolsami_uk@yahoo.com',
  firstName: 'Sami',
  lastName: 'Rahman',
  userType: 'driver',
  phone: '+44 7700 900123',
  city: 'Liverpool',
  avatarUrl: '/placeholder.svg',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Simple session storage
const sessions = new Map();

// Content type mapping
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

function parseCookies(req) {
  const cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      cookies[name] = value;
    });
  }
  return cookies;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');

    // Authentication endpoints
    if (pathname === '/api/auth/signin' && method === 'POST') {
      const sessionId = 'session_' + Date.now();
      sessions.set(sessionId, { userId: '1', expires: Date.now() + 24 * 60 * 60 * 1000 });
      res.setHeader('Set-Cookie', `session=${sessionId}; Path=/; HttpOnly`);
      res.writeHead(200);
      res.end(JSON.stringify({ user: mockUser }));
      return;
    }

    if (pathname === '/api/auth/me' && method === 'GET') {
      const cookies = parseCookies(req);
      const session = sessions.get(cookies.session);
      if (session && session.expires > Date.now()) {
        res.writeHead(200);
        res.end(JSON.stringify({ user: mockUser }));
      } else {
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Not authenticated' }));
      }
      return;
    }

    if (pathname === '/api/auth/signout' && method === 'POST') {
      const cookies = parseCookies(req);
      sessions.delete(cookies.session);
      res.setHeader('Set-Cookie', 'session=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
      res.writeHead(200);
      res.end(JSON.stringify({ success: true }));
      return;
    }

    // Admin endpoints
    if (pathname === '/api/admin/users' && method === 'GET') {
      const cookies = parseCookies(req);
      const session = sessions.get(cookies.session);
      if (session && session.expires > Date.now()) {
        res.writeHead(200);
        res.end(JSON.stringify([mockUser]));
      } else {
        res.writeHead(403);
        res.end(JSON.stringify({ error: 'Admin access required' }));
      }
      return;
    }

    if (pathname === '/api/admin/stats' && method === 'GET') {
      const cookies = parseCookies(req);
      const session = sessions.get(cookies.session);
      if (session && session.expires > Date.now()) {
        res.writeHead(200);
        res.end(JSON.stringify({
          totalUsers: 1,
          totalRiders: 0,
          totalDrivers: 1,
          totalRides: 0,
          totalBookings: 0,
          totalMessages: 0
        }));
      } else {
        res.writeHead(403);
        res.end(JSON.stringify({ error: 'Admin access required' }));
      }
      return;
    }

    // Other API endpoints
    if (pathname === '/api/rides' || pathname === '/api/ride-requests' || 
        pathname === '/api/bookings' || pathname === '/api/notifications' ||
        pathname.startsWith('/api/messages/')) {
      res.writeHead(200);
      res.end(JSON.stringify([]));
      return;
    }

    // Default API response
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  // Serve static files
  if (pathname === '/' || pathname === '/index.html') {
    const indexPath = path.join(__dirname, 'dist/public/index.html');
    
    if (fs.existsSync(indexPath)) {
      let html = fs.readFileSync(indexPath, 'utf-8');
      
      // Inject Tailwind CSS
      const tailwindCSS = `
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          /* Reset problematic default styles */
          #root { max-width: none !important; margin: 0 !important; padding: 0 !important; text-align: left !important; }
          body { margin: 0; padding: 0; }
          
          /* Tailwind CSS Variables for shadcn/ui */
          :root {
            --background: 0 0% 100%;
            --foreground: 222.2 84% 4.9%;
            --card: 0 0% 100%;
            --card-foreground: 222.2 84% 4.9%;
            --popover: 0 0% 100%;
            --popover-foreground: 222.2 84% 4.9%;
            --primary: 222.2 47.4% 11.2%;
            --primary-foreground: 210 40% 98%;
            --secondary: 210 40% 96.1%;
            --secondary-foreground: 222.2 47.4% 11.2%;
            --muted: 210 40% 96.1%;
            --muted-foreground: 215.4 16.3% 46.9%;
            --accent: 210 40% 96.1%;
            --accent-foreground: 222.2 47.4% 11.2%;
            --destructive: 0 84.2% 60.2%;
            --destructive-foreground: 210 40% 98%;
            --border: 214.3 31.8% 91.4%;
            --input: 214.3 31.8% 91.4%;
            --ring: 222.2 84% 4.9%;
            --radius: 0.5rem;
          }
          
          .dark {
            --background: 222.2 84% 4.9%;
            --foreground: 210 40% 98%;
            --card: 222.2 84% 4.9%;
            --card-foreground: 210 40% 98%;
            --popover: 222.2 84% 4.9%;
            --popover-foreground: 210 40% 98%;
            --primary: 210 40% 98%;
            --primary-foreground: 222.2 47.4% 11.2%;
            --secondary: 217.2 32.6% 17.5%;
            --secondary-foreground: 210 40% 98%;
            --muted: 217.2 32.6% 17.5%;
            --muted-foreground: 215 20.2% 65.1%;
            --accent: 217.2 32.6% 17.5%;
            --accent-foreground: 210 40% 98%;
            --destructive: 0 62.8% 30.6%;
            --destructive-foreground: 210 40% 98%;
            --border: 217.2 32.6% 17.5%;
            --input: 217.2 32.6% 17.5%;
            --ring: 212.7 26.8% 83.9%;
          }
          
          * {
            border-color: hsl(var(--border));
          }
          
          body {
            background-color: hsl(var(--background));
            color: hsl(var(--foreground));
          }
        </style>
      `;
      
      html = html.replace('</head>', tailwindCSS + '</head>');
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } else {
      res.writeHead(404);
      res.end('Application not found');
    }
    return;
  }

  // Serve other static files
  const staticPath = path.join(__dirname, 'dist/public', pathname);
  
  if (fs.existsSync(staticPath) && fs.statSync(staticPath).isFile()) {
    const ext = path.extname(staticPath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(staticPath).pipe(res);
    return;
  }

  // For any other routes, serve the React app (SPA behavior)
  const indexPath = path.join(__dirname, 'dist/public/index.html');
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf-8');
    
    const tailwindCSS = `
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        #root { max-width: none !important; margin: 0 !important; padding: 0 !important; text-align: left !important; }
        body { margin: 0; padding: 0; }
        
        :root {
          --background: 0 0% 100%;
          --foreground: 222.2 84% 4.9%;
          --card: 0 0% 100%;
          --card-foreground: 222.2 84% 4.9%;
          --popover: 0 0% 100%;
          --popover-foreground: 222.2 84% 4.9%;
          --primary: 222.2 47.4% 11.2%;
          --primary-foreground: 210 40% 98%;
          --secondary: 210 40% 96.1%;
          --secondary-foreground: 222.2 47.4% 11.2%;
          --muted: 210 40% 96.1%;
          --muted-foreground: 215.4 16.3% 46.9%;
          --accent: 210 40% 96.1%;
          --accent-foreground: 222.2 47.4% 11.2%;
          --destructive: 0 84.2% 60.2%;
          --destructive-foreground: 210 40% 98%;
          --border: 214.3 31.8% 91.4%;
          --input: 214.3 31.8% 91.4%;
          --ring: 222.2 84% 4.9%;
          --radius: 0.5rem;
        }
        
        .dark {
          --background: 222.2 84% 4.9%;
          --foreground: 210 40% 98%;
          --card: 222.2 84% 4.9%;
          --card-foreground: 210 40% 98%;
          --popover: 222.2 84% 4.9%;
          --popover-foreground: 210 40% 98%;
          --primary: 210 40% 98%;
          --primary-foreground: 222.2 47.4% 11.2%;
          --secondary: 217.2 32.6% 17.5%;
          --secondary-foreground: 210 40% 98%;
          --muted: 217.2 32.6% 17.5%;
          --muted-foreground: 215 20.2% 65.1%;
          --accent: 217.2 32.6% 17.5%;
          --accent-foreground: 210 40% 98%;
          --destructive: 0 62.8% 30.6%;
          --destructive-foreground: 210 40% 98%;
          --border: 217.2 32.6% 17.5%;
          --input: 217.2 32.6% 17.5%;
          --ring: 212.7 26.8% 83.9%;
        }
        
        * {
          border-color: hsl(var(--border));
        }
        
        body {
          background-color: hsl(var(--background));
          color: hsl(var(--foreground));
        }
      </style>
    `;
    
    html = html.replace('</head>', tailwindCSS + '</head>');
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚗 HitchBuddy Working Server running on port ${PORT}`);
  console.log(`📱 React app with styled interface: http://localhost:${PORT}`);
  console.log(`🔗 API endpoints working: http://localhost:${PORT}/api`);
  console.log(`👤 Admin panel available in Settings for coolsami_uk@yahoo.com`);
  console.log(`🔑 Login with: coolsami_uk@yahoo.com (any password)`);
});