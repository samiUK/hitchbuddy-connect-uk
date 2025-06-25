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

# Create non-root user for security
RUN addgroup -S appuser && adduser -S appuser -G appuser

# Change ownership of the app directory and set the user
RUN chown -R appuser:appuser /app
USER appuser

# Expose the correct application port (based on fly.toml and likely render needs)
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start the application
CMD ["npm", "start"]