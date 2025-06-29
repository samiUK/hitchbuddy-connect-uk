import express from "express";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes.js";
import { setupVite } from "./vite.js";
import { rideScheduler } from "./scheduler.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const server = createServer(app);

async function startServer() {
  await registerRoutes(app);
  
  // Start the ride cancellation scheduler
  rideScheduler.start();
  
  if (process.env.NODE_ENV === "production") {
    // Serve static files in production
    const { serveStatic } = await import("./vite.js");
    serveStatic(app);
  } else {
    // Set up Vite dev server for development
    await setupVite(app, server);
  }

  const PORT = parseInt(process.env.PORT || '5000', 10);
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[express] serving on port ${PORT}`);
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[express] Shutting down gracefully...');
  rideScheduler.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[express] Shutting down gracefully...');
  rideScheduler.stop();
  process.exit(0);
});

startServer();