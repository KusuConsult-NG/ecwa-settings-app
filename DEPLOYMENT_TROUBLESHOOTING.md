# Vercel Deployment Troubleshooting

## Common Issues and Solutions

### 1. Build Fails - Missing Dependencies
**Error**: `Module not found` or `Cannot resolve module`

**Solution**: 
- Ensure all dependencies are in `package.json`
- Run `bun install` locally to verify
- Check that `bun.lock` is committed

### 2. Build Fails - TypeScript Errors
**Error**: `Type error` or `Cannot find name`

**Solution**:
- Run `bun run build` locally to check for errors
- Fix any TypeScript errors before deploying
- Ensure all imports are correct

### 3. Build Fails - Environment Variables
**Error**: `AUTH_SECRET is not defined`

**Solution**:
- Set `AUTH_SECRET` in Vercel dashboard
- Go to Project Settings > Environment Variables
- Add: `AUTH_SECRET=your-secret-key-here`

### 4. Runtime Error - Database Connection
**Error**: `Cannot connect to database`

**Solution**:
- The app uses file-based storage as fallback
- No external database required
- Data persists in Vercel's file system

### 5. Build Fails - Node.js Version
**Error**: `Node.js version mismatch`

**Solution**:
- Vercel uses Node.js 18 by default
- No configuration needed
- App is compatible with Node.js 18

## Step-by-Step Fix

1. **Check Build Locally**:
   ```bash
   bun run build
   ```

2. **Set Environment Variables in Vercel**:
   - Go to Vercel Dashboard
   - Select your project
   - Go to Settings > Environment Variables
   - Add: `AUTH_SECRET=your-secret-key-here`

3. **Redeploy**:
   - Click "Redeploy" in Vercel dashboard
   - Or push a new commit to trigger deployment

## Required Environment Variables

```
AUTH_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
```

## Optional Environment Variables

```
KV_REST_API_URL=your-kv-url (if using external KV store)
KV_REST_API_TOKEN=your-kv-token (if using external KV store)
```

## If Still Failing

1. **Check Vercel Build Logs**:
   - Go to Vercel Dashboard
   - Click on your project
   - Go to "Functions" tab
   - Check build logs for specific errors

2. **Common Build Commands**:
   - Vercel auto-detects Next.js
   - Build command: `next build`
   - Output directory: `.next`

3. **Contact Support**:
   - If issues persist, check Vercel documentation
   - Or create a new deployment with fresh settings
