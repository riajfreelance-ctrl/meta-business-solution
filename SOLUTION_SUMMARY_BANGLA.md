# 🔧 Facebook Inbox Auto-Reply - সমস্যা ও সমাধান

## ❌ সমস্যা কী?

Facebook Inbox-এ Auto-Reply কাজ করছে না। User মেসেজ পাঠাচ্ছে কিন্তু কোনো Reply পাচ্ছে না।

## 🔍 Root Cause (মূল কারণ)

**Facebook Page Access Token INVALID বা EXPIRED**

Auto-reply system মেসেজ process করতে পারে, কিন্তু Facebook-এ reply পাঠাতে পারে না কারণ token-এর permission নেই।

### Error Message:
```
(#100) Unsupported get request. Object with ID '61587065925121' does not exist, 
cannot be loaded due to missing permissions
```

### বাংলায় বুঝুন:
আপনার Facebook Page Token-এর `pages_messaging` permission নেই অথবা token মেয়াদ উত্তীর্ণ হয়েছে। তাই bot মেসেজ প্রসেস করে কিন্তু Facebook-এ reply পাঠাতে পারে না।

---

## ✅ সমাধান (৫ মিনিট)

### ধাপ ১: নতুন Page Access Token নিন

**সহজ পদ্ধতি - Graph API Explorer:**

1. **লিংক খুলুন**: https://developers.facebook.com/tools/explorer/

2. **App সিলেক্ট করুন**:
   - "Facebook App" dropdown-এ ক্লিক করুন
   - **MetaSolution** সিলেক্ট করুন (App ID: 1698854504433245)

3. **User Token নিন**:
   - "Get Token" → "Get User Token" এ ক্লিক করুন
   - এই permissionগুলো ✅ check করুন:
     ```
     ✅ pages_show_list
     ✅ pages_read_engagement
     ✅ pages_manage_posts
     ✅ pages_manage_engagement
     ✅ pages_messaging (সবচেয়ে জরুরি!)
     ```
   - "Generate Access Token" এ ক্লিক করুন
   - Login করে permission approve করুন
   - Token টি copy করুন (EAAY... দিয়ে শুরু হবে)

4. **Page Access Token বের করুন**:
   - Explorer-এ endpoint পরিবর্তন করুন: `/me/accounts`
   - "Submit" এ ক্লিক করুন
   - এইরকম response পাবেন:
     ```json
     {
       "data": [
         {
           "name": "Skinzy",
           "id": "61587065925121",
           "access_token": "EAAY..." ← এটি COPY করুন
         }
       ]
     }
     ```
   - Skinzy page-এর `access_token` value টি **COPY করুন**

---

### ধাপ ২: Firestore Update করুন

Terminal-এ এই command চালান:

```bash
cd /Users/mac/Documents/mysolutionapps/metasolution/server
node update_firestore_token.js "আপনার_NEW_TOKEN_এখানে_পেস্ট_করুন"
```

**উদাহরণ:**
```bash
node update_firestore_token.js "EAAYJGWNDBl0BOxZCZCZC..."
```

Script অটোমেটিক:
- ✅ Token validate করবে
- ✅ Facebook API তে test করবে
- ✅ Firestore update করবে
- ✅ Test message পাঠাবে

---

### ধাপ ৩: Vercel Update করুন (Production)

```bash
cd /Users/mac/Documents/mysolutionapps/metasolution
npx vercel env add PAGE_ACCESS_TOKEN production
```

Prompt এলে **একই token** paste করুন।

---

### ধাপ ৪: Verify করুন

Diagnostic চালান:

```bash
cd server
node production_autoreply_diagnostic.js
```

এই output পাবেন:
```
✅ Page Token is VALID
✅ Facebook Send API is WORKING!
✅ ALL SYSTEMS OPERATIONAL!
```

---

### ধাপ ৫: Live Test করুন

1. Facebook Messenger খুলুন
2. **Skinzy** page-এ মেসেজ পাঠান: `ডেলিভারি চার্জ`
3. ২-৩ সেকেন্ডের মধ্যে auto-reply পাবেন!

---

## ⚠️ জরুরি নোট

### Token মেয়াদ
- **Graph API Explorer থেকে পাওয়া Token ~৬০ দিনে expire হয়**
- Production-এর জন্য Facebook App Review approval লাগবে
- Approval পেলে non-expiring token পাবেন

### Admin Testing সমস্যা
**Facebook Page Admin-দের bot reply ব্লক করে!**

আপনি যদি নিজের Facebook account (যেটি Page Admin) দিয়ে test করেন:
- Bot মেসেজ process করবে ✅
- কিন্তু Facebook reply পৌঁছাতে দেবে না ❌

**সমাধান**: ভিন্ন Facebook account দিয়ে test করুন (যেটি Page Admin নয়)

### সঠিকভাবে Test করবেন কিভাবে:
1. একজন বন্ধুকে Skinzy page-এ মেসেজ পাঠাতে বলুন
2. অথবা secondary Facebook account ব্যবহার করুন
3. অথবা Vercel logs check করুন reply send হচ্ছে কিনা:
   ```
   Vercel Dashboard → metasolution → Logs
   খুঁজুন: "[Send SUCCESS] Sent bot reply to PSID"
   ```

---

## 📊 Monitoring

### Vercel Logs Check
```
https://vercel.com/dashboard → metasolution → Logs
```

**সফলতার লক্ষণ:**
```
[WEBHOOK] Entry.id: 61587065925121
[WEBHOOK SUCCESS] Matched Brand: Skinzy
[DRAFT ✅] Found 1 matching draft(s)
[Send SUCCESS] Sent bot reply to PSID
```

**Error লক্ষণ:**
```
[Send ERROR] Failed to send message
[API_FAILED] [PERMISSION_ERROR] Code 10
```

### Firestore Check

**Conversations:**
```
Firestore → conversations
খুঁজুন: status = "auto_replied"
```

**Error Logs:**
```
Firestore → logs
Filter: type = "send_error"
```

---

## 🆘 Troubleshooting

### "Token is invalid"
→ Graph API Explorer থেকে নতুন token নিন `pages_messaging` permission সহ

### "Webhook মেসেজ পাচ্ছে না"
→ Facebook App → Webhooks → "page" subscribed কিনা check করুন  
→ Callback URL verify করুন: `https://metasolution-rho.vercel.app/webhook`

### "Valid token দিয়েও auto-reply কাজ করছে না"
→ আপনি Page Admin হিসেবে test করছেন - ভিন্ন account দিয়ে test করুন  
→ Vercel logs check করুন reply send হচ্ছে কিনা

### "Token locally কাজ করে কিন্তু Vercel-এ না"
→ Vercel env variable update করুন: `npx vercel env add PAGE_ACCESS_TOKEN production`  
→ Redeploy করুন: `git push`

---

## ✅ Success Checklist

- [ ] নতুন Page Access Token নিয়েছি `pages_messaging` permission সহ
- [ ] Token Facebook API তে validate হয়েছে
- [ ] Firestore update হয়েছে: `brands.Skinzy.fbPageToken`
- [ ] Vercel update হয়েছে: `PAGE_ACCESS_TOKEN`
- [ ] Diagnostic সব green check দেখাচ্ছে
- [ ] Test message সফলভাবে পাঠানো হয়েছে
- [ ] Live auto-reply কাজ করছে (non-admin account দিয়ে test)

---

## 📁 তৈরি করা Scripts

আপনার জন্য এই tools তৈরি করেছি:

### Diagnostic Scripts
1. **`production_autoreply_diagnostic.js`** - Complete system check
2. **`test_inbox_webhook.js`** - Webhook processing test
3. **`test_autoreply_flow.js`** - Complete flow test
4. **`check_page_token.js`** - Token validation

### Fix Scripts
5. **`update_firestore_token.js`** - Firestore-এ token update
6. **`fix_fb_page_token.js`** - Guided token generation
7. **`generate_fb_token.js`** - OAuth flow opens করে

### Documentation
8. **`FB_AUTOREPLY_FIX.md`** - Complete fix guide (English)
9. **`SOLUTION_SUMMARY.md`** - Summary (English)
10. **`SOLUTION_SUMMARY_BANGLA.md`** - এই ফাইল

---

## 🎯 Next Steps

1. **নতুন Page Access Token নিন** (৫ মিনিট)
2. **Firestore & Vercel update করুন** (২ মিনিট)
3. **Diagnostic চালান** (১ মিনিট)
4. **Live test করুন** (১ মিনিট)
5. **Logs monitor করুন** প্রথম কয়েকটি মেসেজের জন্য

**মোট সময়**: ~১০ মিনিটে permanent fix

---

**তারিখ**: April 20, 2026  
**স্ট্যাটাস**: 🟡 Fix-এর জন্য প্রস্তুত  
**Priority**: 🔴 Critical  
**Impact**: Token update না হওয়া পর্যন্ত সব auto-reply বন্ধ থাকবে
