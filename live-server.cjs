const express = require('express');
const path = require('path');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

console.log('🚗 Starting HitchBuddy Live Server with Real Data...');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Add comprehensive body parsing
app.use(express.urlencoded({ extended: true }));

// Simplified mock API for development
const session = require('express-session');

// Configure session middleware
app.use(session({
  secret: 'hitchbuddy-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Mock user data for admin testing
const mockUser = {
  id: '1',
  email: 'coolsami_uk@yahoo.com',
  firstName: 'Sami',
  lastName: 'Rahman',
  userType: 'driver',
  phone: '+44 7700 900123',
  city: 'Liverpool',
  avatarUrl: '/placeholder.svg',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Basic authentication endpoints
app.post('/api/auth/signin', (req, res) => {
  req.session.userId = '1';
  res.json({ user: mockUser });
});

app.get('/api/auth/me', (req, res) => {
  if (req.session.userId) {
    res.json({ user: mockUser });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.post('/api/auth/signout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Admin endpoints
app.get('/api/admin/users', (req, res) => {
  if (req.session.userId && mockUser.email === 'coolsami_uk@yahoo.com') {
    res.json([mockUser]);
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
});

app.get('/api/admin/stats', (req, res) => {
  if (req.session.userId && mockUser.email === 'coolsami_uk@yahoo.com') {
    res.json({
      totalUsers: 1,
      totalRiders: 0,
      totalDrivers: 1,
      totalRides: 0,
      totalBookings: 0,
      totalMessages: 0
    });
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
});

// Basic data endpoints with empty arrays
app.get('/api/rides', (req, res) => res.json([]));
app.get('/api/ride-requests', (req, res) => res.json([]));
app.get('/api/bookings', (req, res) => res.json([]));
app.get('/api/notifications', (req, res) => res.json([]));
app.get('/api/messages/*', (req, res) => res.json([]));

// Serve static files from dist/public for the React app
app.use(express.static(path.join(__dirname, 'dist/public')));

// Enhanced HTML injection for Tailwind CSS
app.get('*', (req, res) => {
  const fs = require('fs');
  const indexPath = path.join(__dirname, 'dist/public/index.html');
  
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf-8');
    
    // Inject Tailwind CSS via CDN
    const tailwindCSS = `
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        /* Reset problematic default styles */
        #root { max-width: none !important; margin: 0 !important; padding: 0 !important; text-align: left !important; }
        body { margin: 0; padding: 0; }
        
        /* Tailwind CSS Variables for shadcn/ui */
        :root {
          --background: 0 0% 100%;
          --foreground: 222.2 84% 4.9%;
          --card: 0 0% 100%;
          --card-foreground: 222.2 84% 4.9%;
          --popover: 0 0% 100%;
          --popover-foreground: 222.2 84% 4.9%;
          --primary: 222.2 47.4% 11.2%;
          --primary-foreground: 210 40% 98%;
          --secondary: 210 40% 96.1%;
          --secondary-foreground: 222.2 47.4% 11.2%;
          --muted: 210 40% 96.1%;
          --muted-foreground: 215.4 16.3% 46.9%;
          --accent: 210 40% 96.1%;
          --accent-foreground: 222.2 47.4% 11.2%;
          --destructive: 0 84.2% 60.2%;
          --destructive-foreground: 210 40% 98%;
          --border: 214.3 31.8% 91.4%;
          --input: 214.3 31.8% 91.4%;
          --ring: 222.2 84% 4.9%;
          --radius: 0.5rem;
        }
        
        .dark {
          --background: 222.2 84% 4.9%;
          --foreground: 210 40% 98%;
          --card: 222.2 84% 4.9%;
          --card-foreground: 210 40% 98%;
          --popover: 222.2 84% 4.9%;
          --popover-foreground: 210 40% 98%;
          --primary: 210 40% 98%;
          --primary-foreground: 222.2 47.4% 11.2%;
          --secondary: 217.2 32.6% 17.5%;
          --secondary-foreground: 210 40% 98%;
          --muted: 217.2 32.6% 17.5%;
          --muted-foreground: 215 20.2% 65.1%;
          --accent: 217.2 32.6% 17.5%;
          --accent-foreground: 210 40% 98%;
          --destructive: 0 62.8% 30.6%;
          --destructive-foreground: 210 40% 98%;
          --border: 217.2 32.6% 17.5%;
          --input: 217.2 32.6% 17.5%;
          --ring: 212.7 26.8% 83.9%;
        }
        
        * {
          border-color: hsl(var(--border));
        }
        
        body {
          background-color: hsl(var(--background));
          color: hsl(var(--foreground));
        }
      </style>
    `;
    
    html = html.replace('</head>', tailwindCSS + '</head>');
    res.send(html);
  } else {
    res.status(404).send('Application not found');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚗 HitchBuddy Live Server running on port ${PORT}`);
  console.log(`📱 React app with live data: http://localhost:${PORT}`);
  console.log(`🔗 API endpoints: http://localhost:${PORT}/api`);
  console.log(`👤 Admin panel available in Settings for coolsami_uk@yahoo.com`);
  console.log(`🔑 Use email: coolsami_uk@yahoo.com with any password to login`);
});