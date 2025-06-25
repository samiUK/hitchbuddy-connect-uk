# HitchBuddy Deployment Guide

## Quick Deployment Solutions

### Option 1: Fast Deploy (Recommended for Cloud Run)
```bash
node fast-deploy.js
```
- **Build time**: ~20ms
- **Bundle size**: 20KB
- **Requirements**: No vite dependency
- **Output**: `dist/index.js` + minimal HTML

### Option 2: Full Build (When vite works)
```bash
node build.js
```
- **Build time**: 2-5 minutes
- **Bundle size**: ~500KB client + 35KB server
- **Requirements**: Full frontend build
- **Output**: Complete React app

### Option 3: Shell Script (Linux/Docker)
```bash
./render-build.sh
```
- **Build time**: 2-5 minutes
- **Features**: Multiple fallbacks, error handling
- **Output**: Production-ready deployment

## Deployment Commands by Platform

### Google Cloud Run
```bash
# Use fast deployment
node fast-deploy.js
gcloud run deploy hitchbuddy --source .
```

### Render
```bash
# Uses render-build.sh automatically
git push origin main
```

### Docker
```bash
# Build with optimized Dockerfile
docker build -f Dockerfile.cloud -t hitchbuddy .
docker run -p 8080:8080 hitchbuddy
```

## Build Outputs

### Fast Deploy Structure
```
dist/
├── index.js (20KB production server)
└── public/
    └── index.html (minimal SPA loader)
```

### Full Build Structure
```
dist/
├── index.js (35KB production server)
└── public/
    ├── index.html
    ├── assets/
    │   ├── index-[hash].js
    │   └── index-[hash].css
    └── [other static files]
```

## Environment Variables

### Required for all deployments:
- `NODE_ENV=production`
- `PORT=8080` (or platform default)
- `DATABASE_URL` (PostgreSQL connection)

### Optional:
- `SESSION_SECRET` (auto-generated if not provided)

## Health Check Endpoint
All deployment configurations include:
- `GET /health` - Returns 200 OK when server is ready
- Used by Cloud Run, Docker, and other platforms

## Performance Characteristics

### Fast Deploy:
- ✓ 20ms build time
- ✓ 20KB bundle size
- ✓ Instant startup (<100ms)
- ✓ No vite dependency issues
- ✓ Works in any environment

### Full Build:
- ⚠ 2-5 minute build time
- ✓ Complete React frontend
- ✓ Optimized assets
- ⚠ Requires stable vite installation

## Troubleshooting

### "vite command not found"
**Solution**: Use `node fast-deploy.js` instead

### Build timeout
**Solution**: Switch to fast deployment or increase timeout

### Missing dependencies
**Solution**: Ensure vite is in production dependencies
```bash
npm install vite @vitejs/plugin-react esbuild --save
```

### Container startup issues
**Solution**: Use deploy-server.js (optimized, no vite dependency)