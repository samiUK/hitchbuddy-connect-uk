# Deployment Guide

This guide covers deploying the Hitchbuddy ride-sharing platform to various hosting providers.

## Prerequisites

- Node.js 20 or higher
- PostgreSQL database (Supabase, Railway, or any PostgreSQL provider)
- Environment variables configured

## Environment Variables

Set these environment variables in your hosting platform:

```bash
NODE_ENV=production
PORT=5000  # Optional, most platforms set this automatically
DATABASE_URL=postgresql://username:password@host:port/database
```

## Platform-Specific Deployment

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Set environment variables in Vercel dashboard
5. Your app will be deployed automatically

**Note**: Vercel has limitations with server-side applications. Consider using serverless functions.

### Render (Recommended: Docker)

**Docker Deployment (Recommended):**
1. Connect your GitHub repository to Render
2. Choose "Web Service"
3. Select "Docker" as the environment
4. Render will automatically detect and use the Dockerfile
5. Add environment variables in Render dashboard:
   - `NODE_ENV=production`
   - `DATABASE_URL=your_supabase_connection_string`
6. Deploy

**Alternative: Node.js Deployment (if Docker fails):**
1. Choose "Node.js" environment
2. Set build command: `npm ci && npm run build`
3. Set start command: `npm start`
4. Set Node version: 20
5. Add same environment variables

**Troubleshooting Render Issues:**
- **"npm command not found"**: Use Docker deployment instead
- **Build timeouts**: Increase build timeout in Render settings
- **Memory issues**: Upgrade to a higher plan temporarily for build
- **Docker build fails**: Check Docker logs in Render dashboard

### Railway

1. Install Railway CLI: `npm i -g @railway/cli`
2. Run: `railway login`
3. Run: `railway init`
4. Run: `railway up`
5. Set environment variables: `railway variables set DATABASE_URL=your_url`

### Heroku

1. Create a new Heroku app: `heroku create your-app-name`
2. Add PostgreSQL addon: `heroku addons:create heroku-postgresql:mini`
3. Set environment variables: `heroku config:set NODE_ENV=production`
4. Deploy: `git push heroku main`

### Docker (DigitalOcean, AWS, etc.)

1. Build the Docker image: `docker build -t hitchbuddy .`
2. Run locally to test: `docker run -p 5000:5000 --env-file .env hitchbuddy`
3. Deploy to your preferred container hosting service

## Database Setup

After deployment, push your database schema:

```bash
# Set your DATABASE_URL environment variable
export DATABASE_URL="your_database_connection_string"

# Push the schema to your database
npm run db:push
```

## Post-Deployment Checklist

- [ ] Verify the application starts without errors
- [ ] Test user registration and login
- [ ] Test ride posting and booking functionality
- [ ] Verify database connections are working
- [ ] Check all API endpoints are responding correctly
- [ ] Test file uploads (profile photos)
- [ ] Verify environment variables are properly set

## Troubleshooting

### Common Issues

1. **Port binding errors**: Make sure your app listens on `0.0.0.0` and uses the `PORT` environment variable
2. **Database connection errors**: Verify your `DATABASE_URL` is correct and the database is accessible
3. **Build failures**: Ensure all dependencies are properly listed in `package.json`
4. **Static file serving**: Make sure the build process completes and creates the `client/dist` directory

### Platform-Specific Notes

- **Vercel**: Limited to serverless functions, may require refactoring for WebSocket support
- **Render**: Offers persistent storage and better support for full-stack applications
- **Railway**: Great for databases and full-stack apps with automatic deployments
- **Heroku**: Reliable but more expensive, includes many useful addons

## Performance Optimization

- Enable gzip compression in production
- Use a CDN for static assets
- Implement proper caching headers
- Monitor application performance and database queries
- Consider using connection pooling for database connections

## Security Considerations

- Always use HTTPS in production
- Set proper CORS headers
- Validate all user inputs
- Use environment variables for secrets
- Implement rate limiting
- Keep dependencies updated