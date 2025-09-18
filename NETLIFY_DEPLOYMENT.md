# Netlify Deployment Guide

## Prerequisites
- GitHub repository with your code
- Netlify account
- Environment variables configured

## Step 1: Connect Repository to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "New site from Git"
3. Choose "GitHub" and authorize Netlify
4. Select your repository: `KusuConsult-NG/ecwa-settings-app`
5. Configure build settings:
   - **Build command**: `bun run build`
   - **Publish directory**: `.next`
   - **Node version**: `18`

## Step 2: Configure Environment Variables

In Netlify dashboard, go to Site Settings > Environment Variables and add:

```
AUTH_SECRET=your-super-secret-key-here-change-this-in-production
NODE_ENV=production
KV_REST_API_URL=your-kv-rest-api-url
KV_REST_API_TOKEN=your-kv-rest-api-token
```

## Step 3: Configure Build Settings

1. Go to Site Settings > Build & Deploy > Build Settings
2. Set:
   - **Build command**: `bun run build`
   - **Publish directory**: `.next`
   - **Node version**: `18`

## Step 4: Configure Redirects

The `netlify.toml` file is already configured with:
- API routes redirects
- Security headers
- CORS settings

## Step 5: Deploy

1. Click "Deploy site"
2. Wait for build to complete
3. Your app will be available at `https://your-site-name.netlify.app`

## Important Notes

- **Database**: You'll need to set up a database service (Netlify KV, PlanetScale, or similar)
- **Environment Variables**: Make sure to set all required environment variables
- **Build Time**: First build may take 5-10 minutes
- **Custom Domain**: You can add a custom domain in Site Settings

## Troubleshooting

- **Build Fails**: Check build logs in Netlify dashboard
- **Environment Variables**: Ensure all required variables are set
- **Database Connection**: Verify your database credentials
- **API Routes**: Check that API routes are working in Functions tab

## Alternative: Netlify CLI

You can also deploy using Netlify CLI:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```
