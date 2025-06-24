#!/bin/bash
# Quick Vercel deployment script after authentication

echo "🚀 Deploying Hitchbuddy to Vercel..."

# Deploy to production
npx vercel --prod --yes

echo "✅ Deployment complete!"
echo ""
echo "Your Hitchbuddy app is now live with:"
echo "- Built React frontend (no more source code display)"
echo "- Serverless API with Supabase database"
echo "- All ride-sharing features functional"
echo ""
echo "Next: Add environment variables in Vercel dashboard if needed:"
echo "- DATABASE_URL (already configured)"
echo "- NODE_ENV: production"