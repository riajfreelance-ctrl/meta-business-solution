# Facebook Webhook Setup Guide

## 📍 আপনার Vercel Deployment URL

```
https://metasolution-pc0qogiqj-riajfreelance-ctrls-projects.vercel.app
```

## 🔗 Webhook URL (Facebook-এ ব্যবহার করুন)

```
https://metasolution-pc0qogiqj-riajfreelance-ctrls-projects.vercel.app/webhook
```

## 🔑 Verify Token

```
myapp4204
```

---

## 🚀 দ্রুত সেটআপ (অটোমেটেড)

### Option 1: স্ক্রিপ্ট দিয়ে সেটআপ

```bash
cd /Users/mac/Documents/mysolutionapps/metasolution
node setup_facebook_webhook.js <PAGE_ACCESS_TOKEN> myapp4204
```

**উদাহরণ:**
```bash
node setup_facebook_webhook.js EAAYJGWNDBl0B... myapp4204
```

---

## 📖 ম্যানুয়াল সেটআপ (Facebook Developers Console)

### Step 1: Facebook Developers Console-এ যান
1. https://developers.facebook.com/apps এ যান
2. আপনার অ্যাপ সিলেক্ট করুন

### Step 2: Webhook কনফিগার করুন
1. **Webhooks** সেকশনে যান (বাম সাইডবারে)
2. **Page** সিলেক্ট করুন ড্রপডাউন থেকে
3. **Subscribe to this object** বাটনে ক্লিক করুন

### Step 3: Callback URL সেট করুন

| ফিল্ড | মান |
|-------|------|
| **Callback URL** | `https://metasolution-pc0qogiqj-riajfreelance-ctrls-projects.vercel.app/webhook` |
| **Verify Token** | `myapp4204` |

### Step 4: Fields সাবস্ক্রাইব করুন
নিচের ফিল্ডগুলো সিলেক্ট করুন:
- ✅ `messages` - ইনবক্স মেসেজের জন্য
- ✅ `messaging_postbacks` - পোস্টব্যাক ইভেন্টের জন্য
- ✅ `feed` - কমেন্ট এবং পোস্টের জন্য

### Step 5: Webhook ভেরিফাই করুন
**Verify and Save** বাটনে ক্লিক করুন। সবুজ টিক চিহ্ন দেখা গেলে সেটআপ সফল!

---

## 🔧 Vercel Environment Variables চেক করুন

Vercel Dashboard-এ যান এবং নিচের ভেরিয়েবলগুলো সেট আছে কিনা চেক করুন:

| Variable | Description | Example |
|----------|-------------|---------|
| `PAGE_ACCESS_TOKEN` | Facebook Page Access Token | `EAAYJGWNDBl0B...` |
| `VERIFY_TOKEN` | Webhook verify token | `myapp4204` |
| `APP_SECRET` | Facebook App Secret | `66fec7b28...` |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSyDTiRSR9...` |

### Environment Variables আপডেট করুন:

```bash
# Terminal থেকে
npx vercel env add PAGE_ACCESS_TOKEN production
npx vercel env add VERIFY_TOKEN production
npx vercel env add APP_SECRET production
```

বা `deploy_vercel_env.sh` স্ক্রিপ্ট রান করুন:
```bash
bash deploy_vercel_env.sh
```

---

## 🧪 টেস্ট করুন

### 1. Webhook ভেরিফিকেশন টেস্ট
```bash
curl -X GET "https://metasolution-pc0qogiqj-riajfreelance-ctrls-projects.vercel.app/webhook?hub.mode=subscribe&hub.verify_token=myapp4204&hub.challenge=test_challenge"
```

### 2. API স্ট্যাটাস চেক
```bash
curl https://metasolution-pc0qogiqj-riajfreelance-ctrls-projects.vercel.app/api/status
```

### 3. ফেসবুক পেজে মেসেজ পাঠান
আপনার ফেসবুক পেজে একটি মেসেজ পাঠান এবং Vercel লগস চেক করুন।

---

## 🔍 সমস্যা সমাধান (Troubleshooting)

### সমস্যা: "URL couldn't be validated"
**সমাধান:**
- URL সঠিকভাবে কপি-পেস্ট করুন: `/webhook` শেষে থাকা আবশ্যক
- Verify Token `myapp4204` সঠিক কিনা চেক করুন
- Vercel deployment সক্রিয় আছে কিনা চেক করুন

### সমস্যা: "No auto-reply coming"
**সমাধান:**
1. Vercel লগস চেক করুন: `npx vercel logs --production`
2. Firestore-এ ব্র্যান্ড সেটিংস চেক করুন:
   - `inboxSettings.systemAutoReply: true`
   - `aiSettings.inboxAiEnabled: true`
3. Page Access Token ভ্যালিড কিনা চেক করুন

### সমস্যা: "Token expired"
**সমাধান:**
Facebook Developers Console থেকে নতুন Page Access Token জেনারেট করুন এবং Vercel-এ আপডেট করুন।

---

## 📞 সাপোর্ট

সমস্যা হলে নিচের তথ্যগুলো সংগ্রহ করে ডিবাগ করুন:

```bash
# লোকাল থেকে টেস্ট
node setup_facebook_webhook.js

# Vercel লগস চেক
npx vercel logs --production
```
