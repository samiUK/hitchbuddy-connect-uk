const http = require('http');
const url = require('url');
const crypto = require('crypto');

// Storage
const users = new Map();
const sessions = new Map();
const rides = new Map();

// Utils
const generateId = () => crypto.randomBytes(8).toString('hex');
const hash = (str) => crypto.createHash('sha256').update(str + 'salt').digest('hex');
const parseCookies = (header) => {
  const cookies = {};
  if (header) {
    header.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) cookies[name] = value;
    });
  }
  return cookies;
};

// API routes
const routes = {
  'GET /api/health': (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'online', 
      users: users.size, 
      rides: rides.size,
      time: new Date().toISOString() 
    }));
  },
  
  'POST /api/auth/register': (req, res, body) => {
    try {
      const { email, password, name, type } = JSON.parse(body);
      
      if (users.has(email)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User exists' }));
        return;
      }
      
      const user = {
        id: generateId(),
        email, name, type,
        password: hash(password),
        created: new Date().toISOString()
      };
      
      users.set(email, user);
      const sessionId = generateId();
      sessions.set(sessionId, { userId: user.id, email });
      
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Set-Cookie': 'sid=' + sessionId + '; HttpOnly; Path=/; Max-Age=86400'
      });
      res.end(JSON.stringify({ success: true, user: { ...user, password: undefined } }));
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid data' }));
    }
  },
  
  'POST /api/auth/login': (req, res, body) => {
    try {
      const { email, password } = JSON.parse(body);
      const user = users.get(email);
      
      if (!user || user.password !== hash(password)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid credentials' }));
        return;
      }
      
      const sessionId = generateId();
      sessions.set(sessionId, { userId: user.id, email });
      
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Set-Cookie': 'sid=' + sessionId + '; HttpOnly; Path=/; Max-Age=86400'
      });
      res.end(JSON.stringify({ success: true, user: { ...user, password: undefined } }));
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid data' }));
    }
  },
  
  'GET /api/auth/profile': (req, res, body, session) => {
    if (!session) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not authenticated' }));
      return;
    }
    
    const user = Array.from(users.values()).find(u => u.id === session.userId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ user: { ...user, password: undefined } }));
  },
  
  'POST /api/rides': (req, res, body, session) => {
    if (!session) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Login required' }));
      return;
    }
    
    try {
      const rideData = JSON.parse(body);
      const ride = {
        id: generateId(),
        ...rideData,
        driverId: session.userId,
        status: 'active',
        created: new Date().toISOString()
      };
      
      rides.set(ride.id, ride);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, ride }));
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid ride data' }));
    }
  },
  
  'GET /api/rides': (req, res) => {
    const activeRides = Array.from(rides.values())
      .filter(r => r.status === 'active')
      .map(r => {
        const driver = Array.from(users.values()).find(u => u.id === r.driverId);
        return { ...r, driverName: driver ? driver.name : 'Unknown' };
      });
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(activeRides));
  }
};

// HTML page
const getHTML = () => `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hitchbuddy - Ride Sharing Platform</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh; color: #333;
        }
        .container { max-width: 900px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; color: white; margin-bottom: 40px; padding: 40px 0; }
        .header h1 { font-size: 3em; margin-bottom: 10px; }
        .card { 
            background: white; border-radius: 12px; padding: 25px; margin: 20px 0; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .card h3 { color: #667eea; margin-bottom: 15px; }
        .status { background: linear-gradient(45deg, #00c851, #007e33); color: white; }
        .status h3 { color: white; }
        button { 
            background: linear-gradient(45deg, #667eea, #764ba2); color: white; border: none; 
            padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px; margin: 5px;
        }
        input, select { 
            padding: 12px; border: 2px solid #e1e5e9; border-radius: 8px; 
            font-size: 16px; width: 100%; margin: 8px 0;
        }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
        pre { 
            background: #f8f9fa; padding: 15px; border-radius: 8px; 
            border-left: 4px solid #667eea; font-size: 14px;
        }
        .success { border-left-color: #28a745; }
        .error { border-left-color: #dc3545; }
        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚗 Hitchbuddy</h1>
            <p>Connect. Ride. Share the Journey.</p>
        </div>
        
        <div class="card status">
            <h3>✅ Platform Status</h3>
            <div class="stats">
                <div><div class="stat-number" id="users">0</div><div>Users</div></div>
                <div><div class="stat-number" id="rides">0</div><div>Rides</div></div>
                <div><div class="stat-number">✓</div><div>Online</div></div>
            </div>
        </div>
        
        <div class="card">
            <h3>🔧 System Test</h3>
            <button onclick="testHealth()">Health Check</button>
            <div id="health-result"></div>
        </div>
        
        <div class="card">
            <h3>👤 User Registration</h3>
            <div class="grid">
                <input id="email" placeholder="Email" value="demo@hitchbuddy.com">
                <input id="password" type="password" placeholder="Password" value="demo123">
                <input id="name" placeholder="Full Name" value="Demo User">
                <select id="type">
                    <option value="rider">🏃 Rider</option>
                    <option value="driver">🚗 Driver</option>
                </select>
            </div>
            <button onclick="testRegister()">Register User</button>
            <div id="register-result"></div>
        </div>
        
        <div class="card">
            <h3>🔑 Authentication</h3>
            <button onclick="testLogin()">Login</button>
            <button onclick="testProfile()">Get Profile</button>
            <div id="auth-result"></div>
        </div>
        
        <div class="card">
            <h3>🚗 Ride Management</h3>
            <div class="grid">
                <input id="from" placeholder="From" value="Downtown">
                <input id="to" placeholder="To" value="Airport">
                <input id="time" type="datetime-local">
                <input id="price" type="number" placeholder="Price (£)" value="25">
            </div>
            <button onclick="testCreateRide()">Post Ride</button>
            <button onclick="testGetRides()">View All Rides</button>
            <div id="ride-result"></div>
        </div>
        
        <div class="card">
            <h3>📊 Deployment Info</h3>
            <p><strong>Platform:</strong> Replit</p>
            <p><strong>Server:</strong> Node.js ${process.version}</p>
            <p><strong>Memory:</strong> ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB</p>
            <p><strong>Started:</strong> ${new Date().toLocaleString()}</p>
        </div>
    </div>
    
    <script>
        document.getElementById('time').value = new Date(Date.now() + 3600000).toISOString().slice(0, 16);
        
        async function api(endpoint, options = {}) {
            try {
                const response = await fetch(endpoint, {
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    ...options
                });
                return { ok: response.ok, data: await response.json() };
            } catch (error) {
                return { ok: false, error: error.message };
            }
        }
        
        function show(id, result) {
            const el = document.getElementById(id);
            const cls = result.ok ? 'success' : 'error';
            el.innerHTML = '<pre class="' + cls + '">' + JSON.stringify(result.ok ? result.data : result, null, 2) + '</pre>';
        }
        
        async function testHealth() {
            const result = await api('/api/health');
            show('health-result', result);
            if (result.ok) {
                document.getElementById('users').textContent = result.data.users;
                document.getElementById('rides').textContent = result.data.rides;
            }
        }
        
        async function testRegister() {
            const result = await api('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value,
                    name: document.getElementById('name').value,
                    type: document.getElementById('type').value
                })
            });
            show('register-result', result);
            testHealth();
        }
        
        async function testLogin() {
            const result = await api('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value
                })
            });
            show('auth-result', result);
        }
        
        async function testProfile() {
            const result = await api('/api/auth/profile');
            show('auth-result', result);
        }
        
        async function testCreateRide() {
            const result = await api('/api/rides', {
                method: 'POST',
                body: JSON.stringify({
                    from: document.getElementById('from').value,
                    to: document.getElementById('to').value,
                    datetime: document.getElementById('time').value,
                    price: parseFloat(document.getElementById('price').value)
                })
            });
            show('ride-result', result);
            testHealth();
        }
        
        async function testGetRides() {
            const result = await api('/api/rides');
            show('ride-result', result);
        }
        
        window.onload = testHealth;
    </script>
</body>
</html>`;

// Server
const server = http.createServer((req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    const parsedUrl = url.parse(req.url, true);
    const route = req.method + ' ' + parsedUrl.pathname;
    
    console.log('[' + new Date().toISOString() + '] ' + route);
    
    if (routes[route]) {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const cookies = parseCookies(req.headers.cookie);
          const session = cookies.sid ? sessions.get(cookies.sid) : null;
          routes[route](req, res, body, session);
        } catch (error) {
          console.error('Route Error:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Server error' }));
        }
      });
    } else if (parsedUrl.pathname === '/' || !parsedUrl.pathname.startsWith('/api/')) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(getHTML());
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  } catch (error) {
    console.error('Server Error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('🚗 Hitchbuddy Platform Online');
  console.log('📍 Port: ' + PORT);
  console.log('🌐 URL: https://' + process.env.REPL_SLUG + '--' + process.env.REPL_OWNER + '.replit.app/');
  console.log('⚡ Node.js ' + process.version);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));