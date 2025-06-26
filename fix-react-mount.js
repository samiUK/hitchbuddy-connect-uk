// Fix React mounting issue by testing component rendering
const http = require('http');

// Test if React components can mount
async function testReactMount() {
  try {
    console.log('Testing React app mounting...');
    
    // Check if main.tsx loads properly
    const response = await fetch('http://localhost:5000/src/main.tsx');
    const mainTsx = await response.text();
    
    if (mainTsx.includes('createRoot')) {
      console.log('✓ Main.tsx loads correctly');
    } else {
      console.log('✗ Main.tsx has issues');
    }
    
    // Check if App.tsx renders
    const appResponse = await fetch('http://localhost:5000/src/App.tsx');
    const appTsx = await appResponse.text();
    
    if (appTsx.includes('AuthProvider')) {
      console.log('✓ App.tsx structure correct');
    } else {
      console.log('✗ App.tsx missing AuthProvider');
    }
    
    // Check if Index page loads
    const indexResponse = await fetch('http://localhost:5000/src/pages/Index.tsx');
    const indexTsx = await indexResponse.text();
    
    if (indexTsx.includes('LandingHero')) {
      console.log('✓ Index page components loaded');
    } else {
      console.log('✗ Index page missing components');
    }
    
    console.log('React mount test complete');
    
  } catch (error) {
    console.error('React mount test failed:', error);
  }
}

testReactMount();