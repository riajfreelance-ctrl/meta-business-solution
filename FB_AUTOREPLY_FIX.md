# 🔧 Facebook Inbox Auto-Reply - Permanent Fix Guide

## ❌ Root Cause Identified

**The Facebook Page Access Token is INVALID or EXPIRED**

The auto-reply system processes messages correctly, but **cannot send replies back to Facebook** because the token lacks proper permissions.

---

## ✅ Solution (5 Minutes)

### Step 1: Get New Page Access Token

#### Option A: Using Graph API Explorer (RECOMMENDED - Easiest)

1. **Open Graph API Explorer**: https://developers.facebook.com/tools/explorer/

2. **Select Your App**:
   - Click "Facebook App" dropdown
   - Select: **MetaSolution** (App ID: 1698854504433245)

3. **Get User Token**:
   - Click "Get Token" → "Get User Token"
   - Check these permissions:
     ```
     ✅ pages_show_list
     ✅ pages_read_engagement
     ✅ pages_manage_posts
     ✅ pages_manage_engagement
     ✅ pages_messaging (CRITICAL - This is what you're missing!)
     ```
   - Click "Generate Access Token"
   - Login and approve permissions if prompted
   - Copy the generated token (starts with `EAAY...`)

4. **Get Page Access Token**:
   - In the same Explorer, change endpoint to: `/me/accounts`
   - Click "Submit"
   - You'll see a response like:
     ```json
     {
       "data": [
         {
           "name": "Skinzy",
           "id": "61587065925121",
           "access_token": "EAAY..." ← COPY THIS LONG TOKEN
         }
       ]
     }
     ```
   - **Copy the `access_token` value for Skinzy page**

---

### Step 2: Update Firestore (Local)

Run this command in your terminal:

```bash
cd /Users/mac/Documents/mysolutionapps/metasolution/server
node update_firestore_token.js "PASTE_YOUR_NEW_PAGE_TOKEN_HERE"
```

**Example:**
```bash
node update_firestore_token.js "EAAYJGWNDBl0BOxZCZCZC..."
```

The script will:
- ✅ Validate the token
- ✅ Test it with Facebook API
- ✅ Update Firestore automatically
- ✅ Send a test message

---

### Step 3: Update Vercel (Production)

```bash
cd /Users/mac/Documents/mysolutionapps/metasolution
npx vercel env add PAGE_ACCESS_TOKEN production
```

When prompted, paste the **same token** you used in Step 2.

---

### Step 4: Verify Fix

Run the diagnostic:

```bash
cd server
node production_autoreply_diagnostic.js
```

You should see:
```
✅ Page Token is VALID
✅ Facebook Send API is WORKING!
✅ ALL SYSTEMS OPERATIONAL!
```

---

### Step 5: Test Live

1. Open Facebook Messenger
2. Send a message to **Skinzy** page: `ডেলিভারি চার্জ`
3. You should get an auto-reply within 2-3 seconds!

---

## 🔍 Quick Diagnostics

If it's still not working, run these checks:

### Check 1: Is token valid?
```bash
node -e "
const axios = require('axios');
axios.get('https://graph.facebook.com/v21.0/me', {
  params: { access_token: 'YOUR_TOKEN', fields: 'id,name' }
}).then(r => console.log('✅ Valid:', r.data))
  .catch(e => console.log('❌ Invalid:', e.response?.data?.error?.message));
"
```

### Check 2: Can you access the page?
```bash
node -e "
const axios = require('axios');
axios.get('https://graph.facebook.com/v21.0/61587065925121', {
  params: { access_token: 'YOUR_TOKEN' }
}).then(r => console.log('✅ Page:', r.data))
  .catch(e => console.log('❌ Error:', e.response?.data?.error?.message));
"
```

### Check 3: Can you send a message?
```bash
node -e "
const axios = require('axios');
axios.post('https://graph.facebook.com/v21.0/me/messages', {
  recipient: { id: '25798685759834086' },
  message: { text: 'Test' }
}, {
  params: { access_token: 'YOUR_TOKEN' }
}).then(r => console.log('✅ Sent:', r.data))
  .catch(e => console.log('❌ Error:', e.response?.data?.error?.message));
"
```

---

## ⚠️ Important Notes

### Token Expiration
- **Page Access Tokens from Graph API Explorer expire in ~60 days**
- For production, you need a **non-expiring token**:
  1. Complete Facebook App Review
  2. Get your app approved for `pages_messaging` permission
  3. Use a Long-Lived Page Token (doesn't expire)

### For Non-Expiring Token:
1. Go to: https://developers.facebook.com/apps/1698854504433245/app-review/
2. Request approval for:
   - `pages_messaging`
   - `pages_show_list`
   - `pages_read_engagement`
3. Once approved, generate a long-lived token

### Admin Testing Issue
- **Facebook blocks bot replies to Page Admins**
- If you're testing with your own Facebook account (which is Page Admin), you might NOT see the auto-reply
- **Solution**: Test with a different Facebook account (not a Page Admin)

---

## 📊 Monitoring

### Check Vercel Logs
```
https://vercel.com/dashboard → metasolution → Logs
```
Watch for:
- `[WEBHOOK] Entry.id: 61587065925121`
- `[WEBHOOK SUCCESS] Matched Brand: Skinzy`
- `[Send SUCCESS] Sent bot reply to PSID`

### Check Firestore Conversations
- Go to Firebase Console → Firestore
- Collection: `conversations`
- Look for documents with `status: "auto_replied"`

### Check Error Logs
- Collection: `logs`
- Filter: `type == "send_error"`
- This shows if messages are failing to send

---

## 🆘 Troubleshooting

### Error: "(#100) Requires pages_messaging permission"
**Fix**: Regenerate token with `pages_messaging` permission checked

### Error: "(#190) Invalid OAuth access token"
**Fix**: Token expired, get a new one

### Error: "Unsupported get request. Object does not exist"
**Fix**: Token doesn't have access to this Page ID

### Webhook not receiving messages
**Fix**: Check Vercel logs, verify webhook subscription in Facebook App

### Auto-reply works in test but not live
**Fix**: You're probably testing as Page Admin - test with different account

---

## 📞 Need Help?

Run this comprehensive diagnostic:
```bash
node production_autoreply_diagnostic.js
```

It will tell you exactly what's wrong and how to fix it.

---

## ✅ Success Checklist

- [ ] Generated new Page Access Token with `pages_messaging` permission
- [ ] Token validated successfully with Facebook API
- [ ] Firestore updated: `brands.Skinzy.fbPageToken`
- [ ] Vercel updated: `PAGE_ACCESS_TOKEN` environment variable
- [ ] Diagnostic shows all green checks
- [ ] Test message sent successfully
- [ ] Live auto-reply working (tested with non-admin account)

---

**Last Updated**: April 20, 2026  
**Status**: Ready for Fix  
**Priority**: 🔴 CRITICAL
