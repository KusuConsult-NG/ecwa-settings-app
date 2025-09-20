# Environment Variables Setup for New Vercel Deployment

## 🔧 Required Environment Variables

After your deployment is complete, add these environment variables:

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Click on your new project: `ecwa-settings-app-v2`
- Go to Settings → Environment Variables

### 2. Add These Variables

#### **DATABASE_URL** (for Neon Database)
```
Name: DATABASE_URL
Value: postgresql://neondb_owner:npg_8iVZwHmaxgy7@ep-old-truth-admsvs0a-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
Environments: Production, Preview, Development
```

#### **MONGODB_URI** (for MongoDB)
```
Name: MONGODB_URI
Value: mongodb+srv://gonana:YRJXv3mTD2Xtt854@churchflow.mnlhhpg.mongodb.net/ecwa-settings?retryWrites=true&w=majority&appName=Churchflow
Environments: Production, Preview, Development
```

#### **NODE_ENV** (optional)
```
Name: NODE_ENV
Value: production
Environments: Production, Preview, Development
```

### 3. Redeploy After Adding Variables
- After adding environment variables
- Go to Deployments tab
- Click "Redeploy" on the latest deployment
- Wait for completion

## ✅ Test After Setup

Run the test script:
```bash
bun test-new-deployment.js
```

Or test manually:
```bash
# Test basic connectivity
curl -X GET https://ecwa-settings-app-v2.vercel.app/api/test-vercel

# Test authentication
curl -X POST https://ecwa-settings-app-v2.vercel.app/api/init-new-auth
```

## 🎯 Expected Results

After adding environment variables and redeploying:
- ✅ All API endpoints working
- ✅ Authentication systems functional
- ✅ Database connections working
- ✅ No middleware blocking issues

**The new deployment will have a fresh cache and work immediately!** 🚀
