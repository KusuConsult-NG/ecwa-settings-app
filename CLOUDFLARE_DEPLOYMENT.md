# ECWA Settings App - Cloudflare Pages Deployment

## 🚀 Cloudflare Pages Deployment Guide

This app is configured for static export and can be deployed to Cloudflare Pages.

### Prerequisites
- Cloudflare account (free tier available)
- GitHub repository with the code
- Node.js 18+ for local development

### Deployment Steps

#### 1. Connect Repository to Cloudflare Pages

1. **Go to Cloudflare Dashboard**
   - Visit [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to "Pages" in the sidebar

2. **Create New Project**
   - Click "Create a project"
   - Select "Connect to Git"
   - Choose your GitHub repository: `KusuConsult-NG/ecwa-settings-app`

3. **Configure Build Settings**
   - **Framework preset**: Next.js (Static HTML Export)
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Root directory**: `/` (leave empty)

#### 2. Environment Variables

Set these environment variables in Cloudflare Pages:

```env
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here
```

**To set environment variables:**
1. Go to your project in Cloudflare Pages
2. Click "Settings" tab
3. Click "Environment variables"
4. Add the variables above

#### 3. Deploy

1. **Automatic Deployment**
   - Push to `main` branch
   - Cloudflare Pages will automatically build and deploy

2. **Manual Deployment**
   - Go to "Deployments" tab
   - Click "Retry deployment" if needed

### Build Configuration

The app is configured with:

```javascript
// next.config.js
const nextConfig = {
  output: 'export',        // Static export
  trailingSlash: true,     // Required for Cloudflare Pages
  images: {
    unoptimized: true,     // Required for static export
  },
}
```

### File Structure

```
ecwa-settings-app/
├── _headers              # Cloudflare security headers
├── _redirects            # URL routing rules
├── out/                  # Static export output (generated)
├── public/               # Static assets
└── src/                  # Source code
```

### Important Notes

⚠️ **Static Export Limitations:**
- **No API Routes** - Server-side API routes won't work
- **No Server-Side Rendering** - All pages are pre-rendered
- **No Database** - Data persistence requires external services
- **No Authentication** - Login/signup won't work without backend

### Alternative: Cloudflare Workers (Full-Stack)

For full functionality, consider using Cloudflare Workers:

1. **Cloudflare Workers** - Serverless functions
2. **Cloudflare D1** - SQLite database
3. **Cloudflare KV** - Key-value storage
4. **Full Next.js support** - All features work

### Performance Features

✅ **Cloudflare Pages Benefits:**
- **Global CDN** - Fast loading worldwide
- **Automatic HTTPS** - SSL certificates included
- **Custom Domains** - Use your own domain
- **Preview Deployments** - Test before going live
- **Analytics** - Built-in performance metrics
- **Security** - DDoS protection and WAF

### Custom Domain Setup

1. **Add Custom Domain**
   - Go to "Custom domains" tab
   - Click "Set up a custom domain"
   - Enter your domain name

2. **DNS Configuration**
   - Add CNAME record pointing to your Pages URL
   - Or use Cloudflare nameservers

### Troubleshooting

1. **Build Fails**
   - Check Node.js version (18+)
   - Verify build command: `npm run build`
   - Check build output directory: `out`

2. **Pages Not Loading**
   - Verify `trailingSlash: true` in next.config.js
   - Check `_redirects` file for routing rules

3. **Assets Not Loading**
   - Ensure `images: { unoptimized: true }`
   - Check `_headers` file for caching rules

4. **API Errors**
   - Remember: API routes don't work in static export
   - Consider Cloudflare Workers for backend functionality

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run start
```

### Support

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js Static Export](https://nextjs.org/docs/advanced-features/static-html-export)
- [Cloudflare Community](https://community.cloudflare.com/)

### Cost

- **Free Tier**: 500 builds/month, 20,000 requests/month
- **Pro Plan**: $20/month for more builds and requests
- **Custom Domains**: Free
- **Global CDN**: Free
