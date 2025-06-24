# GitHub + Vercel Deployment Guide

## Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon → "New repository"
3. Repository name: `hitchbuddy`
4. Description: `Modern ride-sharing platform`
5. Set to Public (recommended) or Private
6. Click "Create repository"

## Step 2: Upload Your Code

### Method A: Web Upload
1. In your new repository, click "uploading an existing file"
2. Download all files from this Replit project
3. Drag and drop all files except `.replit` and deployment guides
4. Commit with message: "Initial Hitchbuddy deployment"

### Method B: GitHub CLI (if available)
```bash
git remote add origin https://github.com/yourusername/hitchbuddy.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Sign up/login with GitHub
3. Click "Import Git Repository"
4. Select your "hitchbuddy" repository
5. Vercel will auto-detect the configuration

## Step 4: Configure Environment Variables

In Vercel dashboard:
1. Go to your project → Settings → Environment Variables
2. Add: `DATABASE_URL` = your Supabase connection string
3. Add: `NODE_ENV` = production
4. Click "Deploy" to redeploy with environment variables

## Result

Your app will be live at: `https://hitchbuddy.vercel.app`

The deployment fixes ensure it displays the built React application instead of source code.