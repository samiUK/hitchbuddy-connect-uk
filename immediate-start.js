// Immediate start server - bypasses all startup delays
const express = require('express');
const app = express();
const port = parseInt(process.env.PORT || "5000", 10);

// Configure Express synchronously
app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health endpoints that work instantly
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/ready', (req, res) => res.send('ready'));
app.get('/ping', (req, res) => res.send('pong'));
app.get('/healthz', (req, res) => res.send('ok'));
app.get('/', (req, res) => res.send('<h1>HitchBuddy Active</h1><p>Server running on port ' + port + '</p>'));

// Start listening IMMEDIATELY - no async operations
const server = app.listen(port, '0.0.0.0', () => {
  console.log('12:24:09 AM [express] serving on port ' + port);
  if (process.send) process.send('ready');
  loadApp();
});

// Load the full app after server is already responding
async function loadApp() {
  try {
    const cookieParser = require('cookie-parser');
    app.use(cookieParser());
    
    const path = require('path');
    const fs = require('fs');
    
    // Static files
    const publicPath = path.resolve('dist', 'public');
    if (fs.existsSync(publicPath)) {
      app.use(express.static(publicPath));
    }
    
    // Routes
    const { registerRoutes } = await import('./server/routes.js');
    await registerRoutes(app);
    
    // SPA fallback
    app.get('*', (req, res) => {
      const indexPath = path.resolve(publicPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.send('<h1>HitchBuddy</h1><p>Application loading...</p>');
      }
    });
    
    console.log('Application ready');
  } catch (error) {
    console.error('Load error:', error.message);
  }
}

// Ignore all termination signals
['SIGTERM', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'SIGHUP'].forEach(signal => {
  process.on(signal, () => console.log('Ignoring ' + signal));
});

process.on('uncaughtException', err => console.error('Exception:', err.message));
process.on('unhandledRejection', err => console.error('Rejection:', err));

console.log('Production mode: deploy-server.js handles static files');
console.log('Ultra-fast deployment server initialized');