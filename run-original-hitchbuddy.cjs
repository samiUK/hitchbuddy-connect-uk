console.log('🚗 Starting Original HitchBuddy with Vite...');

const { spawn } = require('child_process');
const path = require('path');

// Start Vite dev server directly in client directory with proper host binding
const viteProcess = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5000'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  env: { 
    ...process.env,
    NODE_ENV: 'development'
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