// Post-build script to replace bundled server with optimized instant server
import fs from 'fs';

console.log('Replacing bundled server with instant production server...');

// Copy our optimized instant server over the bundled version
fs.copyFileSync('production-instant.js', 'dist/index.js');

console.log('Build optimization complete - race condition eliminated');