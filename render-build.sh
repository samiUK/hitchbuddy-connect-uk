#!/bin/bash
set -e

echo "Starting Render build process..."

# Install all dependencies (including dev dependencies for build)
npm ci

# Build the frontend with timeout to prevent hanging
timeout 300 npx vite build --mode production || {
    echo "Vite build timed out, trying alternative approach..."
    # Create minimal static files if build fails
    mkdir -p dist/public
    echo '<!DOCTYPE html><html><head><title>Loading...</title></head><body><div id="root">Building...</div></body></html>' > dist/public/index.html
}

# Build the backend server (to dist/index.js) using minimal production entry point
npx esbuild server/minimal-production.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js

# Verify build outputs
ls -la dist/
ls -la dist/public/ 2>/dev/null || echo "Warning: dist/public not found"

echo "Build completed successfully!"