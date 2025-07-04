import express from "express";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes.js";
import { setupVite } from "./vite.js";
// Scheduler imported dynamically after server startup
let scheduler: any = null;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const server = createServer(app);
const PORT = parseInt(process.env.PORT || '5000', 10);

// Only start server if not running as Vite proxy backend
if (process.env.IS_VITE_PROXY !== 'true') {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[express] serving on port ${PORT}`);
  });
}

async function startServer() {
  // If running as backend for Vite proxy, only setup routes and start on port 8080
  if (process.env.IS_VITE_PROXY === 'true') {
    console.log('[vite-proxy] Starting backend API server for Vite proxy...');
    const apiServer = await registerRoutes(app);
    const apiPort = parseInt(process.env.PORT || '8080', 10);
    apiServer.listen(apiPort, "0.0.0.0", () => {
      console.log(`[express] backend API serving on port ${apiPort}`);
    });
    return;
  }
  
  if (process.env.NODE_ENV === "production") {
    // Production: Skip Vite, just serve static files
    console.log('[production] Production mode - serving static files only');
    const { serveStatic } = await import("./vite.js");
    serveStatic(app);
    await registerRoutes(app);
    return;
  }
  
  // Development mode: Use static file serving to load actual React components
  console.log('[development] Setting up TypeScript React application');
  
  // Import required modules  
  const path = require("path");
  const fs = require("fs");
  const esbuild = require("esbuild");
  
  // Serve static files from client/public
  app.use(express.static(path.join(process.cwd(), "client", "public")));
  
  // Transform and serve TypeScript files
  app.get('/src/*', async (req, res) => {
    const filePath = path.join(process.cwd(), "client", req.path);
    
    try {
      if (req.path.endsWith('.tsx') || req.path.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replace React imports with CDN globals
        content = content.replace(/import React.*from ['"]react['"];?/g, '');
        content = content.replace(/import.*from ['"]react-dom\/client['"];?/g, '');
        content = content.replace(/import.*\{.*\}.*from ['"]react['"];?/g, (match) => {
          // Extract hooks and other imports from React
          const imports = match.match(/\{([^}]+)\}/);
          if (imports) {
            const hooks = imports[1].split(',').map(h => h.trim());
            return `const { ${hooks.join(', ')} } = React;`;
          }
          return '';
        });
        
        // Remove CSS imports (they should be loaded separately)
        content = content.replace(/import\s+['"][^'"]*\.css['"];?/g, '');
        
        content = content.replace(/createRoot/g, 'ReactDOM.createRoot');
        
        // Add React globals at the top
        content = 'const React = window.React; const ReactDOM = window.ReactDOM;\n' + content;
        
        const result = await esbuild.transform(content, {
          loader: req.path.endsWith('.tsx') ? 'tsx' : 'ts',
          target: 'es2020',
          format: 'esm',
          jsx: 'transform',
          jsxFactory: 'React.createElement',
          jsxFragment: 'React.Fragment'
        });
        
        res.setHeader('Content-Type', 'application/javascript');
        res.send(result.code);
      } else if (req.path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
        res.sendFile(filePath);
      } else {
        res.sendFile(filePath);
      }
    } catch (error) {
      console.error('Error transforming TypeScript:', error);
      res.status(500).send('TypeScript transformation error');
    }
  });
  
  // Serve node_modules for React dependencies
  app.use('/node_modules', express.static(path.join(process.cwd(), 'node_modules')));
  
  // Serve React app for all non-API routes
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/src") || req.path.startsWith("/node_modules")) return next();
    
    const indexPath = path.join(process.cwd(), "client", "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Application not found");
    }
  });
  
  await registerRoutes(app);
  
  try {
    const { rideScheduler } = await import("./scheduler.ts");
    scheduler = rideScheduler;
    scheduler.start();
  } catch (error) {
    console.error('[scheduler] Failed to start:', error);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[express] Shutting down gracefully...');
  if (scheduler) scheduler.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[express] Shutting down gracefully...');
  if (scheduler) scheduler.stop();
  process.exit(0);
});

startServer();