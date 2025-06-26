// Simple start script that runs deploy-hitchbuddy.js
const { spawn } = require('child_process');

console.log('🚀 Starting HitchBuddy deployment...');

const child = spawn('node', ['deploy-hitchbuddy.js'], {
  stdio: 'inherit',
  env: { ...process.env }
});

child.on('error', (err) => {
  console.error('Failed to start deployment:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`Deployment process exited with code ${code}`);
  process.exit(code);
});

// Handle shutdown signals
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  child.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Shutting down...');
  child.kill('SIGINT');
});