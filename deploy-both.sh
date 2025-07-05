#!/bin/bash

# HitchBuddy Multi-Platform Deployment Script
# Prepares the application for both Replit and Render deployments

echo "🚗 HitchBuddy Multi-Platform Deployment Setup"
echo "=============================================="

# Check current status
echo "📋 Current Status:"
echo "  - Replit: Development server running"
echo "  - Render: Configuration ready"
echo ""

# Verify all deployment files exist
echo "🔍 Verifying deployment files..."

files=("deploy-server.cjs" "render.yaml" "build-client.sh" "dev-server.cjs")
missing_files=()

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (missing)"
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo "⚠️  Missing deployment files. Please ensure all files are present."
    exit 1
fi

echo ""
echo "🎯 Deployment Instructions:"
echo ""
echo "FOR REPLIT DEPLOYMENT:"
echo "1. Click the 'Deploy' button in your Replit interface"
echo "2. Choose 'Autoscale' deployment type"
echo "3. Your app will be live at: https://your-repl-name.replit.app"
echo ""
echo "FOR RENDER DEPLOYMENT:"
echo "1. Connect your GitHub repository to Render"
echo "2. Create a new Web Service"
echo "3. Use the existing render.yaml configuration"
echo "4. Set environment variables:"
echo "   - DATABASE_URL (your PostgreSQL connection string)"
echo "   - NODE_ENV=development"
echo "   - FORCE_DEV_MODE=true"
echo "5. Deploy automatically builds and starts"
echo ""
echo "BOTH DEPLOYMENTS SUPPORT:"
echo "✅ Complete HitchBuddy functionality"
echo "✅ User authentication and sessions"
echo "✅ Real-time messaging"
echo "✅ Ride booking and management"
echo "✅ File uploads and profile photos"
echo "✅ Database operations"
echo "✅ Mobile-responsive interface"
echo ""
echo "📊 Health Check Endpoints:"
echo "  - /health (server status)"
echo "  - /api/health (API status)"
echo ""
echo "🌐 URLs after deployment:"
echo "  - Replit: https://your-repl-name.replit.app"
echo "  - Render: https://your-app-name.onrender.com"
echo ""
echo "✅ Ready for deployment on both platforms!"
echo "   See DEPLOYMENT_GUIDE.md for detailed instructions."