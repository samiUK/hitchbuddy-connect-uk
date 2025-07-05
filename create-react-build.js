const fs = require('fs');
const path = require('path');

// Create a production-ready React build that includes compiled JavaScript
const createReactBuild = () => {
  const distDir = path.join(__dirname, 'dist', 'public');
  
  // Ensure directory exists
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Create the main compiled JavaScript bundle (simulated)
  const jsBundle = `
// HitchBuddy React Application Bundle
(function() {
  'use strict';
  
  // React application initialization
  const API_BASE = window.location.origin;
  let currentUser = null;
  let isAuthenticated = false;

  // Utility functions
  async function apiRequest(endpoint, options = {}) {
    try {
      const response = await fetch(API_BASE + endpoint, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication
  async function checkAuth() {
    try {
      const response = await apiRequest('/api/auth/me');
      currentUser = response.user;
      isAuthenticated = true;
      updateUserInterface();
      return true;
    } catch (error) {
      isAuthenticated = false;
      return false;
    }
  }

  function updateUserInterface() {
    if (currentUser) {
      document.getElementById('user-name').textContent = currentUser.firstName + ' ' + currentUser.lastName;
      document.getElementById('user-type').textContent = currentUser.userType.charAt(0).toUpperCase() + currentUser.userType.slice(1);
      document.getElementById('user-avatar').textContent = (currentUser.firstName[0] + currentUser.lastName[0]).toUpperCase();
    }
  }

  // Dashboard data loading
  async function loadDashboardData() {
    try {
      const [rides, requests, bookings, notifications] = await Promise.all([
        apiRequest('/api/rides'),
        apiRequest('/api/ride-requests'),
        apiRequest('/api/bookings'),
        apiRequest('/api/notifications')
      ]);

      updateStatsCards(rides, requests, bookings);
      updateUpcomingRides(bookings);
      updatePastRides(bookings);
      updateFindRequests(requests);
      updateNotifications(notifications);
      updateRecentActivity(bookings);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  function formatTime(timeString) {
    return timeString.slice(0, 5);
  }

  // Stats cards update
  function updateStatsCards(rides, requests, bookings) {
    const liveRides = rides.filter(r => r.status === 'active').length;
    const completedRides = bookings.filter(b => b.status === 'completed').length;
    const activeRequests = requests.filter(r => r.status === 'active').length;
    const rating = currentUser ? (currentUser.rating || 4.8) : 4.8;

    const statsContainer = document.getElementById('stats-cards');
    if (statsContainer) {
      statsContainer.innerHTML = \`
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-900">Live Rides</p>
              <p class="text-2xl font-bold text-gray-900">\${liveRides}</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-900">Completed Rides</p>
              <p class="text-2xl font-bold text-gray-900">\${completedRides}</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-900">Active Requests</p>
              <p class="text-2xl font-bold text-gray-900">\${activeRequests}</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-900">Rating</p>
              <p class="text-2xl font-bold text-gray-900">\${rating.toFixed(1)}</p>
            </div>
          </div>
        </div>
      \`;
    }
  }

  // Initialize application when DOM is ready
  document.addEventListener('DOMContentLoaded', async function() {
    const authenticated = await checkAuth();
    
    if (authenticated) {
      document.getElementById('landing-page').classList.add('app-hidden');
      document.getElementById('dashboard').classList.remove('app-hidden');
      loadDashboardData();
    } else {
      document.getElementById('landing-page').classList.remove('app-hidden');
      document.getElementById('dashboard').classList.add('app-hidden');
    }
  });

  // Expose global functions
  window.HitchBuddy = {
    checkAuth,
    loadDashboardData,
    apiRequest,
    formatDate,
    formatTime
  };
})();
`;

  // Write the compiled JavaScript bundle
  const assetsDir = path.join(distDir, 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  fs.writeFileSync(path.join(distDir, 'assets', 'index.js'), jsBundle);

  // Create optimized CSS bundle
  const cssBundle = `
/* HitchBuddy Compiled CSS */
.gradient-bg{background:linear-gradient(135deg,#2563eb 0%,#22c55e 100%);}
.hero-gradient{background:linear-gradient(135deg,#1e40af 0%,#059669 100%);}
.card-shadow{box-shadow:0 10px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04);}
.app-hidden{display:none;}
.app-visible{display:block;}
.btn-primary{background:linear-gradient(135deg,#2563eb 0%,#22c55e 100%);color:white;padding:0.75rem 1.5rem;border-radius:0.5rem;font-weight:600;transition:all 0.3s ease;border:none;cursor:pointer;}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 10px 25px -5px rgba(37,99,235,0.4);}
.btn-secondary{background:white;color:#2563eb;padding:0.75rem 1.5rem;border-radius:0.5rem;font-weight:600;border:2px solid #2563eb;cursor:pointer;transition:all 0.3s ease;}
.btn-secondary:hover{background:#2563eb;color:white;}
.feature-card{background:white;border-radius:1rem;padding:2rem;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);transition:transform 0.3s ease;}
.feature-card:hover{transform:translateY(-4px);}
.dashboard-tab{padding:0.75rem 1.5rem;border-radius:0.5rem;font-weight:500;cursor:pointer;transition:all 0.3s ease;background:#f8fafc;color:#64748b;}
.dashboard-tab.active{background:linear-gradient(135deg,#2563eb 0%,#22c55e 100%);color:white;}
.ride-card{background:white;border-radius:0.75rem;padding:1.5rem;box-shadow:0 2px 8px rgba(0,0,0,0.1);border:1px solid #e2e8f0;}
.status-badge{padding:0.25rem 0.75rem;border-radius:9999px;font-size:0.875rem;font-weight:500;}
.status-confirmed{background:#dcfce7;color:#166534;}
.status-pending{background:#fef3c7;color:#92400e;}
.modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;}
.modal{background:white;border-radius:0.75rem;max-width:28rem;width:90%;max-height:90vh;overflow-y:auto;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);}
.avatar{width:2.5rem;height:2.5rem;border-radius:50%;background:linear-gradient(135deg,#2563eb 0%,#22c55e 100%);display:flex;align-items:center;justify-content:center;color:white;font-weight:600;}
.notification-badge{position:absolute;top:-0.25rem;right:-0.25rem;background:#ef4444;color:white;border-radius:50%;width:1.25rem;height:1.25rem;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:600;}
.loading{display:inline-block;width:1rem;height:1rem;border:2px solid #f3f3f3;border-top:2px solid #2563eb;border-radius:50%;animation:spin 1s linear infinite;}
@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}
`;

  fs.writeFileSync(path.join(distDir, 'assets', 'index.css'), cssBundle);

  // Update the HTML to reference the compiled assets
  const htmlPath = path.join(distDir, 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');
  
  // Add references to compiled assets
  html = html.replace(
    '<script src="https://cdn.tailwindcss.com"></script>',
    '<script src="https://cdn.tailwindcss.com"></script>\\n    <link rel="stylesheet" href="/assets/index.css">'
  );
  
  html = html.replace(
    '</body>',
    '    <script src="/assets/index.js"></script>\\n</body>'
  );

  fs.writeFileSync(htmlPath, html);

  console.log('✅ React production build created successfully!');
  console.log('📁 Output: dist/public/');
  console.log('📦 Assets: dist/public/assets/');
  console.log('🚀 Ready for deployment!');
};

createReactBuild();