const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚗 Restoring Original HitchBuddy React Application...');

// Temporarily move the problematic vite.config.ts
const viteConfigPath = path.join(__dirname, 'vite.config.ts');
const viteConfigBackupPath = path.join(__dirname, 'vite.config.ts.backup');

if (fs.existsSync(viteConfigPath)) {
  console.log('📦 Temporarily moving problematic vite.config.ts...');
  fs.renameSync(viteConfigPath, viteConfigBackupPath);
}

// Create a minimal working vite.config.ts
const minimalViteConfig = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: 5000
  }
});`;

fs.writeFileSync(viteConfigPath, minimalViteConfig);

console.log('✅ Created minimal vite.config.ts');
console.log('🔧 Starting original TypeScript server...');

// Start the TypeScript server
const tsxProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

// Handle cleanup
const cleanup = () => {
  console.log('🧹 Cleaning up...');
  if (fs.existsSync(viteConfigPath)) {
    fs.unlinkSync(viteConfigPath);
  }
  if (fs.existsSync(viteConfigBackupPath)) {
    fs.renameSync(viteConfigBackupPath, viteConfigPath);
    console.log('✅ Restored original vite.config.ts');
  }
  tsxProcess.kill();
};

tsxProcess.on('error', (error) => {
  console.error('❌ Failed to start TypeScript server:', error.message);
  cleanup();
  process.exit(1);
});

tsxProcess.on('exit', (code) => {
  cleanup();
  if (code !== 0) {
    console.error(`❌ TypeScript server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle graceful shutdown
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);