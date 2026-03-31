/**
 * 🚀 FULL AUTOMATION SETUP SCRIPT
 * এই script টি একসাথে সব কিছু সেটআপ করবে:
 * 1. Brand document update (commentSettings, inboxSettings, aiSettings)
 * 2. comment_drafts seed করবে
 * 3. knowledge_base seed করবে
 * 4. Token health check করবে
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

// Firebase Init
const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const APP_SECRET = process.env.APP_SECRET;

async function run() {
    console.log('\n🚀 ====== AUTOMATION FULL SETUP STARTED ======\n');

    // ─────────────────────────────────────────────────────────────
    // STEP 1: Token Health Check
    // ─────────────────────────────────────────────────────────────
    console.log('📌 Step 1: Facebook Token Health Check...');
    try {
        const resp = await axios.get(
            `https://graph.facebook.com/v21.0/me?access_token=${PAGE_ACCESS_TOKEN}`
        );
        console.log(`✅ Token OK — Page: ${resp.data.name} (ID: ${resp.data.id})`);
    } catch (e) {
        console.error('❌ Token INVALID or Expired!', e.response?.data?.error?.message || e.message);
        console.log('⚠️  Page Access Token renewal করতে হবে! বাকি setup চলছে...');
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 2: Check & Update Brand Document in Firestore
    // ─────────────────────────────────────────────────────────────
    console.log('\n📌 Step 2: Brand Document Setup...');

    // Find brand by facebookPageId
    const brandSnap = await db.collection('brands')
        .where('facebookPageId', '==', FACEBOOK_PAGE_ID)
        .get();

    const fullSettings = {
        facebookPageId: FACEBOOK_PAGE_ID,
        fbPageToken: PAGE_ACCESS_TOKEN,
        googleAIKey: GEMINI_API_KEY,
        appSecret: APP_SECRET,
        // Comment Automation Settings
        commentSettings: {
            systemAutoReply: true,   // keyword match দিয়ে reply
            aiReply: true,           // AI দিয়ে reply
            autoLike: true,          // comment auto like
            spamFilter: true,        // spam hide
            leadCapture: true,       // lead save
            humanDelay: true,        // natural delay
            humanHandoff: false,     // manual handoff
            sentimentAnalysis: true  // sentiment check
        },
        // Inbox DM Settings
        inboxSettings: {
            systemAutoReply: true,
            aiReply: true,
            humanHandoff: false
        },
        // AI Settings
        aiSettings: {
            inboxAiEnabled: true,
            commentAiEnabled: true
        },
        // Auto-learning ON
        autoHyperIndex: true,
        isLearningMode: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (!brandSnap.empty) {
        const brandDoc = brandSnap.docs[0];
        await brandDoc.ref.set(fullSettings, { merge: true });
        console.log(`✅ Brand "${brandDoc.data().name || brandDoc.id}" updated successfully!`);
        console.log(`   ID: ${brandDoc.id}`);
    } else {
        // Brand নেই — নতুন তৈরি করো
        const newBrandRef = await db.collection('brands').add({
            name: 'Skinzy Skincare',
            ...fullSettings,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ New brand created: ${newBrandRef.id}`);
    }

    // owner_dev_brand fallback-ও update করো
    const ownerRef = db.collection('brands').doc('owner_dev_brand');
    const ownerSnap = await ownerRef.get();
    if (ownerSnap.exists) {
        await ownerRef.set(fullSettings, { merge: true });
        console.log('✅ owner_dev_brand also updated!');
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 3: Seed comment_drafts (Keywords → Replies)
    // ─────────────────────────────────────────────────────────────
    console.log('\n📌 Step 3: Seeding comment_drafts...');

    // Brand ID find করো
    let brandId = 'owner_dev_brand';
    if (!brandSnap.empty) brandId = brandSnap.docs[0].id;

    const existingDrafts = await db.collection('comment_drafts')
        .where('brandId', '==', brandId)
        .get();

    const draftCount = existingDrafts.size;
    console.log(`   Existing comment_drafts: ${draftCount}`);

    const commentDrafts = [
        {
            keywords: ['price', 'দাম', 'কত', 'কত টাকা', 'rate', 'cost', 'price ki', 'dam koto', 'dam?', 'price?'],
            variations: [
                {
                    publicReply: '💌 আপনার ইনবক্সে বিস্তারিত পাঠানো হয়েছে! দেখুন 😊',
                    privateReply: 'আমাদের প্রোডাক্টের দাম ও বিস্তারিত জানতে আমাদের সাথে যোগাযোগ করুন। আপনার পছন্দের প্রোডাক্টটি কোনটি?',
                    buttonText: 'আমাদের সাথে যোগাযোগ করুন',
                    buttonUrl: 'https://m.me/skinzy'
                },
                {
                    publicReply: '✨ দাম জানতে inbox চেক করুন! 📩',
                    privateReply: 'আপনি কোন প্রোডাক্টের দাম জানতে চাইছেন? আমাকে জানান, আমি সাথে সাথে জানিয়ে দিচ্ছি! 😊',
                },
                {
                    publicReply: '💬 Inbox এ details পাঠিয়ে দিলাম! 😍',
                    privateReply: 'আমাদের সকল প্রোডাক্টের দাম ও অফার সম্পর্কে জানতে এখানে মেসেজ করুন। আপনার কোন প্রোডাক্ট দরকার?',
                }
            ]
        },
        {
            keywords: ['order', 'অর্ডার', 'buy', 'কিনতে চাই', 'নিতে চাই', 'order korbo', 'oder', 'কিনব'],
            variations: [
                {
                    publicReply: '🎉 অর্ডার করতে inbox এ message করুন! আমরা সাথে সাথে reply করব।',
                    privateReply: 'অর্ডার করতে চান? 😊 আপনার নাম, ফোন নম্বর এবং ঠিকানা দিন — আমরা কনফার্ম করে দেব!',
                },
                {
                    publicReply: '✅ অর্ডারের জন্য inbox এ আসুন! দ্রুত delivery guaranteed 🚀',
                    privateReply: 'আপনি কোন প্রোডাক্টটি অর্ডার করতে চান? নাম ও পরিমাণ জানালে আমরা এগিয়ে নেব!',
                }
            ]
        },
        {
            keywords: ['available', 'আছে', 'stock', 'পাওয়া যাবে', 'stock ache', 'in stock', 'পাবো', 'পাওয়া যায়'],
            variations: [
                {
                    publicReply: '✅ হ্যাঁ, এখন stock আছে! Inbox এ এসে অর্ডার করুন 😊',
                    privateReply: 'আমাদের কাছে এখন stock আছে। অর্ডার করতে চাইলে আপনার ঠিকানা ও ফোন নম্বর দিন!',
                }
            ]
        },
        {
            keywords: ['delivery', 'ডেলিভারি', 'কতদিন', 'কত দিন', 'কখন পাব', 'delivery charge', 'shipping'],
            variations: [
                {
                    publicReply: '🚚 Dhaka-তে ১-২ দিন, Dhaka-র বাইরে ৩-৫ দিনে delivery পাবেন! Inbox এ আরো জানুন।',
                    privateReply: 'আমাদের delivery সময়:\n📍 ঢাকা: ১-২ কার্যদিবস\n📍 ঢাকার বাইরে: ৩-৫ কার্যদিবস\nDelivery charge সম্পর্কে জানতে চাইলে বলুন! 😊',
                }
            ]
        },
        {
            keywords: ['original', 'আসল', 'fake', 'নকল', 'real', 'authentic', 'genuine', 'quality'],
            variations: [
                {
                    publicReply: '💯 আমাদের সব প্রোডাক্ট ১০০% অরিজিনাল ও authentic! আমরা quality guarantee দিই ✨',
                    privateReply: 'আমাদের সব প্রোডাক্ট সম্পূর্ণ অরিজিনাল এবং international quality standard মেনে চলে। কোনো সন্দেহ থাকলে জানাবেন! 😊',
                }
            ]
        },
        {
            keywords: ['discount', 'ছাড়', 'offer', 'অফার', 'কমানো যাবে', 'কম', 'combo', 'deal'],
            variations: [
                {
                    publicReply: '🎁 বিশেষ অফারের জন্য inbox এ message করুন! আপনার জন্য বিশেষ deal আছে 😍',
                    privateReply: 'আপনার জন্য আমাদের কাছে বিশেষ অফার আছে! কোন প্রোডাক্ট দরকার সেটা জানান, আমরা best price দেওয়ার চেষ্টা করব 💖',
                }
            ]
        },
        {
            keywords: ['return', 'রিটার্ন', 'exchange', 'ফেরত', 'বদলে', 'refund', 'problem', 'সমস্যা'],
            variations: [
                {
                    publicReply: '💙 সমস্যা হলে অবশ্যই inbox এ জানান! আমরা সমাধান দেব।',
                    privateReply: 'আপনার সমস্যার জন্য দুঃখিত! 😔 বিস্তারিত জানান — আমরা যত দ্রুত সম্ভব সমাধান করব। আপনার order ID টা কি?',
                }
            ]
        },
        {
            keywords: ['hi', 'hello', 'হ্যালো', 'hy', 'hii', 'helo', 'নমস্কার', 'আস', 'আছেন'],
            variations: [
                {
                    publicReply: '👋 হ্যালো! Skinzy-তে আপনাকে স্বাগতম! কীভাবে সাহায্য করতে পারি? 😊',
                    privateReply: 'হ্যালো! Skinzy-তে আপনাকে স্বাগতম 😊 আপনি কি কোনো প্রোডাক্ট সম্পর্কে জানতে চাইছেন?',
                }
            ]
        },
    ];

    let seeded = 0;
    for (const draft of commentDrafts) {
        await db.collection('comment_drafts').add({
            brandId: brandId,
            keywords: draft.keywords,
            variations: draft.variations,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        seeded++;
        console.log(`   ✅ Draft seeded: "${draft.keywords[0]}" (${draft.keywords.length} keywords)`);
    }
    console.log(`\n✅ Total ${seeded} comment_drafts seeded!`);

    // ─────────────────────────────────────────────────────────────
    // STEP 4: Seed knowledge_base (for inbox DM matching)
    // ─────────────────────────────────────────────────────────────
    console.log('\n📌 Step 4: Seeding knowledge_base for DM auto-reply...');

    const existingKB = await db.collection('knowledge_base')
        .where('brandId', '==', brandId)
        .get();
    console.log(`   Existing knowledge_base entries: ${existingKB.size}`);

    const knowledgeBase = [
        {
            keywords: ['price', 'দাম', 'কত টাকা', 'rate', 'দাম কত', 'price koto', 'price?'],
            answer: 'আমাদের প্রোডাক্টের দাম জানতে চাইলে আপনার পছন্দের প্রোডাক্টটির নাম বলুন। আমরা সাথে সাথে দাম জানিয়ে দেব! 😊'
        },
        {
            keywords: ['order', 'অর্ডার করতে চাই', 'buy', 'কিনতে চাই', 'order korbo'],
            answer: 'অর্ডার করতে চাইলে আপনার:\n📞 ফোন নম্বর\n📍 সম্পূর্ণ ঠিকানা (জেলাসহ)\n🛍️ প্রোডাক্টের নাম\n\nএই তথ্যগুলো দিন, আমরা কনফার্ম করব!'
        },
        {
            keywords: ['delivery', 'ডেলিভারি কতদিন', 'kobe pabo', 'কতদিনে পাব'],
            answer: 'ডেলিভারি সময়:\n🏙️ ঢাকা: ১-২ কার্যদিবস\n🗺️ ঢাকার বাইরে: ৩-৫ কার্যদিবস\nআমরা Sundarban, Pathao ও Redx courier ব্যবহার করি!'
        },
        {
            keywords: ['payment', 'পেমেন্ট', 'bkash', 'nagad', 'rocket', 'cash on delivery', 'cod'],
            answer: 'আমরা সব ধরনের payment গ্রহণ করি:\n💳 Cash on Delivery (COD)\n📱 bKash, Nagad, Rocket\n🏦 Bank Transfer\n\nআপনার পছন্দের method-এ payment করতে পারবেন!'
        },
        {
            keywords: ['contact', 'যোগাযোগ', 'number', 'নাম্বার', 'phone', 'call'],
            answer: 'আমাদের সাথে যোগাযোগ করুন:\n📞 এই Messenger-এ message করুন\n⏰ সময়: সকাল ৯টা - রাত ১০টা\nআমরা যত তাড়াতাড়ি সম্ভব reply দেব! 😊'
        },
        {
            keywords: ['return', 'রিটার্ন', 'refund', 'ফেরত', 'exchange', 'বদল'],
            answer: 'আমাদের return policy:\n✅ পণ্য পাওয়ার ৭ দিনের মধ্যে return করা যাবে\n✅ Defective/ভুল পণ্য হলে বিনামূল্যে exchange\nবিস্তারিত জানতে আমাদের সাথে যোগাযোগ করুন!'
        },
        {
            keywords: ['warranty', 'গ্যারান্টি', 'guarantee', 'কতদিন চলবে'],
            answer: 'আমাদের সব প্রোডাক্টে quality guarantee আছে! ✨ কোনো সমস্যা হলে আমাদের জানান, আমরা অবশ্যই সমাধান করব।'
        }
    ];

    let kbSeeded = 0;
    for (const kb of knowledgeBase) {
        await db.collection('knowledge_base').add({
            brandId: brandId,
            keywords: kb.keywords,
            answer: kb.answer,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        kbSeeded++;
        console.log(`   ✅ KB seeded: "${kb.keywords[0]}"`);
    }
    console.log(`\n✅ Total ${kbSeeded} knowledge_base entries seeded!`);

    // ─────────────────────────────────────────────────────────────
    // STEP 5: Verify FB Page Webhook Subscriptions
    // ─────────────────────────────────────────────────────────────
    console.log('\n📌 Step 5: Checking FB Webhook Subscriptions...');
    try {
        const subResp = await axios.get(
            `https://graph.facebook.com/v21.0/${FACEBOOK_PAGE_ID}/subscribed_apps?access_token=${PAGE_ACCESS_TOKEN}`
        );
        const subs = subResp.data?.data || [];
        if (subs.length > 0) {
            console.log('✅ Webhook subscriptions active:');
            subs.forEach(s => {
                console.log(`   📡 App: ${s.name || s.id}`);
                if (s.subscribed_fields) {
                    console.log(`   Fields: ${s.subscribed_fields.join(', ')}`);
                }
            });
        } else {
            console.log('⚠️  No webhook subscriptions found!');
            console.log('   Attempting to subscribe...');
            
            const subscribeResp = await axios.post(
                `https://graph.facebook.com/v21.0/${FACEBOOK_PAGE_ID}/subscribed_apps`,
                {
                    subscribed_fields: ['messages', 'feed', 'message_reactions', 'messaging_postbacks'].join(','),
                    access_token: PAGE_ACCESS_TOKEN
                }
            );
            if (subscribeResp.data.success) {
                console.log('✅ Webhook subscription activated: messages, feed, messaging_postbacks');
            }
        }
    } catch (e) {
        console.error('❌ Webhook check failed:', e.response?.data?.error?.message || e.message);
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 6: Summary
    // ─────────────────────────────────────────────────────────────
    console.log('\n======================================');
    console.log('✅ SETUP COMPLETE! Summary:');
    console.log('======================================');
    console.log(`Brand: Skinzy (${brandId})`);
    console.log(`Comment Auto-Reply: ✅ ON`);
    console.log(`Comment AI Fallback: ✅ ON`);
    console.log(`Inbox Auto-Reply: ✅ ON`);
    console.log(`Auto-Like: ✅ ON`);
    console.log(`Spam Filter: ✅ ON`);
    console.log(`Lead Capture: ✅ ON`);
    console.log(`comment_drafts seeded: ${seeded}`);
    console.log(`knowledge_base seeded: ${kbSeeded}`);
    console.log('\n🎉 System is ready! Deploy করুন এবং test করুন।\n');

    process.exit(0);
}

run().catch(e => {
    console.error('❌ SETUP FAILED:', e.message);
    process.exit(1);
});
