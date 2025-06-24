# How to Retrieve Your Supabase DATABASE_URL

## Step-by-Step Instructions

### 1. Access Supabase Dashboard
- Go to [supabase.com/dashboard](https://supabase.com/dashboard)
- Login to your account

### 2. Select Your Project
- Find your Hitchbuddy project in the dashboard
- Click on it to open the project

### 3. Get Connection String
- Look for the **"Connect"** button (usually in the top toolbar)
- Click **"Connect"**
- In the popup, find **"Connection string"** section
- Select **"Transaction pooler"** tab
- Copy the **URI** value

### 4. Format Check
Your connection string should look like:
```
postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres
```

### 5. Replace Password
- Replace `[YOUR-PASSWORD]` with your actual database password
- This is the password you set when creating the Supabase project

## Alternative Method
If you can't find the Connect button:
1. Go to **Settings** → **Database**
2. Look for **Connection string** section
3. Copy the **URI** under **Connection pooler**

## Next Steps
Once you have the complete connection string:
1. Use it in Vercel dashboard as `DATABASE_URL`
2. The format should be exactly as shown above
3. No modifications needed - use the complete string

## Security Note
Keep this connection string secure - it contains your database credentials.