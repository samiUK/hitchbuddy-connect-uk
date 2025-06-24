#!/bin/bash
# Quick Vercel deployment without local build

echo "🚀 Quick Vercel Deployment"
echo "=========================="

# Create minimal vercel.json for auto-build
cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/$1"
    }
  ],
  "env": {
    "DATABASE_URL": "@database-url",
    "NODE_ENV": "production"
  }
}
EOF

# Deploy directly to Vercel
echo "Deploying to Vercel..."
npx vercel --prod --yes

echo "✅ Deployment initiated!"
echo "Next steps:"
echo "1. Add DATABASE_URL in Vercel Dashboard"
echo "2. Set NODE_ENV=production"
echo "3. Test the deployed application"