# 🔍 CRITICAL DEBUGGING CHECKLIST - Facebook Comment Automation

## Step 1: Webhook Reception
- [ ] Facebook webhook পাঠাচ্ছে কিনা?
- [ ] Vercel receive করছে কিনা?
- [ ] Raw webhook Firestore এ save হচ্ছে কিনা?

## Step 2: Brand Matching
- [ ] `entry.id` (Page ID) দিয়ে brand match হচ্ছে কিনা?
- [ ] `getBrandByPlatformId` কাজ করছে কিনা?
- [ ] Brand data পাওয়া যাচ্ছে কিনা?

## Step 3: Comment Processing
- [ ] `processIncomingComment` call হচ্ছে কিনা?
- [ ] `post_id` value আসছে কিনা?
- [ ] `comment_id` value আসছে কিনা?
- [ ] Duplicate check pass হচ্ছে কিনা?

## Step 4: Data Center Matching
- [ ] `getDataCenterReply` call হচ্ছে কিনা?
- [ ] `postId` দিয়ে query হচ্ছে কিনা?
- [ ] Global template check হচ্ছে কিনা?
- [ ] Keyword match হচ্ছে কিনা?

## Step 5: Reply Sending
- [ ] `replyToComment` call হচ্ছে কিনা?
- [ ] Facebook API response কী?
- [ ] Comment এ reply post হচ্ছে কিনা?

## Step 6: Firestore Logging
- [ ] `comments` collection এ save হচ্ছে কিনা?
- [ ] `postId` field correctly save হচ্ছে কিনা?
- [ ] `reply` field save হচ্ছে কিনা?

---

## POTENTIAL ISSUES IDENTIFIED:

### Issue 1: Idempotency Check (Line 414)
```javascript
const cmtTask = checkIdempotencySafe(eventId).then(canProceed => {
    if (!canProceed) return; // ← যদি already processed হয়, তাহলে return!
```
**Problem:** যদি comment আগে process হয়ে থাকে (even if failed), তাহলে skip হয়ে যাবে!

### Issue 2: Timeout Handling (Line 416)
```javascript
withTimeout(processIncomingComment(change.value, brandData), 50000, 'processComment', ...)
```
**Problem:** 50 seconds timeout, কিন্তু Vercel maxDuration 60s। If processing takes >60s, Vercel kills it!

### Issue 3: Data Center Query (Line 717-719)
```javascript
const postSpecificSnap = await db.collection("comment_data_center")
    .where("postId", "==", postId)
    .where("isActive", "==", true)
    .get();
```
**Problem:** যদি `postId` undefined/null হয়, তাহলে post-specific rules match হবে না!

### Issue 4: Brand ID Mismatch
Data Center rules এ `brandId: "skinzy"` কিন্তু Firestore এ brand ID different হতে পারে!

### Issue 5: Facebook Token Expired
Page access token expired থাকলে reply post হবে না!

---

## IMMEDIATE ACTION PLAN:

1. ✅ Check Vercel logs for errors
2. ✅ Check raw_webhooks collection
3. ✅ Check pending_comments collection
4. ✅ Check comments collection
5. ✅ Verify brand ID in Data Center
6. ✅ Test Facebook token validity
7. ✅ Add detailed logging to trace exact failure point
