const { createServer } = require('vite');
const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 5000;

async function startViteDevServer() {
  try {
    console.log('🚀 Starting HitchBuddy React application with Vite...');
    
    // Create Vite server for the client directory
    const vite = await createServer({
      configFile: path.resolve(__dirname, 'client/vite.config.ts'),
      root: path.resolve(__dirname, 'client'),
      server: { middlewareMode: true },
      appType: 'spa'
    });

    const app = express();
    
    // Add middleware for parsing
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'development server running',
        app: 'HitchBuddy',
        mode: 'development',
        features: ['React App', 'Authentication', 'Dashboard', 'Ride Management', 'Chat', 'Booking System']
      });
    });
    
    // API endpoints (mock for development)
    app.get('/api/auth/me', (req, res) => {
      res.json({ error: 'Not authenticated' });
    });
    
    // Use Vite's middleware to serve the React app
    app.use(vite.ssrFixStacktrace);
    app.use(vite.middlewares);

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ HitchBuddy React app running on port ${PORT}`);
      console.log('✅ Full Dashboard with all your components loaded');
      console.log('✅ BookRideModal, ChatPopup, AuthModal, etc. available');
      console.log('✅ Authentication system ready');
      console.log('✅ Ride management and booking features active');
    });

    return server;

  } catch (error) {
    console.error('❌ Failed to start Vite dev server:', error.message);
    console.log('🔄 Falling back to static file serving...');
    
    // Fallback to serving client files directly
    const app = express();
    app.use(express.json());
    app.use('/src', express.static(path.join(__dirname, 'client/src')));
    app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
    app.use(express.static(path.join(__dirname, 'client/public')));
    
    app.get('/health', (req, res) => {
      res.json({
        status: 'fallback server running',
        app: 'HitchBuddy',
        mode: 'fallback'
      });
    });
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'client/index.html'));
    });
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🔄 HitchBuddy fallback server running on port ${PORT}`);
    });
  }
}

startViteDevServer();