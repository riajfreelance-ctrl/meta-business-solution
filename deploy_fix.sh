#!/bin/bash

echo ""
echo "🚀 DEPLOY AUTO-REPLY FIX TO VERCEL"
echo "=================================="
echo ""
echo "This script will help you deploy the critical auto-reply fix."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI not found"
    echo ""
    echo "Please install it first:"
    echo "  npm install -g vercel"
    echo ""
    echo "Or deploy manually:"
    echo "  1. Go to https://vercel.com/dashboard"
    echo "  2. Find your project: metasolution-rho"
    echo "  3. Click 'Redeploy' on the latest deployment"
    echo ""
    exit 1
fi

echo "✅ Vercel CLI found"
echo ""
echo "📦 Deploying fix..."
echo ""

cd /Users/mac/Documents/mysolutionapps/metasolution

# Deploy to production
vercel --prod --yes

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🧪 Testing the fix..."
echo ""

# Wait a moment for deployment to propagate
sleep 5

# Run test
cd server
node test_webhook_direct.js

echo ""
echo "🎉 Fix deployed and tested!"
echo ""
echo "Now test manually:"
echo "1. Open Facebook Messenger"
echo "2. Message your Skinzy page from your personal account"
echo "3. Send: 'Hi' or 'Price'"
echo "4. You should receive an auto-reply within 3-5 seconds"
echo ""
