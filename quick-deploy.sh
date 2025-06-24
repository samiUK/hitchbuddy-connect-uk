#!/bin/bash
# Quick deployment script for Hitchbuddy

echo "🚀 Hitchbuddy Deployment Helper"
echo "================================"

# Check if build exists
if [ ! -d "dist" ]; then
    echo "📦 Building application..."
    npm run build
fi

echo ""
echo "Choose deployment platform:"
echo "1. Railway (Recommended)"
echo "2. Render"
echo "3. Fly.io"
echo "4. Docker (Local)"
echo "5. Exit"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🚂 Deploying to Railway..."
        echo "Run: npm install -g @railway/cli && railway login && railway up"
        ;;
    2)
        echo "🎨 Deploying to Render..."
        echo "1. Go to https://render.com"
        echo "2. Connect your GitHub repository"
        echo "3. Add PostgreSQL service"
        echo "4. Set environment variables"
        ;;
    3)
        echo "🪂 Deploying to Fly.io..."
        echo "Run: curl -L https://fly.io/install.sh | sh && flyctl auth login && flyctl launch"
        ;;
    4)
        echo "🐳 Starting Docker containers..."
        if command -v docker &> /dev/null; then
            docker-compose up -d
            echo "Application running at http://localhost:3000"
        else
            echo "Docker not installed. Please install Docker first."
        fi
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        ;;
esac

echo ""
echo "📋 Remember to set these environment variables:"
echo "DATABASE_URL=postgresql://..."
echo "NODE_ENV=production"
echo "PORT=3000"