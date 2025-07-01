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
  
  // For production: Setup routes BEFORE binding to eliminate async delays
  if (process.env.NODE_ENV === "production") {
    console.log('[production] Scheduler disabled to prevent deployment race condition');
    await registerRoutes(app);
    const { serveStatic } = await import("./vite.js");
    serveStatic(app);
  } else {
    // Development setup
    await registerRoutes(app);
    await setupVite(app, server);
  }
  
  // CRITICAL: Bind to port AFTER all setup is complete - no async delays
  await new Promise<void>((resolve) => {
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`[express] serving on port ${PORT}`);
      resolve();
    });
  });
  
  // Start scheduler ONLY in development
  if (process.env.NODE_ENV !== "production") {
    try {
      const { rideScheduler } = await import("./scheduler.js");
      scheduler = rideScheduler;
      scheduler.start();
    } catch (error) {
      console.error('[scheduler] Failed to start:', error);
    }
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