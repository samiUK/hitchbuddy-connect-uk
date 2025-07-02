#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || 5000;

console.log('🚀 Starting Real HitchBuddy React Application');
console.log(`📍 Port: ${PORT}`);
console.log(`📁 Directory: ${process.cwd()}`);

// Start the real server
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: PORT,
    NODE_ENV: 'development'
  },
  cwd: process.cwd()
});

server.on('error', (err) => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`🔴 Server process exited with code ${code}`);
  process.exit(code);
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Terminating server...');
  server.kill('SIGTERM');
});