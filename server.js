const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

console.log('🚀 Starting Simple HitchBuddy Server...');

// Basic middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist', 'public')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API fallback
app.get('/api/*', (req, res) => {
  res.status(503).json({ error: 'API temporarily unavailable' });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Server running on port ${PORT}`);
});