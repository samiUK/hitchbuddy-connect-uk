const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 5001;

async function startDevelopmentServer() {
  console.log('🚀 Starting HitchBuddy with Vite + Express setup...');
  
  // Start Vite development server
  const viteProcess = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '3000'], {
    cwd: 'client',
    stdio: 'pipe'
  });

  viteProcess.stdout.on('data', (data) => {
    console.log(`[Vite] ${data.toString().trim()}`);
  });

  viteProcess.stderr.on('data', (data) => {
    console.log(`[Vite] ${data.toString().trim()}`);
  });

  // Start backend API server
  const backendProcess = spawn('npx', ['tsx', 'server/index.ts'], {
    env: { 
      ...process.env,
      IS_VITE_PROXY: 'true',
      PORT: '8080'
    },
    stdio: 'pipe'
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`[Backend] ${data.toString().trim()}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.log(`[Backend] ${data.toString().trim()}`);
  });

  // Wait for servers to start
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Create proxy server
  const app = express();
  app.use(express.json());

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'development server running',
      app: 'HitchBuddy',
      frontend: 'http://localhost:3000',
      backend: 'http://localhost:8080'
    });
  });

  // Proxy API requests to backend
  app.use('/api', createProxyMiddleware({
    target: 'http://localhost:8080',
    changeOrigin: true,
    logLevel: 'info'
  }));

  // Proxy all other requests to Vite
  app.use('*', createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true,
    logLevel: 'info'
  }));

  // Start proxy server
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ HitchBuddy development server running on port ${PORT}`);
    console.log('✅ Frontend: Vite development server with hot reload');
    console.log('✅ Backend: Express API with database connectivity');
    console.log('✅ Your sophisticated React app is ready!');
  });

  // Cleanup function
  const cleanup = () => {
    console.log('Shutting down development server...');
    viteProcess.kill();
    backendProcess.kill();
    server.close();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  return server;
}

startDevelopmentServer().catch(console.error);