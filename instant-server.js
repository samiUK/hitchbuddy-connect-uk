// Ultra-fast production server for Replit deployment
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;

const app = express();

// Immediate middleware
app.use(express.json());
app.use(express.static('dist/client'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.resolve('dist/client/index.html'));
});

// Bind immediately - zero async delays
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[instant] Server ready on port ${PORT}`);
});