const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');

const PORT = process.env.REPLIT_DEV_DOMAIN ? 5000 : 5001;

async function startDevServer() {
  console.log('🚀 Starting HitchBuddy React development server...');
  
  // Start Vite development server
  const viteProcess = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '3000'], {
    cwd: path.join(__dirname, 'client'),
    stdio: 'pipe'
  });

  viteProcess.stdout.on('data', (data) => {
    console.log(`[Vite] ${data}`);
  });

  viteProcess.stderr.on('data', (data) => {
    console.log(`[Vite] ${data}`);
  });

  // Wait for Vite to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Start Express server with proxy to Vite
  const app = express();
  
  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Start the backend server
  const backendProcess = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'pipe',
    env: { 
      ...process.env, 
      NODE_ENV: 'development',
      PORT: '8080',
      IS_VITE_PROXY: 'true'
    }
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`[Backend] ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.log(`[Backend] ${data}`);
  });

  // Wait for backend to start
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Proxy API requests to backend
  app.use('/api', createProxyMiddleware({
    target: 'http://localhost:8080',
    changeOrigin: true,
    ws: true
  }));

  // Proxy all other requests to Vite
  app.use('*', createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true,
    ws: true
  }));

  // Start the proxy server
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ HitchBuddy development server running on port ${PORT}`);
    console.log(`✅ React app (Vite): http://localhost:3000`);
    console.log(`✅ Backend API: http://localhost:8080`);
    console.log(`✅ Full app: http://localhost:${PORT}`);
  });

  // Cleanup on exit
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development server...');
    server.close();
    viteProcess.kill('SIGINT');
    backendProcess.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down development server...');
    server.close();
    viteProcess.kill('SIGTERM');
    backendProcess.kill('SIGTERM');
    process.exit(0);
  });
}

startDevServer().catch(error => {
  console.error('Failed to start development server:', error);
  process.exit(1);
});