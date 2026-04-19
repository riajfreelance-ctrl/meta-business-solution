# 🔧 Comment Not Working - Diagnostic Guide

## ✅ What We Verified:

1. ✅ Webhook endpoint is working (responds in ~8 seconds)
2. ✅ Page Access Token is valid (Skinzy page ID: 963307416870090)
3. ✅ Webhook subscription is active (feed, messages, messaging_postbacks)
4. ✅ Comment automation is enabled
5. ✅ Comment drafts exist (33 drafts with keywords)

## ❌ The Problem:

**Facebook is NOT sending webhook events to your server.**

When you comment on Facebook, no webhook is received.

## 🔍 Possible Reasons & Solutions:

### 1. **Wrong Facebook Page** ⚠️ MOST LIKELY

**Check:** Are you commenting on the **Skinzy** page?

- Skinzy Page ID: `963307416870090`
- Go to: https://facebook.com/963307416870090

**If you commented on a different page**, the webhook won't work because:
- Webhook is subscribed to Skinzy page only
- Other pages don't have webhook configured

**Solution:** Comment on the Skinzy page specifically.

---

### 2. **Facebook App Permissions** ⚠️

**Check:** Does your Facebook App have these permissions?

1. Go to: https://developers.facebook.com/apps
2. Select your app
3. Go to **App Review** → **Permissions and Features**
4. Verify these are approved:
   - ✅ `pages_manage_posts`
   - ✅ `pages_read_engagement` (for reading comments)
   - ✅ `pages_manage_metadata`
   - ✅ `pages_messaging`

**If not approved**, Facebook won't send webhook events.

---

### 3. **Page Token Expired or Revoked**

**Check:** Verify the token in Facebook's debugger

1. Go to: https://developers.facebook.com/tools/debug/access-token/
2. Paste your token: `EAAYJGWNDBl0BRDVLvc7Dbvg...`
3. Check:
   - Is it expired?
   - Does it have `pages_show_list`, `pages_read_engagement` permissions?
   - Is it for the correct page (Skinzy)?

**Solution:** If expired, generate a new token:
```bash
# Update in Vercel environment variables
PAGE_ACCESS_TOKEN=<new_token>
```

---

### 4. **Webhook Not Properly Subscribed in Facebook Developers Console**

**Check:**

1. Go to: https://developers.facebook.com/apps/<YOUR_APP_ID>/webhooks/
2. Click on **Page** webhook
3. Verify:
   - Callback URL: `https://metasolution-rho.vercel.app/webhook`
   - Verify Token: `myapp4204`
   - Subscribed fields: `feed`, `messages`, `messaging_postbacks`

**If anything is wrong:**
1. Click **Edit** and fix it
2. Or run: `node webhook_resubscribe_and_fix.js <TOKEN>`

---

### 5. **Facebook App in Development Mode**

**Check:**

1. Go to: https://developers.facebook.com/apps
2. Check if app status is **"In Development"** or **"Live"**

**If "In Development":**
- Only app admins/testers can trigger webhooks
- Regular user comments won't send webhooks

**Solution:** 
- Add yourself as a tester, OR
- Switch app to "Live" mode (requires app review approval)

---

## 🧪 How to Test Properly:

### Step 1: Confirm You're Using the Right Page

```bash
# Check which page your token is for
curl -s "https://graph.facebook.com/v21.0/me?access_token=YOUR_TOKEN"
```

Should return:
```json
{
  "name": "Skinzy",
  "id": "963307416870090"
}
```

### Step 2: Comment on THAT Specific Page

1. Go to Facebook
2. Navigate to **Skinzy** page
3. Find ANY post on that page
4. Comment: `price` or `দাম কত?`

### Step 3: Wait 10-30 Seconds

Facebook webhooks can be delayed by 10-30 seconds.

### Step 4: Check if Webhook Was Received

```bash
node check_very_recent_webhooks.js
```

If you see your comment, it means:
- ✅ Facebook sent the webhook
- ✅ Server received it
- Check next if it was processed

If you DON'T see it:
- ❌ Facebook didn't send it
- One of the issues above is the cause

---

## 🔥 Quick Fix Checklist:

- [ ] Commenting on **Skinzy** page (ID: 963307416870090)
- [ ] Facebook App is **Live** (not in Development)
- [ ] You are an **Admin** or **Tester** of the Facebook App
- [ ] Page Access Token has **pages_read_engagement** permission
- [ ] Webhook subscribed to **feed** field
- [ ] Callback URL is correct: `https://metasolution-rho.vercel.app/webhook`

---

## 📞 Still Not Working?

Run this comprehensive diagnostic:

```bash
# 1. Check webhook events (last 5 minutes)
node check_very_recent_webhooks.js

# 2. Resubscribe webhook
node webhook_resubscribe_and_fix.js <PAGE_ACCESS_TOKEN>

# 3. Manually test webhook
node test_webhook_manual_trigger.js

# 4. Check automation status
curl https://metasolution-rho.vercel.app/api/health/automation
```

---

## 🎯 Most Common Mistake:

**Commenting on the wrong Facebook page!**

Make 100% sure you're commenting on:
- Page Name: **Skinzy**
- Page ID: **963307416870090**

If you have multiple pages, the webhook is ONLY configured for Skinzy.
