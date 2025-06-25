// Immediate startup production server for Replit deployment
import express from "express";
import { registerRoutes } from "./server/routes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check - must be first and immediate
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const port = parseInt(process.env.PORT || "5000", 10);

// Start listening immediately
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Server ready on port ${port}`);
});

// Setup routes and static files after server is listening
registerRoutes(app).then(async () => {
  console.log('Routes initialized');
  // Serve static files
  const path = await import("path");
  const fs = await import("fs");
  const distPath = path.resolve(process.cwd(), "dist", "public");
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.use("*", (req, res) => res.sendFile(path.resolve(distPath, "index.html")));
  }
}).catch(console.error);