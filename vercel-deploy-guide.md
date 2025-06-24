# Deploying Hitchbuddy to Vercel

## Prerequisites
1. Vercel account (free tier available)
2. GitHub repository with the code
3. PostgreSQL database (can use Neon, Supabase, or Railway)

## Step-by-Step Deployment

### 1. Run Setup Script
```bash
./vercel-setup.sh
```

Or manually install Vercel CLI:
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy the Application
```bash
# From the project root
vercel --prod
```

### 4. Set Environment Variables
In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add these variables:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   NODE_ENV=production
   ```

### 5. Configure Database
If you need a new database, I recommend:
- **Neon**: Free PostgreSQL with excellent Vercel integration
- **Supabase**: Free tier with 500MB storage
- **Railway**: Simple PostgreSQL setup

### 6. Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

## Important Notes

### Database Migration
After deployment, run the database migration:
```bash
# Set DATABASE_URL environment variable locally
export DATABASE_URL="your_production_database_url"
npm run db:push
```

### Serverless Limitations
- Vercel functions have a 30-second timeout
- Cold starts may affect initial response times
- Database connections are pooled automatically

### Monitoring
- View logs in Vercel Dashboard → Functions tab
- Monitor performance in Analytics section
- Set up error tracking with Sentry (optional)

## Troubleshooting

### Common Issues
1. **Build fails**: Check TypeScript errors in logs
2. **Database connection**: Verify DATABASE_URL format
3. **API routes 404**: Check api/server.js configuration
4. **CORS issues**: Already configured in api/server.js

### Performance Optimization
- Enable Edge Runtime for faster cold starts
- Use Vercel's Edge Config for configuration
- Implement proper caching headers

## Expected Result
After successful deployment:
- Frontend accessible at: `https://your-app.vercel.app`
- API endpoints at: `https://your-app.vercel.app/api/*`
- All ride-sharing features functional
- Database persistence working

## Support
If deployment fails, check:
1. Vercel deployment logs
2. Function logs in dashboard
3. Database connectivity
4. Environment variables