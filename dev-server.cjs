const { spawn } = require('child_process');

console.log('🚗 Starting HitchBuddy with working configuration...');

// Use TypeScript-capable server
const serverProcess = spawn('node', ['working-tsx-server.js'], {
  stdio: 'inherit',
  env: { 
    ...process.env,
    NODE_ENV: 'development',
    PORT: '5000'
  }
});

console.log('✅ Loading complete HitchBuddy application...');

process.on('SIGINT', () => {
  serverProcess.kill('SIGINT');
  process.exit(0);
});

process.on('close', (code) => {
  process.exit(code);
});

process.on('error', (err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});