const express = require('express');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

console.log('🚗 Starting HitchBuddy React Application...');

const app = express();

// Start the backend API server first
const backendProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'pipe',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '3001'
  }
});

backendProcess.stdout.on('data', (data) => {
  console.log(`[backend] ${data.toString().trim()}`);
});

backendProcess.stderr.on('data', (data) => {
  console.error(`[backend] ${data.toString().trim()}`);
});

// Serve the React app with CDN approach
app.use(express.static(path.join(__dirname, 'client/public')));

// API proxy
app.use('/api', (req, res) => {
  const proxyReq = require('http').request({
    hostname: 'localhost',
    port: 3001,
    path: req.originalUrl,
    method: req.method,
    headers: req.headers
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  
  if (req.method === 'POST' || req.method === 'PUT') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
});

// Serve the main HTML file
app.get('*', (req, res) => {
  // Use the React CDN approach with working app.js
  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>HitchBuddy - Share Your Journey, Save the Planet</title>
    <meta name="description" content="Connect with eco-friendly travelers on HitchBuddy. Share rides, reduce costs, and help save the planet with our smart ride-sharing platform." />
    <link rel="icon" href="/favicon.ico" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  </head>
  <body>
    <div id="root">
      <noscript>You need to enable JavaScript to run this app.</noscript>
    </div>
    <script src="/app-sophisticated.js"></script>
  </body>
</html>`;
  
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

app.listen(5000, '0.0.0.0', () => {
  console.log('✅ HitchBuddy React app running on port 5000');
  console.log('✅ Backend API server on port 3001');
  console.log('✅ Using React CDN with working app.js');
});

console.log('✅ Starting backend API server on port 3001...');