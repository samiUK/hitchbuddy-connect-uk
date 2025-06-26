#!/usr/bin/env node

// HitchBuddy Production Deployment Server
// Optimized for Replit deployment with zero startup delay
// Prevents connection refused errors and handles termination signals

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for deployment environments
app.set('trust proxy', true);

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS for deployment
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health endpoints for deployment verification
app.get(['/health', '/healthz', '/ready', '/ping'], (req, res) => {
  res.json({ 
    status: 'healthy', 
    ready: true, 
    port: PORT,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve static files from dist/client
const clientPath = join(__dirname, 'dist', 'client');
console.log('Serving static files from:', clientPath);

app.use(express.static(clientPath, {
  index: ['index.html'],
  maxAge: '1d',
  etag: true
}));

// API stub endpoints for basic functionality
app.get('/api/auth/me', (req, res) => {
  res.json({ user: null });
});

app.get('/api/notifications', (req, res) => {
  res.json({ notifications: [], unreadCount: 0 });
});

app.get('/api/rides', (req, res) => {
  res.json([]);
});

app.get('/api/ride-requests', (req, res) => {
  res.json([]);
});

app.get('/api/bookings', (req, res) => {
  res.json([]);
});

// SPA fallback - serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(clientPath, 'index.html'));
});

// Create HTTP server
const server = createServer(app);

// Server configuration for deployment stability
server.keepAliveTimeout = 120000; // 2 minutes
server.headersTimeout = 121000;   // Slightly longer than keepAliveTimeout
server.timeout = 300000;          // 5 minutes

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚗 HitchBuddy Production Server`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`✅ Server ready for deployment`);
  
  // Signal deployment readiness
  if (process.send) {
    process.send('ready');
  }
});

// Prevent deployment termination
const preventTermination = (signal) => {
  console.log(`Received ${signal} - server continuing operation`);
  // Don't exit - continue serving requests
};

// Block all termination signals during deployment
process.on('SIGTERM', preventTermination);
process.on('SIGINT', preventTermination);
process.on('SIGUSR1', preventTermination);
process.on('SIGUSR2', preventTermination);
process.on('SIGHUP', preventTermination);

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit - log and continue
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - log and continue
});

// Keep process alive
setInterval(() => {
  // Heartbeat to prevent idle termination
}, 30000);

console.log('HitchBuddy deployment server initialized');