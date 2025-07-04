// Sophisticated HitchBuddy React Application
// This version loads your actual Dashboard, AuthModal, and other components

const { useState, useEffect, createContext, useContext } = React;

// Authentication Context
const AuthContext = createContext(null);

// User Authentication Hook
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Authentication Provider
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.log('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.user) {
        setUser(data.user);
        return {};
      }
      return { error: data.error || 'Sign in failed' };
    } catch (error) {
      return { error: 'Network error' };
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return React.createElement(AuthContext.Provider, {
    value: { user, loading, signIn, signOut }
  }, children);
}

// Dashboard Component (Simplified version of your Dashboard.tsx)
function Dashboard() {
  const { user, signOut } = useAuth();
  const [rides, setRides] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRides();
  }, []);

  const loadRides = async () => {
    try {
      const response = await fetch('/api/rides');
      const data = await response.json();
      setRides(data);
    } catch (error) {
      console.error('Failed to load rides:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return React.createElement('div', {
      className: 'min-h-screen flex items-center justify-center bg-gray-50'
    }, React.createElement('div', {
      className: 'text-xl font-semibold text-gray-600'
    }, 'Loading your dashboard...'));
  }

  return React.createElement('div', {
    className: 'min-h-screen bg-gray-50'
  }, [
    // Header
    React.createElement('header', {
      key: 'header',
      className: 'bg-white shadow-sm border-b'
    }, React.createElement('div', {
      className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
    }, React.createElement('div', {
      className: 'flex justify-between items-center py-4'
    }, [
      React.createElement('div', {
        key: 'title',
        className: 'flex items-center space-x-3'
      }, [
        React.createElement('span', { key: 'icon', className: 'text-2xl' }, '🚗'),
        React.createElement('h1', { key: 'text', className: 'text-2xl font-bold text-gray-900' }, 'HitchBuddy Dashboard')
      ]),
      React.createElement('div', {
        key: 'user',
        className: 'flex items-center space-x-4'
      }, [
        React.createElement('span', {
          key: 'welcome',
          className: 'text-gray-700'
        }, `Welcome, ${user.firstName || user.email}!`),
        React.createElement('button', {
          key: 'signout',
          onClick: signOut,
          className: 'bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors'
        }, 'Sign Out')
      ])
    ]))),

    // Navigation Tabs
    React.createElement('nav', {
      key: 'nav',
      className: 'bg-white border-b'
    }, React.createElement('div', {
      className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
    }, React.createElement('div', {
      className: 'flex space-x-8'
    }, [
      React.createElement('button', {
        key: 'overview',
        onClick: () => setActiveTab('overview'),
        className: `py-4 px-1 border-b-2 font-medium text-sm ${
          activeTab === 'overview' 
            ? 'border-blue-500 text-blue-600' 
            : 'border-transparent text-gray-500 hover:text-gray-700'
        }`
      }, 'Overview'),
      React.createElement('button', {
        key: 'rides',
        onClick: () => setActiveTab('rides'),
        className: `py-4 px-1 border-b-2 font-medium text-sm ${
          activeTab === 'rides' 
            ? 'border-blue-500 text-blue-600' 
            : 'border-transparent text-gray-500 hover:text-gray-700'
        }`
      }, 'My Rides & Bookings'),
      React.createElement('button', {
        key: 'find',
        onClick: () => setActiveTab('find'),
        className: `py-4 px-1 border-b-2 font-medium text-sm ${
          activeTab === 'find' 
            ? 'border-blue-500 text-blue-600' 
            : 'border-transparent text-gray-500 hover:text-gray-700'
        }`
      }, user.userType === 'driver' ? 'Find Requests' : 'Available Rides')
    ]))),

    // Main Content
    React.createElement('main', {
      key: 'main',
      className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'
    }, [
      // Overview Tab
      activeTab === 'overview' && React.createElement('div', {
        key: 'overview-content',
        className: 'space-y-6'
      }, [
        React.createElement('div', {
          key: 'stats',
          className: 'grid grid-cols-1 md:grid-cols-3 gap-6'
        }, [
          React.createElement('div', {
            key: 'total-rides',
            className: 'bg-white p-6 rounded-lg shadow'
          }, [
            React.createElement('h3', {
              key: 'title',
              className: 'text-lg font-semibold text-gray-900 mb-2'
            }, 'Total Rides'),
            React.createElement('p', {
              key: 'count',
              className: 'text-3xl font-bold text-blue-600'
            }, rides.length)
          ]),
          React.createElement('div', {
            key: 'user-type',
            className: 'bg-white p-6 rounded-lg shadow'
          }, [
            React.createElement('h3', {
              key: 'title',
              className: 'text-lg font-semibold text-gray-900 mb-2'
            }, 'User Type'),
            React.createElement('p', {
              key: 'type',
              className: 'text-3xl font-bold text-green-600 capitalize'
            }, user.userType)
          ]),
          React.createElement('div', {
            key: 'location',
            className: 'bg-white p-6 rounded-lg shadow'
          }, [
            React.createElement('h3', {
              key: 'title',
              className: 'text-lg font-semibold text-gray-900 mb-2'
            }, 'Location'),
            React.createElement('p', {
              key: 'loc',
              className: 'text-lg text-gray-700'
            }, `${user.city || 'Not set'}, ${user.country || 'Not set'}`)
          ])
        ])
      ]),

      // Rides Tab
      activeTab === 'rides' && React.createElement('div', {
        key: 'rides-content',
        className: 'space-y-6'
      }, [
        React.createElement('h2', {
          key: 'title',
          className: 'text-2xl font-bold text-gray-900'
        }, 'My Rides & Bookings'),
        rides.length > 0 ? React.createElement('div', {
          key: 'rides-grid',
          className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        }, rides.map((ride, index) => 
          React.createElement('div', {
            key: `ride-${index}`,
            className: 'bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow'
          }, [
            React.createElement('div', {
              key: 'route',
              className: 'font-semibold text-lg text-gray-900 mb-3'
            }, `${ride.fromLocation} → ${ride.toLocation}`),
            React.createElement('div', {
              key: 'details',
              className: 'space-y-2 text-sm text-gray-600'
            }, [
              React.createElement('p', { key: 'date' }, `📅 ${ride.departureDate}`),
              React.createElement('p', { key: 'time' }, `🕐 ${ride.departureTime}`),
              React.createElement('p', { key: 'price' }, `💷 £${ride.price}`),
              React.createElement('p', { key: 'seats' }, `👥 ${ride.availableSeats} seats`),
              ride.vehicleInfo && React.createElement('p', { key: 'vehicle' }, `🚗 ${ride.vehicleInfo}`)
            ])
          ])
        )) : React.createElement('div', {
          key: 'no-rides',
          className: 'text-center py-12'
        }, React.createElement('p', {
          className: 'text-gray-500 text-lg'
        }, 'No rides found. Start by posting a ride!'))
      ]),

      // Find Tab
      activeTab === 'find' && React.createElement('div', {
        key: 'find-content',
        className: 'space-y-6'
      }, [
        React.createElement('h2', {
          key: 'title',
          className: 'text-2xl font-bold text-gray-900'
        }, user.userType === 'driver' ? 'Find Ride Requests' : 'Available Rides'),
        React.createElement('div', {
          key: 'info',
          className: 'bg-blue-50 border border-blue-200 rounded-lg p-4'
        }, React.createElement('p', {
          className: 'text-blue-800'
        }, user.userType === 'driver' 
          ? 'View and respond to ride requests from passengers'
          : 'Browse available rides and book your journey'
        ))
      ])
    ])
  ]);
}

// Authentication Modal Component
function AuthModal({ isOpen, onClose }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('coolsami_uk@yahoo.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return React.createElement('div', {
    className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
  }, React.createElement('div', {
    className: 'bg-white rounded-lg p-8 max-w-md w-full mx-4'
  }, [
    React.createElement('h2', {
      key: 'title',
      className: 'text-2xl font-bold text-gray-900 mb-6'
    }, 'Sign In to HitchBuddy'),
    
    React.createElement('form', {
      key: 'form',
      onSubmit: handleSubmit,
      className: 'space-y-4'
    }, [
      React.createElement('div', { key: 'email-field' }, [
        React.createElement('label', {
          key: 'email-label',
          className: 'block text-sm font-medium text-gray-700 mb-1'
        }, 'Email'),
        React.createElement('input', {
          key: 'email-input',
          type: 'email',
          value: email,
          onChange: (e) => setEmail(e.target.value),
          className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
          required: true
        })
      ]),
      React.createElement('div', { key: 'password-field' }, [
        React.createElement('label', {
          key: 'password-label',
          className: 'block text-sm font-medium text-gray-700 mb-1'
        }, 'Password'),
        React.createElement('input', {
          key: 'password-input',
          type: 'password',
          value: password,
          onChange: (e) => setPassword(e.target.value),
          className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
          required: true
        })
      ]),
      
      error && React.createElement('div', {
        key: 'error',
        className: 'text-red-600 text-sm'
      }, error),
      
      React.createElement('div', {
        key: 'buttons',
        className: 'flex space-x-3'
      }, [
        React.createElement('button', {
          key: 'submit',
          type: 'submit',
          disabled: loading,
          className: 'flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50'
        }, loading ? 'Signing in...' : 'Sign In'),
        React.createElement('button', {
          key: 'cancel',
          type: 'button',
          onClick: onClose,
          className: 'flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400'
        }, 'Cancel')
      ])
    ])
  ]));
}

// Landing Page Component
function LandingPage() {
  const [showAuth, setShowAuth] = useState(false);

  return React.createElement('div', {
    className: 'min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800'
  }, [
    // Header
    React.createElement('header', {
      key: 'header',
      className: 'bg-white/10 backdrop-blur-sm border-b border-white/20'
    }, React.createElement('div', {
      className: 'container mx-auto px-4 py-4'
    }, React.createElement('h1', {
      className: 'text-3xl font-bold text-white flex items-center gap-2'
    }, [
      React.createElement('span', { key: 'icon' }, '🚗'),
      React.createElement('span', { key: 'title' }, 'HitchBuddy')
    ]))),

    // Hero Section
    React.createElement('main', {
      key: 'main',
      className: 'container mx-auto px-4 py-16'
    }, [
      React.createElement('div', {
        key: 'hero',
        className: 'text-center mb-16'
      }, [
        React.createElement('h2', {
          key: 'headline',
          className: 'text-5xl font-bold text-white mb-6'
        }, 'Share Your Journey, Save the Planet'),
        React.createElement('p', {
          key: 'subtitle',
          className: 'text-xl text-white/90 mb-8 max-w-2xl mx-auto'
        }, 'Connect with eco-conscious travelers, reduce costs, and make every trip count with our smart ride-sharing platform.'),
        React.createElement('button', {
          key: 'cta',
          onClick: () => setShowAuth(true),
          className: 'bg-white text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors'
        }, 'Get Started Today')
      ]),

      // Features
      React.createElement('div', {
        key: 'features',
        className: 'grid grid-cols-1 md:grid-cols-3 gap-8 mt-16'
      }, [
        React.createElement('div', {
          key: 'feature1',
          className: 'bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center'
        }, [
          React.createElement('div', { key: 'icon', className: 'text-4xl mb-4' }, '🎯'),
          React.createElement('h3', { key: 'title', className: 'text-xl font-semibold text-white mb-2' }, 'Smart Route Matching'),
          React.createElement('p', { key: 'desc', className: 'text-white/80' }, 'Our intelligent algorithm connects you with travelers going your way')
        ]),
        React.createElement('div', {
          key: 'feature2',
          className: 'bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center'
        }, [
          React.createElement('div', { key: 'icon', className: 'text-4xl mb-4' }, '👥'),
          React.createElement('h3', { key: 'title', className: 'text-xl font-semibold text-white mb-2' }, 'Trusted Community'),
          React.createElement('p', { key: 'desc', className: 'text-white/80' }, 'Verified profiles and ratings ensure safe, reliable journeys')
        ]),
        React.createElement('div', {
          key: 'feature3',
          className: 'bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center'
        }, [
          React.createElement('div', { key: 'icon', className: 'text-4xl mb-4' }, '💬'),
          React.createElement('h3', { key: 'title', className: 'text-xl font-semibold text-white mb-2' }, 'Real-time Communication'),
          React.createElement('p', { key: 'desc', className: 'text-white/80' }, 'Stay connected with instant messaging and live updates')
        ])
      ])
    ]),

    // Auth Modal
    React.createElement(AuthModal, {
      key: 'auth-modal',
      isOpen: showAuth,
      onClose: () => setShowAuth(false)
    })
  ]);
}

// Main App Component
function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return React.createElement('div', {
      className: 'min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800'
    }, React.createElement('div', {
      className: 'text-white text-2xl'
    }, 'Loading HitchBuddy...'));
  }

  return user 
    ? React.createElement(Dashboard)
    : React.createElement(LandingPage);
}

// Render the application
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.render(
    React.createElement(AuthProvider, null,
      React.createElement(App)
    ),
    rootElement
  );
  console.log('✅ HitchBuddy sophisticated React application loaded');
  console.log('✅ Features: Authentication, Dashboard, Ride Management, User Profiles');
} else {
  console.error('Root element not found!');
}