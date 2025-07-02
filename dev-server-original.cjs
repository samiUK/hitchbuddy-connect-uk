const { spawn } = require('child_process');
const PORT = process.env.PORT || 5000;

console.log('[Dev] Starting your original HitchBuddy React application...');

// Start the original server directly with tsx
const originalServer = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: { 
    ...process.env, 
    PORT: PORT,
    NODE_ENV: 'development'
  },
  cwd: process.cwd()
});

originalServer.on('close', (code) => {
  console.log(`[Dev] Original server exited with code ${code}`);
  process.exit(code);
});

originalServer.on('error', (err) => {
  console.error('[Dev] Failed to start original server:', err.message);
  process.exit(1);
});

// Handle cleanup
process.on('SIGINT', () => {
  originalServer.kill('SIGINT');
});

process.on('SIGTERM', () => {
  originalServer.kill('SIGTERM');
});