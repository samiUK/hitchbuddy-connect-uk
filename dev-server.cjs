console.log('[VITE] Starting Vite development server for your React app...');

const { spawn } = require('child_process');
const PORT = process.env.PORT || 5000;

const viteServer = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', PORT], {
  stdio: 'inherit',
  cwd: 'client',
  env: { 
    ...process.env, 
    PORT: PORT,
    NODE_ENV: 'development'
  }
});

viteServer.on('error', (err) => {
  console.error('[VITE] Server error:', err.message);
  process.exit(1);
});

viteServer.on('close', (code) => {
  console.log(`[VITE] Server exited with code ${code}`);
  process.exit(code);
});

process.on('SIGINT', () => {
  viteServer.kill('SIGINT');
});

process.on('SIGTERM', () => {
  viteServer.kill('SIGTERM');
});