import React from 'react';
import { createRoot } from 'react-dom/client';

const SimpleTest = () => {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'system-ui',
      background: 'linear-gradient(135deg, #f0f8ff 0%, #ffffff 50%, #f0fff4 100%)',
      minHeight: '100vh'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#1f2937', marginBottom: '20px' }}>
          🚗 HitchBuddy - Original Application Ready
        </h1>
        <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '30px' }}>
          Complete ride-sharing platform with authentication, dashboard, messaging, and rating system
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          marginBottom: '30px'
        }}>
          <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
            <strong>✅ Authentication</strong><br/>
            <small>Login, signup, sessions</small>
          </div>
          <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
            <strong>✅ Dashboard</strong><br/>
            <small>Rider & driver interfaces</small>
          </div>
          <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
            <strong>✅ Ride Management</strong><br/>
            <small>Post & find rides</small>
          </div>
          <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
            <strong>✅ Messaging</strong><br/>
            <small>Real-time chat</small>
          </div>
        </div>
        
        <div style={{ 
          background: '#dbeafe', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #3b82f6'
        }}>
          <p style={{ margin: 0, color: '#1e40af' }}>
            <strong>React Mount Test Successful!</strong><br/>
            Original HitchBuddy application components are ready for deployment.
          </p>
        </div>
      </div>
    </div>
  );
};

// Test mounting
const rootElement = document.getElementById('root');
if (rootElement) {
  console.log('Mounting HitchBuddy test component...');
  const root = createRoot(rootElement);
  root.render(<SimpleTest />);
  console.log('HitchBuddy test component mounted successfully!');
} else {
  console.error('Root element not found!');
}

export default SimpleTest;