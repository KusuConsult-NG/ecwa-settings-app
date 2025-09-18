# Vercel Environment Variables Setup

## The Issue
Your app works locally but breaks on Vercel because the JWT_SECRET environment variable is missing.

## Solution
Add these environment variables to your Vercel project:

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Click on your `ecwa-settings-app` project
- Go to **Settings** → **Environment Variables**

### 2. Add These Variables
```
JWT_SECRET = your-super-secret-jwt-key-here-change-this-in-production
AUTH_SECRET = your-super-secret-jwt-key-here-change-this-in-production
NODE_ENV = production
```

### 3. Redeploy
- After adding the variables, Vercel will automatically redeploy
- Or trigger a manual redeploy from the dashboard

## Why This Happens
- Local development uses `.env.local` file
- Vercel production needs environment variables set in the dashboard
- Without JWT_SECRET, the middleware can't verify tokens
- This causes the redirect loop you're experiencing

## Test After Setup
1. Wait for Vercel to redeploy (usually 1-2 minutes)
2. Test signup on: https://ecwa-settings-app-1zja.vercel.app/signup
3. Should work exactly like local development

## Security Note
Make sure to use a strong, unique JWT_SECRET in production!
