const express = require('express');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 5000;

async function startDevServer() {
  try {
    console.log('🚀 Starting HitchBuddy React development server...');
    
    // Start Vite development server for client directory
    const viteProcess = exec('cd client && npx vite --host 0.0.0.0 --port 3000', (error, stdout, stderr) => {
      if (error) {
        console.log('Vite process exited:', error.message);
        return;
      }
    });

    viteProcess.stdout.on('data', (data) => {
      console.log(`[Vite] ${data}`);
    });

    viteProcess.stderr.on('data', (data) => {
      console.log(`[Vite] ${data}`);
    });

    // Give Vite a moment to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Create Express proxy server
    const app = express();
    app.use(express.json());

    // Health check
    app.get('/health', (req, res) => {
      res.json({
        status: 'proxy server running',
        app: 'HitchBuddy',
        vite: 'http://localhost:3000',
        features: ['React App', 'Authentication', 'Dashboard', 'Ride Management', 'Chat', 'Booking System']
      });
    });

    // Start the backend API server for real database connectivity
    const backendProcess = exec('npx tsx server/index.ts', {
      env: { 
        ...process.env,
        IS_VITE_PROXY: 'true',
        PORT: '8080',
        NODE_ENV: 'development'
      }
    });

    backendProcess.stdout.on('data', (data) => {
      console.log(`[Backend] ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
      console.log(`[Backend] ${data}`);
    });

    // Give backend a moment to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Proxy API requests to backend server
    app.use('/api/*', (req, res) => {
      const url = `http://localhost:8080${req.originalUrl}`;
      console.log(`API Proxying: ${req.originalUrl} -> ${url}`);
      
      // Forward the request to backend
      const options = {
        hostname: 'localhost',
        port: 8080,
        path: req.originalUrl,
        method: req.method,
        headers: req.headers
      };

      const http = require('http');
      const proxyReq = http.request(options, (proxyRes) => {
        res.status(proxyRes.statusCode);
        Object.keys(proxyRes.headers).forEach(key => {
          res.setHeader(key, proxyRes.headers[key]);
        });
        proxyRes.pipe(res);
      });

      if (req.body) {
        proxyReq.write(JSON.stringify(req.body));
      }
      proxyReq.end();
    });

    // Proxy all other requests to Vite
    app.use('*', (req, res) => {
      const url = `http://localhost:3000${req.originalUrl}`;
      console.log(`Frontend Proxying: ${req.originalUrl} -> ${url}`);
      
      // Simple redirect to Vite dev server
      res.redirect(url);
    });

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ HitchBuddy proxy server running on port ${PORT}`);
      console.log('✅ Vite dev server on port 3000');
      console.log('✅ Your original React app with Dashboard, Auth, etc. available');
    });

    return server;

  } catch (error) {
    console.error('❌ Failed to start dev server:', error.message);
    startExpressFallback();
  }
}

function startExpressFallback() {
  console.log('🔄 Starting Express fallback server...');
  
  const app = express();
  app.use(express.json());
  
  // Serve static files from client directory
  app.use(express.static(path.join(__dirname, 'client/public')));
  app.use('/src', express.static(path.join(__dirname, 'client/src')));
  app.use('/assets', express.static(path.join(__dirname, 'client/src/assets')));
  
  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'fallback server running',
      app: 'HitchBuddy',
      mode: 'fallback'
    });
  });

  // Serve main React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/index.html'));
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔄 HitchBuddy fallback server running on port ${PORT}`);
  });
}

startDevServer();