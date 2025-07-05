#!/usr/bin/env node

// Production entry point for Render deployment
// This file ensures Render can find the startup script it expects
// while routing to our full-featured development server

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 HitchBuddy Production Entry Point - Starting Development Server...');

// Change to the parent directory where our actual server files are located
const projectRoot = path.resolve(__dirname, '..');
process.chdir(projectRoot);

console.log(`📁 Working directory: ${projectRoot}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
console.log(`🚪 Port: ${process.env.PORT || '10000'}`);

// Start the development server with production environment settings
const server = spawn('node', ['dev-server.cjs'], {
  stdio: 'inherit',
  shell: false,
  cwd: projectRoot,
  env: {
    ...process.env,
    NODE_ENV: 'development',
    FORCE_DEV_MODE: 'true',
    VITE_CONFIG: 'vite.config.production.js',
    PORT: process.env.PORT || '10000'
  }
});

server.on('error', (err) => {
  console.error('❌ Failed to start development server:', err);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`🛑 Development server process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Received SIGTERM, shutting down gracefully...');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('📴 Received SIGINT, shutting down gracefully...');
  server.kill('SIGINT');
});

console.log('✅ Production entry point configured - development server starting...');