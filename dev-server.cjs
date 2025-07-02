console.log('[HYBRID] Starting Vite dev server with backend proxy...');

const { spawn } = require('child_process');
const PORT = process.env.PORT || 5000;

// Start the Vite development server which handles TypeScript compilation
const viteServer = spawn('npx', ['vite', 'dev', '--host', '0.0.0.0', '--port', PORT], {
  stdio: 'inherit',
  cwd: 'client',
  env: { 
    ...process.env, 
    PORT: PORT,
    NODE_ENV: 'development'
  }
});

viteServer.on('error', (err) => {
  console.error('[HYBRID] Vite server error:', err.message);
  process.exit(1);
});

viteServer.on('close', (code) => {
  console.log(`[HYBRID] Vite server exited with code ${code}`);
  process.exit(code);
});

process.on('SIGINT', () => {
  viteServer.kill('SIGINT');
});

process.on('SIGTERM', () => {
  viteServer.kill('SIGTERM');
});