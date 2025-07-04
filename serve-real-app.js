const express = require('express');
const path = require('path');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');

console.log('🚗 Starting HitchBuddy TypeScript React Application...');

// Transform TypeScript/JSX imports to browser-compatible format
function transformTSX(content) {
  return content
    .replace(/import\s+.*?from\s+['"]@\/(.+?)['"];?/g, (match, importPath) => {
      return `import ${match.split('from')[0].split('import')[1].trim()} from '/src/${importPath}';`;
    })
    .replace(/import\s+.*?from\s+['"]\.\.?\/(.+?)['"];?/g, (match, importPath) => {
      return `import ${match.split('from')[0].split('import')[1].trim()} from '/${importPath}';`;
    })
    .replace(/export\s+default\s+/g, 'export default ')
    .replace(/interface\s+\w+\s*{[^}]*}/g, '') // Remove TypeScript interfaces
    .replace(/:\s*\w+(\[\])?/g, '') // Remove type annotations
    .replace(/as\s+\w+/g, ''); // Remove type assertions
}

const app = express();

// Configure MIME types for JavaScript modules
express.static.mime.define({
  'text/javascript': ['js', 'mjs'],
  'application/javascript': ['jsx', 'tsx']
});

// Serve static files from client directory with proper MIME types
app.use(express.static(path.join(__dirname, 'client'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js') || path.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'text/javascript');
    } else if (path.endsWith('.jsx') || path.endsWith('.tsx')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Handle TypeScript/JSX files
app.get('/src/*', (req, res) => {
  const filePath = path.join(__dirname, 'client', req.path);
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const transformed = transformTSX(content);
    res.setHeader('Content-Type', 'text/javascript');
    res.send(transformed);
  } else {
    res.status(404).send('File not found');
  }
});

// Proxy API requests to the backend
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  logLevel: 'error'
}));

// Serve the main application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

app.listen(5000, '0.0.0.0', () => {
  console.log('✅ HitchBuddy frontend server running on port 5000');
  console.log('✅ TypeScript React application with Dashboard.tsx components');
  console.log('✅ Backend API proxy to port 3001');
});

// Start the backend API server
const { spawn } = require('child_process');

const backendProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'pipe',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '3001'
  }
});

backendProcess.stdout.on('data', (data) => {
  console.log(`[backend] ${data.toString().trim()}`);
});

backendProcess.stderr.on('data', (data) => {
  console.error(`[backend] ${data.toString().trim()}`);
});

console.log('✅ Starting backend API server on port 3001...');