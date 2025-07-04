// Production server for HitchBuddy - Use your actual development server
const { spawn } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || 5000;

console.log('🚀 Starting HitchBuddy production server...');
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
console.log(`📊 Server will run on port ${PORT}`);

// Start the actual development server for production
const serverProcess = spawn('node', ['dev-server.cjs'], {
  env: { ...process.env, PORT },
  stdio: 'inherit',
  cwd: __dirname
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