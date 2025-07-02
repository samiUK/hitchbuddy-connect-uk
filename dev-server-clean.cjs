console.log('[CLEAN] Starting your ORIGINAL HitchBuddy tsx server...');

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
  console.error('[CLEAN] Failed to start tsx server:', err.message);
  process.exit(1);
});

originalServer.on('close', (code) => {
  console.log(`[CLEAN] tsx server exited with code ${code}`);
  process.exit(code);
});

process.on('SIGINT', () => {
  console.log('[CLEAN] Shutting down tsx server...');
  originalServer.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('[CLEAN] Terminating tsx server...');
  originalServer.kill('SIGTERM');
});