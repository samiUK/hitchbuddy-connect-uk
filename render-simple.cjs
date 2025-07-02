const express = require("express");
const path = require('path');
const { existsSync } = require('fs');

const app = express();
const PORT = parseInt(process.env.PORT || '10000', 10);

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS for production
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
  res.json({ status: 'ok', app: 'HitchBuddy', timestamp: new Date().toISOString() });
});

// Find and serve React build files
const possibleDirs = [
  path.join(__dirname, 'dist'),
  path.join(__dirname, 'dist/public'),  
  path.join(__dirname, 'client/dist'),
  path.join(__dirname, 'build'),
  path.join(__dirname, 'public')
];

let staticDir = null;
for (const dir of possibleDirs) {
  if (existsSync(dir) && existsSync(path.join(dir, 'index.html'))) {
    staticDir = dir;
    console.log(`[server] Found React app at: ${dir}`);
    break;
  }
}

if (staticDir) {
  // Serve static files
  app.use(express.static(staticDir));
  
  // Catch all handler: send back React's index.html file
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
  });
} else {
  // Fallback if no React build found
  app.get('*', (req, res) => {
    res.send(`
      <html>
        <head>
          <title>HitchBuddy</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { max-width: 400px; margin: 0 auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>HitchBuddy</h1>
            <p>React build not found</p>
            <p>Checked directories:</p>
            <ul>
              ${possibleDirs.map(dir => `<li>${dir}: ${existsSync(dir) ? 'exists' : 'not found'}</li>`).join('')}
            </ul>
          </div>
        </body>
      </html>
    `);
  });
}

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[server] HitchBuddy running on port ${PORT}`);
  console.log(`[server] Static files directory: ${staticDir || 'none found'}`);
});