#!/bin/bash
echo "🚀 Building HitchBuddy React Application for Production"

# Ensure we're using the complex package.json with build capabilities
if [ ! -f "package.json.complex" ]; then
    echo "❌ package.json.complex not found"
    exit 1
fi

cp package.json.complex package.json
echo "📋 Using complex package.json for build"

# Install all dependencies
echo "📦 Installing dependencies..."
npm install

# Build the React application
echo "⚛️ Building React application..."
npm run build

# Verify build completed successfully
if [ -d "dist/public" ] && [ -f "dist/public/index.html" ]; then
    echo "✅ React build completed successfully"
    echo "📁 Built files available in dist/public/"
    ls -la dist/public/
else
    echo "❌ Build failed - dist/public directory not found"
    exit 1
fi

echo "🎉 HitchBuddy production build ready for deployment"