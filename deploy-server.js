import express from "express";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./server/routes.js";
import { serveStatic } from "./server/vite.js";

// Scheduler imported dynamically after server startup
let scheduler = null;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const server = createServer(app);
const PORT = parseInt(process.env.PORT || '10000', 10);

// CRITICAL: Bind to port IMMEDIATELY to prevent connection refused
server.listen(PORT, "0.0.0.0", () => {
  console.log(`[express] serving on port ${PORT}`);
});

async function startServer() {
  // Production mode: Serve static files and register all API routes
  console.log('[production] Production mode - serving static files with full API');
  serveStatic(app);
  await registerRoutes(app);
  
  // Start scheduler in production to handle ride cancellations
  try {
    const { rideScheduler } = await import("./server/scheduler.js");
    scheduler = rideScheduler;
    scheduler.start();
    console.log('[scheduler] Started ride cancellation scheduler');
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
  console.log('\n[express] SIGTERM received, shutting down gracefully...');
  if (scheduler) scheduler.stop();
  server.close(() => {
    console.log('[express] Process terminated');
    process.exit(0);
  });
});

// Start the server
startServer().catch(error => {
  console.error('[express] Failed to start server:', error);
  process.exit(1);
});