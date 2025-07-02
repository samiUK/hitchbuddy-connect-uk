// FINAL APPROACH: Run your ORIGINAL tsx server directly
console.log('[FINAL] Starting your ORIGINAL HitchBuddy React application with tsx...');

const { spawn } = require('child_process');
const PORT = process.env.PORT || 5000;

const originalServer = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: { 
    ...process.env, 
    PORT: PORT,
    NODE_ENV: 'development'
  }
});

originalServer.on('error', (err) => {
  console.error('[FINAL] Failed to start original server:', err.message);
  process.exit(1);
});

originalServer.on('close', (code) => {
  console.log(`[FINAL] Original server exited with code ${code}`);
  process.exit(code);
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('[FINAL] Shutting down original server...');
  originalServer.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('[FINAL] Terminating original server...');
  originalServer.kill('SIGTERM');
});