#!/bin/bash
# Deploy to Vercel with proper authentication

echo "🚀 Deploying Hitchbuddy to Vercel"
echo "================================="

# Build the client
echo "Building client application..."
cd client && npm run build && cd ..

# Check if build was successful
if [ ! -d "client/dist" ]; then
    echo "❌ Build failed - client/dist directory not found"
    exit 1
fi

echo "✅ Client build successful"

# Deploy to Vercel (user needs to be logged in)
echo "Deploying to Vercel..."
echo "Note: You need to run 'npx vercel login' first if not authenticated"

# Create a simple deployment
npx vercel --prod --yes

echo ""
echo "🎉 Deployment initiated!"
echo ""
echo "Next steps:"
echo "1. Add environment variables in Vercel dashboard:"
echo "   - DATABASE_URL: Your Supabase connection string"
echo "   - NODE_ENV: production"
echo ""
echo "2. Test your deployment:"
echo "   - Frontend: https://your-app.vercel.app"
echo "   - API Health: https://your-app.vercel.app/api/health"