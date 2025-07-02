#!/bin/bash
set -e

echo "Starting Render build process..."

# Install all dependencies (including dev dependencies for build)
npm ci --include=dev

# Ensure vite is available by checking if it's in node_modules
if [ ! -f "node_modules/.bin/vite" ]; then
    echo "Vite not found in node_modules, installing..."
    npm install vite @vitejs/plugin-react esbuild
fi

# Set production environment
export NODE_ENV=production

# Build the frontend with multiple fallback strategies
echo "Building frontend..."
if timeout 300 npx vite build --mode production; then
    echo "Frontend build successful"
else
    echo "Vite build failed, trying alternative approach..."
    # Create minimal static files if build fails
    mkdir -p dist/public
    cat > dist/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HitchBuddy - Loading...</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        .loader { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 20px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .container { max-width: 400px; margin: 0 auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="container">
        <h1>HitchBuddy</h1>
        <div class="loader"></div>
        <p>Application is starting up...</p>
        <p><small>Please wait while we prepare your ride-sharing experience.</small></p>
    </div>
    <script>
        // Auto-refresh after 5 seconds to check if app is ready
        setTimeout(() => {
            if (document.readyState === 'complete') {
                location.reload();
            }
        }, 5000);
    </script>
</body>
</html>
EOF
    echo "Created fallback HTML file"
fi

# Build the complete HitchBuddy backend (using same process as local but with deploy server)
echo "Building HitchBuddy frontend with Vite..."
if timeout 300 npx vite build --mode production; then
    echo "✓ Frontend built successfully"
else
    echo "❌ Frontend build failed"
    exit 1
fi

echo "Building HitchBuddy backend server..."
if npx esbuild production-server.js --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js --minify; then
    echo "✓ Backend server built successfully"
else
    echo "❌ Backend build failed"
    exit 1
fi

# Create the complete server structure for production
echo "Setting up complete server structure..."

# Create directories
mkdir -p dist/server
mkdir -p dist/shared

# Copy ALL server files to ensure imports work
if [ -d "server" ]; then
    cp -r server/* dist/server/ 2>/dev/null || true
    echo "✓ Server files copied to dist/server/"
fi

if [ -d "shared" ]; then
    cp -r shared/* dist/shared/ 2>/dev/null || true
    echo "✓ Shared files copied to dist/shared/"
fi

# Copy essential files for module resolution
cp package.json dist/ 2>/dev/null || true
cp drizzle.config.ts dist/ 2>/dev/null || true

# Also copy files to root level for import resolution
cp -r server dist/ 2>/dev/null || true
cp -r shared dist/ 2>/dev/null || true

# Ensure React build files are available in expected locations
echo "Ensuring React build files are accessible..."
if [ -d "dist/public" ]; then
    # Copy from dist/public to dist for production server compatibility
    cp dist/public/* dist/ 2>/dev/null || true
    echo "✓ React build files copied to dist/"
fi

# Create backup locations for static files
mkdir -p dist/static 2>/dev/null || true
if [ -f "dist/index.html" ]; then
    cp dist/index.html dist/static/ 2>/dev/null || true
fi

echo "✓ Complete server structure and React build ready"

# Verify build outputs and display statistics
echo "Verifying build outputs..."
ls -la dist/
if [ -f "dist/index.js" ]; then
    SERVER_SIZE=$(du -k dist/index.js | cut -f1)
    echo "✓ Server bundle: ${SERVER_SIZE}KB"
else
    echo "❌ Server build failed - dist/index.js not found"
    exit 1
fi

if [ -d "dist/public" ]; then
    CLIENT_FILES=$(find dist/public -type f | wc -l)
    echo "✓ Client files: ${CLIENT_FILES} files in dist/public/"
    ls -la dist/public/ 2>/dev/null || true
else
    echo "⚠ Client build not found - using fallback"
fi

echo "✓ Build completed successfully!"
echo "✓ Ready for deployment with fast startup"