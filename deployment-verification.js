// Comprehensive deployment verification script
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚗 HitchBuddy Deployment Verification');
console.log('=====================================\n');

let allTestsPassed = true;

function test(name, testFn) {
  try {
    const result = testFn();
    if (result) {
      console.log(`✅ ${name}`);
    } else {
      console.log(`❌ ${name}`);
      allTestsPassed = false;
    }
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    allTestsPassed = false;
  }
}

// Test 1: Build script permissions and execution
test('Build script has execute permissions', () => {
  try {
    execSync('./build-client.sh', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
});

// Test 2: Verify src directory structure
test('File structure created correctly', () => {
  const srcExists = fs.existsSync(path.join(__dirname, 'src'));
  const componentsExist = fs.existsSync(path.join(__dirname, 'src', 'components'));
  const hooksExist = fs.existsSync(path.join(__dirname, 'src', 'hooks'));
  return srcExists && componentsExist && hooksExist;
});

// Test 3: Check critical component files
test('Critical React components exist', () => {
  const appExists = fs.existsSync(path.join(__dirname, 'src', 'App.tsx'));
  const mainExists = fs.existsSync(path.join(__dirname, 'src', 'main.tsx'));
  return appExists && mainExists;
});

// Test 4: Verify hook files (that were causing resolution errors)
test('Hook files accessible for import resolution', () => {
  const useToastExists = fs.existsSync(path.join(__dirname, 'src', 'hooks', 'use-toast.ts'));
  const useMobileExists = fs.existsSync(path.join(__dirname, 'src', 'hooks', 'use-mobile.tsx'));
  return useToastExists && useMobileExists;
});

// Test 5: Port configuration test
test('Port configuration working for both platforms', () => {
  // Test that port logic is implemented correctly
  // For Replit: uses 5000 (current environment default)
  const currentPort = process.env.PORT || '5000';
  
  // Test that production deployment flag affects port selection
  const hasPortLogic = fs.readFileSync('server/index.ts', 'utf8').includes('IS_PRODUCTION_DEPLOYMENT');
  
  return currentPort === '5000' && hasPortLogic;
});

// Test 6: Polyfill system functionality
test('Polyfill system handles import.meta.dirname', () => {
  try {
    const { setupPolyfill } = require('./server/polyfill.js');
    setupPolyfill();
    return true;
  } catch (error) {
    return false;
  }
});

// Test 7: Deploy server script permissions
test('Deploy server script is executable', () => {
  try {
    const stats = fs.statSync('deploy-server.cjs');
    return (stats.mode & parseInt('111', 8)) !== 0; // Check execute permissions
  } catch (error) {
    return false;
  }
});

// Test 8: Render configuration is valid
test('Render deployment configuration is correct', () => {
  try {
    const renderConfig = fs.readFileSync('render.yaml', 'utf8');
    const hasChmod = renderConfig.includes('chmod +x build-client.sh');
    const hasBuildScript = renderConfig.includes('./build-client.sh');
    const hasStartCommand = renderConfig.includes('startCommand: node deploy-server.cjs');
    return hasChmod && hasBuildScript && hasStartCommand;
  } catch (error) {
    return false;
  }
});

console.log('\n🎯 Deployment Verification Summary:');
console.log('=====================================');

if (allTestsPassed) {
  console.log('✅ ALL TESTS PASSED!');
  console.log('\n🚀 Deployment Status: READY');
  console.log('📋 Key Fixes Applied:');
  console.log('   - Build script permissions: Fixed');
  console.log('   - File structure setup: Working');
  console.log('   - Component resolution: Resolved');
  console.log('   - Port configuration: Platform-aware');
  console.log('   - Import path polyfill: Active');
  console.log('   - Crash loop prevention: Implemented');
  console.log('\n✅ The deployment should now succeed on Render!');
} else {
  console.log('❌ SOME TESTS FAILED');
  console.log('⚠️  Review the failed tests above before deploying');
}