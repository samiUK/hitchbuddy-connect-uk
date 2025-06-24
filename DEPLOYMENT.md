# Quick GitHub + Vercel Deployment

## 1. Create GitHub Repository
- Go to github.com → New repository
- Name: `hitchbuddy`
- Public/Private (your choice)
- Don't initialize with README

## 2. Upload Files
Download these key files from Replit and upload to GitHub:

**Required Core Files:**
- `api/server.js` (serverless API)
- `client/dist/` folder (built React app)
- `shared/` folder (database schema)
- `vercel.json` (deployment config)
- `package.json` & `package-lock.json`
- `README.md`
- `.gitignore`

**Skip these files:**
- `.replit`
- `node_modules/`
- Deployment guide files

## 3. Deploy to Vercel
1. Go to vercel.com/new
2. Import your GitHub repository
3. Vercel auto-detects configuration
4. Deploy starts automatically

## 4. Add Environment Variable
In Vercel dashboard:
- Settings → Environment Variables
- Add: `DATABASE_URL` = your Supabase connection string
- Redeploy

## Result
Your app will be live with the Hitchbuddy interface at your Vercel URL.

The source code display issue is fixed - the API server now properly serves the built React application.