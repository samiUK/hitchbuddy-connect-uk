#!/bin/bash
# Deploy Hitchbuddy to Vercel with Supabase

echo "Deploying Hitchbuddy to Vercel..."

# Build the application
echo "Building application..."
npm run build

# Deploy to Vercel
echo "Deploying to Vercel..."
npx vercel deploy --prod --yes --confirm

echo "Deployment complete!"
echo "Remember to add environment variables in Vercel dashboard:"
echo "- DATABASE_URL (your Supabase URL)"
echo "- NODE_ENV=production"