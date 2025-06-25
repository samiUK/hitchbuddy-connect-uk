import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import path from "path";
import fs from "fs";

// Start server initialization immediately
console.log('Starting Hitchbuddy server initialization...');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
  const start = Date.now();
  const pathReq = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (pathReq.startsWith("/api")) {
      let logLine = `${req.method} ${pathReq} ${res.statusCode} in ${duration}ms`;
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
  try {
    console.log('Initializing server and database connection...');
    const server = await registerRoutes(app);
    console.log('Routes registered successfully');

    // Health check endpoint for deployment readiness
    app.get('/health', (_req, res) => {
      res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error('Server error:', message);
      res.status(status).json({ message });
    });

    // In production, serve static files directly
    const distPath = path.resolve(process.cwd(), "dist", "public");
    
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.use("*", (_req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
      });
    } else {
      app.use("*", (_req, res) => {
        res.status(404).send("Application not built properly");
      });
    }

    const port = parseInt(process.env.PORT || "5000", 10);
    
    console.log(`Starting production server on port ${port} with NODE_ENV=${process.env.NODE_ENV}`);

    server.listen(port, "0.0.0.0", () => {
      const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      console.log(`${formattedTime} [express] serving on port ${port}`);
      console.log(`Health check available at http://0.0.0.0:${port}/health`);
      console.log('Server is ready to accept connections');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();