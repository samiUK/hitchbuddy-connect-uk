#!/usr/bin/env node

// Simple development server starter that bypasses Vite config issues
const { spawn } = require('child_process');
const path = require('path');

console.log('[DEV] Starting HitchBuddy development server...');

// Start the server directly using tsx
const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '5000'
  }
});

serverProcess.on('error', (error) => {
  console.error('[DEV] Server error:', error);
});

serverProcess.on('exit', (code) => {
  console.log(`[DEV] Server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[DEV] Shutting down...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n[DEV] Shutting down...');
  serverProcess.kill('SIGTERM');
});