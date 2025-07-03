const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS for development
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

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'HitchBuddy Live React Server', 
    mode: 'development',
    tailwind: 'active',
    features: ['Live React', 'Tailwind CSS', 'Hot Reload']
  });
});

// API endpoints for development
app.get('/api/auth/me', (req, res) => {
  res.json({ error: 'Not authenticated' });
});

app.post('/api/auth/signin', (req, res) => {
  res.json({ message: 'Development mode - authentication bypassed' });
});

app.post('/api/auth/signup', (req, res) => {
  res.json({ message: 'Development mode - registration bypassed' });
});

app.get('/api/rides', (req, res) => {
  res.json([]);
});

app.get('/api/bookings', (req, res) => {
  res.json({ bookings: [] });
});

// Serve client HTML with live script injection
app.get('/', (req, res) => {
  const clientIndexPath = path.join(__dirname, 'client/index.html');
  
  if (fs.existsSync(clientIndexPath)) {
    let html = fs.readFileSync(clientIndexPath, 'utf-8');
    
    // Inject Tailwind CSS directly
    const tailwindCSS = `
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        tailwind.config = {
          theme: {
            extend: {
              colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                card: "hsl(var(--card))",
                "card-foreground": "hsl(var(--card-foreground))",
                popover: "hsl(var(--popover))",
                "popover-foreground": "hsl(var(--popover-foreground))",
                primary: "hsl(var(--primary))",
                "primary-foreground": "hsl(var(--primary-foreground))",
                secondary: "hsl(var(--secondary))",
                "secondary-foreground": "hsl(var(--secondary-foreground))",
                muted: "hsl(var(--muted))",
                "muted-foreground": "hsl(var(--muted-foreground))",
                accent: "hsl(var(--accent))",
                "accent-foreground": "hsl(var(--accent-foreground))",
                destructive: "hsl(var(--destructive))",
                "destructive-foreground": "hsl(var(--destructive-foreground))",
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
              },
            },
          },
        }
      </script>
      <style>
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
    
    // Insert before closing head tag
    html = html.replace('</head>', tailwindCSS + '</head>');
    
    res.send(html);
  } else {
    res.status(404).send('Client index.html not found');
  }
});

// Set proper MIME types for module files
app.use('/src', (req, res, next) => {
  if (req.path.endsWith('.tsx') || req.path.endsWith('.ts')) {
    res.setHeader('Content-Type', 'application/javascript');
  } else if (req.path.endsWith('.jsx')) {
    res.setHeader('Content-Type', 'application/javascript');
  }
  next();
}, express.static(path.join(__dirname, 'client/src')));

app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, 'client/public')));

// Catch all routes for SPA
app.get('*', (req, res) => {
  const clientIndexPath = path.join(__dirname, 'client/index.html');
  
  if (fs.existsSync(clientIndexPath)) {
    let html = fs.readFileSync(clientIndexPath, 'utf-8');
    
    // Inject Tailwind CSS directly for all routes
    const tailwindCSS = `
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
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
    res.status(404).send('Client index.html not found');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚗 HitchBuddy Live React Server running on port ${PORT}`);
  console.log('✅ Tailwind CSS styling active');
  console.log('✅ React components with proper styling');
  console.log('✅ Development mode with hot reloading');
  console.log(`📱 Access your app at http://localhost:${PORT}`);
});