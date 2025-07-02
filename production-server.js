import express from "express";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const PORT = parseInt(process.env.PORT || '10000', 10);

// Start server immediately
const server = createServer(app);
server.listen(PORT, "0.0.0.0", () => {
  console.log(`[express] HitchBuddy serving on port ${PORT}`);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'HitchBuddy' });
});

// Load full backend if available
async function loadBackend() {
  try {
    const { registerRoutes } = await import('./server/routes.js');
    await registerRoutes(app);
    console.log('[server] Full API routes loaded');
    
    const { rideScheduler } = await import('./server/scheduler.js');
    rideScheduler.start();
    console.log('[scheduler] Started');
  } catch (error) {
    console.log('[server] Using basic fallbacks');
    app.get('/api/*', (req, res) => res.status(503).json({ error: 'Service starting' }));
  }
}

// Setup React app serving
const staticPaths = [
  join(__dirname, 'dist/public'),
  join(__dirname, 'dist'),
  join(__dirname, 'public')
];

let staticPath = null;
for (const path of staticPaths) {
  if (existsSync(path) && existsSync(join(path, 'index.html'))) {
    staticPath = path;
    break;
  }
}

if (staticPath) {
  console.log(`[static] Serving React from: ${staticPath}`);
  app.use(express.static(staticPath));
  app.get('*', (req, res) => {
    res.sendFile(join(staticPath, 'index.html'));
  });
} else {
  // Clean fallback without debug info
  app.get('*', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>HitchBuddy</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              background: linear-gradient(135deg, #3b82f6, #10b981);
              min-height: 100vh; 
              margin: 0; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
            }
            .container { 
              background: white; 
              padding: 2rem; 
              border-radius: 1rem; 
              text-align: center; 
              max-width: 400px; 
              box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
            .logo { 
              font-size: 2.5rem; 
              color: #3b82f6; 
              margin-bottom: 1rem; 
              font-weight: bold; 
            }
            h1 { 
              font-size: 1.8rem; 
              margin-bottom: 1rem; 
              color: #1f2937; 
            }
            p { 
              color: #6b7280; 
              margin-bottom: 2rem; 
            }
            .status { 
              background: #10b981; 
              color: white; 
              padding: 0.5rem 1rem; 
              border-radius: 0.5rem; 
              display: inline-block; 
              margin-bottom: 1rem; 
            }
            .loader { 
              border: 3px solid #f3f4f6; 
              border-top: 3px solid #3b82f6; 
              border-radius: 50%; 
              width: 30px; 
              height: 30px; 
              animation: spin 1s linear infinite; 
              margin: 1rem auto; 
            }
            @keyframes spin { 
              0% { transform: rotate(0deg); } 
              100% { transform: rotate(360deg); } 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🚗 HitchBuddy</div>
            <h1>Share Your Journey, Save the Planet</h1>
            <p>The affordable way to get to and from airports, stations, and beyond.</p>
            <div class="status">Server Online</div>
            <div class="loader"></div>
            <p>Loading your ride-sharing experience...</p>
            <script>
              setTimeout(() => location.reload(), 5000);
            </script>
          </div>
        </body>
      </html>
    `);
  });
}

// Initialize
loadBackend();

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});