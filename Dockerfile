# Use Node.js 20 LTS
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Create a non-root user and group with explicit IDs in a single command
RUN addgroup -g 1001 -S appuser && adduser -S appuser -u 1001 -G appuser
RUN chown -R appuser:appuser /app

# Expose the correct application port (based on fly.toml and likely render needs)
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Switch to the non-root user
USER appuser

# Start the application
CMD ["npm", "start"]