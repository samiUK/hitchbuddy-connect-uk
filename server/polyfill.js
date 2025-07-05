// Production polyfill for import.meta.dirname
// This file fixes the undefined import.meta.dirname issue in production environments

const path = require('path');

// Create a polyfill function that provides the correct server directory
function getServerDirname() {
  // Use the SERVER_DIRNAME environment variable if available
  if (process.env.SERVER_DIRNAME) {
    return process.env.SERVER_DIRNAME;
  }
  // Otherwise use the current working directory + server
  return path.join(process.cwd(), 'server');
}

// Export for use in server startup
module.exports = {
  getServerDirname,
  setupPolyfill: () => {
    // Set global polyfill for server directory
    const serverDir = getServerDirname();
    global.__serverDirname = serverDir;
    global.__dirname = serverDir;
    
    // Set environment variable for server directory
    process.env.SERVER_DIRNAME = serverDir;
    
    console.log('✅ Production polyfill activated - server directory:', serverDir);
  }
};