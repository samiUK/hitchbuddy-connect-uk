console.log('[REAL] Starting HitchBuddy with real PostgreSQL backend...');

const { spawn } = require('child_process');
const PORT = process.env.PORT || 5000;

// Start the real backend server with PostgreSQL database
const realServer = spawn('node', ['hitchbuddy-real.js'], {
  stdio: 'inherit',
  env: { 
    ...process.env, 
    PORT: PORT,
    NODE_ENV: 'development'
  }
});

realServer.on('error', (err) => {
  console.error('[REAL] Backend server error:', err.message);
  process.exit(1);
});

realServer.on('close', (code) => {
  console.log(`[REAL] Backend server exited with code ${code}`);
  process.exit(code);
});

process.on('SIGINT', () => {
  realServer.kill('SIGINT');
});

process.on('SIGTERM', () => {
  realServer.kill('SIGTERM');
});