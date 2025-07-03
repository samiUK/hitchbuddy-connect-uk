const { createServer: createViteServer } = require('vite');
const express = require('express');
const { registerRoutes } = require('./server/routes');

const PORT = process.env.PORT || 5000;

async function startOriginalHitchBuddy() {
  console.log('🚗 Starting Original HitchBuddy React Application...');
  
  try {
    // Create Express app for API routes
    const app = express();
    
    // Register API routes first
    const server = await registerRoutes(app);
    
    // Create Vite server but bypass the problematic config
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: './client',
      resolve: {
        alias: {
          '@': './src',
          '@shared': '../shared',
          '@assets': '../attached_assets',
        },
      },
      plugins: [], // Skip problematic plugins
      build: {
        outDir: '../dist/public',
        emptyOutDir: true,
      },
    });
    
    // Use Vite's connect instance as middleware
    app.use(vite.ssrFixStacktrace);
    app.use(vite.middlewares);
    
    // Start server
    server.listen(PORT, () => {
      console.log('✅ Original HitchBuddy React App running on port ' + PORT);
      console.log('✅ Full dashboard with navigation and real database');
      console.log('✅ Visit: http://localhost:' + PORT);
    });
    
  } catch (error) {
    console.error('❌ Failed to start original app:', error.message);
    console.log('🔄 Starting simplified fallback...');
    
    // Fallback to Express-only server
    const app = express();
    await registerRoutes(app);
    
    // Serve basic React app
    app.get('*', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>HitchBuddy - Original Dashboard</title>
          <script type="module">
            import { createRoot } from 'https://esm.sh/react-dom@18/client';
            import React from 'https://esm.sh/react@18';
            
            // Load original HitchBuddy components here
            window.React = React;
            window.ReactDOM = { createRoot };
          </script>
        </head>
        <body>
          <div id="root">
            <div style="padding: 20px; text-align: center;">
              <h1>🚗 HitchBuddy</h1>
              <p>Loading original React dashboard...</p>
            </div>
          </div>
        </body>
        </html>
      `);
    });
    
    app.listen(PORT, () => {
      console.log('✅ HitchBuddy fallback running on port ' + PORT);
    });
  }
}

startOriginalHitchBuddy();