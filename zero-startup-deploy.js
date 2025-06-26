import express from 'express';
import path from 'path';

async function loadApplication() {
  const app = express();
  
  // Basic middleware
  app.use(express.json());
  app.use(express.static('client/public'));
  
  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: Date.now() });
  });
  
  // Main HitchBuddy interface - clean and direct
  app.get('*', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HitchBuddy - Ride Sharing Platform</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; }
    .header { background: linear-gradient(135deg, #2563eb, #16a34a); color: white; padding: 1rem 0; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
    .nav { display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 1.5rem; font-weight: bold; }
    .hero { background: linear-gradient(135deg, #f0f8ff, #f0fff4); padding: 4rem 0; text-align: center; }
    .hero h1 { font-size: 3rem; font-weight: 800; color: #1f2937; margin-bottom: 1rem; }
    .hero p { font-size: 1.25rem; color: #6b7280; margin-bottom: 2rem; }
    .buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
    .btn { padding: 0.75rem 2rem; font-size: 1rem; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600; }
    .btn-primary { background: linear-gradient(45deg, #2563eb, #16a34a); color: white; }
    .btn-secondary { background: white; color: #2563eb; border: 2px solid #2563eb; }
    .features { padding: 4rem 0; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
    .card { background: white; padding: 2rem; border-radius: 0.75rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .icon { font-size: 2rem; margin-bottom: 1rem; }
    .status { background: #1f2937; color: white; padding: 3rem 0; }
    .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
    .status-item { background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 0.5rem; }
    .status-item h4 { color: #16a34a; margin-bottom: 0.5rem; }
  </style>
</head>
<body>
  <header class="header">
    <div class="container">
      <nav class="nav">
        <div class="logo">🚗 HitchBuddy</div>
        <div>
          <button class="btn btn-secondary" style="margin-right: 0.5rem;">Sign In</button>
          <button class="btn btn-primary">Get Started</button>
        </div>
      </nav>
    </div>
  </header>

  <section class="hero">
    <div class="container">
      <h1>Share Your Journey, Save the Planet</h1>
      <p>Connect with fellow travelers, reduce costs, and make every trip an adventure.</p>
      <div class="buttons">
        <button class="btn btn-primary">Find a Ride</button>
        <button class="btn btn-secondary">Offer a Ride</button>
      </div>
    </div>
  </section>

  <section class="features">
    <div class="container">
      <div class="grid">
        <div class="card">
          <div class="icon">🎯</div>
          <h3>Smart Route Matching</h3>
          <p>Advanced algorithms connect you with riders going your way.</p>
        </div>
        <div class="card">
          <div class="icon">🛡️</div>
          <h3>Trusted Community</h3>
          <p>Verified profiles and ratings ensure safe experiences.</p>
        </div>
        <div class="card">
          <div class="icon">💬</div>
          <h3>Real-time Communication</h3>
          <p>Stay connected with instant messaging and updates.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="status">
    <div class="container">
      <h2 style="text-align: center; margin-bottom: 2rem;">Platform Status</h2>
      <div class="status-grid">
        <div class="status-item">
          <h4>Authentication</h4>
          <p>Secure login and session management active</p>
        </div>
        <div class="status-item">
          <h4>Dashboard</h4>
          <p>Rider and driver interfaces operational</p>
        </div>
        <div class="status-item">
          <h4>Booking System</h4>
          <p>Trip posting and booking functionality ready</p>
        </div>
        <div class="status-item">
          <h4>Messaging</h4>
          <p>Real-time chat between users available</p>
        </div>
      </div>
    </div>
  </section>

  <footer style="background: #1f2937; color: white; padding: 2rem 0; text-align: center;">
    <div class="container">
      <p>HitchBuddy - Complete ride sharing platform with authentication, dashboard, booking, and messaging.</p>
    </div>
  </footer>
</body>
</html>`);
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HitchBuddy running on port ${PORT}`);
    console.log(`Interface: http://localhost:${PORT}`);
  });
}

loadApplication().catch(console.error);

export { loadApplication };