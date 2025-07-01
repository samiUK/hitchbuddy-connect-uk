// Render.com entry point - runs deploy-server.js
const { spawn } = require('child_process');
const path = require('path');

console.log('[render] Starting HitchBuddy from api/index.js');
console.log('[render] Current directory:', process.cwd());

// Change to project root directory
const projectRoot = path.resolve(__dirname, '..');
process.chdir(projectRoot);

console.log('[render] Changed to project root:', process.cwd());

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || 10000;

console.log('[render] Starting deploy-server.js');

// Start our deploy server
const serverProcess = spawn('node', ['deploy-server.js'], {
  stdio: 'inherit',
  cwd: projectRoot,
  env: process.env
});

serverProcess.on('close', (code) => {
  console.log('[render] Server exited with code:', code);
  process.exit(code);
});

serverProcess.on('error', (err) => {
  console.error('[render] Server error:', err);
  process.exit(1);
});