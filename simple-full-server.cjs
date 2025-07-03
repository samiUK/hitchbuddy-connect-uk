console.log('🚗 Starting HitchBuddy with integrated frontend and backend...');

const express = require('express');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5000;

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Simple API routes for authentication
app.get('/api/auth/me', (req, res) => {
  res.json({ error: 'Not authenticated' });
});

app.post('/api/auth/signin', (req, res) => {
  res.json({ error: 'Sign in functionality not yet connected' });
});

app.post('/api/auth/signup', (req, res) => {
  res.json({ error: 'Sign up functionality not yet connected' });
});

app.get('/api/rides', (req, res) => {
  res.json([]);
});

app.get('/api/bookings', (req, res) => {
  res.json([]);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: 'HitchBuddy Complete',
    features: ['React Frontend', 'Express Backend', 'API Routes']
  });
});

// Start Vite dev server for frontend development
const viteProcess = spawn('npx', ['vite', '--host', '--port', '5173'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  env: { 
    ...process.env,
    NODE_ENV: 'development'
  }
});

// Wait for Vite to start, then set up frontend proxy
setTimeout(() => {
  console.log('[hitchbuddy] Setting up frontend proxy...');
  
  const { createProxyMiddleware } = require('http-proxy-middleware');
  
  // Proxy all non-API requests to Vite dev server
  const frontendProxy = createProxyMiddleware({
    target: 'http://localhost:5173',
    changeOrigin: true,
    ws: true,
    onError: (err, req, res) => {
      console.log('Vite not ready yet, showing loading...');
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>HitchBuddy Loading</title>
          <meta http-equiv="refresh" content="2">
          <style>
            body { 
              font-family: Arial; 
              text-align: center; 
              padding: 50px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              margin: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
            }
            .spinner {
              border: 4px solid rgba(255,255,255,0.3);
              border-radius: 50%;
              border-top: 4px solid white;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin: 20px auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div>
            <h1>🚗 HitchBuddy</h1>
            <div class="spinner"></div>
            <p>Loading your original React application...</p>
            <p><small>This page will refresh automatically</small></p>
          </div>
        </body>
        </html>
      `);
    }
  });
  
  // Apply proxy to all non-API routes
  app.use('/', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      next(); // Skip proxy for API routes
    } else {
      frontendProxy(req, res, next);
    }
  });
}, 3000);

// Start main server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[hitchbuddy] Integrated server running on port ${PORT}`);
  console.log(`[hitchbuddy] API routes available at /api/*`);
  console.log(`[hitchbuddy] Frontend will load once Vite starts`);
  console.log(`[hitchbuddy] Visit: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down HitchBuddy...');
  viteProcess.kill('SIGINT');
  server.close(() => {
    process.exit(0);
  });
});

viteProcess.on('close', (code) => {
  if (code !== 0) {
    console.log(`Vite process exited with code ${code}`);
  }
});