#!/bin/bash

# HitchBuddy Production Startup Script
# Ensures all permissions and builds are handled correctly before server start

echo "🚗 HitchBuddy Production Startup"
echo "================================"

# Make this script executable
chmod +x "$0" 2>/dev/null || true

# Function to set permissions safely
set_permissions() {
    local file="$1"
    if [ -f "$file" ]; then
        chmod +x "$file" 2>/dev/null && echo "✅ Set permissions for $file" || echo "⚠️  Could not set permissions for $file"
    else
        echo "⚠️  File not found: $file"
    fi
}

echo "🔧 Setting script permissions..."
set_permissions "build-client.sh"
set_permissions "deploy-server.cjs"
set_permissions "dev-server.cjs"

# Run build process if needed
if [ ! -d "src" ]; then
    echo "📦 Running build process..."
    if [ -f "build-client.sh" ]; then
        ./build-client.sh
    else
        echo "⚠️  build-client.sh not found, skipping build"
    fi
else
    echo "📁 Build already completed (src directory exists)"
fi

echo "🚀 Starting production server..."
node deploy-server.cjs