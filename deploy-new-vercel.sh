#!/bin/bash

echo "🚀 DEPLOYING TO NEW VERCEL PROJECT"
echo "=================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not installed. Installing..."
    npm install -g vercel
fi

echo "📦 Installing dependencies..."
bun install

echo "🔧 Building project..."
bun run build

echo "🚀 Deploying to new Vercel project..."
echo "This will create a new project with a fresh cache!"

# Deploy to new project
vercel --prod --name ecwa-settings-app-v2

echo "✅ Deployment complete!"
echo "🔗 Your new app URL will be shown above"
echo ""
echo "📋 Next steps:"
echo "1. Go to Vercel Dashboard"
echo "2. Find your new project: ecwa-settings-app-v2"
echo "3. Go to Settings → Environment Variables"
echo "4. Add your environment variables:"
echo "   - DATABASE_URL (if using Neon)"
echo "   - MONGODB_URI (if using MongoDB)"
echo "5. Test the new deployment!"
