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

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API routes
  if (pathname === '/api/auth/me') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockUser));
    return;
  }

  if (pathname === '/api/auth/signout' && req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      app: 'HitchBuddy',
      mode: 'development',
      features: ['React App', 'Authentication', 'Ride Management']
    }));
    return;
  }

  // Serve main application
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>HitchBuddy - Dashboard</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>
      <div id="root"></div>
      <script type="module">
        import { createRoot } from 'https://esm.sh/react-dom/client';
        import React from 'https://esm.sh/react';
        
        const Dashboard = () => {
          const [user, setUser] = React.useState(null);
          const [loading, setLoading] = React.useState(true);
          
          React.useEffect(() => {
            fetch('/api/auth/me')
              .then(res => res.json())
              .then(userData => {
                setUser(userData);
                setLoading(false);
              })
              .catch(() => {
                setLoading(false);
              });
          }, []);
          
          if (loading) {
            return React.createElement('div', { 
              className: 'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'
            }, React.createElement('div', { className: 'text-center' }, 
              React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto' }),
              React.createElement('p', { className: 'text-gray-600 mt-4' }, 'Loading dashboard...')
            ));
          }
          
          return React.createElement('div', { 
            className: 'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'
          }, React.createElement('div', { className: 'container mx-auto px-4 py-8' }, 
            React.createElement('div', { className: 'text-center' },
              React.createElement('h1', { className: 'text-4xl font-bold text-gray-900 mb-4' }, 
                'Welcome to HitchBuddy'
              ),
              React.createElement('p', { className: 'text-xl text-gray-600 mb-8' }, 
                user ? 'Hello, ' + user.firstName + '!' : 'Share Your Journey, Save the Planet'
              ),
              React.createElement('div', { className: 'max-w-4xl mx-auto' },
                React.createElement('div', { className: 'bg-white rounded-lg shadow-lg p-8' },
                  React.createElement('h2', { className: 'text-2xl font-semibold mb-6' }, 'Dashboard'),
                  React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' },
                    React.createElement('div', { className: 'bg-blue-50 p-6 rounded-lg' },
                      React.createElement('h3', { className: 'font-semibold text-blue-900 mb-2' }, 'Total Rides'),
                      React.createElement('p', { className: 'text-3xl font-bold text-blue-600' }, '0')
                    ),
                    React.createElement('div', { className: 'bg-green-50 p-6 rounded-lg' },
                      React.createElement('h3', { className: 'font-semibold text-green-900 mb-2' }, 'Active Bookings'),
                      React.createElement('p', { className: 'text-3xl font-bold text-green-600' }, '0')
                    ),
                    React.createElement('div', { className: 'bg-purple-50 p-6 rounded-lg' },
                      React.createElement('h3', { className: 'font-semibold text-purple-900 mb-2' }, 'Messages'),
                      React.createElement('p', { className: 'text-3xl font-bold text-purple-600' }, '0')
                    )
                  ),
                  React.createElement('div', { className: 'mt-8 text-center' },
                    React.createElement('p', { className: 'text-gray-600 mb-4' }, 
                      'This is a stable version of HitchBuddy dashboard that stays visible.'
                    ),
                    React.createElement('button', { 
                      className: 'bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-4',
                      onClick: () => alert('Feature coming soon!')
                    }, 'Get Started'),
                    React.createElement('button', { 
                      className: 'bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors',
                      onClick: () => window.location.reload()
                    }, 'Refresh')
                  )
                )
              )
            )
          ));
        };
        
        const root = createRoot(document.getElementById('root'));
        root.render(React.createElement(Dashboard));
      </script>
    </body>
    </html>
  `);
});

server.listen(PORT, () => {
  console.log('🚗 HitchBuddy Working Server running on port ' + PORT);
  console.log('📱 React app with styled interface: http://localhost:' + PORT);
  console.log('🔗 API endpoints working: http://localhost:' + PORT + '/api');
});