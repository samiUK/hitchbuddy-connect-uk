const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/public')));

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'minimal server running', app: 'HitchBuddy' });
});

// API endpoint
app.get('/api/auth/me', (req, res) => {
  res.json({ error: 'Not authenticated' });
});

// Serve your React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`HitchBuddy server running on port ${PORT}`);
  console.log('Serving React app without Vite build step');
});
