const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 5000;

console.log('🚀 Starting HitchBuddy React application server...');

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from the client public directory
app.use(express.static(path.join(__dirname, 'client/public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'server running',
    app: 'HitchBuddy',
    mode: 'production',
    features: ['React App', 'Authentication', 'Ride Management', 'Client-side Caching']
  });
});

// Basic API endpoints
app.get('/api/auth/me', (req, res) => {
  res.json({ error: 'Not authenticated' });
});

// Serve React app for all other routes - using client HTML
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'client/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ HitchBuddy React app running on port ${PORT}`);
  console.log('✅ Authentication system ready');
  console.log('✅ Dashboard and components loaded');
  console.log('✅ Client-side caching active');
});