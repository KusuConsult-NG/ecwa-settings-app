# Vercel + Neon Database Setup Guide

This guide will help you deploy your ECWA Settings application on Vercel with Neon database integration.

## 🚀 Quick Setup

### 1. Create Neon Database

1. **Go to Neon Console**: [console.neon.tech](https://console.neon.tech/)
2. **Sign up/Login** with GitHub
3. **Create New Project**:
   - Project name: `ecwa-settings-db`
   - Region: Choose closest to your users
   - Database name: `neondb` (default)
4. **Copy Connection String**: Save the `DATABASE_URL` for later

### 2. Deploy to Vercel

#### Option A: Deploy from GitHub (Recommended)

1. **Push to GitHub** (already done ✅)
2. **Go to Vercel**: [vercel.com](https://vercel.com/)
3. **Import Project**:
   - Click "New Project"
   - Import from GitHub: `KusuConsult-NG/ecwa-settings-app`
   - Select the repository
4. **Configure Build Settings**:
   - Framework: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

#### Option B: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name: ecwa-settings-app
# - Directory: ./
# - Override settings? No
```

### 3. Configure Environment Variables

#### In Vercel Dashboard:

1. **Go to Project Settings**
2. **Click "Environment Variables"**
3. **Add the following variables**:

```env
# Required
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb
AUTH_SECRET=your-super-secret-jwt-key-here-change-this-in-production

# Optional
NODE_ENV=production
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

#### Using Vercel CLI:

```bash
# Add environment variables
vercel env add DATABASE_URL
# Paste your Neon connection string when prompted

vercel env add AUTH_SECRET
# Enter a strong secret key

# Deploy with new environment variables
vercel --prod
```

### 4. Initialize Database

After deployment, you need to initialize the database:

#### Option A: Using Vercel Functions

Create a one-time setup function:

```bash
# Create setup function
mkdir -p api/setup-db
```

Create `api/setup-db/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { createTables } from '@/lib/database';

export async function POST() {
  try {
    await createTables();
    return NextResponse.json({ 
      success: true, 
      message: 'Database tables created successfully' 
    });
  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Then call it once:
```bash
curl -X POST https://your-app.vercel.app/api/setup-db
```

#### Option B: Using Neon Console

1. **Go to Neon Console**
2. **Open SQL Editor**
3. **Run the schema creation** (from `src/lib/database.ts`)

### 5. Migrate Data (Optional)

If you have existing data to migrate:

```bash
# Set environment variable locally
export DATABASE_URL="your-neon-connection-string"

# Run migration
bun run migrate-neon
```

## 🔧 Vercel Configuration

### vercel.json

Create/update `vercel.json`:

```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "DATABASE_URL": "@database_url",
    "AUTH_SECRET": "@auth_secret"
  }
}
```

### next.config.js

Update your `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless']
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  }
}

module.exports = nextConfig
```

## 📊 Database Schema Setup

### Automatic Setup

The application will automatically create tables on first run if they don't exist.

### Manual Setup

If you prefer to set up manually:

1. **Go to Neon Console**
2. **Open SQL Editor**
3. **Run the schema** from `src/lib/database.ts`

## 🔍 Testing Deployment

### 1. Test Database Connection

```bash
# Test the deployed app
curl https://your-app.vercel.app/api/test-auth
```

### 2. Test Authentication

```bash
# Test login
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### 3. Test Data Operations

```bash
# Test agencies endpoint
curl https://your-app.vercel.app/api/agencies \
  -H "Cookie: auth=your-jwt-token"
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Error**: `Database connection failed`

**Solutions**:
- Check `DATABASE_URL` in Vercel environment variables
- Verify Neon database is active
- Check IP whitelisting in Neon console
- Ensure connection string format is correct

#### 2. Build Failures

**Error**: `Module not found: @neondatabase/serverless`

**Solutions**:
- Add to `next.config.js`:
  ```javascript
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless']
  }
  ```
- Ensure package is in `dependencies`, not `devDependencies`

#### 3. Environment Variables Not Loading

**Error**: `DATABASE_URL is undefined`

**Solutions**:
- Check variable names in Vercel dashboard
- Ensure variables are added to all environments (Production, Preview, Development)
- Redeploy after adding variables

#### 4. Function Timeout

**Error**: `Function execution timeout`

**Solutions**:
- Increase timeout in `vercel.json`:
  ```json
  {
    "functions": {
      "src/app/api/**/*.ts": {
        "maxDuration": 30
      }
    }
  }
  ```
- Optimize database queries
- Use connection pooling

### Debugging

#### 1. Check Vercel Logs

```bash
# View function logs
vercel logs https://your-app.vercel.app

# View real-time logs
vercel logs --follow
```

#### 2. Check Neon Logs

1. Go to Neon Console
2. Click on your project
3. Go to "Logs" tab
4. Check for connection errors

#### 3. Test Locally with Production DB

```bash
# Set production DATABASE_URL
export DATABASE_URL="your-neon-connection-string"

# Test locally
bun dev
```

## 📈 Performance Optimization

### 1. Connection Pooling

Neon automatically handles connection pooling, but you can optimize:

```typescript
// In src/lib/database.ts
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!, {
  arrayMode: false,
  fullResults: false
});
```

### 2. Query Optimization

- Use indexes on frequently queried columns
- Limit result sets with `LIMIT`
- Use prepared statements
- Monitor query performance in Neon console

### 3. Caching

Consider adding Redis for frequently accessed data:

```typescript
// Example with Vercel KV
import { kv } from '@vercel/kv';

export async function getCachedData(key: string) {
  const cached = await kv.get(key);
  if (cached) return cached;
  
  const data = await sql`SELECT * FROM table WHERE id = ${key}`;
  await kv.set(key, data, { ex: 3600 }); // 1 hour cache
  return data;
}
```

## 🔒 Security Best Practices

### 1. Environment Variables

- Never commit `DATABASE_URL` to version control
- Use Vercel's environment variable system
- Rotate secrets regularly
- Use different databases for different environments

### 2. Database Security

- Enable SSL/TLS (automatic with Neon)
- Use least privilege principle
- Regularly audit access logs
- Enable IP whitelisting if needed

### 3. Application Security

- Validate all inputs
- Use parameterized queries
- Implement rate limiting
- Monitor for suspicious activity

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PostgreSQL Best Practices](https://www.postgresql.org/docs/current/performance-tips.html)

## 🆘 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check Neon console logs
3. Verify environment variables
4. Test database connection
5. Contact support if needed

---

**Note**: This setup provides a production-ready deployment with automatic scaling, global CDN, and enterprise-grade database hosting.
