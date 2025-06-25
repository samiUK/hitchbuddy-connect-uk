// Quick verification that the bundled server starts immediately
const { spawn } = require('child_process');

console.log('Testing deployment server startup speed...');
const start = Date.now();

const server = spawn('node', ['dist/index.js'], {
  env: { ...process.env, NODE_ENV: 'production', PORT: '3008' },
  stdio: 'pipe'
});

let serverReady = false;

server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('SERVER:', output.trim());
  
  if (output.includes('Server ready')) {
    const elapsed = Date.now() - start;
    console.log(`✅ Server ready in ${elapsed}ms`);
    serverReady = true;
    server.kill();
  }
});

server.stderr.on('data', (data) => {
  console.log('ERROR:', data.toString().trim());
});

setTimeout(() => {
  if (!serverReady) {
    console.log('❌ Server failed to start within 3 seconds');
    server.kill();
  }
}, 3000);