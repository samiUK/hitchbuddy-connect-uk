console.log('🚗 Starting Original HitchBuddy with Vite...');

const { spawn } = require('child_process');
const path = require('path');

// Start Vite dev server directly in client directory with Replit-friendly config
const viteProcess = spawn('npx', ['vite', '--host', '--port', '5000'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  env: { 
    ...process.env,
    NODE_ENV: 'development',
    REPLIT_DB_URL: process.env.REPLIT_DB_URL,
    REPL_ID: process.env.REPL_ID,
    REPL_SLUG: process.env.REPL_SLUG
  }
});

console.log('[hitchbuddy] Starting Vite dev server for original React app...');
console.log('[hitchbuddy] Original HitchBuddy will be available on port 5000');

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down HitchBuddy...');
  viteProcess.kill('SIGINT');
  process.exit(0);
});

viteProcess.on('close', (code) => {
  console.log(`Vite process exited with code ${code}`);
  process.exit(code);
});

viteProcess.on('error', (err) => {
  console.error('Failed to start Vite:', err);
  process.exit(1);
});