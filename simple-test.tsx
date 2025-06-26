import { createRoot } from 'react-dom/client';

// Simple test component
const TestApp = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h1>HitchBuddy Test</h1>
      <p>If you can see this, React is working!</p>
    </div>
  );
};

// Mount the test component
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<TestApp />);
} else {
  console.error('Root element not found');
}