import express from "express";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes.js";
import { setupVite } from "./vite.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const server = createServer(app);

async function startServer() {
  await registerRoutes(app);
  
  if (process.env.NODE_ENV === "production") {
    // Serve static files in production
    const { serveStatic } = await import("./vite.js");
    serveStatic(app);
  } else {
    // Set up Vite dev server for development
    await setupVite(app, server);
  }

  const PORT = 5000;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[express] serving on port ${PORT}`);
  });
}

startServer();