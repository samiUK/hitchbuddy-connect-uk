console.log('🚗 Starting HitchBuddy from working yesterday configuration...');

const { spawn } = require('child_process');

// Use the working server from yesterday
const serverProcess = spawn('node', ['original-dashboard-server.cjs'], {
  stdio: 'inherit',
  env: { 
    ...process.env,
    NODE_ENV: 'development'
  }
});

console.log('HitchBuddy working server starting...');

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