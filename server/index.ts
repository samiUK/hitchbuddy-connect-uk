// Force deployment to use optimized production server
console.log('Redirecting to production-server.js for all environments');
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const productionServer = join(__dirname, '..', 'production-server.js');

console.log(`Starting production server: ${productionServer}`);

const server = spawn('node', [productionServer], {
  env: { ...process.env, NODE_ENV: 'production', PORT: process.env.PORT || '5000' },
  stdio: 'inherit'
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, stopping production server');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, stopping production server');
  server.kill('SIGINT');
});

server.on('exit', (code) => {
  console.log(`Production server exited with code ${code}`);
  process.exit(code || 0);
});

server.on('error', (err) => {
  console.error('Production server error:', err);
  process.exit(1);
});

console.log('Production server redirect initialized');