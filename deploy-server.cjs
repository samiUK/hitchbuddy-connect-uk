const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting HitchBuddy Production Server with Full Functionality...');

// Start the production server that includes all development features
const server = spawn('node', ['final-production-server.cjs'], {
  stdio: 'inherit',
  shell: false,
  cwd: __dirname,
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: process.env.PORT || '10000'
  }
});

server.on('error', (err) => {
  console.error('Failed to start production server:', err);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`Production server process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  server.kill('SIGINT');
});