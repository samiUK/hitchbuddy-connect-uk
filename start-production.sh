#!/bin/bash

echo "🚀 Starting Hitchbuddy production server..."

# Set production environment
export NODE_ENV=production

# Start the server
node dist/index.js

echo "Server startup completed"