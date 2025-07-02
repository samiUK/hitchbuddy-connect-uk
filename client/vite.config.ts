import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: false,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.replit.dev',
      '.replit.app',
      '.worf.replit.dev',
      '605a8f2f-3a25-4df1-902d-3aaee1a1c6b0-00-217wf2xlb5x3s.worf.replit.dev'
    ],
    hmr: {
      port: 443,
      clientPort: 443,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../shared"),
      "@assets": path.resolve(__dirname, "../attached_assets"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "../dist/public"),
    emptyOutDir: true,
  },
});