# HitchBuddy Multi-Platform Deployment Guide

HitchBuddy supports deployment on multiple platforms without conflicts. Each platform uses the same `deploy-server.cjs` production server with comprehensive import.meta.dirname polyfills.

## ✅ Render (Primary - Recommended)
**Configuration:** `render.yaml`
```bash
# Deploy to Render
1. Connect repository to Render
2. Render will auto-detect render.yaml
3. App deploys automatically on port 10000
```
**Features:**
- Health check: `/health`
- Automatic builds
- Environment: Development mode for TypeScript compatibility

## ✅ Railway
**Configuration:** `railway.json`
```bash
# Deploy to Railway
1. Connect repository to Railway
2. Railway auto-detects railway.json
3. App deploys on RAILWAY_PUBLIC_PORT
```
**Features:**
- Nixpacks builder
- Health monitoring
- Auto-restart on failure

## ✅ Fly.io
**Configuration:** `fly.toml`
```bash
# Deploy to Fly.io
flyctl auth login
flyctl launch --no-deploy
flyctl deploy
```
**Features:**
- London region (lhr)
- Auto-scaling (0 to 1 machines)
- Health checks and monitoring

## ✅ Vercel
**Configuration:** `vercel.json`
```bash
# Deploy to Vercel
1. Connect repository to Vercel
2. Vercel auto-detects vercel.json
3. Serverless function deployment
```
**Features:**
- Edge network deployment
- 10-second function timeout
- Automatic scaling

## 🐳 Docker (Universal)
**Configuration:** `Dockerfile`
```bash
# Build and run locally
docker build -t hitchbuddy .
docker run -p 5000:5000 -e DATABASE_URL="your_db_url" hitchbuddy

# Deploy to any Docker platform
docker push your-registry/hitchbuddy
```
**Features:**
- Multi-stage optimized build
- Health checks included
- Production security

## Environment Variables

All platforms require these environment variables:
```bash
DATABASE_URL=postgresql://...     # Your PostgreSQL database URL
NODE_ENV=development             # Set automatically
FORCE_DEV_MODE=true             # Set automatically
SERVER_DIRNAME=/app/server      # Set automatically
```

## Build Commands

All platforms use the same build process:
```bash
npm ci                          # Install dependencies
chmod +x build-client.sh       # Make build script executable
./build-client.sh              # Build React frontend
node deploy-server.cjs        # Start production server
```

## Health Monitoring

All platforms include health monitoring at `/health` endpoint:
- Memory usage tracking
- Database connectivity check
- Application status verification

## Platform-Specific Notes

### Render
- Uses port 10000 automatically
- Best for full-stack applications
- Persistent storage available

### Railway
- Dynamic port assignment
- Excellent GitHub integration
- Built-in metrics

### Fly.io
- Global edge deployment
- Machine-based scaling
- Regional data storage

### Vercel
- Serverless functions
- Global CDN
- Best for low-traffic apps

### Docker
- Universal compatibility
- Self-hosted options
- Full control over environment

## Quick Start

1. **Choose your platform** from the options above
2. **Set DATABASE_URL** environment variable
3. **Connect your repository** to the platform
4. **Deploy automatically** - all configurations are ready

All deployments use the same production-ready server with comprehensive polyfills ensuring compatibility across all platforms.