// Production server for HitchBuddy - Direct TypeScript execution
const { spawn } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || 5000;

console.log('🚀 Starting HitchBuddy production server...');
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
console.log(`📊 Server will run on port ${PORT}`);

// Start the TypeScript server directly without shell
const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  env: { ...process.env, PORT },
  stdio: 'inherit',
  cwd: __dirname,
  shell: false // Disable shell to avoid deprecation warning
});

serverProcess.on('error', (err) => {
  console.error('Failed to start production server:', err);
  process.exit(1);
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

// Graceful shutdown
function gracefulShutdown() {
  console.log('Shutting down gracefully...');
  serverProcess.kill('SIGTERM');
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);