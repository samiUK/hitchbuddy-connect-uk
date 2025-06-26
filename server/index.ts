import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Check if we should use production deployment server
if (process.env.NODE_ENV === 'production') {
  console.log('Production mode detected - switching to optimized deployment server');
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const productionServer = join(__dirname, '..', 'deploy-production.js');
  
  const server = spawn('node', [productionServer], {
    env: { ...process.env },
    stdio: 'inherit'
  });
  
  process.on('SIGTERM', () => server.kill('SIGTERM'));
  process.on('SIGINT', () => server.kill('SIGINT'));
  
  server.on('exit', (code) => process.exit(code || 0));
  
  // Exit early - don't continue with development server
  process.exit(0);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(`${new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit", 
        second: "2-digit",
        hour12: true,
      })} [express] ${logLine}`);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error in development, but don't expose stack traces in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Server error:', err);
    } else {
      console.error('Server error:', message);
    }

    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite.js");
    await setupVite(app, server);
  } else {
    // Production uses fast deployment server (deploy-server.js)
    // Static files served by deploy-server.js directly
    console.log("Production mode: deploy-server.js handles static files");
  }

  // Use PORT environment variable for deployment, with fallbacks for different platforms
  const port = parseInt(process.env.PORT || "5000", 10);

  server.listen(port, "0.0.0.0", () => {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    console.log(`${formattedTime} [express] serving on port ${port}`);
  });
})();
