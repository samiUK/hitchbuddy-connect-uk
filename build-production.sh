#!/bin/bash

# HitchBuddy Production Build Script
# Creates optimized React production build with all features

echo "🚗 Building HitchBuddy Production Bundle..."

# Set permissions
chmod +x build-production.sh

# Create dist directory
mkdir -p dist/public

# Build the React application using Vite
echo "📦 Building React application..."
cd client

# Quick production build with optimization
NODE_ENV=production VITE_LEGACY=false npx vite build --minify esbuild --sourcemap false --target=es2020

# Check if build was successful
if [ -d "../dist/public" ] && [ -f "../dist/public/index.html" ]; then
    echo "✅ Production build completed successfully!"
    echo "📁 Build output: dist/public/"
    
    # Show build size
    echo "📊 Build size:"
    du -sh ../dist/public/
    ls -la ../dist/public/
else
    echo "❌ Production build failed"
    exit 1
fi

cd ..

echo "🚀 Production build ready for deployment!"