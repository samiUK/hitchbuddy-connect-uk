const path = require('path');

// This is a redirect file to resolve Render's cached configuration
// Redirect to the actual working production server
console.log('🔄 Redirecting to final production server...');
require(path.join(__dirname, '../final-production-server.cjs'));