const express = require('express');
const { createServer } = require('vite');
const path = require('path');

async function startServer() {
  const app = express();
  
  console.log('🚗 Starting Original HitchBuddy TypeScript Application...');
  
  try {
    // Create Vite server with proper configuration
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
      optimizeDeps: {
        include: ['react', 'react-dom', '@tanstack/react-query']
      }
    });
    
    // Use Vite's middleware to serve the original React app
    app.use(vite.ssrFixStacktrace);
    app.use(vite.middlewares);
    
    // Serve the original index.html through Vite
    app.use('*', async (req, res) => {
      try {
        const url = req.originalUrl;
        const template = await vite.transformIndexHtml(url, `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>HitchBuddy - Original Dashboard</title>
            </head>
            <body>
              <div id="root"></div>
              <script type="module" src="/src/main.tsx"></script>
            </body>
          </html>
        `);
        
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (error) {
        console.error('Error serving page:', error);
        res.status(500).end(error.message);
      }
    });
    
    app.listen(5000, () => {
      console.log('✅ Original HitchBuddy React Dashboard running on port 5000');
      console.log('✅ Full TypeScript support with Vite hot reload');
      console.log('✅ All original components: Dashboard, AuthModal, BookRideModal, ChatPopup');
      console.log('✅ Sophisticated shadcn/ui design with Cards, Tabs, Badges');
      console.log('✅ Visit: http://localhost:5000');
    });
    
  } catch (error) {
    console.error('Failed to start Vite server:', error);
    process.exit(1);
  }
}

startServer();