console.log('🚗 Starting HitchBuddy with original working configuration...');

const { spawn } = require('child_process');

// Use the working deploy-server.cjs which has proper React CDN handling
const serverProcess = spawn('node', ['deploy-server.cjs'], {
  stdio: 'inherit',
  env: { 
    ...process.env,
    NODE_ENV: 'development',
    PORT: '5000'
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