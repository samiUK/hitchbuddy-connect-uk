const { spawn } = require('child_process');
const path = require('path');

console.log('🚗 Starting Original HitchBuddy with TypeScript server...');

// Start the TypeScript server directly
const tsxProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

tsxProcess.on('error', (error) => {
  console.error('❌ Failed to start TypeScript server:', error.message);
  process.exit(1);
});

tsxProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ TypeScript server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down HitchBuddy server...');
  tsxProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down HitchBuddy server...');
  tsxProcess.kill('SIGTERM');
});