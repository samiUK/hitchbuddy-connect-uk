console.log('[DEV] Starting HitchBuddy development server with bypass approach...');

const { spawn } = require('child_process');
const path = require('path');

// First try to serve using the built dist files, if they exist
const fs = require('fs');
const distPath = path.join(__dirname, 'dist/public');

if (fs.existsSync(distPath)) {
  console.log('[DEV] Using built React app from dist/public');
  // Use the simple dev server that serves the built files
  const devServer = spawn('node', ['simple-dev-server.cjs'], {
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_ENV: 'development',
      PORT: process.env.PORT || 5000
    }
  });

  devServer.on('error', (err) => {
    console.error('[DEV] Server error:', err.message);
    process.exit(1);
  });

  devServer.on('close', (code) => {
    console.log(`[DEV] Server exited with code ${code}`);
    process.exit(code);
  });

  process.on('SIGINT', () => {
    devServer.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    devServer.kill('SIGTERM');
  });
} else {
  console.log('[DEV] No built files found, attempting to start backend server directly...');
  // Try to start just the backend server without vite
  const devServer = spawn('node', ['server-bypass.js'], {
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_ENV: 'development',
      PORT: process.env.PORT || 5000
    }
  });

  devServer.on('error', (err) => {
    console.error('[DEV] Server error:', err.message);
    process.exit(1);
  });

  devServer.on('close', (code) => {
    console.log(`[DEV] Server exited with code ${code}`);
    process.exit(code);
  });

  process.on('SIGINT', () => {
    devServer.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    devServer.kill('SIGTERM');
  });
}