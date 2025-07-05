import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix for production deployment path resolution
const isProduction = process.env.NODE_ENV === 'production' || process.env.FORCE_DEV_MODE === 'true';
const rootDir = isProduction && process.cwd().endsWith('/src') ? process.cwd() : __dirname;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
      "@shared": path.resolve(rootDir, "shared"),
      "@assets": path.resolve(rootDir, "attached_assets"),
    },
    // Enhanced resolution for production deployment
    conditions: ['import', 'module', 'browser', 'default'],
    mainFields: ['browser', 'module', 'main'],
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']
  },
  root: rootDir,
  build: {
    outDir: 'dist/public',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(rootDir, 'index.html')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  css: {
    postcss: path.resolve(rootDir, "client/postcss.config.js"),
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "date-fns",
      "lucide-react",
      "clsx",
      "tailwind-merge",
      "@radix-ui/react-avatar",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toast",
      "@hookform/resolvers/zod"
    ],
    force: true,
    entries: ['./src/main.tsx', './src/main.jsx'],
    exclude: []
  },
  define: {
    // Ensure process.env is available in development mode
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
});
