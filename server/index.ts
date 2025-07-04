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
  if (process.env.NODE_ENV === "production") {
    // Production: Skip Vite, just serve static files
    console.log('[production] Production mode - serving static files only');
    const { serveStatic } = await import("./vite.js");
    serveStatic(app);
    await registerRoutes(app);
    return;
  }
  
  // Development mode: Setup Vite and API routes
  console.log('[development] Full stack mode with Vite');
  await setupVite(app, server);
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