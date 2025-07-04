/**
 * Render Free Tier Optimizations
 * Backend-only optimizations that preserve UI experience
 */

import { Express } from "express";

export interface OptimizationConfig {
  enableMemoryOptimization: boolean;
  enableQueryOptimization: boolean;
  enableCacheOptimization: boolean;
  maxConcurrentConnections: number;
  requestTimeout: number;
}

export const renderFreeConfig: OptimizationConfig = {
  enableMemoryOptimization: true,
  enableQueryOptimization: true,
  enableCacheOptimization: true,
  maxConcurrentConnections: 50, // Higher limit to avoid blocking users
  requestTimeout: 30000, // 30 seconds - more generous for UI
};

/**
 * Apply memory optimizations for Render free tier
 */
export function applyMemoryOptimizations(app: Express) {
  // Set memory limits
  if (process.env.NODE_ENV === 'production') {
    // Force garbage collection more frequently on free tier
    if ((global as any).gc) {
      setInterval(() => {
        try {
          (global as any).gc();
        } catch (e) {
          console.log('GC not available');
        }
      }, 30000); // Every 30 seconds
    }
  }

  // Optimize Express settings for memory
  app.set('trust proxy', 1);
  app.set('json limit', '1mb');
  app.set('x-powered-by', false);
  
  // Add memory monitoring
  const memoryMonitor = () => {
    const used = process.memoryUsage();
    const mb = (bytes: number) => Math.round(bytes / 1024 / 1024 * 100) / 100;
    
    if (used.heapUsed > 300 * 1024 * 1024) { // 300MB warning
      console.log(`⚠️ High memory usage: ${mb(used.heapUsed)}MB`);
    }
  };

  // Monitor memory every 2 minutes
  setInterval(memoryMonitor, 120000);
}

/**
 * Apply request optimization middleware
 */
export function applyRequestOptimizations(app: Express, config: OptimizationConfig) {
  // Request timeout middleware
  app.use((req: any, res: any, next: any) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({ error: 'Request timeout' });
      }
    }, config.requestTimeout);

    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));
    
    next();
  });

  // Connection limiting for free tier
  let activeConnections = 0;
  
  app.use((req: any, res: any, next: any) => {
    if (activeConnections >= config.maxConcurrentConnections) {
      return res.status(503).json({ error: 'Server busy, please try again' });
    }
    
    activeConnections++;
    res.on('finish', () => activeConnections--);
    res.on('close', () => activeConnections--);
    
    next();
  });
}

/**
 * Database query optimization for free tier
 */
export function optimizeQueries() {
  return {
    // Limit result sets to prevent memory issues
    maxLimit: 50,
    defaultLimit: 10,
    
    // Cache frequently accessed data
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    
    // Optimize notification queries
    notificationLimit: 10,
    
    // Reduce polling frequency
    pollingInterval: 5 * 60 * 1000, // 5 minutes instead of 2
  };
}

/**
 * Apply compression optimizations
 */
export function applyCompressionOptimizations(app: Express) {
  try {
    // Enable gzip compression
    const compression = require('compression');
    
    app.use(compression({
      level: 6, // Good balance between compression and CPU usage
      threshold: 1024, // Only compress responses > 1KB
      filter: (req: any, res: any) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      }
    }));
  } catch (error) {
    console.log('Compression optimization skipped - package not available');
  }
}

/**
 * Health check optimization for Render
 */
export function setupHealthCheck(app: Express) {
  let healthy = true;
  let lastHealthCheck = Date.now();
  
  // Simple health check that doesn't hit database
  app.get('/health', (req: any, res: any) => {
    const now = Date.now();
    lastHealthCheck = now;
    
    // Quick memory check
    const used = process.memoryUsage();
    const memoryOk = used.heapUsed < 400 * 1024 * 1024; // 400MB limit
    
    if (memoryOk && healthy) {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        memory: Math.round(used.heapUsed / 1024 / 1024) + 'MB'
      });
    } else {
      res.status(503).json({ 
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        memory: Math.round(used.heapUsed / 1024 / 1024) + 'MB'
      });
    }
  });
  
  // Set unhealthy if no requests for 5 minutes (Render sleep detection)
  setInterval(() => {
    if (Date.now() - lastHealthCheck > 5 * 60 * 1000) {
      healthy = false;
    } else {
      healthy = true;
    }
  }, 60000);
}

/**
 * Graceful shutdown for Render deployments
 */
export function setupGracefulShutdown(server: any) {
  const shutdown = (signal: string) => {
    console.log(`Received ${signal}. Graceful shutdown...`);
    
    server.close(() => {
      console.log('HTTP server closed.');
      
      // Force exit after 5 seconds
      setTimeout(() => {
        console.log('Force exit.');
        process.exit(0);
      }, 5000);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}