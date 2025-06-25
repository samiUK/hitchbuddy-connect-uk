#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Starting build process...');

try {
  // Check if we're in the right directory
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('package.json not found. Please run this from the project root.');
  }

  console.log('Installing dependencies (including dev dependencies)...');
  execSync('npm install --include=dev', { stdio: 'inherit' });

  console.log('Building client...');
  // Try multiple approaches to ensure vite is available
  try {
    execSync('npx vite build', { stdio: 'inherit' });
  } catch (viteError) {
    console.log('npx vite failed, trying with NODE_PATH...');
    execSync('NODE_PATH=./node_modules npx vite build', { stdio: 'inherit' });
  }

  console.log('Building optimized production server...');
  // Use the fast deploy-server.js for production builds
  try {
    execSync('npx esbuild deploy-server.js --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js', { stdio: 'inherit' });
  } catch (esbuildError) {
    console.log('Fast server build failed, trying with NODE_PATH...');
    execSync('NODE_PATH=./node_modules npx esbuild deploy-server.js --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js', { stdio: 'inherit' });
  }

  // Verify build outputs
  const clientDistPath = path.join(process.cwd(), 'dist', 'public');
  const serverDistPath = path.join(process.cwd(), 'dist', 'index.js');
  
  if (!fs.existsSync(clientDistPath)) {
    console.warn('Client build output not found at dist/public - this may be expected for server-only builds');
  }
  
  if (!fs.existsSync(serverDistPath)) {
    throw new Error('Server build output not found at dist/index.js');
  }

  console.log('Build completed successfully!');
  console.log('Server build output:', serverDistPath);
  if (fs.existsSync(clientDistPath)) {
    console.log('Client build output:', clientDistPath);
  }
  
  // Display build statistics
  const stats = fs.statSync(serverDistPath);
  console.log(`Server bundle size: ${Math.round(stats.size / 1024)}KB`);
  console.log('Ready for deployment!');
} catch (error) {
  console.error('Build failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}