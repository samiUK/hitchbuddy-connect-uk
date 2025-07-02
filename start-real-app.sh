#!/bin/bash
echo "🚀 Starting Real HitchBuddy React Application"

# Kill any existing servers
pkill -f "node.*server" 2>/dev/null
pkill -f "tsx.*server" 2>/dev/null

# Check if tsx is available
if command -v tsx &> /dev/null; then
    echo "✅ Using tsx to run your real React app..."
    exec tsx server/index.ts
else
    echo "⚠️ tsx not available, installing..."
    npm install tsx --save-dev
    echo "✅ Now starting your real React app..."
    exec npx tsx server/index.ts
fi