# Use Node.js 20 LTS Alpine for smaller image size
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies including dev dependencies for build
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Create a non-root user (Alpine Linux compatible)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app

# Expose port 8080 to match fly.toml
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Switch to the non-root user
USER nodejs

# Start the application
CMD ["npm", "start"]