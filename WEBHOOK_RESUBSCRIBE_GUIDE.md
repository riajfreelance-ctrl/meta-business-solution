# Webhook Resubscribe & Comment Automation Fix Guide

## 🎯 Overview
This guide helps you resubscribe to Facebook webhooks and fix comment automation for your MetaSolution deployment.

## 📋 Prerequisites
- Facebook Page Access Token
- Vercel deployment is live at: `https://metasolution-rho.vercel.app`
- Node.js installed on your system

## 🚀 Quick Start

### Option 1: Automated Fix (Recommended)

Run the comprehensive fix script:

```bash
node webhook_resubscribe_and_fix.js <YOUR_PAGE_ACCESS_TOKEN>
```

Example:
```bash
node webhook_resubscribe_and_fix.js EAAY1234567890...
```

This script will:
1. ✅ Verify webhook endpoint is accessible
2. ✅ Validate your Page Access Token
3. ✅ Check current webhook subscriptions
4. ✅ Resubscribe to required fields (messages, feed, messaging_postbacks)
5. ✅ Verify subscription status
6. ✅ Check comment automation settings for all brands
7. ✅ Provide detailed status report

### Option 2: Manual Steps

#### Step 1: Verify Webhook Endpoint

```bash
curl "https://metasolution-rho.vercel.app/webhook?hub.mode=subscribe&hub.verify_token=myapp4204&hub.challenge=test"
```

Expected response: `test`

#### Step 2: Resubscribe to Webhook

```bash
curl -X POST "https://graph.facebook.com/v21.0/<PAGE_ID>/subscribed_apps" \
  -d "subscribed_fields=messages,messaging_postbacks,feed" \
  -d "access_token=<PAGE_ACCESS_TOKEN>"
```

#### Step 3: Verify Subscription

```bash
curl "https://graph.facebook.com/v21.0/<PAGE_ID>/subscribed_apps?access_token=<PAGE_ACCESS_TOKEN>"
```

Expected response should include:
```json
{
  "data": [
    {
      "app_id": "YOUR_APP_ID",
      "subscribed_fields": ["messages", "messaging_postbacks", "feed"]
    }
  ]
}
```

## 🔍 Health Checks

### Check Token Status
```bash
curl https://metasolution-rho.vercel.app/api/health/token
```

### Check Webhook Subscription
```bash
curl https://metasolution-rho.vercel.app/api/health/webhook
```

### Check Automation Status
```bash
curl https://metasolution-rho.vercel.app/api/health/automation
```

## 🤖 Comment Automation Configuration

### Required Settings

For comment automation to work, ensure these settings are enabled in your brand:

1. **systemAutoReply**: `true` (default)
   - Enables keyword-based auto-replies from comment drafts

2. **aiReply**: `true` (default)
   - Enables AI-powered replies when no keyword match found

3. **autoLike**: `true` (optional)
   - Automatically likes user comments

4. **spamFilter**: `true` (optional)
   - Filters spam comments

5. **leadCapture**: `true` (optional)
   - Captures leads from comments

### Setting Up Comment Drafts

1. Go to Dashboard → Brand → Comment Automation
2. Create comment drafts with:
   - Keywords (e.g., "price", "দাম", "cost")
   - Public reply (visible to everyone)
   - Private reply (sent to inbox)
   - Optional: Button text and URL

### AI Fallback

If no keyword match is found, the system uses Google Gemini AI to generate replies automatically. Ensure:
- `GEMINI_API_KEY` is set in Vercel environment variables
- OR `googleAIKey` is set in brand settings

## 🧪 Testing

### Test Comment Automation

1. Go to your Facebook page
2. Find any post
3. Comment with a keyword like:
   - "price"
   - "দাম কত?"
   - "cost?"
   - "hi"

4. **Expected Behavior:**
   - Public reply appears on your comment within 5-10 seconds
   - Private message sent to your inbox
   - Comment logged in Firestore

### Monitor Logs

Check Vercel deployment logs for:
- `[WEBHOOK]` - Webhook received
- `[Comment]` - Comment processing started
- `[System MATCH]` - Keyword match found
- `[AI]` - AI response generated
- `[REPLY ERROR]` - Reply failed (check error details)

## 🐛 Troubleshooting

### Issue: Webhook Not Receiving Events

**Check:**
1. Webhook URL is exactly: `https://metasolution-rho.vercel.app/webhook`
2. Verify token matches: `myapp4204` (or your custom token)
3. Subscription includes `feed` field
4. Vercel deployment is live and accessible

**Fix:**
```bash
node webhook_resubscribe_and_fix.js <PAGE_ACCESS_TOKEN>
```

### Issue: Comments Not Getting Replies

**Check:**
1. Webhook is subscribed to `feed` events
2. Brand has `commentSettings.systemAutoReply` enabled
3. Brand has `commentSettings.aiReply` enabled
4. Comment drafts exist OR GEMINI_API_KEY is set
5. Facebook Page Token is valid

**Fix:**
```bash
# Check automation status
curl https://metasolution-rho.vercel.app/api/health/automation

# Check token validity
curl https://metasolution-rho.vercel.app/api/health/token
```

### Issue: AI Replies Not Working

**Check:**
1. `GEMINI_API_KEY` environment variable is set in Vercel
2. API key is valid and has quota
3. Check Vercel logs for AI errors

**Fix:**
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add/update `GEMINI_API_KEY` with your Google AI Studio key
3. Redeploy the application

### Issue: Signature Validation Errors

**Check:**
1. `APP_SECRET` environment variable is set in Vercel
2. APP_SECRET matches your Facebook App Secret

**Note:** Signature validation is currently logged but not enforced (to prevent message loss during debugging).

## 📊 Webhook Fields Explained

| Field | Purpose | Required For |
|-------|---------|--------------|
| `messages` | Facebook Messenger messages | Inbox automation |
| `feed` | Post comments | Comment automation |
| `messaging_postbacks` | Button clicks | Interactive messages |

## 🔧 Advanced Configuration

### Environment Variables (Vercel)

Required:
- `PAGE_ACCESS_TOKEN` - Facebook Page Access Token
- `VERIFY_TOKEN` - Webhook verification token (default: myapp4204)
- `APP_SECRET` - Facebook App Secret (for signature validation)
- `GEMINI_API_KEY` - Google Gemini API key (for AI replies)

Optional:
- `FIREBASE_SERVICE_ACCOUNT` - Firebase service account JSON
- Various other Firebase and API keys

### Facebook Developer Console Setup

1. Go to https://developers.facebook.com/apps
2. Select your app
3. Navigate to **Webhooks** section
4. Select **Page** from dropdown
5. Configure:
   - **Callback URL**: `https://metasolution-rho.vercel.app/webhook`
   - **Verify Token**: `myapp4204`
6. Subscribe to fields: `messages`, `messaging_postbacks`, `feed`
7. Click **Verify and Save**

## 📝 Files Reference

- `webhook_resubscribe_and_fix.js` - Comprehensive fix script
- `test_webhook_quick.sh` - Quick webhook test script
- `setup_facebook_webhook.js` - Original webhook setup script
- `server/controllers/fbController.js` - Webhook handlers and comment automation
- `server/routes/facebook.js` - Facebook API routes
- `server/index.js` - Main server with webhook routes
- `vercel.json` - Vercel routing configuration

## ✅ Verification Checklist

- [ ] Webhook endpoint responds to verification challenge
- [ ] Page Access Token is valid
- [ ] Subscribed to `feed` field (for comments)
- [ ] Subscribed to `messages` field (for inbox)
- [ ] Comment automation enabled in brand settings
- [ ] Comment drafts created OR AI enabled
- [ ] Test comment receives auto-reply
- [ ] No errors in Vercel logs

## 🆘 Support

If issues persist:
1. Check all health endpoints
2. Review Vercel deployment logs
3. Verify Facebook App permissions
4. Ensure Page Token has required permissions:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `pages_manage_metadata`
   - `pages_messaging`

## 📚 Additional Resources

- [Facebook Webhooks Documentation](https://developers.facebook.com/docs/graph-api/webhooks)
- [Graph API Reference](https://developers.facebook.com/docs/graph-api/reference/)
- [MetaSolution Project Wiki](./.qoder/repowiki/en/content/)
