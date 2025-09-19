# ECWA Settings App - Render.com Deployment

## 🚀 Render.com Deployment Guide

This app is configured for Render.com hosting with full Next.js functionality.

### Prerequisites
- Render.com account (free tier available)
- GitHub repository with the code
- Node.js 18+ for local development

### Deployment Steps

#### 1. Connect Repository to Render

1. **Go to Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Sign up/Login with GitHub

2. **Create New Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository: `KusuConsult-NG/ecwa-settings-app`
   - Select the repository

#### 2. Configure Build Settings

**Basic Settings:**
- **Name**: `ecwa-settings-app` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `/` (leave empty)

**Build & Deploy:**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Auto-Deploy**: `Yes` (deploys on every push to main)

#### 3. Environment Variables

Set these environment variables in Render:

```env
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here
```

**To set environment variables:**
1. Go to your service in Render dashboard
2. Click "Environment" tab
3. Add the variables above
4. Click "Save Changes"

#### 4. Deploy

1. **Automatic Deployment**
   - Push to `main` branch
   - Render will automatically build and deploy

2. **Manual Deployment**
   - Go to "Manual Deploy" tab
   - Click "Deploy latest commit"

### Render Configuration

The app uses the `render.yaml` file for configuration:

```yaml
services:
  - type: web
    name: ecwa-settings-app
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        generateValue: true
    healthCheckPath: /
    autoDeploy: true
    branch: main
    rootDir: .
```

### Full Functionality

✅ **Render.com Benefits:**
- **Full Next.js Support** - API routes work perfectly
- **Server-Side Rendering** - Dynamic content generation
- **Database Support** - Can connect to external databases
- **Authentication** - Login/signup/password reset fully functional
- **All Features** - Complete ECWA management system works

### Database Options

For data persistence, consider these options:

1. **Render PostgreSQL** (Recommended)
   - Add PostgreSQL service in Render
   - Connect to your web service
   - Use Prisma or similar ORM

2. **External Databases**
   - PlanetScale (MySQL)
   - Supabase (PostgreSQL)
   - MongoDB Atlas
   - Firebase Firestore

3. **File-based Storage** (Current)
   - KV store for simple data
   - File system for complex data
   - Good for development/testing

### Custom Domain Setup

1. **Add Custom Domain**
   - Go to your service settings
   - Click "Custom Domains"
   - Add your domain name

2. **DNS Configuration**
   - Add CNAME record pointing to your Render URL
   - Or use A record with Render's IP

### Performance Features

✅ **Render.com Benefits:**
- **Global CDN** - Fast loading worldwide
- **Automatic HTTPS** - SSL certificates included
- **Auto-scaling** - Handles traffic spikes
- **Health Checks** - Automatic service monitoring
- **Logs** - Real-time application logs
- **Metrics** - Performance monitoring

### Free Tier Limits

**Free Tier Includes:**
- **750 hours/month** - Enough for small apps
- **512MB RAM** - Sufficient for Next.js apps
- **Custom domains** - Free
- **HTTPS** - Free
- **Auto-deploy** - Free

**Upgrade to Paid:**
- **Starter Plan**: $7/month
- **Standard Plan**: $25/month
- **Pro Plan**: $85/month

### Troubleshooting

1. **Build Fails**
   - Check Node.js version (18+)
   - Verify build command: `npm install && npm run build`
   - Check logs in Render dashboard

2. **App Crashes**
   - Check start command: `npm start`
   - Verify environment variables
   - Check application logs

3. **Database Connection Issues**
   - Verify database URL
   - Check network connectivity
   - Ensure database is accessible

4. **API Routes Not Working**
   - Ensure you're not using static export
   - Check Next.js configuration
   - Verify server-side rendering is enabled

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

**Required:**
```env
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here
```

**Optional:**
```env
DATABASE_URL=your-database-connection-string
NEXTAUTH_URL=https://your-app.onrender.com
NEXTAUTH_SECRET=your-nextauth-secret
```

### Security Considerations

1. **Environment Variables**
   - Never commit secrets to Git
   - Use Render's environment variable system
   - Rotate secrets regularly

2. **HTTPS**
   - Render provides automatic HTTPS
   - Always use HTTPS in production

3. **CORS**
   - Configure CORS for API routes
   - Restrict origins in production

### Monitoring

1. **Application Logs**
   - Real-time logs in Render dashboard
   - Filter by log level
   - Download logs for analysis

2. **Metrics**
   - CPU and memory usage
   - Response times
   - Error rates

3. **Health Checks**
   - Automatic health monitoring
   - Custom health check endpoints
   - Automatic restarts on failure

### Support

- [Render Documentation](https://render.com/docs)
- [Next.js on Render](https://render.com/docs/deploy-nextjs)
- [Render Community](https://community.render.com/)

### Cost Optimization

1. **Free Tier**
   - Use free tier for development
   - Monitor usage to avoid overages

2. **Paid Plans**
   - Upgrade only when needed
   - Monitor usage patterns
   - Use auto-scaling features

3. **Database**
   - Use external databases for better performance
   - Consider connection pooling
   - Optimize queries

The app is now ready for Render.com deployment with full functionality! 🎉
