#!/bin/bash
# Quick deployment after authentication

echo "Deploying Hitchbuddy with fixes applied..."
npx vercel --prod --yes

echo "Deployment complete!"
echo "Your app should now display correctly at: https://hitchbuddy-connect-uk.vercel.app"
echo ""
echo "Fixed issues:"
echo "- Source code display → Built React application"
echo "- Static files → Properly served"
echo "- SPA routing → Configured"
echo ""
echo "Don't forget to add NODE_ENV=production in Vercel dashboard if needed."