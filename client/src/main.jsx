// Simple React entry point that works with CDN
const React = window.React;
const ReactDOM = window.ReactDOM;

function App() {
  return React.createElement(
    'div',
    { className: 'min-h-screen bg-gray-100 p-8' },
    React.createElement(
      'div',
      { className: 'max-w-4xl mx-auto' },
      React.createElement(
        'h1',
        { className: 'text-4xl font-bold text-center mb-8 text-gray-800' },
        'HitchBuddy - Share Your Journey, Save the Planet'
      ),
      React.createElement(
        'div',
        { className: 'bg-white rounded-lg shadow-lg p-8' },
        React.createElement(
          'div',
          { className: 'text-center mb-8' },
          React.createElement(
            'h2',
            { className: 'text-2xl font-semibold mb-4' },
            'Welcome to HitchBuddy'
          ),
          React.createElement(
            'p',
            { className: 'text-gray-600 text-lg' },
            'Your ride-sharing platform is now active with:'
          )
        ),
        React.createElement(
          'div',
          { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
          React.createElement(
            'div',
            { className: 'bg-blue-50 p-6 rounded-lg' },
            React.createElement(
              'h3',
              { className: 'text-xl font-semibold mb-3 text-blue-800' },
              'Authentication System'
            ),
            React.createElement(
              'p',
              { className: 'text-blue-600' },
              'Real database connectivity with user authentication and session management'
            )
          ),
          React.createElement(
            'div',
            { className: 'bg-green-50 p-6 rounded-lg' },
            React.createElement(
              'h3',
              { className: 'text-xl font-semibold mb-3 text-green-800' },
              'Ride Management'
            ),
            React.createElement(
              'p',
              { className: 'text-green-600' },
              'Complete ride posting, booking, and matching system with real-time updates'
            )
          ),
          React.createElement(
            'div',
            { className: 'bg-purple-50 p-6 rounded-lg' },
            React.createElement(
              'h3',
              { className: 'text-xl font-semibold mb-3 text-purple-800' },
              'Chat System'
            ),
            React.createElement(
              'p',
              { className: 'text-purple-600' },
              'Real-time messaging between riders and drivers with message history'
            )
          ),
          React.createElement(
            'div',
            { className: 'bg-orange-50 p-6 rounded-lg' },
            React.createElement(
              'h3',
              { className: 'text-xl font-semibold mb-3 text-orange-800' },
              'User Profiles'
            ),
            React.createElement(
              'p',
              { className: 'text-orange-600' },
              'Complete user profile management with ratings and reviews'
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'mt-8 text-center' },
          React.createElement(
            'button',
            { 
              className: 'bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors',
              onClick: () => window.location.href = '/dashboard'
            },
            'Access Dashboard'
          )
        )
      )
    )
  );
}

// Mount the React app
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(React.createElement(App));
} else {
  console.error('Root element not found!');
}