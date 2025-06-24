#!/bin/bash
# Run this after Vercel authentication is complete

echo "🚀 Starting Hitchbuddy Deployment to Vercel"
echo "==========================================="

# Verify authentication
echo "Checking Vercel authentication..."
npx vercel whoami

# Deploy to production
echo "Deploying to Vercel production..."
npx vercel --prod --yes

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Add environment variables in Vercel dashboard"
echo "2. DATABASE_URL: Your Supabase connection string"
echo "3. NODE_ENV: production"
echo ""
echo "Your app will be live at the URL provided above!"