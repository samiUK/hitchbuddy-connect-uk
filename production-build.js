// Production build script that ensures fast deployment server
import { execSync } from 'child_process';
import fs from 'fs';

console.log('Building Hitchbuddy for fast deployment...');

try {
  // Build frontend
  console.log('Building frontend...');
  execSync('vite build', { stdio: 'inherit' });
  
  // Build fast backend server
  console.log('Building optimized backend...');
  execSync('npx esbuild deploy-server.js --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js', { stdio: 'inherit' });
  
  // Verify the build
  const stats = fs.statSync('dist/index.js');
  console.log(`✅ Fast deployment server built: ${Math.round(stats.size/1024)}kb`);
  console.log('🚀 Ready for instant deployment');
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}