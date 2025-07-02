console.log('[DEV] Starting HitchBuddy development server with your original React app...');

const { spawn } = require('child_process');
const path = require('path');

// Start the reliable production server
const devServer = spawn('node', ['simple-production-server.js'], {
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