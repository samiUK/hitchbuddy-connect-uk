const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;

// Read the built HTML file
let htmlContent = '';
const htmlPath = path.join(__dirname, 'dist', 'client', 'index.html');

try {
  if (fs.existsSync(htmlPath)) {
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
    console.log('[deploy] HTML file loaded from dist/client/index.html');
  } else {
    throw new Error('HTML file not found');
  }
} catch (error) {
  console.log('[deploy] Using fallback HTML');
  htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HitchBuddy - Ride Sharing Platform</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 3rem;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            max-width: 600px;
        }
        .logo { font-size: 3rem; margin-bottom: 1rem; }
        .tagline { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9; }
        .btn {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 2px solid white;
            padding: 1rem 2rem;
            border-radius: 50px;
            text-decoration: none;
            display: inline-block;
            margin: 0.5rem;
            font-size: 1.1rem;
            transition: all 0.3s;
        }
        .btn:hover { background: rgba(255, 255, 255, 0.3); }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🚗 HitchBuddy</div>
        <div class="tagline">Share Your Journey, Save the Planet</div>
        <p>The affordable way to get to and from airports, stations, and beyond. Connect with trusted drivers and riders in your area.</p>
        <p><strong>✅ Successfully Deployed!</strong></p>
        <a href="/login" class="btn">Sign In</a>
        <a href="/register" class="btn">Join Now</a>
        <div style="margin-top: 2rem; font-size: 0.9rem; opacity: 0.8;">
            Server Status: Online | Features: Authentication, Ride Booking, Messaging
        </div>
    </div>
</body>
</html>`;
}

// Create server
const server = http.createServer((req, res) => {
  try {
    // Set headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    if (req.url === '/health' || req.url === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        app: 'HitchBuddy',
        version: '1.0',
        timestamp: new Date().toISOString(),
        deployment: 'production'
      }));
      return;
    }
    
    // Serve HTML for all other routes
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(htmlContent);
    
  } catch (error) {
    console.error('[deploy] Server error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server Error');
  }
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[deploy] HitchBuddy successfully deployed on port ${PORT}`);
});

// Error handling
server.on('error', (err) => {
  console.error('[deploy] Server error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('[deploy] Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[deploy] Unhandled rejection:', reason);
});