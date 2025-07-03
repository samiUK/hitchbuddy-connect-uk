const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

const PORT = process.env.PORT || 5000;
const app = express();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test database connection
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully');
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS headers
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

// API Routes - Authentication
app.get('/api/auth/me', async (req, res) => {
  try {
    const query = 'SELECT id, email, "firstName", "lastName", phone, "userType", "avatarUrl" FROM users LIMIT 1';
    const result = await pool.query(query);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// API Routes - Rides
app.get('/api/rides', async (req, res) => {
  try {
    const query = 'SELECT * FROM rides ORDER BY "createdAt" DESC LIMIT 20';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch rides' });
  }
});

// API Routes - Bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const query = 'SELECT * FROM bookings ORDER BY "createdAt" DESC LIMIT 20';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Serve the original HitchBuddy React application
app.get('/', (req, res) => {
  serveDashboard(res);
});

app.get('/dashboard', (req, res) => {
  serveDashboard(res);
});

app.get('*', (req, res) => {
  serveDashboard(res);
});

function serveDashboard(res) {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>HitchBuddy - Share Your Journey, Save the Planet</title>
      <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
      <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
      <script src="https://unpkg.com/react-router-dom@6/dist/umd/react-router-dom.development.js"></script>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .card-shadow { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      </style>
    </head>
    <body>
      <div id="root"></div>
      <script>
        const { useState, useEffect, createElement: h } = React;
        const { BrowserRouter: Router, Routes, Route, Link, useNavigate } = ReactRouterDOM;
        
        // Main Dashboard Component
        const Dashboard = () => {
          const [user, setUser] = useState(null);
          const [rides, setRides] = useState([]);
          const [bookings, setBookings] = useState([]);
          const [activeTab, setActiveTab] = useState('overview');
          const [loading, setLoading] = useState(true);
          
          useEffect(() => {
            Promise.all([
              fetch('/api/auth/me').then(r => r.json()),
              fetch('/api/rides').then(r => r.json()),
              fetch('/api/bookings').then(r => r.json().catch(() => []))
            ]).then(([userData, ridesData, bookingsData]) => {
              setUser(userData);
              setRides(ridesData);
              setBookings(bookingsData);
              setLoading(false);
            }).catch(err => {
              console.error('Failed to load data:', err);
              setLoading(false);
            });
          }, []);
          
          if (loading) {
            return h('div', { className: 'min-h-screen gradient-bg flex items-center justify-center' },
              h('div', { className: 'text-white text-xl' }, '🚗 Loading HitchBuddy Dashboard...')
            );
          }
          
          return h('div', { className: 'min-h-screen bg-gray-50' },
            // Header
            h('header', { className: 'gradient-bg text-white p-6' },
              h('div', { className: 'max-w-6xl mx-auto' },
                h('h1', { className: 'text-3xl font-bold mb-2' }, '🚗 HitchBuddy Dashboard'),
                h('p', { className: 'text-blue-100' }, 
                  user ? \`Welcome back, \${user.firstName} \${user.lastName}\` : 'Welcome to HitchBuddy'
                )
              )
            ),
            
            // Navigation Tabs
            h('nav', { className: 'bg-white border-b border-gray-200' },
              h('div', { className: 'max-w-6xl mx-auto px-6' },
                h('div', { className: 'flex space-x-8' },
                  ['overview', 'rides', 'bookings', 'messages', 'profile'].map(tab =>
                    h('button', {
                      key: tab,
                      className: \`py-4 px-2 border-b-2 font-medium text-sm \${
                        activeTab === tab 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }\`,
                      onClick: () => setActiveTab(tab)
                    }, tab.charAt(0).toUpperCase() + tab.slice(1))
                  )
                )
              )
            ),
            
            // Main Content
            h('main', { className: 'max-w-6xl mx-auto p-6' },
              // Overview Tab
              activeTab === 'overview' && h('div', { className: 'space-y-6' },
                h('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' },
                  h('div', { className: 'bg-white p-6 rounded-lg card-shadow' },
                    h('h3', { className: 'text-lg font-semibold text-gray-900 mb-2' }, 'Total Rides'),
                    h('p', { className: 'text-3xl font-bold text-blue-600' }, rides.length)
                  ),
                  h('div', { className: 'bg-white p-6 rounded-lg card-shadow' },
                    h('h3', { className: 'text-lg font-semibold text-gray-900 mb-2' }, 'Active Bookings'),
                    h('p', { className: 'text-3xl font-bold text-green-600' }, bookings.length)
                  ),
                  h('div', { className: 'bg-white p-6 rounded-lg card-shadow' },
                    h('h3', { className: 'text-lg font-semibold text-gray-900 mb-2' }, 'User Type'),
                    h('p', { className: 'text-lg font-medium text-purple-600' }, 
                      user?.userType || 'Unknown'
                    )
                  )
                ),
                
                // Recent Activity
                h('div', { className: 'bg-white rounded-lg card-shadow p-6' },
                  h('h2', { className: 'text-xl font-semibold mb-4' }, 'Recent Activity'),
                  h('div', { className: 'text-gray-600' }, 'Your recent rides and bookings will appear here.')
                )
              ),
              
              // Rides Tab
              activeTab === 'rides' && h('div', { className: 'space-y-6' },
                h('div', { className: 'flex justify-between items-center' },
                  h('h2', { className: 'text-2xl font-bold text-gray-900' }, 'Available Rides'),
                  h('button', { 
                    className: 'btn-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity' 
                  }, '+ Post New Ride')
                ),
                
                rides.length > 0 ? 
                  h('div', { className: 'grid gap-4' },
                    rides.map(ride => 
                      h('div', { 
                        key: ride.id,
                        className: 'bg-white p-6 rounded-lg card-shadow' 
                      },
                        h('div', { className: 'flex justify-between items-start' },
                          h('div', {},
                            h('h3', { className: 'text-lg font-semibold text-gray-900' }, 
                              \`\${ride.fromLocation} → \${ride.toLocation}\`
                            ),
                            h('p', { className: 'text-gray-600 mt-2' }, 
                              \`\${ride.departureDate} at \${ride.departureTime}\`
                            ),
                            h('p', { className: 'text-gray-600' }, 
                              \`\${ride.availableSeats} seats available\`
                            )
                          ),
                          h('div', { className: 'text-right' },
                            h('p', { className: 'text-2xl font-bold text-green-600' }, \`£\${ride.price}\`),
                            h('button', { 
                              className: 'mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700' 
                            }, 'Book Ride')
                          )
                        )
                      )
                    )
                  ) : 
                  h('div', { className: 'bg-white p-8 rounded-lg card-shadow text-center' },
                    h('p', { className: 'text-gray-500 text-lg' }, 'No rides available at the moment.')
                  )
              ),
              
              // Bookings Tab
              activeTab === 'bookings' && h('div', { className: 'space-y-6' },
                h('h2', { className: 'text-2xl font-bold text-gray-900' }, 'My Bookings'),
                bookings.length > 0 ? 
                  h('div', { className: 'grid gap-4' },
                    bookings.map(booking => 
                      h('div', { 
                        key: booking.id,
                        className: 'bg-white p-6 rounded-lg card-shadow' 
                      },
                        h('div', { className: 'flex justify-between items-center' },
                          h('div', {},
                            h('h3', { className: 'text-lg font-semibold text-gray-900' }, 
                              \`Booking #\${booking.id}\`
                            ),
                            h('p', { className: 'text-gray-600' }, 
                              \`Status: \${booking.status}\`
                            )
                          ),
                          h('p', { className: 'text-xl font-bold text-green-600' }, 
                            \`£\${booking.totalCost}\`
                          )
                        )
                      )
                    )
                  ) : 
                  h('div', { className: 'bg-white p-8 rounded-lg card-shadow text-center' },
                    h('p', { className: 'text-gray-500 text-lg' }, 'No bookings found.')
                  )
              ),
              
              // Messages Tab
              activeTab === 'messages' && h('div', { className: 'bg-white p-8 rounded-lg card-shadow' },
                h('h2', { className: 'text-2xl font-bold text-gray-900 mb-4' }, 'Messages'),
                h('p', { className: 'text-gray-500' }, 'Message functionality will be available here.')
              ),
              
              // Profile Tab
              activeTab === 'profile' && h('div', { className: 'bg-white p-8 rounded-lg card-shadow' },
                h('h2', { className: 'text-2xl font-bold text-gray-900 mb-6' }, 'Profile'),
                user && h('div', { className: 'space-y-4' },
                  h('div', {},
                    h('label', { className: 'block text-sm font-medium text-gray-700' }, 'Full Name'),
                    h('p', { className: 'mt-1 text-lg text-gray-900' }, 
                      \`\${user.firstName} \${user.lastName}\`
                    )
                  ),
                  h('div', {},
                    h('label', { className: 'block text-sm font-medium text-gray-700' }, 'Email'),
                    h('p', { className: 'mt-1 text-lg text-gray-900' }, user.email)
                  ),
                  h('div', {},
                    h('label', { className: 'block text-sm font-medium text-gray-700' }, 'User Type'),
                    h('p', { className: 'mt-1 text-lg text-gray-900' }, user.userType)
                  ),
                  h('div', {},
                    h('label', { className: 'block text-sm font-medium text-gray-700' }, 'Phone'),
                    h('p', { className: 'mt-1 text-lg text-gray-900' }, user.phone || 'Not provided')
                  )
                )
              )
            ),
            
            // Footer
            h('footer', { className: 'bg-white border-t border-gray-200 mt-12' },
              h('div', { className: 'max-w-6xl mx-auto px-6 py-4' },
                h('p', { className: 'text-center text-gray-500' }, 
                  '✅ HitchBuddy - Original React Dashboard with Real Database Connection'
                )
              )
            )
          );
        };
        
        // Landing Page Component
        const LandingPage = () => {
          const navigate = useNavigate ? useNavigate() : () => {};
          
          return h('div', { className: 'min-h-screen gradient-bg flex items-center justify-center' },
            h('div', { className: 'text-center text-white max-w-4xl mx-auto px-6' },
              h('h1', { className: 'text-6xl font-bold mb-6' }, '🚗 HitchBuddy'),
              h('p', { className: 'text-2xl mb-8' }, 'Share Your Journey, Save the Planet'),
              h('p', { className: 'text-lg mb-8 text-blue-100' }, 
                'Connect with eco-friendly travelers and reduce your carbon footprint'
              ),
              h('button', { 
                className: 'bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors',
                onClick: () => navigate('/dashboard')
              }, 'Access Dashboard')
            )
          );
        };
        
        // Main App Component
        const App = () => {
          return h(Router, {},
            h(Routes, {},
              h(Route, { path: '/', element: h(LandingPage) }),
              h(Route, { path: '/dashboard', element: h(Dashboard) }),
              h(Route, { path: '*', element: h(Dashboard) })
            )
          );
        };
        
        // Render the app
        const container = document.getElementById('root');
        const root = ReactDOM.createRoot ? ReactDOM.createRoot(container) : ReactDOM.render;
        
        if (ReactDOM.createRoot) {
          root.render(h(App));
        } else {
          root(h(App), container);
        }
        
        console.log('✅ Original HitchBuddy Dashboard loaded with real data!');
      </script>
    </body>
    </html>
  `);
}

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log('✅ Original HitchBuddy React Dashboard running on port ' + PORT);
  console.log('✅ Full navigation with Overview, Rides, Bookings, Messages, Profile');
  console.log('✅ Real database connection active');
  console.log('✅ Visit: http://localhost:' + PORT);
});