const { spawn } = require('child_process');

console.log('🚗 Starting HitchBuddy Development Server...');

// Note: import.meta polyfill now handled by server/polyfill.js

// Load and activate production polyfill to fix import.meta.dirname issues
try {
  const { setupPolyfill } = require('./server/polyfill.js');
  setupPolyfill();
} catch (err) {
  console.log('Note: Polyfill not needed in development:', err.message);
}

// Start the development server using tsx with Node.js loader
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  shell: false,
  env: {
    ...process.env,
    NODE_ENV: 'development',
    FORCE_DEV_MODE: 'true',
    IS_PRODUCTION_DEPLOYMENT: 'true', // Mark as production deployment
    PORT: process.env.PORT || '5000'   // Ensure Replit uses port 5000
  }
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

server.on('close', (code) => {
  if (code !== 0) {
    console.log(`Server exited with code ${code}`);
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.kill('SIGTERM');
  process.exit(0);
});