#!/bin/bash

echo "Building Hitchbuddy for production deployment..."

# Build frontend
echo "Building frontend with Vite..."
npm run build:frontend

# Build optimized backend
echo "Building minimal production server..."
npx esbuild server/minimal-production.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js

# Verify build
echo "Build completed:"
ls -la dist/
echo "Server bundle size: $(du -h dist/index.js | cut -f1)"

echo "Production build ready for deployment"