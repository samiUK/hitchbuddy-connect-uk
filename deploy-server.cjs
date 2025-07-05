const { spawn } = require('child_process');

console.log('🚀 Starting HitchBuddy Production Server...');

// Load and activate production polyfill to fix import.meta.dirname issues
try {
  const { setupPolyfill } = require('./server/polyfill.js');
  setupPolyfill();
} catch (err) {
  console.log('Note: Polyfill not needed in production:', err.message);
}

// Start the production server using tsx with Node.js loader
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  shell: false,
  cwd: __dirname,
  env: {
    ...process.env,
    NODE_ENV: 'development',  // Use development mode for Vite processing
    FORCE_DEV_MODE: 'true',   // Force dev mode to enable Vite TypeScript compilation
    IS_PRODUCTION_DEPLOYMENT: 'true',
    PORT: process.env.PORT || '10000'
  }
});

server.on('error', (err) => {
  console.error('Failed to start production server:', err);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`Production server process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  server.kill('SIGINT');
});