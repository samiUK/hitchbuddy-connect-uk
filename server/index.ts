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
  
  // Initialize routes after port binding
  await registerRoutes(app);
  
  if (process.env.NODE_ENV === "production") {
    // Serve static files in production
    const { serveStatic } = await import("./vite.js");
    serveStatic(app);
  } else {
    // Set up Vite dev server for development
    await setupVite(app, server);
  }
  
  // Start scheduler AFTER server is listening - dynamic import to prevent startup delays
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