const path = require('path');

// This is a redirect file to resolve Render's cached configuration
// Redirect to the working deployment server
console.log('🔄 Redirecting to working development server...');
require(path.join(__dirname, '../deploy-server.cjs'));