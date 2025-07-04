import express from "express";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import * as esbuild from "esbuild";
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
  
  // Development mode: Use Vite for proper React TypeScript support
  console.log('[development] Setting up TypeScript React application');
  
  const { setupVite } = await import("./vite.js");
  await setupVite(app, server);
  await registerRoutes(app);
  
  // Start the scheduler after server setup
  try {
    const { rideScheduler } = await import("./scheduler.js");
    rideScheduler.start();
    console.log('[scheduler] Started ride cancellation scheduler');
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