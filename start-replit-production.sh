#!/bin/bash

# Replit Production Startup Script
# Ensures the live deployment uses the optimized production server

echo "🚀 Starting HitchBuddy production deployment for Replit..."

# Kill any existing development servers
pkill -f "tsx server/index.ts" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Wait for processes to terminate
sleep 2

# Set production environment
export NODE_ENV=production
export PORT=${PORT:-5000}

echo "📍 Environment: $NODE_ENV"
echo "🔌 Port: $PORT"

# Start the Replit-optimized production server
exec node replit-deploy.js