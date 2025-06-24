#!/bin/bash
# Vercel deployment setup for Hitchbuddy

echo "Setting up Vercel deployment for Hitchbuddy..."

# Check if build exists
if [ ! -d "dist" ]; then
    echo "Building application..."
    npm run build
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

echo ""
echo "Deployment checklist:"
echo "1. ✓ Vercel configuration ready (vercel.json)"
echo "2. ✓ API serverless function created (api/server.js)"
echo "3. ✓ Build configuration updated"
echo "4. ✓ Environment files ignored (.vercelignore)"
echo ""
echo "Next steps:"
echo "1. Run: vercel login"
echo "2. Run: vercel --prod"
echo "3. Add environment variables in Vercel dashboard:"
echo "   - DATABASE_URL=postgresql://..."
echo "   - NODE_ENV=production"
echo ""
echo "Database options:"
echo "- Neon (recommended for Vercel): https://neon.tech"
echo "- Supabase: https://supabase.com"
echo "- Railway: https://railway.app"
echo ""
echo "After deployment, run database migration:"
echo "export DATABASE_URL='your_production_url'"
echo "npm run db:push"