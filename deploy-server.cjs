const { spawn } = require('child_process');

console.log('🚗 Starting HitchBuddy Production Server...');

// Force development mode to ensure Vite processes TypeScript modules
process.env.NODE_ENV = 'development';
process.env.FORCE_DEV_MODE = 'true';
process.env.SERVER_DIRNAME = __dirname;

// Load and activate production polyfill
const { setupPolyfill } = require('./server/polyfill.js');
setupPolyfill();

// Start the TypeScript server
console.log('Starting TypeScript server with tsx...');

const server = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  shell: false,
  env: {
    ...process.env,
    NODE_ENV: 'development',
    FORCE_DEV_MODE: 'true',
    SERVER_DIRNAME: __dirname,
    PORT: process.env.PORT || '10000',
    IS_PRODUCTION_DEPLOYMENT: 'true'
  }
});

server.on('error', (err) => {
  console.error('❌ tsx failed to start:', err.message);
  console.log('🔄 Trying ts-node as fallback...');
  
  // Start fallback server
  const fallbackServer = spawn('npx', ['ts-node', 'server/index.ts'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: 'development',
      FORCE_DEV_MODE: 'true',
      SERVER_DIRNAME: __dirname,
      PORT: process.env.PORT || '10000'
    }
  });
  
  fallbackServer.on('error', (fallbackErr) => {
    console.error('❌ Both tsx and ts-node failed:', fallbackErr.message);
    process.exit(1);
  });
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