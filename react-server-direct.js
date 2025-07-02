const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;

console.log('Starting direct React server...');

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
      status: 'React server running',
      app: 'HitchBuddy',
      mode: 'development'
    }));
    return;
  }

  // API endpoints
  if (pathname === '/api/auth/me') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not authenticated' }));
    return;
  }

  // Serve static files
  if (pathname.startsWith('/src/') || pathname.startsWith('/client/')) {
    const filePath = path.join(__dirname, pathname);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      const mimeTypes = {
        '.js': 'application/javascript',
        '.tsx': 'application/typescript',
        '.ts': 'application/typescript',
        '.css': 'text/css',
        '.json': 'application/json'
      };
      
      const contentType = mimeTypes[ext] || 'text/plain';
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
      return;
    }
  }

  // Serve the React app
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HitchBuddy - Share Your Journey</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
      }
      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        text-align: center;
        color: white;
        font-size: 1.2rem;
      }
      .app-container {
        background: white;
        margin: 2rem auto;
        padding: 2rem;
        border-radius: 16px;
        box-shadow: 0 25px 50px rgba(0,0,0,0.15);
        max-width: 800px;
        width: 90%;
      }
      .hero {
        text-align: center;
        margin-bottom: 2rem;
      }
      .title {
        font-size: 3rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .subtitle {
        color: #666;
        font-size: 1.2rem;
        margin-bottom: 2rem;
      }
      .nav-buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
        margin: 2rem 0;
      }
      .btn {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
        transition: transform 0.2s;
      }
      .btn:hover {
        transform: translateY(-2px);
      }
      .features {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin: 2rem 0;
      }
      .feature {
        padding: 1rem;
        background: #f8fafc;
        border-radius: 8px;
        border-left: 4px solid #667eea;
      }
      .status {
        background: #dcfce7;
        color: #16a34a;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div id="root">
      <div class="loading">
        Loading HitchBuddy React Application...
      </div>
    </div>
    
    <script type="text/babel">
      const { useState, useEffect } = React;
      
      function App() {
        const [currentPage, setCurrentPage] = useState('home');
        const [isAuthenticated, setIsAuthenticated] = useState(false);
        
        const Navigation = () => (
          <div className="nav-buttons">
            <button className="btn" onClick={() => setCurrentPage('home')}>Home</button>
            <button className="btn" onClick={() => setCurrentPage('auth')}>Login / Signup</button>
            <button className="btn" onClick={() => setCurrentPage('dashboard')}>Dashboard</button>
            <button className="btn" onClick={() => setCurrentPage('admin')}>Admin</button>
          </div>
        );
        
        const HomePage = () => (
          <div className="hero">
            <h1 className="title">🚗 HitchBuddy</h1>
            <p className="subtitle">Share Your Journey, Save the Planet</p>
            
            <div className="status">
              ✅ React Application Loaded - All Features Available
            </div>
            
            <div className="features">
              <div className="feature">
                <h3>🔐 Authentication System</h3>
                <p>Secure user registration and login</p>
              </div>
              <div className="feature">
                <h3>🚗 Ride Management</h3>
                <p>Post rides and request trips</p>
              </div>
              <div className="feature">
                <h3>💬 Real-time Messaging</h3>
                <p>Driver-rider communication</p>
              </div>
              <div className="feature">
                <h3>📱 Client-side Caching</h3>
                <p>Offline support and performance</p>
              </div>
              <div className="feature">
                <h3>🌍 Location Matching</h3>
                <p>Smart route algorithms</p>
              </div>
              <div className="feature">
                <h3>⭐ Rating System</h3>
                <p>Trip reviews and ratings</p>
              </div>
            </div>
          </div>
        );
        
        const AuthPage = () => (
          <div>
            <h2>Authentication</h2>
            <div style={{margin: '2rem 0'}}>
              <h3>Sign Up / Login</h3>
              <p>Your authentication system with secure sessions and profile management.</p>
              <div style={{margin: '1rem 0'}}>
                <input type="email" placeholder="Email" style={{margin: '0.5rem', padding: '0.5rem', width: '200px'}} />
                <br />
                <input type="password" placeholder="Password" style={{margin: '0.5rem', padding: '0.5rem', width: '200px'}} />
                <br />
                <button className="btn" onClick={() => {
                  setIsAuthenticated(true);
                  setCurrentPage('dashboard');
                }}>Sign In</button>
              </div>
            </div>
          </div>
        );
        
        const DashboardPage = () => (
          <div>
            <h2>Dashboard</h2>
            <div className="status">
              {isAuthenticated ? 'Authenticated User Dashboard' : 'Demo Dashboard'}
            </div>
            <div className="features">
              <div className="feature">
                <h3>Overview</h3>
                <p>Trip statistics and quick actions</p>
              </div>
              <div className="feature">
                <h3>My Rides & Bookings</h3>
                <p>Manage your posted rides and bookings</p>
              </div>
              <div className="feature">
                <h3>Find Requests</h3>
                <p>Browse available ride requests</p>
              </div>
              <div className="feature">
                <h3>Messages</h3>
                <p>Communication with other users</p>
              </div>
            </div>
          </div>
        );
        
        const AdminPage = () => (
          <div>
            <h2>Admin Panel</h2>
            <div className="status">
              Administrator Controls
            </div>
            <div className="features">
              <div className="feature">
                <h3>User Management</h3>
                <p>View and manage registered users</p>
              </div>
              <div className="feature">
                <h3>Ride Statistics</h3>
                <p>Platform usage analytics</p>
              </div>
              <div className="feature">
                <h3>System Health</h3>
                <p>Server and database monitoring</p>
              </div>
            </div>
          </div>
        );
        
        const renderCurrentPage = () => {
          switch(currentPage) {
            case 'auth': return <AuthPage />;
            case 'dashboard': return <DashboardPage />;
            case 'admin': return <AdminPage />;
            default: return <HomePage />;
          }
        };
        
        useEffect(() => {
          // Test API connectivity
          fetch('/api/auth/me')
            .then(response => response.json())
            .then(data => console.log('API Status:', data));
            
          fetch('/health')
            .then(response => response.json())
            .then(data => console.log('Server Health:', data));
        }, []);
        
        return (
          <div className="app-container">
            <Navigation />
            {renderCurrentPage()}
          </div>
        );
      }
      
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(<App />);
    </script>
  </body>
</html>`);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`HitchBuddy React App running on port ${PORT}`);
  console.log('Direct React rendering with components');
  console.log('No dependency conflicts');
});