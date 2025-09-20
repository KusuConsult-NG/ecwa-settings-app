#!/bin/bash

# Vercel + Neon Deployment Script for ECWA Settings App

echo "🚀 Starting Vercel + Neon deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel:"
    vercel login
fi

echo "📦 Building project..."
bun run build

echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to Vercel dashboard: https://vercel.com/dashboard"
echo "2. Select your project"
echo "3. Go to Settings > Environment Variables"
echo "4. Add DATABASE_URL with your Neon connection string"
echo "5. Add AUTH_SECRET with a strong secret key"
echo "6. Redeploy the project"
echo "7. Initialize database: curl -X POST https://your-app.vercel.app/api/setup-db"
echo ""
echo "🎉 Your app is now live with Neon database!"
