#!/bin/bash
# Quick Webhook & Comment Automation Test Script
# This script helps you verify and fix webhook and comment automation

echo "🚀 MetaSolution Webhook & Comment Automation Fix"
echo "================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
VERCEL_URL="https://metasolution-rho.vercel.app"
WEBHOOK_URL="${VERCEL_URL}/webhook"
VERIFY_TOKEN="${VERIFY_TOKEN:-myapp4204}"

echo -e "${YELLOW}📍 Webhook URL:${NC} ${WEBHOOK_URL}"
echo -e "${YELLOW}🔑 Verify Token:${NC} ${VERIFY_TOKEN}"
echo ""

# Step 1: Test webhook endpoint
echo "🔍 Step 1: Testing webhook endpoint..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${WEBHOOK_URL}?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=test")

if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅${NC} Webhook endpoint is accessible"
else
    echo -e "${RED}❌${NC} Webhook endpoint not responding (HTTP $RESPONSE)"
    echo "   💡 Make sure your Vercel deployment is live"
    exit 1
fi

echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1️⃣  Resubscribe to Facebook Webhook:"
echo "   node webhook_resubscribe_and_fix.js <PAGE_ACCESS_TOKEN>"
echo ""
echo "2️⃣  Check Health Status:"
echo "   curl ${VERCEL_URL}/api/health/token"
echo "   curl ${VERCEL_URL}/api/health/webhook"
echo "   curl ${VERCEL_URL}/api/health/automation"
echo ""
echo "3️⃣  Test Comment Automation:"
echo "   - Go to your Facebook page"
echo "   - Comment on any post with 'price' or 'দাম'"
echo "   - Check if auto-reply works"
echo ""
echo "4️⃣  Monitor Logs:"
echo "   - Check Vercel deployment logs"
echo "   - Look for [WEBHOOK] and [Comment] entries"
echo ""
echo -e "${GREEN}✅${NC} Setup ready! Run the resubscribe script with your Page Access Token."
