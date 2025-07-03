import React, { useState, useEffect } from 'react';

export default function DashboardSafe() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simple auth check without external dependencies
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Not authenticated, redirect to login
          window.location.href = '/auth';
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/auth';
        return;
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include'
      });
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out failed:', error);
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 50%, #e8f5e8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '4px solid #3b82f6',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Loading HitchBuddy...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 50%, #e8f5e8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>Please log in to continue</p>
          <button 
            onClick={() => window.location.href = '/auth'}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = user.email === 'coolsami_uk@yahoo.com';

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 50%, #e8f5e8 100%)'
    }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .tab-button {
          padding: 12px 24px;
          margin: 0 4px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .tab-button.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        .tab-button:hover {
          background: #f3f4f6;
        }
        .tab-button.active:hover {
          background: #2563eb;
        }
        .card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin: 16px 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .stat-number {
          font-size: 32px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 8px;
        }
        .stat-label {
          color: #6b7280;
          font-size: 14px;
        }
        .admin-panel {
          background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
          color: white;
          border-radius: 12px;
          padding: 24px;
          margin-top: 16px;
        }
      `}</style>
      
      {/* Header */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
              🚗 HitchBuddy
            </h1>
            <span style={{
              background: '#f3f4f6',
              color: '#374151',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '14px'
            }}>
              {user.userType === 'driver' ? 'Driver' : 'Rider'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: '#6b7280', fontSize: '14px' }}>
              Welcome, {user.firstName || 'User'} {user.lastName || ''}
            </span>
            <button 
              onClick={handleSignOut}
              style={{
                background: 'transparent',
                border: '1px solid #d1d5db',
                color: '#374151',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px'
      }}>
        <TabSystem user={user} isAdmin={isAdmin} />
      </div>
    </div>
  );
}

function TabSystem({ user, isAdmin }) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'rides', label: 'My Rides' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'settings', label: 'Settings' }
  ];

  return (
    <div>
      {/* Tab Navigation */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <OverviewTab user={user} />}
        {activeTab === 'rides' && <RidesTab user={user} />}
        {activeTab === 'bookings' && <BookingsTab user={user} />}
        {activeTab === 'settings' && <SettingsTab user={user} isAdmin={isAdmin} />}
      </div>
    </div>
  );
}

function OverviewTab({ user }) {
  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">0</div>
          <div className="stat-label">Total Rides</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">0</div>
          <div className="stat-label">Active Bookings</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">0</div>
          <div className="stat-label">Messages</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#1f2937' }}>
          Welcome to HitchBuddy!
        </h3>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          Your sustainable ride-sharing platform is ready to use. Start by exploring the features:
        </p>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '16px' 
        }}>
          <div style={{ 
            padding: '16px', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px' 
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>🚗 For Drivers</h4>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Post available rides and connect with riders going your way
            </p>
          </div>
          <div style={{ 
            padding: '16px', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px' 
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>🎒 For Riders</h4>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Find available rides and book your journey with trusted drivers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RidesTab({ user }) {
  return (
    <div className="card">
      <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#1f2937' }}>
        My Rides
      </h3>
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>No rides posted yet</p>
        <button style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px'
        }}>
          Post New Ride
        </button>
      </div>
    </div>
  );
}

function BookingsTab({ user }) {
  return (
    <div className="card">
      <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#1f2937' }}>
        My Bookings
      </h3>
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>No bookings yet</p>
        <button style={{
          backgroundColor: '#16a34a',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px'
        }}>
          Find Rides
        </button>
      </div>
    </div>
  );
}

function SettingsTab({ user, isAdmin }) {
  return (
    <div>
      <div className="card">
        <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#1f2937' }}>
          Profile Settings
        </h3>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Email
            </label>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              {user.email}
            </p>
          </div>
          <div>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Name
            </label>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              {user.firstName} {user.lastName}
            </p>
          </div>
          <div>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Account Type
            </label>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              {user.userType}
            </p>
          </div>
          {user.phone && (
            <div>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Phone
              </label>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                {user.phone}
              </p>
            </div>
          )}
          <button style={{
            background: 'transparent',
            border: '1px solid #d1d5db',
            color: '#374151',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            width: 'fit-content'
          }}>
            Edit Profile
          </button>
        </div>
      </div>

      {isAdmin && (
        <div className="admin-panel">
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>
            🔧 Admin Portal
          </h3>
          <p style={{ marginBottom: '16px', opacity: 0.9 }}>
            Administrative functions for system management
          </p>
          <AdminPortalSimple />
        </div>
      )}
    </div>
  );
}

function AdminPortalSimple() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRiders: 0,
    totalDrivers: 0,
    totalRides: 0,
    totalBookings: 0,
    totalMessages: 0
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      // Load stats
      const statsResponse = await fetch('/api/admin/stats', {
        credentials: 'include'
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData || {
          totalUsers: 0,
          totalRiders: 0,
          totalDrivers: 0,
          totalRides: 0,
          totalBookings: 0,
          totalMessages: 0
        });
      }

      // Load users
      const usersResponse = await fetch('/api/admin/users', {
        credentials: 'include'
      });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(Array.isArray(usersData) ? usersData : []);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      // Set safe defaults on error
      setStats({
        totalUsers: 0,
        totalRiders: 0,
        totalDrivers: 0,
        totalRides: 0,
        totalBookings: 0,
        totalMessages: 0
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{
          width: '24px',
          height: '24px',
          border: '3px solid rgba(255,255,255,0.3)',
          borderTop: '3px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
        <p style={{ marginTop: '12px', opacity: 0.8 }}>Loading admin data...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '12px',
        marginBottom: '24px'
      }}>
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '12px', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats?.totalUsers || 0}</div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>Total Users</div>
        </div>
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '12px', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats?.totalRides || 0}</div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>Total Rides</div>
        </div>
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '12px', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats?.totalBookings || 0}</div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>Total Bookings</div>
        </div>
      </div>

      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: '8px', 
        padding: '16px' 
      }}>
        <h4 style={{ margin: '0 0 12px 0' }}>User Management</h4>
        {(!users || users.length === 0) ? (
          <p style={{ opacity: 0.8, fontSize: '14px' }}>No users found</p>
        ) : (
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {(users || []).slice(0, 5).map((user, index) => (
              <div key={user?.id || index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div>
                  <div style={{ fontWeight: '500' }}>
                    {user?.firstName || 'Unknown'} {user?.lastName || ''}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>
                    {user?.email || 'No email'} ({user?.userType || 'Unknown'})
                  </div>
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown date'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}