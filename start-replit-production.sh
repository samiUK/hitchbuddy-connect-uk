#!/bin/bash

# HitchBuddy Production Deployment Script for Replit
echo "🚀 Starting HitchBuddy production deployment..."

# Kill any existing processes
pkill -f "production-server.js" || true
pkill -f "node.*5000" || true

# Start production server in background
NODE_ENV=production node production-server.js &
PID=$!

echo "📊 Production server started with PID: $PID"
echo "🌐 HitchBuddy will be available at: https://hitchbuddyapp.replit.app"

# Monitor the process
sleep 3
if ps -p $PID > /dev/null; then
    echo "✅ HitchBuddy production server is running successfully"
    echo "🔗 Interface ready for deployment"
else
    echo "❌ Production server failed to start"
    exit 1
fi

# Keep script running to maintain deployment
wait $PID