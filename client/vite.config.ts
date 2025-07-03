import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    host: true,
    port: 5000,
    strictPort: false,
    allowedHosts: 'all',
    hmr: {
      port: 443,
      clientPort: 443,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        configure: (proxy, options) => {
          // Mock API responses for development
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Handle auth requests with mock responses
            if (req.url === '/api/auth/me') {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Not authenticated' }));
              return;
            }
            if (req.url === '/api/rides') {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify([]));
              return;
            }
            if (req.url === '/api/bookings') {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify([]));
              return;
            }
          });
        }
      }
    }
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