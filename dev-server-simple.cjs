console.log('🚗 Starting HitchBuddy Development Server...');

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: 'HitchBuddy',
    mode: 'development',
    port: PORT,
    message: 'Development server running successfully'
  });
});

// Serve the React app
app.get('*', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>HitchBuddy - Development Server</title>
      <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
      <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>
      <div id="root"></div>
      <script>
        console.log('HitchBuddy Development Server loaded successfully');
        
        const { useState, useEffect, createElement: h } = React;
        
        const App = () => {
          return h('div', {
            className: 'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8'
          }, 
            h('div', { className: 'max-w-4xl mx-auto' },
              h('div', { className: 'bg-white rounded-lg shadow-xl p-8 text-center' },
                h('h1', { className: 'text-4xl font-bold text-gray-900 mb-4' }, 'HitchBuddy'),
                h('p', { className: 'text-xl text-gray-600 mb-8' }, 'Share Your Journey, Save the Planet'),
                h('div', { className: 'bg-green-50 border border-green-200 rounded-lg p-6 mb-6' },
                  h('h3', { className: 'font-semibold text-green-900 mb-2' }, '✅ Development Server Running'),
                  h('p', { className: 'text-green-700' }, 'HitchBuddy development server is now working correctly!')
                ),
                h('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' },
                  h('div', { className: 'bg-blue-50 p-6 rounded-lg' },
                    h('h3', { className: 'font-semibold text-blue-900 mb-2' }, 'Smart Matching'),
                    h('p', { className: 'text-blue-700' }, 'AI-powered route optimization')
                  ),
                  h('div', { className: 'bg-green-50 p-6 rounded-lg' },
                    h('h3', { className: 'font-semibold text-green-900 mb-2' }, 'Eco-Friendly'),
                    h('p', { className: 'text-green-700' }, 'Reduce carbon footprint')
                  ),
                  h('div', { className: 'bg-purple-50 p-6 rounded-lg' },
                    h('h3', { className: 'font-semibold text-purple-900 mb-2' }, 'Community'),
                    h('p', { className: 'text-purple-700' }, 'Connect with travelers')
                  )
                )
              )
            )
          );
        };
        
        ReactDOM.render(React.createElement(App), document.getElementById('root'));
      </script>
    </body>
    </html>
  `);
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[dev-server] HitchBuddy running on port ${PORT}`);
  console.log(`[dev-server] Visit: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down development server...');
  server.close(() => {
    process.exit(0);
  });
});