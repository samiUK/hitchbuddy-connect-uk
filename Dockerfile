# Multi-stage build for HitchBuddy
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Build stage
FROM base AS builder
WORKDIR /app

# Copy all source files
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Build the client
RUN npm run build:client

# Production stage
FROM base AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV=development
ENV FORCE_DEV_MODE=true
ENV SERVER_DIRNAME=/app/server

# Create app user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hitchbuddy

# Copy built application
COPY --from=builder --chown=hitchbuddy:nodejs /app/client/dist ./client/dist
COPY --from=builder --chown=hitchbuddy:nodejs /app/server ./server
COPY --from=builder --chown=hitchbuddy:nodejs /app/shared ./shared
COPY --from=builder --chown=hitchbuddy:nodejs /app/deploy-server.cjs ./
COPY --from=builder --chown=hitchbuddy:nodejs /app/patch-import-meta.cjs ./
COPY --from=deps --chown=hitchbuddy:nodejs /app/node_modules ./node_modules

# Set correct permissions
RUN chmod +x deploy-server.cjs

# Switch to app user
USER hitchbuddy

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "deploy-server.cjs"]