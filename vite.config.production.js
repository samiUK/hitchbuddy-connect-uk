import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Production-specific Vite configuration for Render deployment
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./shared"),
      "@assets": path.resolve(__dirname, "./attached_assets"),
    },
  },
  root: __dirname,
  build: {
    outDir: 'dist/public',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "date-fns",
      "lucide-react",
      "clsx",
      "tailwind-merge"
    ],
    force: false,
    exclude: []
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('development')
  },
  // Production environment specific settings
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  logLevel: 'info'
});