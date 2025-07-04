console.log('🚗 Starting HitchBuddy with dual server setup...');

const { spawn } = require('child_process');
const path = require('path');

// Use working deploy server on port 3000
const backendProcess = spawn('node', ['deploy-server.cjs'], {
  stdio: 'inherit',
  env: { 
    ...process.env,
    NODE_ENV: 'development',
    PORT: '3000'
  }
});

console.log('Backend API server starting on port 3000...');

// Start frontend Vite server on port 5000
setTimeout(() => {
  const frontendProcess = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5000'], {
    cwd: path.join(__dirname, 'client'),
    stdio: 'inherit',
    env: { 
      ...process.env,
      NODE_ENV: 'development'
    }
  });

  console.log('Frontend Vite server starting on port 5000...');

  process.on('SIGINT', () => {
    console.log('\nShutting down both servers...');
    frontendProcess.kill('SIGINT');
    backendProcess.kill('SIGINT');
    process.exit(0);
  });

  frontendProcess.on('close', (code) => {
    backendProcess.kill('SIGINT');
    process.exit(code);
  });
}, 1500);

backendProcess.on('close', (code) => {
  process.exit(code);
});

backendProcess.on('error', (err) => {
  console.error('Failed to start backend:', err);
  process.exit(1);
});