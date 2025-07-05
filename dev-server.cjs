const { spawn } = require('child_process');

console.log('🚗 Starting HitchBuddy Development Server...');

// Load global import.meta patch before starting server
require('./patch-import-meta.cjs');

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
    // Set Node.js options to require our polyfill before any ES modules
    NODE_OPTIONS: '--require ./patch-import-meta.cjs'
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