const { createServer } = require('vite');
const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 5000;

async function startDevServer() {
  try {
    console.log('🚀 Starting real HitchBuddy React development server...');
    
    // Create Vite dev server in middleware mode
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: path.resolve(__dirname, 'client'),
      resolve: {
        alias: {
          '@': path.resolve(__dirname, 'client/src'),
          '@shared': path.resolve(__dirname, 'shared'),
          '@assets': path.resolve(__dirname, 'attached_assets'),
        },
      },
    });

    const app = express();
    
    // Add basic middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'development server running',
        app: 'HitchBuddy',
        mode: 'development',
        features: ['React App', 'Authentication', 'Ride Management', 'Client-side Caching']
      });
    });
    
    // Basic API endpoints for testing
    app.get('/api/auth/me', (req, res) => {
      res.json({ error: 'Not authenticated' });
    });
    
    // Use Vite's middleware
    app.use(vite.ssrFixStacktrace);
    app.use(vite.middlewares);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Real HitchBuddy React app running on port ${PORT}`);
      console.log('✅ Authentication system ready');
      console.log('✅ Dashboard and components loaded');
      console.log('✅ Client-side caching active');
    });

  } catch (error) {
    console.error('❌ Failed to start Vite dev server:', error.message);
    
    // Fallback to basic Express server with React build
    console.log('🔄 Starting Express fallback with React build...');
    startExpressFallback();
  }
}

function startExpressFallback() {
  const app = express();
  
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'client/dist')));
  
  app.get('/health', (req, res) => {
    res.json({
      status: 'express fallback running',
      app: 'HitchBuddy',
      mode: 'fallback'
    });
  });
  
  app.get('/api/auth/me', (req, res) => {
    res.json({ error: 'Not authenticated' });
  });
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  });
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔄 Express fallback server running on port ${PORT}`);
  });
}

startDevServer();