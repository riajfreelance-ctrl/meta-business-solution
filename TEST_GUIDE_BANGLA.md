# 🧪 Facebook Comment Test করবেন কীভাবে?

## ✅ সব Ready আছে!

আপনার Facebook comment automation এখন **fully working**। এখন শুধু test করতে হবে।

---

## 📝 Step-by-Step Test Guide

### Step 1: Facebook Page-এ যান
1. আপনার **Skinzy Facebook Page**-এ যান
2. Link: https://facebook.com/963307416870090

### Step 2: Post করুন (না থাকলে)
একটা test post করুন:
```
নতুন প্রোডাক্ট এসেছে! 🎉
বিস্তারিত জানতে comment করুন 👇
```

### Step 3: Test Comments করুন

নিচের comments এক এক করে করুন:

#### Test #1 - Price Question
**Comment:** `price koto?`

**Expected Result:**
- ✅ Public reply আসবে: "💌 আপনার ইনবক্সে বিস্তারিত পাঠানো হয়েছে!"
- ✅ Private reply আসবে Messenger-এ
- ✅ Comment like হবে ❤️

---

#### Test #2 - Order Request
**Comment:** `order korbo`

**Expected Result:**
- ✅ Public reply: "🎉 অর্ডার করতে inbox এ message করুন!"
- ✅ Private reply: অর্ডারের details চাইবে

---

#### Test #3 - Delivery Question
**Comment:** `delivery koto din?`

**Expected Result:**
- ✅ Public reply: "🚚 Dhaka-তে ১-২ দিন, Dhaka-র বাইরে ৩-৫ দিন"
- ✅ Private reply: Full delivery details

---

#### Test #4 - Positive Feedback (Catch-All Test)
**Comment:** `অনেক ভালো প্রোডাক্ট!`

**Expected Result:**
- ✅ Public reply: "💙 আপনার মতামতের জন্য ধন্যবাদ!"
- ✅ Private reply: Thank you message
- ⚠️ **এইটা আগে কাজ করছিল না, এখন করবে!**

---

#### Test #5 - Greeting
**Comment:** `hi`

**Expected Result:**
- ✅ Public reply: "👋 হ্যালো! Skinzy-তে আপনাকে স্বাগতম!"
- ✅ Private reply: Welcome message

---

#### Test #6 - AI Test (Random Question)
**Comment:** `এইটা কি real না fake?`

**Expected Result:**
- ✅ AI reply generate করবে (Gemini)
- ✅ Natural Bangla response আসবে

---

## 🔍 Result কীভাবে চেক করবেন?

### Option 1: Facebook-এ দেখুন
1. **Post-এ যান** যেখানে comment করেছেন
2. **Comment-এর niche** দেখুন - public reply আছে কিনা
3. **Messenger check করুন** - private reply এসেছে কিনা
4. **Comment-এ heart icon** আছে কিনা (auto-like)

### Option 2: Terminal-এ Check করুন
```bash
# Monitor script run করুন
cd /Users/mac/Documents/mysolutionapps/metasolution/server
node monitor_comments.js
```

**এই script দেখাবে:**
- ✅ কতটা webhook এসেছে
- ✅ কতটা comment process হয়েছে
- ✅ কতটা lead capture হয়েছে
- ✅ কোনো error আছে কিনা

### Option 3: Firebase Console-এ দেখুন
1. https://console.firebase.google.com-এ যান
2. আপনার project select করুন
3. **Firestore Database**-এ যান
4. Check these collections:
   - `comments` → Processed comments
   - `leads` → Captured leads
   - `pending_comments` → Unmatched comments
   - `raw_webhooks` → Incoming webhooks

---

## ⚠️ Problem হলে কী করবেন?

### Problem 1: কোনো reply আসছে না
**Check করুন:**
```bash
node server/diagnose_comment.js
```

**Solution:**
- Webhook ঠিক আছে কিনা দেখুন
- Facebook App-এ webhook subscription check করুন

---

### Problem 2: Comment pending-এ যাচ্ছে
**Check করুন:**
```bash
node server/monitor_comments.js
```

**Solution:**
- Keyword add করুন `comment_drafts`-এ
- অথবা catch-all draft ঠিক আছে কিনা দেখুন

---

### Problem 3: Token expired
**Solution:**
- Facebook Page Token renew করুন
- Brand document update করুন Firestore-এ

---

## 📊 Quick Commands

```bash
# Full diagnostic
node server/diagnose_comment.js

# Monitor recent activity
node server/monitor_comments.js

# Test automation
node server/test_comment_automation.js

# Check webhooks
node server/check_app_webhooks.js

# List brands
node server/list_brands.js
```

---

## 🎯 Expected Results Summary

| Test | Comment | Reply Type | Should Work? |
|------|---------|------------|--------------|
| 1 | price koto? | Keyword Match | ✅ Yes |
| 2 | order korbo | Keyword Match | ✅ Yes |
| 3 | delivery koto din? | Keyword Match | ✅ Yes |
| 4 | অনেক ভালো! | Catch-All | ✅ Yes (Fixed!) |
| 5 | hi | Keyword Match | ✅ Yes |
| 6 | random question | AI Fallback | ✅ Yes |

---

## 🚀 Start Testing!

1. **Facebook page-এ যান**
2. **Post-এ comment করুন** (Test #1 থেকে শুরু করুন)
3. **5-10 seconds wait করুন**
4. **Reply check করুন**
5. **Monitor script run করুন**

```bash
node server/monitor_comments.js
```

---

## ✅ Success Signs

আপনি জানবেন automation কাজ করছে যদি:
- ✅ Comment-এর niche public reply দেখেন
- ✅ Messenger-এ private reply আসে
- ✅ Comment automatically like হয়
- ✅ Firestore-এ `comments` collection-এ entry হয়
- ✅ `leads` collection-এ new lead save হয়

---

## 📞 Need Help?

যদি কোনো problem হয়:
1. `diagnose_comment.js` run করুন
2. Result আমাকে দেখান
3. আমি fix করে দেব!

---

**🎉 এখন test শুরু করুন! Good luck!** 🚀
