// Render.com entry point - runs deploy-server.js
import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('[render] Starting HitchBuddy from api/index.js');
console.log('[render] Current directory:', process.cwd());

// Change to project root directory
const projectRoot = resolve(__dirname, '..');
process.chdir(projectRoot);

console.log('[render] Changed to project root:', process.cwd());

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || 10000;

console.log('[render] Starting production-server.js');

// Start our production server with Express
const serverProcess = spawn('node', ['production-server.js'], {
  stdio: 'inherit',
  cwd: projectRoot,
  env: process.env
});

serverProcess.on('close', (code) => {
  console.log('[render] Server exited with code:', code);
  process.exit(code);
});

serverProcess.on('error', (err) => {
  console.error('[render] Server error:', err);
  process.exit(1);
});