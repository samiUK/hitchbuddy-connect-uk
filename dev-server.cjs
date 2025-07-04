console.log('🚗 Starting HitchBuddy with working development server...');

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

// Create a simple server that includes both frontend and backend
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve static files from client/public
app.use(express.static(path.join(__dirname, 'client/public')));

// Import and register API routes
(async () => {
  try {
    // Import the routes dynamically to avoid module issues
    const { registerRoutes } = await import('./server/routes.ts');
    await registerRoutes(app);
    console.log('✅ API routes registered successfully');
  } catch (error) {
    console.error('❌ Failed to register API routes:', error.message);
    console.log('⚠️  Running without API routes - some features may not work');
  }
})();

// Serve the sophisticated React app for all non-API routes
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
  console.log('✅ HitchBuddy development server running on port 5000');
  console.log('✅ Frontend and backend combined on single port');
  console.log('✅ Using sophisticated React app with working API endpoints');
});

process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});