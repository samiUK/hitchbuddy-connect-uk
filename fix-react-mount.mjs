// Fix React mounting issue by testing component rendering
import { createRequire } from 'module';

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
    
    // Check if root div gets populated
    const htmlResponse = await fetch('http://localhost:5000/');
    const html = await htmlResponse.text();
    
    if (html.includes('<div id="root"></div>')) {
      console.log('✗ Root div is empty - React not mounting');
    } else {
      console.log('✓ Root div has content');
    }
    
    console.log('React mount test complete');
    
  } catch (error) {
    console.error('React mount test failed:', error.message);
  }
}

testReactMount();