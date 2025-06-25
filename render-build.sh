#!/bin/bash
set -e

echo "Starting Render build process..."

# Install all dependencies (including dev dependencies for build)
npm ci

# Build the application
npm run build

# Install production dependencies only (vite is now in dependencies)
npm ci --only=production

echo "Build completed successfully!"