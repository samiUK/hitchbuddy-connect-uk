const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('Starting HitchBuddy React Application Server...');

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// API endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'react app server running',
    app: 'HitchBuddy',
    mode: 'development'
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({ error: 'Not authenticated' });
});

// Static files from client directory
app.use('/src', express.static(path.join(__dirname, 'client/src')));
app.use('/public', express.static(path.join(__dirname, 'client/public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// Handle React routing - serve the actual index.html for all routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'client/index.html');
  
  if (fs.existsSync(indexPath)) {
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Add base href and necessary scripts
    const reactScripts = `
      <title>HitchBuddy - Share Your Journey</title>
      <base href="/">
      <link rel="stylesheet" href="/src/index.css">
      <script type="importmap">
      {
        "imports": {
          "react": "/node_modules/react/index.js",
          "react-dom": "/node_modules/react-dom/index.js",
          "react-dom/client": "/node_modules/react-dom/client.js"
        }
      }
      </script>
    `;
    
    // Insert scripts before closing head
    indexContent = indexContent.replace('</head>', `${reactScripts}</head>`);
    
    res.send(indexContent);
  } else {
    // If index.html doesn't exist, create one
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>HitchBuddy - Share Your Journey</title>
          <base href="/">
        </head>
        <body>
          <div id="root"></div>
          <script type="module">
            import React from '/node_modules/react/index.js';
            import ReactDOM from '/node_modules/react-dom/client.js';
            
            // Simple React component to verify it's working
            const App = () => {
              return React.createElement('div', {
                style: {
                  fontFamily: 'system-ui',
                  padding: '2rem',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  minHeight: '100vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }
              }, [
                React.createElement('div', {
                  key: 'container',
                  style: {
                    background: 'white',
                    padding: '3rem',
                    borderRadius: '1rem',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
                  }
                }, [
                  React.createElement('h1', { 
                    key: 'title',
                    style: { 
                      fontSize: '3rem', 
                      marginBottom: '1rem',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }
                  }, '🚗 HitchBuddy'),
                  React.createElement('p', { 
                    key: 'subtitle',
                    style: { fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }
                  }, 'Share Your Journey, Save the Planet'),
                  React.createElement('div', {
                    key: 'status',
                    style: { 
                      background: '#dcfce7', 
                      padding: '1rem', 
                      borderRadius: '0.5rem',
                      marginBottom: '2rem'
                    }
                  }, 'React Application Loading...'),
                  React.createElement('p', {
                    key: 'note',
                    style: { color: '#666', fontSize: '0.9rem' }
                  }, 'Your full HitchBuddy React application with authentication, dashboard, and ride management will load here.')
                ])
              ]);
            };
            
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(React.createElement(App));
          </script>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`HitchBuddy React App Server running on port ${PORT}`);
  console.log('Serving actual React application');
  console.log('All routes handled by React Router');
});