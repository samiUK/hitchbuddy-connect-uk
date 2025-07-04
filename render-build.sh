#!/bin/bash

echo "🏗️  Building HitchBuddy for Render deployment..."

# Create client dist directory
mkdir -p client/dist

# Build React application using Vite
echo "📦 Building React application..."
npx vite build --outDir client/dist --emptyOutDir

# Verify build was successful
if [ -f "client/dist/index.html" ]; then
    echo "✅ React build successful"
    echo "📁 Build files:"
    ls -la client/dist/
else
    echo "❌ React build failed"
    exit 1
fi

echo "🎉 HitchBuddy build completed successfully!"