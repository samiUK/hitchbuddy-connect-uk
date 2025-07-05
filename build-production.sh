#!/bin/bash

# HitchBuddy Production Build Script
# Creates optimized static build for deployment

echo "🚗 Building HitchBuddy for Production..."

# Clean any existing build artifacts
rm -rf dist client/dist 2>/dev/null

# Create production Vite configuration
cat > vite.config.prod.js << 'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: "client",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: "client/index.html",
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
EOF

# Create production index.html in client directory
cat > client/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HitchBuddy - Sustainable Ride Sharing</title>
    <meta name="description" content="Join HitchBuddy's eco-friendly ride sharing community. Connect with drivers and passengers for sustainable travel across the UK." />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

# Build the React application
echo "📦 Building React application..."
npx vite build --config vite.config.prod.js

# Create production server that serves static files
cat > deploy-server-static.cjs << 'EOF'
const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 10000;

// Security and performance middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(compression());

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// API routes would go here (placeholder for backend integration)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`HitchBuddy production server running on port ${PORT}`);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});
EOF

chmod +x deploy-server-static.cjs

echo "✅ Production build complete"
echo "📋 Files created:"
echo "  - dist/ (static build)"
echo "  - deploy-server-static.cjs (production server)"
echo "  - vite.config.prod.js (production config)"

# Verify build output
if [ -d "dist" ]; then
  echo "✅ Build successful - dist directory created"
  ls -la dist/
else
  echo "❌ Build failed - dist directory not found"
fi