#!/usr/bin/env node

// Pre-deployment verification script for HitchBuddy
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

console.log('🚗 HitchBuddy Pre-Deployment Check\n');

const checks = [];
let passed = 0;
let failed = 0;

function check(name, condition, details = '') {
  if (condition) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    console.log(`❌ ${name}${details ? ` - ${details}` : ''}`);
    failed++;
  }
  checks.push({ name, passed: condition, details });
}

// Check essential files
check('Deploy server exists', existsSync('deploy-server.js'));
check('Build script exists', existsSync('render-build.sh'));
check('Render config exists', existsSync('render.yaml'));
check('Package.json exists', existsSync('package.json'));

// Check server modules
check('Server routes exist', existsSync('server/routes.ts'));
check('Server storage exists', existsSync('server/storage.ts'));
check('Database config exists', existsSync('server/db.ts'));
check('Shared schema exists', existsSync('shared/schema.ts'));

// Check React frontend
check('Frontend entry exists', existsSync('client/src/main.tsx'));
check('Frontend app exists', existsSync('client/src/App.tsx'));
check('Vite config exists', existsSync('vite.config.ts'));

// Check package.json scripts
if (existsSync('package.json')) {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  check('Start script configured', pkg.scripts?.start);
  check('Build script configured', pkg.scripts?.build);
  
  // Check critical dependencies
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  check('Express installed', deps.express);
  check('Drizzle ORM installed', deps['drizzle-orm']);
  check('React installed', deps.react);
  check('Vite installed', deps.vite);
  check('TypeScript installed', deps.typescript);
  check('TSX installed', deps.tsx);
}

// Check environment variables requirements
console.log('\n📋 Environment Variables Required:');
console.log('- DATABASE_URL (provided by Render PostgreSQL)');
console.log('- NODE_ENV (set to production)');
console.log('- PORT (set by Render automatically)');

// Summary
console.log(`\n📊 Check Summary:`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 All checks passed! Ready for deployment.');
  console.log('\n🚀 Deployment will include:');
  console.log('- Full Express.js backend with API routes');
  console.log('- PostgreSQL database connectivity');
  console.log('- React frontend with Vite build');
  console.log('- Authentication and session management');
  console.log('- Ride booking and messaging system');
  process.exit(0);
} else {
  console.log('\n⚠️  Some checks failed. Please fix before deploying.');
  process.exit(1);
}