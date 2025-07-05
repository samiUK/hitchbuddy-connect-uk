const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚗 Starting HitchBuddy Production Server...');

// CRITICAL: Ensure build script runs and has permissions
console.log('🔧 Setting up deployment environment...');
try {
  // Step 1: Force set permissions on build script
  console.log('🔧 Setting build script permissions...');
  execSync('chmod +x build-client.sh', { cwd: __dirname, stdio: 'pipe' });
  
  // Step 2: Always run the build script to ensure file structure is correct
  console.log('📦 Running build script to set up file structure...');
  execSync('./build-client.sh', { 
    cwd: __dirname, 
    stdio: 'inherit',
    encoding: 'utf-8'
  });
  console.log('✅ Build script executed successfully');
  
  // Step 3: Verify the file structure was created
  const srcExists = fs.existsSync(path.join(__dirname, 'src'));
  if (srcExists) {
    console.log('✅ File structure verified - src directory exists');
  } else {
    console.log('⚠️  Warning: src directory not created, this may cause Vite resolution issues');
  }
  
} catch (error) {
  console.error('❌ CRITICAL: Build script failed to execute:', error.message);
  console.log('🔄 Attempting manual file structure setup...');
  
  // Fallback: Try to create basic structure manually
  try {
    const srcPath = path.join(__dirname, 'src');
    const clientSrcPath = path.join(__dirname, 'client', 'src');
    
    if (fs.existsSync(clientSrcPath) && !fs.existsSync(srcPath)) {
      console.log('📁 Creating src directory manually...');
      fs.mkdirSync(srcPath, { recursive: true });
      
      // Copy files manually
      const { spawn } = require('child_process');
      execSync(`cp -r ${clientSrcPath}/* ${srcPath}/`, { stdio: 'inherit' });
      console.log('✅ Manual file structure setup completed');
    }
  } catch (fallbackError) {
    console.error('❌ Manual setup also failed:', fallbackError.message);
    console.log('⚠️  Proceeding with existing structure - expect potential issues');
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