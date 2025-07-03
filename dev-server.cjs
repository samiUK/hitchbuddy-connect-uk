console.log('[DEV] Starting HitchBuddy with proper built React application...');

const { spawn } = require('child_process');
const path = require('path');

// Use the simple dev server that works with the built dist files
console.log('[DEV] Using built React app from dist/public with enhanced styling...');

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