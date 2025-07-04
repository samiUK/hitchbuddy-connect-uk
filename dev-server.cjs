console.log('🚗 Starting HitchBuddy with frontend + backend...');

const { spawn } = require('child_process');
const path = require('path');

// Start backend server on port 3000
const backendProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { 
    ...process.env,
    NODE_ENV: 'development',
    PORT: '3000'
  }
});

console.log('[hitchbuddy] Starting backend server on port 3000...');

// Wait a moment for backend to start, then start frontend
setTimeout(() => {
  // Start Vite dev server on port 5000 with API proxy to backend
  const viteProcess = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5000'], {
    cwd: path.join(__dirname, 'client'),
    stdio: 'inherit',
    env: { 
      ...process.env,
      NODE_ENV: 'development'
    }
  });

  console.log('[hitchbuddy] Starting Vite frontend server on port 5000...');
  console.log('[hitchbuddy] Frontend will proxy API requests to backend on port 3000');
  console.log('[hitchbuddy] HitchBuddy will be available on port 5000');

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\nShutting down HitchBuddy...');
    viteProcess.kill('SIGINT');
    backendProcess.kill('SIGINT');
    process.exit(0);
  });

  viteProcess.on('close', (code) => {
    console.log(`Vite process exited with code ${code}`);
    backendProcess.kill('SIGINT');
    process.exit(code);
  });

  viteProcess.on('error', (err) => {
    console.error('Failed to start Vite:', err);
    backendProcess.kill('SIGINT');
    process.exit(1);
  });
}, 2000);

backendProcess.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
  process.exit(code);
});

backendProcess.on('error', (err) => {
  console.error('Failed to start backend:', err);
  process.exit(1);
});