const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');

const PORT = process.env.PORT || 8080;

// Simple development server that works when tsx is broken
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'development server running', app: 'HitchBuddy' }));
    return;
  }

  // Development notice
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head><title>HitchBuddy Development</title></head>
      <body style="font-family: Arial; padding: 40px; background: #f5f5f5;">
        <h1>🚧 HitchBuddy Development Server</h1>
        <p>Development environment is temporarily using fallback server due to tsx dependency issues.</p>
        <p><strong>Status:</strong> Development mode ready</p>
        <p><strong>Production deployment:</strong> Working with deploy-server.cjs</p>
        <p><strong>React application:</strong> Available in client/ directory</p>
        <a href="/health">Health Check</a>
      </body>
    </html>
  `);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Dev] Development server running on port ${PORT}`);
  console.log('[Dev] tsx dependency issue detected - using fallback server');
  console.log('[Dev] Production deployment ready with deploy-server.cjs');
});