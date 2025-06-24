# Vercel Environment Variables Setup

## Step-by-Step Guide

### 1. Access Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and login
2. Find your project (likely named "hitchbuddy" or similar)
3. Click on the project to open it

### 2. Navigate to Environment Variables
1. Click on **"Settings"** tab at the top
2. Select **"Environment Variables"** from the left sidebar
3. You'll see a form to add new variables

### 3. Add Required Environment Variables

#### Variable 1: DATABASE_URL
- **Name**: `DATABASE_URL`
- **Value**: Your Supabase connection string (starts with `postgresql://`)
- **Environment**: Select "Production", "Preview", and "Development" (all three)
- Click **"Save"**

#### Variable 2: NODE_ENV
- **Name**: `NODE_ENV`
- **Value**: `production`
- **Environment**: Select "Production" only
- Click **"Save"**

### 4. Redeploy (if needed)
After adding variables:
1. Go to **"Deployments"** tab
2. Click the **three dots** on the latest deployment
3. Select **"Redeploy"**

## Your Supabase Connection String Format
Your DATABASE_URL should look like:
```
postgresql://postgres:[password]@[host]:5432/[database]?pgbouncer=true&connection_limit=1
```

## Verification
After deployment completes, test these URLs:
- `https://your-app.vercel.app/api/health` - Should return status OK
- `https://your-app.vercel.app/api/auth/me` - Should return authentication status
- `https://your-app.vercel.app` - Should load the frontend

## Troubleshooting
- If API returns 500 errors, check Function logs in Vercel dashboard
- If database connection fails, verify DATABASE_URL format
- If build fails, check Build logs for errors