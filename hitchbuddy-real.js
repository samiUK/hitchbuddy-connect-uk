const { spawn } = require('child_process');

console.log('🚗 Starting HitchBuddy TypeScript React Application...');

// Start server/index.ts directly - it already includes Vite setup
const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '5000'
  }
});

console.log('✅ HitchBuddy TypeScript React server starting...');
console.log('✅ Dashboard.tsx, AuthModal.tsx, and all components loading...');

process.on('SIGINT', () => {
  console.log('\n💀 Shutting down HitchBuddy server...');
  serverProcess.kill('SIGINT');
  process.exit(0);
});

serverProcess.on('close', (code) => {
  process.exit(code);
});

serverProcess.on('error', (err) => {
  console.error('Failed to start HitchBuddy server:', err);
  process.exit(1);
});