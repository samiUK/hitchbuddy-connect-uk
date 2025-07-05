// Global import.meta.dirname polyfill for Node.js compatibility
// This must be loaded before any ES modules that use import.meta.dirname

const path = require('path');

// Set up the server directory path
const serverDir = path.join(process.cwd(), 'server');

// Set environment variable for fallback usage
process.env.SERVER_DIRNAME = serverDir;

// Create a global import.meta object that can be accessed by all modules
globalThis.import = globalThis.import || {};
globalThis.import.meta = globalThis.import.meta || {};
globalThis.import.meta.dirname = serverDir;

// Also set on global object for broader compatibility
global.import = global.import || {};
global.import.meta = global.import.meta || {};
global.import.meta.dirname = serverDir;

// Monkey patch Object.resolve to handle undefined arguments gracefully
const originalResolve = path.resolve;
path.resolve = function(...args) {
  // Replace any undefined arguments with the server directory
  const cleanedArgs = args.map(arg => {
    if (arg === undefined || arg === null) {
      return serverDir;
    }
    return arg;
  });
  
  return originalResolve.apply(this, cleanedArgs);
};

console.log('✅ import.meta.dirname polyfill applied globally');