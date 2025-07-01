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

// CRITICAL: Bind to port IMMEDIATELY to prevent connection refused
server.listen(PORT, "0.0.0.0", () => {
  console.log(`[express] serving on port ${PORT}`);
});

async function startServer() {
  // Setup routes and Vite AFTER server is already listening
  await registerRoutes(app);
  await setupVite(app, server);
  
  // Only difference: disable scheduler in production
  if (process.env.NODE_ENV === "production") {
    console.log('[production] Scheduler disabled to prevent deployment race condition');
  } else {
    // Start scheduler ONLY in development
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