const { spawn } = require('child_process');
const path = require('path');

console.log('🚗 Starting Original HitchBuddy TypeScript Application ONLY...');
console.log('✅ No fallback servers, no mockups - only your original dashboard');

// Start the original TypeScript server directly without fallbacks
const startOriginalServer = () => {
  console.log('🔧 Loading your original server/index.ts...');
  
  const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: { 
      ...process.env,
      NODE_ENV: 'development',
      PORT: process.env.PORT || 5000,
      // Ensure database connection
      DATABASE_URL: process.env.DATABASE_URL
    },
    cwd: process.cwd()
  });

  serverProcess.on('error', (err) => {
    console.error('❌ Original server failed to start:', err.message);
    console.log('❌ No fallback - fix the original server configuration');
    process.exit(1);
  });

  serverProcess.on('close', (code) => {
    if (code !== 0) {
      console.log(`❌ Original server exited with code ${code}`);
      console.log('❌ No fallback - your original server needs to be fixed');
      process.exit(1);
    }
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('🛑 Shutting down original server...');
    serverProcess.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('🛑 Terminating original server...');
    serverProcess.kill('SIGTERM');
    process.exit(0);
  });
};

startOriginalServer();