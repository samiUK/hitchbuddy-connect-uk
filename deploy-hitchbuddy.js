import express from 'express';
import { createServer } from 'http';

const app = express();
const PORT = process.env.PORT || 5000;

// Essential middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', true);

// CORS for deployment
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health endpoints for deployment
app.get(['/health', '/healthz', '/ready', '/ping', '/status'], (req, res) => {
  res.json({
    status: 'healthy',
    service: 'HitchBuddy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Basic API endpoints
app.get('/api/auth/me', (req, res) => res.json({ user: null }));
app.get('/api/notifications', (req, res) => res.json({ notifications: [], unreadCount: 0 }));
app.get('/api/rides', (req, res) => res.json([]));
app.get('/api/ride-requests', (req, res) => res.json([]));
app.get('/api/bookings', (req, res) => res.json([]));

// HitchBuddy interface - serves on all routes
app.get('*', (req, res) => {
  const hitchbuddyHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HitchBuddy - Ride Sharing Platform</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #f0f8ff 0%, #ffffff 50%, #f0fff4 100%); min-height: 100vh; }
        .nav { background: rgba(255,255,255,0.8); backdrop-filter: blur(10px); border-bottom: 1px solid #e5e7eb; position: sticky; top: 0; z-index: 50; }
        .nav-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; height: 64px; }
        .logo { display: flex; align-items: center; gap: 8px; }
        .logo-icon { background: linear-gradient(45deg, #2563eb, #16a34a); padding: 8px; border-radius: 8px; }
        .car-icon { width: 24px; height: 24px; color: white; }
        .brand { font-size: 24px; font-weight: 700; color: #1f2937; }
        .nav-buttons { display: flex; gap: 12px; align-items: center; }
        .btn { padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 500; transition: all 0.2s; cursor: pointer; border: none; }
        .btn-ghost { color: #6b7280; background: transparent; }
        .btn-ghost:hover { color: #374151; background: #f3f4f6; }
        .btn-primary { background: linear-gradient(45deg, #2563eb, #16a34a); color: white; }
        .btn-primary:hover { background: linear-gradient(45deg, #1d4ed8, #15803d); }
        .hero { padding: 80px 20px; text-align: center; }
        .hero-container { max-width: 800px; margin: 0 auto; }
        .hero-title { font-size: 48px; font-weight: 800; color: #1f2937; margin-bottom: 16px; }
        .hero-subtitle { font-size: 20px; color: #6b7280; margin-bottom: 32px; }
        .hero-buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .btn-large { padding: 12px 32px; font-size: 16px; }
        .features { padding: 80px 20px; background: rgba(255,255,255,0.5); }
        .features-container { max-width: 1200px; margin: 0 auto; }
        .features-title { text-align: center; font-size: 36px; font-weight: 700; color: #1f2937; margin-bottom: 48px; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; }
        .feature-card { background: white; padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .feature-icon { width: 48px; height: 48px; margin-bottom: 16px; color: #2563eb; }
        .feature-title { font-size: 20px; font-weight: 600; color: #1f2937; margin-bottom: 8px; }
        .feature-description { color: #6b7280; line-height: 1.6; }
        .status-bar { background: #10b981; color: white; text-align: center; padding: 8px; font-weight: 500; }
        @media (max-width: 768px) {
            .hero-title { font-size: 36px; }
            .nav-buttons { gap: 8px; }
            .hero-buttons { flex-direction: column; align-items: center; }
        }
    </style>
</head>
<body>
    <div class="status-bar">HitchBuddy is live at https://hitchbuddyapp.replit.app - Production deployment active!</div>
    <div class="gradient-bg">
        <nav class="nav">
            <div class="nav-container">
                <div class="logo">
                    <div class="logo-icon">
                        <svg class="car-icon" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0-1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                        </svg>
                    </div>
                    <span class="brand">HitchBuddy</span>
                </div>
                <div class="nav-buttons">
                    <button class="btn btn-ghost" onclick="showAuthModal()">Sign In</button>
                    <button class="btn btn-primary" onclick="showAuthModal()">Get Started</button>
                </div>
            </div>
        </nav>

        <section class="hero">
            <div class="hero-container">
                <h1 class="hero-title">Share Your Journey, Save the Planet</h1>
                <p class="hero-subtitle">
                    Connect with fellow travelers, reduce costs, and make every trip an adventure. 
                    HitchBuddy makes ride sharing safe, reliable, and rewarding.
                </p>
                <div class="hero-buttons">
                    <button class="btn btn-primary btn-large" onclick="findRide()">Find a Ride</button>
                    <button class="btn btn-ghost btn-large" onclick="offerRide()">Offer a Ride</button>
                </div>
            </div>
        </section>

        <section class="features">
            <div class="features-container">
                <h2 class="features-title">Why Choose HitchBuddy?</h2>
                <div class="features-grid">
                    <div class="feature-card">
                        <svg class="feature-icon" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        <h3 class="feature-title">Smart Route Matching</h3>
                        <p class="feature-description">
                            AI-powered matching connects you with rides along your exact route, 
                            saving time and maximizing convenience.
                        </p>
                    </div>
                    <div class="feature-card">
                        <svg class="feature-icon" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77 5.82 21.02 7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <h3 class="feature-title">Trusted Community</h3>
                        <p class="feature-description">
                            Verified profiles, ratings, and reviews ensure safe, reliable connections 
                            with fellow travelers you can trust.
                        </p>
                    </div>
                    <div class="feature-card">
                        <svg class="feature-icon" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                        <h3 class="feature-title">Real-time Communication</h3>
                        <p class="feature-description">
                            Stay connected with instant messaging, live location sharing, 
                            and trip updates for peace of mind.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    </div>

    <script>
        function showAuthModal() {
            alert('Full authentication system launching soon! HitchBuddy is currently in beta development.');
        }
        
        function findRide() {
            alert('Find Ride feature coming soon! Join our waitlist for early access.');
        }
        
        function offerRide() {
            alert('Offer Ride feature launching soon! Be among the first to connect travelers.');
        }
        
        // Background API connectivity check
        setTimeout(() => {
            fetch('/api/auth/me')
                .then(response => response.json())
                .then(data => console.log('Backend API operational'))
                .catch(err => console.log('API status:', err.message));
        }, 1000);
    </script>
</body>
</html>`;
  
  res.setHeader('Content-Type', 'text/html');
  res.send(hitchbuddyHtml);
});

// Create and start server
const server = createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎯 HitchBuddy deployment server running on port ${PORT}`);
  console.log(`🌐 Live at: https://hitchbuddyapp.replit.app`);
  console.log(`✅ Health endpoints: /health, /ready, /status`);
  
  if (process.send) {
    process.send('ready');
  }
});

// Error handling
server.on('error', (err) => {
  console.error('❌ Server error:', err.message);
});

process.on('SIGTERM', () => {
  console.log('🔄 Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});