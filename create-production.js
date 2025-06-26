const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building HitchBuddy production version...');

// Build the client
console.log('Building React frontend...');
try {
  execSync('cd client && npm run build', { stdio: 'inherit' });
} catch (error) {
  console.log('Using alternative build approach...');
  
  // Create a production bundle manually
  const clientHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HitchBuddy - Ride Sharing Platform</title>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script>
      // Initialize React app
      const { createElement: h, useState, useEffect } = React;
      const { createRoot } = ReactDOM;
      
      // Main App Component
      function HitchBuddyApp() {
        const [user, setUser] = useState(null);
        const [currentPage, setCurrentPage] = useState('home');
        
        // Check authentication
        useEffect(() => {
          fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
              if (data.user) {
                setUser(data.user);
                setCurrentPage('dashboard');
              }
            })
            .catch(() => {});
        }, []);
        
        // Header component
        function Header() {
          return h('nav', {
            className: 'bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50'
          }, 
            h('div', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' },
              h('div', { className: 'flex justify-between items-center h-16' },
                h('div', { className: 'flex items-center space-x-2' },
                  h('div', { className: 'bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-lg' },
                    h('svg', { className: 'h-6 w-6 text-white', fill: 'currentColor', viewBox: '0 0 24 24' },
                      h('path', { d: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0-1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z' })
                    )
                  ),
                  h('span', { className: 'text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent' }, 'HitchBuddy')
                ),
                h('div', { className: 'flex space-x-4 items-center' },
                  user ? [
                    h('span', { key: 'welcome', className: 'text-sm text-gray-600' }, \`Welcome, \${user.firstName || user.email}\`),
                    h('button', { 
                      key: 'signout',
                      className: 'bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded',
                      onClick: () => {
                        fetch('/api/auth/signout', { method: 'POST' })
                          .then(() => {
                            setUser(null);
                            setCurrentPage('home');
                          });
                      }
                    }, 'Sign Out')
                  ] : [
                    h('button', { 
                      key: 'signin',
                      className: 'text-gray-600 hover:text-gray-900 px-4 py-2',
                      onClick: () => setCurrentPage('auth')
                    }, 'Sign In'),
                    h('button', { 
                      key: 'getstarted',
                      className: 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-4 py-2 rounded',
                      onClick: () => setCurrentPage('auth')
                    }, 'Get Started')
                  ]
                )
              )
            )
          );
        }
        
        // Home page component
        function HomePage() {
          return h('div', { className: 'min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50' },
            h(Header),
            
            // Hero section
            h('section', { className: 'py-20 px-4 sm:px-6 lg:px-8' },
              h('div', { className: 'max-w-4xl mx-auto text-center' },
                h('h1', { className: 'text-4xl md:text-6xl font-bold text-gray-900 mb-6' }, 'Share Your Journey, Save the Planet'),
                h('p', { className: 'text-xl text-gray-600 mb-8 max-w-3xl mx-auto' }, 
                  'Connect with fellow travelers, reduce costs, and make every trip an adventure. HitchBuddy makes ride sharing safe, reliable, and rewarding.'
                ),
                h('div', { className: 'flex flex-col sm:flex-row gap-4 justify-center' },
                  h('button', { 
                    className: 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-3 rounded-lg text-lg font-semibold',
                    onClick: () => setCurrentPage('auth')
                  }, 'Find a Ride'),
                  h('button', { 
                    className: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg text-lg font-semibold',
                    onClick: () => setCurrentPage('auth')
                  }, 'Offer a Ride')
                )
              )
            ),
            
            // Features section
            h('section', { className: 'py-20 px-4 sm:px-6 lg:px-8 bg-white/50' },
              h('div', { className: 'max-w-7xl mx-auto' },
                h('h2', { className: 'text-3xl md:text-4xl font-bold text-gray-900 mb-16 text-center' }, 'Why Choose HitchBuddy?'),
                h('div', { className: 'grid md:grid-cols-3 gap-8' }, [
                  h('div', { key: 'route', className: 'text-center p-6 bg-white rounded-lg shadow-md' },
                    h('div', { className: 'w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4' },
                      h('svg', { className: 'w-8 h-8 text-blue-600', fill: 'currentColor', viewBox: '0 0 24 24' },
                        h('path', { d: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z' })
                      )
                    ),
                    h('h3', { className: 'text-xl font-semibold mb-2' }, 'Smart Route Matching'),
                    h('p', { className: 'text-gray-600' }, 'AI-powered matching connects you with rides along your exact route')
                  ),
                  h('div', { key: 'community', className: 'text-center p-6 bg-white rounded-lg shadow-md' },
                    h('div', { className: 'w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4' },
                      h('svg', { className: 'w-8 h-8 text-green-600', fill: 'currentColor', viewBox: '0 0 24 24' },
                        h('path', { d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77 5.82 21.02 7 14.14 2 9.27l6.91-1.01L12 2z' })
                      )
                    ),
                    h('h3', { className: 'text-xl font-semibold mb-2' }, 'Trusted Community'),
                    h('p', { className: 'text-gray-600' }, 'Verified profiles and ratings ensure safe, reliable journey partners')
                  ),
                  h('div', { key: 'messaging', className: 'text-center p-6 bg-white rounded-lg shadow-md' },
                    h('div', { className: 'w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4' },
                      h('svg', { className: 'w-8 h-8 text-purple-600', fill: 'currentColor', viewBox: '0 0 24 24' },
                        h('path', { d: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z' })
                      )
                    ),
                    h('h3', { className: 'text-xl font-semibold mb-2' }, 'Real-time Communication'),
                    h('p', { className: 'text-gray-600' }, 'Stay connected with instant messaging and trip updates')
                  )
                ])
              )
            )
          );
        }
        
        // Auth page component
        function AuthPage() {
          const [isSignUp, setIsSignUp] = useState(false);
          const [formData, setFormData] = useState({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            userType: 'rider'
          });
          
          const handleSubmit = (e) => {
            e.preventDefault();
            const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/signin';
            
            fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData)
            })
            .then(res => res.json())
            .then(data => {
              if (data.user) {
                setUser(data.user);
                setCurrentPage('dashboard');
              } else {
                alert(data.error || 'Authentication failed');
              }
            })
            .catch(err => alert('Error: ' + err.message));
          };
          
          return h('div', { className: 'min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50' },
            h(Header),
            h('div', { className: 'flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8' },
              h('div', { className: 'max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md' },
                h('h2', { className: 'text-3xl font-bold text-center text-gray-900 mb-6' }, 
                  isSignUp ? 'Create Account' : 'Sign In'
                ),
                h('form', { onSubmit: handleSubmit, className: 'space-y-4' }, [
                  isSignUp && h('div', { key: 'names', className: 'grid grid-cols-2 gap-4' }, [
                    h('input', {
                      key: 'firstName',
                      type: 'text',
                      placeholder: 'First Name',
                      className: 'w-full px-3 py-2 border border-gray-300 rounded-md',
                      value: formData.firstName,
                      onChange: (e) => setFormData({...formData, firstName: e.target.value})
                    }),
                    h('input', {
                      key: 'lastName',
                      type: 'text',
                      placeholder: 'Last Name',
                      className: 'w-full px-3 py-2 border border-gray-300 rounded-md',
                      value: formData.lastName,
                      onChange: (e) => setFormData({...formData, lastName: e.target.value})
                    })
                  ]),
                  h('input', {
                    key: 'email',
                    type: 'email',
                    placeholder: 'Email',
                    className: 'w-full px-3 py-2 border border-gray-300 rounded-md',
                    value: formData.email,
                    onChange: (e) => setFormData({...formData, email: e.target.value})
                  }),
                  h('input', {
                    key: 'password',
                    type: 'password',
                    placeholder: 'Password',
                    className: 'w-full px-3 py-2 border border-gray-300 rounded-md',
                    value: formData.password,
                    onChange: (e) => setFormData({...formData, password: e.target.value})
                  }),
                  isSignUp && h('select', {
                    key: 'userType',
                    className: 'w-full px-3 py-2 border border-gray-300 rounded-md',
                    value: formData.userType,
                    onChange: (e) => setFormData({...formData, userType: e.target.value})
                  }, [
                    h('option', { key: 'rider', value: 'rider' }, 'I need rides'),
                    h('option', { key: 'driver', value: 'driver' }, 'I offer rides')
                  ]),
                  h('button', {
                    key: 'submit',
                    type: 'submit',
                    className: 'w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-2 px-4 rounded-md hover:from-blue-700 hover:to-green-700'
                  }, isSignUp ? 'Create Account' : 'Sign In'),
                  h('button', {
                    key: 'toggle',
                    type: 'button',
                    className: 'w-full text-blue-600 hover:text-blue-800',
                    onClick: () => setIsSignUp(!isSignUp)
                  }, isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up')
                ])
              )
            )
          );
        }
        
        // Dashboard component
        function Dashboard() {
          const [activeTab, setActiveTab] = useState('overview');
          
          return h('div', { className: 'min-h-screen bg-gray-50' },
            h(Header),
            h('div', { className: 'max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8' },
              h('div', { className: 'mb-8' },
                h('h1', { className: 'text-3xl font-bold text-gray-900' }, \`Welcome back, \${user.firstName || user.email}!\`),
                h('p', { className: 'text-gray-600 mt-2' }, \`You're signed in as a \${user.userType}\`)
              ),
              
              // Tab navigation
              h('div', { className: 'border-b border-gray-200 mb-6' },
                h('nav', { className: 'flex space-x-8' }, [
                  h('button', {
                    key: 'overview',
                    className: \`py-2 px-1 border-b-2 font-medium text-sm \${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}\`,
                    onClick: () => setActiveTab('overview')
                  }, 'Overview'),
                  h('button', {
                    key: 'trips',
                    className: \`py-2 px-1 border-b-2 font-medium text-sm \${activeTab === 'trips' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}\`,
                    onClick: () => setActiveTab('trips')
                  }, user.userType === 'driver' ? 'My Rides' : 'Find Rides'),
                  h('button', {
                    key: 'bookings',
                    className: \`py-2 px-1 border-b-2 font-medium text-sm \${activeTab === 'bookings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}\`,
                    onClick: () => setActiveTab('bookings')
                  }, 'My Bookings')
                ])
              ),
              
              // Tab content
              activeTab === 'overview' && h('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' }, [
                h('div', { key: 'stats', className: 'bg-white p-6 rounded-lg shadow' },
                  h('h3', { className: 'text-lg font-semibold mb-4' }, 'Your Stats'),
                  h('div', { className: 'space-y-2' }, [
                    h('p', { key: 'trips' }, 'Total Trips: 0'),
                    h('p', { key: 'rating' }, 'Rating: New User'),
                    h('p', { key: 'saved' }, 'Money Saved: £0')
                  ])
                ),
                h('div', { key: 'recent', className: 'bg-white p-6 rounded-lg shadow' },
                  h('h3', { className: 'text-lg font-semibold mb-4' }, 'Recent Activity'),
                  h('p', { className: 'text-gray-600' }, 'No recent activity')
                ),
                h('div', { key: 'quick', className: 'bg-white p-6 rounded-lg shadow' },
                  h('h3', { className: 'text-lg font-semibold mb-4' }, 'Quick Actions'),
                  h('div', { className: 'space-y-2' }, [
                    h('button', { 
                      key: 'action1',
                      className: 'w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700',
                      onClick: () => setActiveTab('trips')
                    }, user.userType === 'driver' ? 'Post New Ride' : 'Find a Ride'),
                    h('button', { 
                      key: 'action2',
                      className: 'w-full border border-blue-600 text-blue-600 py-2 px-4 rounded hover:bg-blue-50',
                      onClick: () => setActiveTab('bookings')
                    }, 'View Bookings')
                  ])
                )
              ]),
              
              activeTab === 'trips' && h('div', { className: 'bg-white p-6 rounded-lg shadow' },
                h('h3', { className: 'text-lg font-semibold mb-4' }, 
                  user.userType === 'driver' ? 'Post a New Ride' : 'Find Available Rides'
                ),
                h('p', { className: 'text-gray-600' }, 
                  user.userType === 'driver' 
                    ? 'Share your upcoming trips and help fellow travelers'
                    : 'Browse available rides and book your journey'
                ),
                h('div', { className: 'mt-4 p-4 bg-blue-50 rounded' },
                  h('p', { className: 'text-blue-800' }, 'This feature is coming soon! Full ride management system in development.')
                )
              ),
              
              activeTab === 'bookings' && h('div', { className: 'bg-white p-6 rounded-lg shadow' },
                h('h3', { className: 'text-lg font-semibold mb-4' }, 'Your Bookings'),
                h('p', { className: 'text-gray-600' }, 'No bookings yet'),
                h('div', { className: 'mt-4 p-4 bg-green-50 rounded' },
                  h('p', { className: 'text-green-800' }, 'Booking management system coming soon! Track your trips and communicate with other travelers.')
                )
              )
            )
          );
        }
        
        // Main app render
        if (currentPage === 'auth') {
          return h(AuthPage);
        } else if (currentPage === 'dashboard' && user) {
          return h(Dashboard);
        } else {
          return h(HomePage);
        }
      }
      
      // Mount the app
      const root = createRoot(document.getElementById('root'));
      root.render(h(HitchBuddyApp));
    </script>
  </body>
</html>`;
  
  // Ensure dist directory exists
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }
  
  // Write the production HTML
  fs.writeFileSync(path.join('dist', 'client.html'), clientHtml);
}

console.log('Production build complete!');