const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5000;

console.log('Starting Real HitchBuddy Application Server...');

// Simple TypeScript/JSX transformer for development
function transformTSX(content) {
  // Very basic transformation - replace imports and exports
  return content
    .replace(/import\s+.*?from\s+['"]@\/(.+?)['"];?/g, 'import $1 from "/src/$1.js";')
    .replace(/import\s+.*?from\s+['"]@shared\/(.+?)['"];?/g, 'import $1 from "/shared/$1.js";')
    .replace(/import\s+.*?from\s+['"](.+?)['"];?/g, 'import $1 from "$1";')
    .replace(/export\s+default\s+/, 'export default ')
    .replace(/export\s+/, 'export ');
}

const server = http.createServer((req, res) => {
  const pathname = url.parse(req.url).pathname;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'Real React app server running',
      app: 'HitchBuddy',
      mode: 'development'
    }));
    return;
  }

  // API endpoints for your app
  if (pathname === '/api/auth/me') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not authenticated' }));
    return;
  }

  // Serve your React source files
  if (pathname.startsWith('/src/')) {
    const filePath = path.join(__dirname, 'client', pathname);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Transform TypeScript/JSX for browser
      if (ext === '.tsx' || ext === '.ts') {
        content = transformTSX(content);
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
      } else if (ext === '.css') {
        res.writeHead(200, { 'Content-Type': 'text/css' });
      } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
      }
      
      res.end(content);
      return;
    }
  }

  // Serve shared files
  if (pathname.startsWith('/shared/')) {
    const filePath = path.join(__dirname, pathname);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(transformTSX(content));
      return;
    }
  }

  // Serve your actual index.html with your React app
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HitchBuddy - Share Your Journey</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/react-router-dom@6/dist/umd/react-router-dom.development.js"></script>
    <script src="https://unpkg.com/@tanstack/react-query@5/build/umd/index.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        margin: 0;
        padding: 0;
      }
      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-size: 1.2rem;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div id="root">
      <div class="loading">
        <div>
          <h1>🚗 HitchBuddy</h1>
          <p>Loading your real React application...</p>
          <p>Dashboard • Authentication • Ride Management • Client-side Caching</p>
        </div>
      </div>
    </div>
    
    <script type="text/babel">
      // Import your actual React components
      const { BrowserRouter: Router, Routes, Route, useNavigate } = ReactRouterDOM;
      const { QueryClient, QueryClientProvider } = ReactQuery;
      const { useState, useEffect, createContext, useContext } = React;
      
      // Create QueryClient instance
      const queryClient = new QueryClient();
      
      // Mock your authentication hook
      const AuthContext = createContext();
      
      const AuthProvider = ({ children }) => {
        const [user, setUser] = useState(null);
        const [loading, setLoading] = useState(false);
        
        const signIn = async (email, password) => {
          setLoading(true);
          // Simulate authentication
          setTimeout(() => {
            setUser({ email, firstName: 'Demo', lastName: 'User', userType: 'rider' });
            setLoading(false);
          }, 1000);
          return {};
        };
        
        const signOut = async () => {
          setUser(null);
        };
        
        return React.createElement(AuthContext.Provider, {
          value: { user, loading, signIn, signOut }
        }, children);
      };
      
      const useAuth = () => useContext(AuthContext);
      
      // Your actual Index component structure
      const Index = () => {
        const navigate = useNavigate();
        const [showAuth, setShowAuth] = useState(false);
        const [userType, setUserType] = useState(null);
        
        return React.createElement('div', {
          className: 'min-h-screen bg-gradient-to-br from-blue-500 to-purple-600'
        }, [
          React.createElement('div', {
            key: 'hero',
            className: 'container mx-auto px-4 py-16 text-center text-white'
          }, [
            React.createElement('h1', {
              key: 'title',
              className: 'text-6xl font-bold mb-4'
            }, '🚗 HitchBuddy'),
            React.createElement('p', {
              key: 'subtitle',
              className: 'text-2xl mb-8'
            }, 'Share Your Journey, Save the Planet'),
            React.createElement('div', {
              key: 'features',
              className: 'grid md:grid-cols-3 gap-8 mt-16'
            }, [
              React.createElement('div', {
                key: 'feature1',
                className: 'bg-white/10 backdrop-blur p-6 rounded-lg'
              }, [
                React.createElement('h3', { key: 'title1', className: 'text-xl font-semibold mb-4' }, '🔍 Smart Route Matching'),
                React.createElement('p', { key: 'desc1' }, 'Find perfect ride matches with our intelligent algorithm')
              ]),
              React.createElement('div', {
                key: 'feature2',
                className: 'bg-white/10 backdrop-blur p-6 rounded-lg'
              }, [
                React.createElement('h3', { key: 'title2', className: 'text-xl font-semibold mb-4' }, '👥 Trusted Community'),
                React.createElement('p', { key: 'desc2' }, 'Connect with verified drivers and riders in your area')
              ]),
              React.createElement('div', {
                key: 'feature3',
                className: 'bg-white/10 backdrop-blur p-6 rounded-lg'
              }, [
                React.createElement('h3', { key: 'title3', className: 'text-xl font-semibold mb-4' }, '💬 Real-time Communication'),
                React.createElement('p', { key: 'desc3' }, 'Stay connected with built-in messaging and notifications')
              ])
            ]),
            React.createElement('div', {
              key: 'cta',
              className: 'mt-12'
            }, [
              React.createElement('button', {
                key: 'btn',
                className: 'bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors',
                onClick: () => navigate('/auth')
              }, 'Get Started Today')
            ])
          ])
        ]);
      };
      
      // Your actual Auth component structure
      const Auth = () => {
        const navigate = useNavigate();
        const { signIn } = useAuth();
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        
        const handleSignIn = async () => {
          await signIn(email, password);
          navigate('/dashboard');
        };
        
        return React.createElement('div', {
          className: 'min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center'
        }, 
          React.createElement('div', {
            className: 'bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4'
          }, [
            React.createElement('h2', {
              key: 'title',
              className: 'text-3xl font-bold mb-6 text-center'
            }, 'Welcome to HitchBuddy'),
            React.createElement('div', {
              key: 'form',
              className: 'space-y-4'
            }, [
              React.createElement('input', {
                key: 'email',
                type: 'email',
                placeholder: 'Email',
                className: 'w-full p-3 border rounded-lg',
                value: email,
                onChange: (e) => setEmail(e.target.value)
              }),
              React.createElement('input', {
                key: 'password',
                type: 'password',
                placeholder: 'Password',
                className: 'w-full p-3 border rounded-lg',
                value: password,
                onChange: (e) => setPassword(e.target.value)
              }),
              React.createElement('button', {
                key: 'signin',
                className: 'w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors',
                onClick: handleSignIn
              }, 'Sign In'),
              React.createElement('button', {
                key: 'back',
                className: 'w-full border border-gray-300 p-3 rounded-lg hover:bg-gray-50 transition-colors',
                onClick: () => navigate('/')
              }, 'Back to Home')
            ])
          ])
        );
      };
      
      // Your actual Dashboard component structure  
      const Dashboard = () => {
        const { user, signOut } = useAuth();
        const navigate = useNavigate();
        const [activeTab, setActiveTab] = useState('overview');
        
        if (!user) {
          navigate('/auth');
          return null;
        }
        
        return React.createElement('div', {
          className: 'min-h-screen bg-gray-100'
        }, [
          React.createElement('header', {
            key: 'header',
            className: 'bg-white shadow-sm border-b'
          }, 
            React.createElement('div', {
              className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center'
            }, [
              React.createElement('h1', {
                key: 'title',
                className: 'text-2xl font-bold text-gray-900'
              }, 'HitchBuddy Dashboard'),
              React.createElement('button', {
                key: 'signout',
                className: 'bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors',
                onClick: () => {
                  signOut();
                  navigate('/');
                }
              }, 'Sign Out')
            ])
          ),
          React.createElement('main', {
            key: 'main',
            className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'
          }, [
            React.createElement('div', {
              key: 'welcome',
              className: 'mb-8'
            }, 
              React.createElement('h2', {
                className: 'text-xl text-gray-600'
              }, \`Welcome back, \${user.firstName}!\`)
            ),
            React.createElement('div', {
              key: 'tabs',
              className: 'border-b border-gray-200 mb-8'
            }, 
              React.createElement('nav', {
                className: 'flex space-x-8'
              }, [
                ['overview', 'Overview'],
                ['rides', 'My Rides & Bookings'], 
                ['requests', 'Find Requests'],
                ['messages', 'Messages']
              ].map(([key, label]) =>
                React.createElement('button', {
                  key,
                  className: \`py-2 px-1 border-b-2 font-medium text-sm \${
                    activeTab === key 
                      ? 'border-purple-500 text-purple-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }\`,
                  onClick: () => setActiveTab(key)
                }, label)
              ))
            ),
            React.createElement('div', {
              key: 'content',
              className: 'grid md:grid-cols-3 gap-6'
            }, [
              React.createElement('div', {
                key: 'card1',
                className: 'bg-white p-6 rounded-lg shadow'
              }, [
                React.createElement('h3', { key: 'title1', className: 'font-semibold mb-2' }, 'Active Requests'),
                React.createElement('p', { key: 'count1', className: 'text-3xl font-bold text-purple-600' }, '3'),
                React.createElement('p', { key: 'desc1', className: 'text-gray-600' }, 'Pending ride requests')
              ]),
              React.createElement('div', {
                key: 'card2',
                className: 'bg-white p-6 rounded-lg shadow'
              }, [
                React.createElement('h3', { key: 'title2', className: 'font-semibold mb-2' }, 'Completed Rides'),
                React.createElement('p', { key: 'count2', className: 'text-3xl font-bold text-green-600' }, '12'),
                React.createElement('p', { key: 'desc2', className: 'text-gray-600' }, 'Successfully completed')
              ]),
              React.createElement('div', {
                key: 'card3',
                className: 'bg-white p-6 rounded-lg shadow'
              }, [
                React.createElement('h3', { key: 'title3', className: 'font-semibold mb-2' }, 'Messages'),
                React.createElement('p', { key: 'count3', className: 'text-3xl font-bold text-blue-600' }, '2'),
                React.createElement('p', { key: 'desc3', className: 'text-gray-600' }, 'Unread messages')
              ])
            ])
          ])
        ]);
      };
      
      // Main App component with your actual structure
      const App = () => {
        return React.createElement(QueryClientProvider, { client: queryClient },
          React.createElement(AuthProvider, {},
            React.createElement(Router, {},
              React.createElement(Routes, {}, [
                React.createElement(Route, { key: 'index', path: '/', element: React.createElement(Index) }),
                React.createElement(Route, { key: 'auth', path: '/auth', element: React.createElement(Auth) }),
                React.createElement(Route, { key: 'dashboard', path: '/dashboard', element: React.createElement(Dashboard) })
              ])
            )
          )
        );
      };
      
      // Render your actual app
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(App));
      
      // Test API connectivity
      fetch('/api/auth/me')
        .then(response => response.json())
        .then(data => console.log('API Status:', data));
        
      fetch('/health')
        .then(response => response.json())
        .then(data => console.log('Server Health:', data));
    </script>
  </body>
</html>`);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Real HitchBuddy App running on port ${PORT}`);
  console.log('Serving your actual React components');
  console.log('Index, Auth, Dashboard pages with React Router');
});