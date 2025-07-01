// Production server with IMMEDIATE port binding - eliminates race condition
const express = require('express');
const { createServer } = require('http');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// CRITICAL: Create server and bind to port IMMEDIATELY
const server = createServer(app);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[express] serving on port ${PORT}`);
  if (process.send) process.send('ready');
});

// Setup middleware AFTER port binding
app.use(express.json());
app.use(express.static('dist'));

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Health check endpoints
app.get(['/health', '/api/health', '/ping'], (req, res) => {
  res.json({
    status: 'healthy',
    service: 'HitchBuddy',
    port: PORT,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  try {
    res.sendFile(indexPath);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Error handling
server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

console.log('HitchBuddy production server initialized - zero startup delay');