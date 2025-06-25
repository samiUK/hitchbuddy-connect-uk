#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Fast deployment build - no vite required...');

try {
  // Create dist directory
  const distDir = 'dist';
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Create minimal static files directory
  const publicDir = path.join(distDir, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Create optimized single-page app HTML that loads from CDN
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HitchBuddy - Ride Sharing Platform</title>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
        .loader { border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; 
                  width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 20px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; text-align: center; }
        .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 60px 20px; }
        .card { background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
                padding: 24px; margin: 20px 0; }
    </style>
</head>
<body>
    <div id="root">
        <div class="hero">
            <div class="container">
                <h1 style="font-size: 3rem; margin-bottom: 1rem;">HitchBuddy</h1>
                <p style="font-size: 1.2rem; margin-bottom: 2rem;">Smart Ride Sharing Platform</p>
                <div class="loader"></div>
                <p>Loading application...</p>
            </div>
        </div>
        <div class="container">
            <div class="card">
                <h2>Welcome to HitchBuddy</h2>
                <p>Connect with drivers and riders in your area for convenient, affordable travel.</p>
            </div>
        </div>
    </div>
    <script>
        // Auto-reload every 10 seconds until backend is ready
        let retryCount = 0;
        const maxRetries = 30;
        
        function checkBackend() {
            fetch('/api/auth/me')
                .then(response => {
                    if (response.status === 200 || response.status === 401) {
                        window.location.reload();
                    }
                })
                .catch(() => {
                    retryCount++;
                    if (retryCount < maxRetries) {
                        setTimeout(checkBackend, 10000);
                    }
                });
        }
        
        // Start checking after 5 seconds
        setTimeout(checkBackend, 5000);
    </script>
</body>
</html>`;

  fs.writeFileSync(path.join(publicDir, 'index.html'), indexHtml);

  // Build the production server directly from deploy-server.js
  console.log('Building production server...');
  try {
    execSync('npx esbuild deploy-server.js --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js --minify', { 
      stdio: 'inherit' 
    });
  } catch (error) {
    console.log('Trying alternative build approach...');
    execSync('npx esbuild deploy-server.js --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js', { 
      stdio: 'inherit' 
    });
  }

  // Verify outputs
  const serverFile = path.join(distDir, 'index.js');
  if (!fs.existsSync(serverFile)) {
    throw new Error('Server build failed');
  }

  const stats = fs.statSync(serverFile);
  console.log(`✓ Fast deployment ready: ${Math.round(stats.size / 1024)}KB`);
  console.log('✓ No vite dependency required');
  console.log('✓ Uses optimized deploy-server.js');

} catch (error) {
  console.error('Fast deploy failed:', error.message);
  process.exit(1);
}