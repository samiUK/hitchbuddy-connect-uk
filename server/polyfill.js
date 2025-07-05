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
    
    // Create a comprehensive import.meta polyfill for the server directory
    const importMetaPolyfill = {
      dirname: serverDir,
      filename: path.join(serverDir, 'index.ts'),
      url: `file://${serverDir}`
    };
    
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
          Object.assign(result.import.meta, importMetaPolyfill);
        }
      }
      
      return result;
    };
    
    // Global import.meta polyfill for ES modules
    if (typeof globalThis !== 'undefined') {
      if (!globalThis.import) globalThis.import = {};
      if (!globalThis.import.meta) globalThis.import.meta = {};
      Object.assign(globalThis.import.meta, importMetaPolyfill);
    }
    
    // Direct global polyfill for import.meta.dirname
    if (typeof globalThis.import === 'undefined') {
      globalThis.import = {};
    }
    if (typeof globalThis.import.meta === 'undefined') {
      globalThis.import.meta = {};
    }
    globalThis.import.meta.dirname = serverDir;
    
    // Override the specific path resolution that's failing
    const originalResolve = path.resolve;
    path.resolve = function(...args) {
      // If the first argument is undefined (import.meta.dirname), use serverDir
      if (args[0] === undefined) {
        args[0] = serverDir;
      }
      return originalResolve.apply(this, args);
    };
    
    // Also patch require('path').resolve for modules that import path  
    const originalRequirePath = Module._resolveFilename;
    Module._resolveFilename = function(request, parent, isMain) {
      if (request === 'path') {
        const pathModule = originalRequirePath.apply(this, arguments);
        const resolvedPath = require.cache[pathModule] ? require.cache[pathModule].exports : require(pathModule);
        if (resolvedPath && resolvedPath.resolve && resolvedPath.resolve !== path.resolve) {
          resolvedPath.resolve = path.resolve; // Use our patched version
        }
        return pathModule;
      }
      return originalRequirePath.apply(this, arguments);
    };
    
    // Module-level polyfill for direct import.meta access
    const vm = require('vm');
    const originalRunInThisContext = vm.runInThisContext;
    vm.runInThisContext = function(code, options) {
      // Inject import.meta polyfill into the code context
      const context = {
        import: {
          meta: importMetaPolyfill
        },
        global: global,
        process: process,
        Buffer: Buffer,
        __dirname: serverDir,
        __filename: path.join(serverDir, 'index.ts')
      };
      
      return originalRunInThisContext.call(this, code, { ...options, ...context });
    };
    
    console.log('✅ Production polyfill activated - server directory:', serverDir);
  }
};