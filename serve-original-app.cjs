console.log('🚗 Starting Original HitchBuddy React Application...');

const express = require('express');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: 'HitchBuddy Original',
    mode: 'development',
    features: ['React Dashboard', 'Authentication', 'Ride Management', 'Messaging', 'Booking System']
  });
});

// Serve the built React app if it exists
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// Start Vite dev server for React app
const viteProcess = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5173'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  env: { ...process.env }
});

// Proxy all non-API requests to Vite dev server
app.get('*', (req, res) => {
  // Proxy to Vite dev server
  const { createProxyMiddleware } = require('http-proxy-middleware');
  const proxy = createProxyMiddleware({
    target: 'http://localhost:5173',
    changeOrigin: true,
    onError: (err, req, res) => {
      console.log('Vite dev server not ready, serving fallback...');
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>HitchBuddy Loading...</title>
          <meta http-equiv="refresh" content="3">
        </head>
        <body>
          <div style="text-align: center; padding: 50px; font-family: Arial;">
            <h1>🚗 HitchBuddy Starting...</h1>
            <p>Your original React application is loading...</p>
            <p>This page will refresh automatically.</p>
          </div>
        </body>
        </html>
      `);
    }
  });
  proxy(req, res);
});

// Start Express server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[hitchbuddy] Original React app serving on port ${PORT}`);
  console.log(`[hitchbuddy] Vite dev server starting on port 5173`);
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