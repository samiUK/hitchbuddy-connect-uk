const express = require('express');
const path = require('path');
const { createServer } = require('http');

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from client directory
app.use(express.static(path.join(process.cwd(), 'client')));
app.use('/src', express.static(path.join(process.cwd(), 'client/src')));

// Import and setup routes
async function setupRoutes() {
  try {
    const { registerRoutes } = await import('./server/routes.js');
    await registerRoutes(app);
    console.log('✅ API routes registered');
  } catch (error) {
    console.error('❌ Failed to load routes:', error);
  }
}

// Start scheduler
async function startScheduler() {
  try {
    const { rideScheduler } = await import('./server/scheduler.js');
    rideScheduler.start();
    console.log('✅ Ride scheduler started');
  } catch (error) {
    console.error('❌ Failed to start scheduler:', error);
  }
}

// Serve React app for all non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  
  const indexPath = path.join(process.cwd(), 'client', 'index.html');
  res.sendFile(indexPath);
});

// Start server
server.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚗 HitchBuddy server running on port ${PORT}`);
  await setupRoutes();
  await startScheduler();
  console.log('✅ HitchBuddy fully operational');
});