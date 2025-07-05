// Fix import.meta.dirname before any other imports
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from "path";
import express from "express";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import fs from "fs";
import * as esbuild from "esbuild";
import { registerRoutes } from "./routes.js";
import { setupVite } from "./vite.js";
import { 
  applyMemoryOptimizations, 
  applyRequestOptimizations, 
  applyCompressionOptimizations,
  setupHealthCheck,
  setupGracefulShutdown,
  renderFreeConfig 
} from "./optimization.js";
// Scheduler imported dynamically after server startup
let scheduler: any = null;

const app = express();

// Apply Render free tier optimizations and health check
if (process.env.NODE_ENV === 'production' || process.env.IS_PRODUCTION_DEPLOYMENT === 'true') {
  console.log('[optimization] Applying Render free tier optimizations...');
  applyMemoryOptimizations(app);
  applyRequestOptimizations(app, renderFreeConfig);
  applyCompressionOptimizations(app);
  setupHealthCheck(app);
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const server = createServer(app);

// Server will be started by startServer() function

async function startServer() {
  // Smart port detection for different platforms
  let PORT;
  if (process.env.IS_PRODUCTION_DEPLOYMENT === 'true') {
    // Cloud Run/Render deployment - use environment port or 80
    PORT = parseInt(process.env.PORT || '80', 10);
  } else {
    // Replit development - use 5000
    PORT = parseInt(process.env.PORT || '5000', 10);
  }
  
  console.log(`[port] Platform: ${process.env.IS_PRODUCTION_DEPLOYMENT === 'true' ? 'Cloud Run/Render' : 'Replit'}, Port: ${PORT}`);
  
  // Fix import.meta.dirname compatibility for production
  if (typeof globalThis.__dirname === 'undefined') {
    globalThis.__dirname = process.env.SERVER_DIRNAME || import.meta.dirname || process.cwd();
  }
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
  
  if (process.env.NODE_ENV === "production" && !process.env.FORCE_DEV_MODE) {
    // Production: Serve built React app directly
    console.log('[production] Production mode - serving optimized React application');
    
    // Serve static files from client directory
    app.use(express.static(path.join(process.cwd(), "client", "public")));
    
    // Register API routes first
    await registerRoutes(app);
    
    // Serve the React app for all routes (after API routes)
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      
      const indexPath = path.join(process.cwd(), "client", "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Application not found");
      }
    });
    
    // Start the server in production mode
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`[production] HitchBuddy serving on port ${PORT}`);
    });
    
    // Apply graceful shutdown
    setupGracefulShutdown(server);
    
    // Start the scheduler
    try {
      const { rideScheduler } = await import("./scheduler.js");
      rideScheduler.start();
      console.log('[scheduler] Started ride cancellation scheduler');
      scheduler = rideScheduler;
    } catch (error) {
      console.error('[scheduler] Failed to start scheduler:', error);
    }
    
    return;
  }
  
  // Development mode: Use Vite for proper React TypeScript support
  console.log('[development] Setting up TypeScript React application');
  
  // Register API routes directly before Vite middleware
  await registerRoutes(app);
  
  const { setupVite } = await import("./vite.js");
  await setupVite(app, server);
  
  // Start the server
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[express] serving on port ${PORT}`);
  });
  
  // Apply graceful shutdown for production
  if (process.env.NODE_ENV === 'production') {
    setupGracefulShutdown(server);
  }
  
  // Start the scheduler after server setup
  try {
    const { rideScheduler } = await import("./scheduler.js");
    rideScheduler.start();
    console.log('[scheduler] Started ride cancellation scheduler');
    scheduler = rideScheduler; // Store for graceful shutdown
  } catch (error) {
    console.error('[scheduler] Failed to start:', error);
  }
  
  return;
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