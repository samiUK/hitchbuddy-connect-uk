const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚗 Starting HitchBuddy Production Server...');

// Check if we need to reorganize file structure for deployment
const srcExists = fs.existsSync(path.join(__dirname, 'src'));
if (!srcExists) {
  console.log('📁 Reorganizing file structure for deployment...');
  try {
    // Run the build script synchronously before starting the server
    execSync('./build-client.sh', { 
      cwd: __dirname, 
      stdio: 'inherit',
      encoding: 'utf-8'
    });
    console.log('✅ File structure reorganized successfully');
  } catch (error) {
    console.error('❌ Failed to reorganize file structure:', error.message);
    process.exit(1);
  }
}

// Force development mode to ensure Vite processes TypeScript modules
process.env.NODE_ENV = 'development';
process.env.FORCE_DEV_MODE = 'true';
process.env.SERVER_DIRNAME = __dirname;

// Load and activate production polyfill
const { setupPolyfill } = require('./server/polyfill.js');
setupPolyfill();

// Start the development server directly (same as dev-server.cjs)
console.log('Starting HitchBuddy development server...');

const server = spawn('node', ['dev-server.cjs'], {
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