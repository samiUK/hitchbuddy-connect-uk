# Your Supabase DATABASE_URL

## Where to Find It
Your DATABASE_URL is the same connection string you provided earlier when setting up the secrets in Replit.

## Format
Your Supabase connection string follows this format:
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

## For Vercel Configuration
Use the exact same DATABASE_URL value in your Vercel dashboard:

1. **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**
2. Add variable:
   - Name: `DATABASE_URL`
   - Value: [Your complete Supabase connection string]
   - Environments: Production, Preview, Development

## Verification
Your database is working correctly - I can confirm the connection is active and all tables are synchronized.

## If You Need to Retrieve It
If you need to find your original Supabase connection string:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click "Connect" button
4. Copy the "URI" under "Connection string" → "Transaction pooler"
5. Replace `[YOUR-PASSWORD]` with your actual database password