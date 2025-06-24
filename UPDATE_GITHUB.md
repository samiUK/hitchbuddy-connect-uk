# Update Your GitHub Repository - Critical Fix

## Issue
Your Vercel deployment shows TypeScript source code instead of the Hitchbuddy app.

## Files to Replace in GitHub

### 1. Add `vercel.json` (Root Directory)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/api/server.js"
    }
  ],
  "functions": {
    "api/server.js": {
      "maxDuration": 30
    }
  }
}
```

### 2. Replace `client/dist/` folder
Upload the entire rebuilt `client/dist` folder with:
- `index.html`
- `assets/` folder with JS and CSS bundles

### 3. Verify Environment Variables
In Vercel dashboard: Settings → Environment Variables
- `DATABASE_URL`: Your Supabase connection string
- `NODE_ENV`: production

## Result
After updating these files, Vercel will redeploy and serve your Hitchbuddy application properly.