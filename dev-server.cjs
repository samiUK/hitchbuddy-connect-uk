const { spawn } = require('child_process');

console.log('🚗 Starting HitchBuddy with working configuration...');

// Use original tsx approach that was working
const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: { 
    ...process.env,
    NODE_ENV: 'development',
    PORT: '5000',
    NODE_OPTIONS: '--experimental-modules'
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