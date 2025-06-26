#!/usr/bin/env node

// Production starter for Replit deployment
// This ensures the live deployment uses the production server

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting HitchBuddy production deployment...');

// Ensure we're using the production deployment server
const productionServer = path.join(__dirname, 'deploy-production.js');
const PORT = process.env.PORT || 5000;

console.log(`Production server: ${productionServer}`);
console.log(`Target port: ${PORT}`);

// Start the production server
const server = spawn('node', [productionServer], {
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: PORT
  },
  stdio: 'inherit'
});

server.on('error', (error) => {
  console.error('Failed to start production server:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Production server exited with code ${code}`);
  if (code !== 0) {
    process.exit(code);
  }
});

// Forward signals to the server
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, forwarding to production server');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, forwarding to production server');
  server.kill('SIGINT');
});

console.log('Production deployment started successfully');