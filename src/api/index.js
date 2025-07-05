const path = require('path');

// This is a redirect file to resolve Render's cached configuration
// Redirect to the actual server in the root directory
require(path.join(__dirname, '../../server.js'));