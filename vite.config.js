import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Check if we're in deployment mode (src directory exists at root)
const isDeployment = fs.existsSync(path.resolve(__dirname, "src"));
const srcPath = isDeployment ? path.resolve(__dirname, "src") : path.resolve(__dirname, "client/src");
const rootPath = isDeployment ? __dirname : path.resolve(__dirname, "client");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": srcPath,
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: rootPath,
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  css: {
    postcss: isDeployment 
      ? path.resolve(__dirname, "client/postcss.config.js")
      : path.resolve(__dirname, "client/postcss.config.js"),
  },
});
