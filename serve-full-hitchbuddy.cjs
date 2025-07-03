console.log('🚗 Starting Complete HitchBuddy with Frontend + Backend...');

const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Start backend API server on port 5001
console.log('[backend] Starting TypeScript API server...');
const backendProcess = spawn('node', ['-r', 'tsx/cjs', 'server/index.ts'], {
  stdio: 'inherit',
  env: { 
    ...process.env,
    NODE_ENV: 'development',
    PORT: '5001'
  }
});

// Start Vite dev server on port 5173  
console.log('[frontend] Starting Vite React dev server...');
const viteProcess = spawn('npx', ['vite', '--host', '--port', '5173'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  env: { 
    ...process.env,
    NODE_ENV: 'development'
  }
});

// Wait a bit for servers to start
setTimeout(() => {
  console.log('[proxy] Setting up API and frontend proxying...');
  
  // Proxy API requests to backend server
  app.use('/api', createProxyMiddleware({
    target: 'http://localhost:5001',
    changeOrigin: true,
    pathRewrite: {
      // Don't rewrite the path, keep /api prefix
    },
    onError: (err, req, res) => {
      console.error('API proxy error:', err.message);
      res.status(500).json({ error: 'Backend API server not available' });
    }
  }));

  // Proxy all other requests to Vite frontend
  app.use('*', createProxyMiddleware({
    target: 'http://localhost:5173',
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error('Frontend proxy error:', err.message);
      res.status(500).send('Frontend server not available');
    }
  }));

  // Start main proxy server
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[hitchbuddy] Complete app running on port ${PORT}`);
    console.log(`[hitchbuddy] Frontend: Vite React (port 5173)`);
    console.log(`[hitchbuddy] Backend: Express API (port 5001)`);
    console.log(`[hitchbuddy] Visit: http://localhost:${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down HitchBuddy...');
    backendProcess.kill('SIGINT');
    viteProcess.kill('SIGINT');
    server.close(() => {
      process.exit(0);
    });
  });

}, 3000); // Give servers time to start

backendProcess.on('close', (code) => {
  if (code !== 0) {
    console.log(`Backend process exited with code ${code}`);
  }
});

viteProcess.on('close', (code) => {
  if (code !== 0) {
    console.log(`Vite process exited with code ${code}`);
  }
});