console.log('🚗 Starting HitchBuddy with original working configuration...');

const { spawn } = require('child_process');

// Use the working React CDN approach with backend API
const serverProcess = spawn('node', ['start-react-app.js'], {
  stdio: 'inherit',
  env: { 
    ...process.env,
    NODE_ENV: 'development'
  }
});

console.log('HitchBuddy original sophisticated components loading...');

process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  serverProcess.kill('SIGINT');
  process.exit(0);
});

serverProcess.on('close', (code) => {
  process.exit(code);
});

serverProcess.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});