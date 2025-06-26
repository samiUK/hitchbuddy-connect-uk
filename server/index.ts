import express from "express";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes.js";
import { setupVite } from "./vite.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const server = createServer(app);

async function startServer() {
  // API routes for authentication, rides, bookings, etc.
  await registerRoutes(app);

  // Simple test route
  app.get('/test', (req, res) => {
    res.send('<h1>HitchBuddy Test - Server Working</h1><p>This confirms the server is responding correctly.</p>');
  });

  // Serve working HitchBuddy interface on all other routes
  app.get('*', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HitchBuddy - Share Your Journey</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #f0f8ff 0%, #ffffff 50%, #f0fff4 100%); min-height: 100vh; }
        .nav { background: rgba(255,255,255,0.9); border-bottom: 1px solid #e5e7eb; position: sticky; top: 0; z-index: 50; }
        .nav-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; height: 64px; }
        .logo { display: flex; align-items: center; gap: 8px; }
        .logo-icon { background: linear-gradient(45deg, #2563eb, #16a34a); padding: 8px; border-radius: 8px; color: white; }
        .brand { font-size: 24px; font-weight: 700; color: #1f2937; }
        .nav-buttons { display: flex; gap: 12px; }
        .btn { padding: 8px 16px; border-radius: 6px; font-weight: 500; cursor: pointer; border: none; }
        .btn-ghost { color: #6b7280; background: transparent; }
        .btn-primary { background: linear-gradient(45deg, #2563eb, #16a34a); color: white; }
        .hero { padding: 80px 20px; text-align: center; }
        .hero-title { font-size: 48px; font-weight: 800; color: #1f2937; margin-bottom: 16px; }
        .hero-subtitle { font-size: 20px; color: #6b7280; margin-bottom: 32px; }
        .hero-buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .btn-large { padding: 12px 32px; font-size: 16px; }
        .features { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
        .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
        .feature-card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="gradient-bg">
        <nav class="nav">
            <div class="nav-container">
                <div class="logo">
                    <div class="logo-icon">🚗</div>
                    <span class="brand">HitchBuddy</span>
                </div>
                <div class="nav-buttons">
                    <button class="btn btn-ghost">Sign In</button>
                    <button class="btn btn-primary">Get Started</button>
                </div>
            </div>
        </nav>

        <section class="hero">
            <h1 class="hero-title">Share Your Journey, Save the Planet</h1>
            <p class="hero-subtitle">
                Connect with fellow travelers, reduce costs, and make every trip an adventure. 
                HitchBuddy makes ride sharing safe, reliable, and rewarding.
            </p>
            <div class="hero-buttons">
                <button class="btn btn-primary btn-large">Find a Ride</button>
                <button class="btn btn-ghost btn-large">Offer a Ride</button>
            </div>
        </section>

        <section class="features">
            <div class="feature-grid">
                <div class="feature-card">
                    <h3>🎯 Smart Route Matching</h3>
                    <p>Advanced algorithms connect you with riders going your way, optimizing routes for everyone.</p>
                </div>
                <div class="feature-card">
                    <h3>🛡️ Trusted Community</h3>
                    <p>Verified profiles, ratings, and reviews ensure safe and reliable ride-sharing experiences.</p>
                </div>
                <div class="feature-card">
                    <h3>💬 Real-time Communication</h3>
                    <p>Stay connected with instant messaging, live location sharing, and trip updates.</p>
                </div>
            </div>
        </section>
    </div>
</body>
</html>`);
  });

  const PORT = 5000;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[express] serving on port ${PORT}`);
    console.log(`Test page: http://localhost:${PORT}/test`);
    console.log(`HitchBuddy interface: http://localhost:${PORT}/`);
  });
}

startServer().catch(console.error);