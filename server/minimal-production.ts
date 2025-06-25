import express from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Minimal request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      console.log(`${req.method} ${req.path} ${res.statusCode} in ${Date.now() - start}ms`);
    }
  });
  next();
});

// Health check first - immediate response
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

const port = parseInt(process.env.PORT || "5000", 10);

// Start server immediately
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Server ready on port ${port}`);
});

// Register routes after server is listening
registerRoutes(app).then(() => {
  console.log('Routes registered');
  
  // Static files after routes
  const distPath = path.resolve(process.cwd(), "dist", "public");
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.use("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
}).catch(error => {
  console.error('Failed to register routes:', error);
  process.exit(1);
});