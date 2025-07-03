console.log('[DEV] Starting HitchBuddy Working Server...');

const { spawn } = require('child_process');
const path = require('path');

// Use the working server that avoids all Express/routing issues
console.log('[DEV] Using stable Node.js HTTP server with API and styling...');

const devServer = spawn('node', ['working-server.cjs'], {
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