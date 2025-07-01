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

async function startServer() {
  const PORT = parseInt(process.env.PORT || '5000', 10);
  
  // CRITICAL: Bind to port FIRST to prevent connection refused
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[express] serving on port ${PORT}`);
  });
  
  // For production deployment, register routes but skip scheduler to prevent race conditions
  if (process.env.NODE_ENV === "production") {
    // Production setup - register routes but NO scheduler
    await registerRoutes(app);
    const { serveStatic } = await import("./vite.js");
    serveStatic(app);
    
    // Skip scheduler in production deployment to eliminate race condition
    console.log('[production] Scheduler disabled to prevent deployment race condition');
    return;
  }
  
  // Full initialization for development
  await registerRoutes(app);
  await setupVite(app, server);
  
  // Start scheduler AFTER server is listening - development only
  try {
    const { rideScheduler } = await import("./scheduler.js");
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