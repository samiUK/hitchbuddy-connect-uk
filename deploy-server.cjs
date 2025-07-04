const { spawn } = require('child_process');

console.log('🚗 Starting HitchBuddy Production Server...');

// For production deployment, we run the same TypeScript server but with production environment
process.env.NODE_ENV = 'production';

// Start the server using tsx (production mode will handle optimizations)
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  shell: false,
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: process.env.PORT || '10000'
  }
});

server.on('error', (err) => {
  console.error('Failed to start production server:', err);
  process.exit(1);
});

server.on('close', (code) => {
  if (code !== 0) {
    console.log(`Production server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down production server...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down production server...');
  server.kill('SIGTERM');
  process.exit(0);
});