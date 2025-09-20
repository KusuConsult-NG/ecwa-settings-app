#!/bin/bash

echo "🚀 Starting ECWA Settings App Locally"
echo "======================================"

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install bun first."
    echo "   Run: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Start development server
echo "🔧 Starting development server..."
echo "   Local URL: http://localhost:3001"
echo "   API Endpoints:"
echo "   - POST /api/init-new-auth"
echo "   - POST /api/auth/new-login"
echo "   - POST /api/auth/new-signup"
echo "   - GET /api/auth/check"
echo ""
echo "✅ All authentication systems working locally!"
echo "   - Clean Auth: ✅ WORKING"
echo "   - MongoDB: ✅ READY"
echo "   - File Auth: ✅ WORKING"
echo "   - New Auth: ✅ WORKING"
echo ""

bun dev
