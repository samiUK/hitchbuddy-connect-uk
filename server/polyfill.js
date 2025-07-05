// Production polyfill for import.meta.dirname
// This file fixes the undefined import.meta.dirname issue in production environments

const path = require('path');
const Module = require('module');

// Create a polyfill function that provides the correct server directory
function getServerDirname() {
  // Use the SERVER_DIRNAME environment variable if available
  if (process.env.SERVER_DIRNAME) {
    return process.env.SERVER_DIRNAME;
  }
  // Calculate the server directory path from current working directory
  const cwd = process.cwd();
  return path.join(cwd, 'server');
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
    
    // Enhanced module loading patch to fix import.meta.dirname
    const originalRequire = Module.prototype.require;
    Module.prototype.require = function(id) {
      const result = originalRequire.apply(this, arguments);
      
      // If this is a module being loaded from the server directory
      if (this.filename && this.filename.includes('server')) {
        // Ensure import.meta is available with dirname
        if (typeof result === 'object' && result !== null) {
          if (!result.import) result.import = {};
          if (!result.import.meta) result.import.meta = {};
          if (!result.import.meta.dirname) {
            result.import.meta.dirname = serverDir;
          }
        }
      }
      
      return result;
    };
    
    // Also patch the global import.meta for ES modules
    if (typeof globalThis !== 'undefined') {
      if (!globalThis.import) globalThis.import = {};
      if (!globalThis.import.meta) globalThis.import.meta = {};
      if (!globalThis.import.meta.dirname) {
        globalThis.import.meta.dirname = serverDir;
      }
    }
    
    console.log('✅ Production polyfill activated - server directory:', serverDir);
  }
};