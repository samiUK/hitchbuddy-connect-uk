const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚗 Starting HitchBuddy Production Server...');

// Set up permissions and basic structure without causing crash loops
try {
  // Ensure build script has execute permissions
  console.log('🔧 Setting build script permissions...');
  execSync('chmod +x build-client.sh', { cwd: __dirname, stdio: 'pipe' });
  
  // Check if we need to create src directory (avoid repeated reorganization)
  const srcExists = fs.existsSync(path.join(__dirname, 'src'));
  if (!srcExists) {
    console.log('📁 Creating src directory structure...');
    execSync('./build-client.sh', { 
      cwd: __dirname, 
      stdio: 'inherit',
      encoding: 'utf-8'
    });
    console.log('✅ File structure created successfully');
  } else {
    console.log('✅ File structure already exists - skipping build step');
  }
} catch (error) {
  console.log('⚠️  Build step failed, continuing with existing structure:', error.message);
  // Continue rather than exit - don't crash the deployment
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

// Use the environment port or default to 10000 for Render
const deploymentPort = process.env.PORT || '10000';
console.log(`🌐 Using port: ${deploymentPort}`);

const server = spawn('node', ['dev-server.cjs'], {
  stdio: 'inherit',
  shell: false,
  env: {
    ...process.env,
    NODE_ENV: 'development',
    FORCE_DEV_MODE: 'true',
    SERVER_DIRNAME: __dirname,
    PORT: deploymentPort,
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
      PORT: deploymentPort,
      IS_PRODUCTION_DEPLOYMENT: 'true'
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