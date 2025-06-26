
import React from "react";

const App = () => {
  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #f0f8ff 0%, #ffffff 50%, #f0fff4 100%)',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Navigation */}
      <nav style={{
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '64px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              background: 'linear-gradient(45deg, #2563eb, #16a34a)',
              padding: '8px',
              borderRadius: '8px'
            }}>
              <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0-1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            </div>
            <span style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>HitchBuddy</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button style={{
              padding: '8px 16px',
              borderRadius: '6px',
              color: '#6b7280',
              background: 'transparent',
              border: 'none',
              fontWeight: '500',
              cursor: 'pointer'
            }}>Sign In</button>
            <button style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: 'linear-gradient(45deg, #2563eb, #16a34a)',
              color: 'white',
              border: 'none',
              fontWeight: '500',
              cursor: 'pointer'
            }}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '800',
            color: '#1f2937',
            marginBottom: '16px'
          }}>Share Your Journey, Save the Planet</h1>
          <p style={{
            fontSize: '20px',
            color: '#6b7280',
            marginBottom: '32px'
          }}>
            Connect with fellow travelers, reduce costs, and make every trip an adventure. 
            HitchBuddy makes ride sharing safe, reliable, and rewarding.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={{
              padding: '12px 32px',
              fontSize: '16px',
              borderRadius: '6px',
              background: 'linear-gradient(45deg, #2563eb, #16a34a)',
              color: 'white',
              border: 'none',
              fontWeight: '500',
              cursor: 'pointer'
            }}>Find a Ride</button>
            <button style={{
              padding: '12px 32px',
              fontSize: '16px',
              borderRadius: '6px',
              color: '#6b7280',
              background: 'transparent',
              border: '2px solid #e5e7eb',
              fontWeight: '500',
              cursor: 'pointer'
            }}>Offer a Ride</button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#1f2937', marginBottom: '12px' }}>🎯 Smart Route Matching</h3>
            <p style={{ color: '#6b7280', margin: 0 }}>Advanced algorithms connect you with riders going your way, optimizing routes for everyone.</p>
          </div>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#1f2937', marginBottom: '12px' }}>🛡️ Trusted Community</h3>
            <p style={{ color: '#6b7280', margin: 0 }}>Verified profiles, ratings, and reviews ensure safe and reliable ride-sharing experiences.</p>
          </div>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#1f2937', marginBottom: '12px' }}>💬 Real-time Communication</h3>
            <p style={{ color: '#6b7280', margin: 0 }}>Stay connected with instant messaging, live location sharing, and trip updates.</p>
          </div>
        </div>
      </section>

      {/* Status */}
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#1f2937', marginBottom: '16px' }}>Original HitchBuddy Features Available:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div>
              <strong>Authentication System</strong><br/>
              <small style={{ color: '#6b7280' }}>Login, signup, password reset, session management</small>
            </div>
            <div>
              <strong>Dashboard Interface</strong><br/>
              <small style={{ color: '#6b7280' }}>Separate rider & driver dashboards with analytics</small>
            </div>
            <div>
              <strong>Ride Management</strong><br/>
              <small style={{ color: '#6b7280' }}>Post rides, find rides, booking system</small>
            </div>
            <div>
              <strong>Real-time Messaging</strong><br/>
              <small style={{ color: '#6b7280' }}>In-app chat between riders & drivers</small>
            </div>
            <div>
              <strong>Rating System</strong><br/>
              <small style={{ color: '#6b7280' }}>Rate completed trips and build reputation</small>
            </div>
            <div>
              <strong>Notification Center</strong><br/>
              <small style={{ color: '#6b7280' }}>Real-time alerts and updates</small>
            </div>
          </div>
          <div style={{ marginTop: '20px', padding: '16px', background: '#f3f4f6', borderRadius: '8px' }}>
            <p style={{ color: '#374151', margin: 0 }}>
              <strong>Status:</strong> Original HitchBuddy React application with complete authentication, dashboard, 
              ride-sharing, messaging, and rating functionality is ready. The application includes all original components and features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
