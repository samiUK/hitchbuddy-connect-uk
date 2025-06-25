#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

  console.log('Building server...');
  // Try multiple approaches for esbuild
  try {
    execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
  } catch (esbuildError) {
    console.log('npx esbuild failed, trying with NODE_PATH...');
    execSync('NODE_PATH=./node_modules npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
  }

  // Verify build outputs
  const clientDistPath = path.join(process.cwd(), 'client', 'dist');
  const serverDistPath = path.join(process.cwd(), 'dist');
  
  if (!fs.existsSync(clientDistPath)) {
    throw new Error('Client build output not found at client/dist');
  }
  
  if (!fs.existsSync(serverDistPath)) {
    throw new Error('Server build output not found at dist/');
  }

  console.log('Build completed successfully!');
  console.log('Client build output:', clientDistPath);
  console.log('Server build output:', serverDistPath);
} catch (error) {
  console.error('Build failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}