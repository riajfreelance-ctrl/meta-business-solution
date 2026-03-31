/**
 * 🔍 LIVE DIAGNOSTIC — Comment Automation Debug
 * What's happening when a comment comes in?
 */
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const serviceAccount = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-service-account.json'), 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const PAGE_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const PAGE_ID = process.env.FACEBOOK_PAGE_ID;

async function diagnose() {
    console.log('\n🔍 ====== COMMENT AUTOMATION DIAGNOSIS ======\n');

    // 1. Check raw_webhooks — কোনো comment webhook এসেছে কিনা
    console.log('📌 Step 1: Recent Webhooks (last 5)...');
    const webhookSnap = await db.collection('raw_webhooks')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get();

    if (webhookSnap.empty) {
        console.log('❌ NO webhooks found in Firestore!');
        console.log('   → FB থেকে কোনো event আসছেই না।');
        console.log('   → Webhook subscription সমস্যা আছে।\n');
    } else {
        console.log(`✅ Found ${webhookSnap.size} recent webhooks:`);
        webhookSnap.docs.forEach((doc, i) => {
            const data = doc.data();
            const ts = new Date(data.timestamp).toLocaleTimeString('en-BD', { timeZone: 'Asia/Dhaka' });
            const type = data.body?.object || 'unknown';
            const changes = data.body?.entry?.[0]?.changes?.[0];
            const item = changes?.value?.item || 'N/A';
            const verb = changes?.value?.verb || 'N/A';
            console.log(`   ${i+1}. [${ts}] type=${type}, item=${item}, verb=${verb}`);
        });
        console.log();
    }

    // 2. Check recent comments in Firestore
    console.log('📌 Step 2: Recent Comments Processed (last 5)...');
    const commentsSnap = await db.collection('comments')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get();

    if (commentsSnap.empty) {
        console.log('❌ No comments processed yet.\n');
    } else {
        console.log(`✅ Found ${commentsSnap.size} processed comments:`);
        commentsSnap.docs.forEach((doc, i) => {
            const d = doc.data();
            console.log(`   ${i+1}. From: ${d.sender_name} | Msg: "${d.message?.substring(0,30)}" | Reply: "${d.reply?.substring(0,30)}"`);
        });
        console.log();
    }

    // 3. Check pending_comments
    console.log('📌 Step 3: Pending Comments (no reply sent)...');
    const pendingSnap = await db.collection('pending_comments')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get();

    if (pendingSnap.empty) {
        console.log('✅ No pending comments.\n');
    } else {
        console.log(`⚠️  ${pendingSnap.size} pending comments (no reply sent):`);
        pendingSnap.docs.forEach((doc, i) => {
            const d = doc.data();
            console.log(`   ${i+1}. From: ${d.fromName} | "${d.commentText?.substring(0,40)}" | type: ${d.type || 'normal'}`);
        });
        console.log();
    }

    // 4. Check FB Webhook Subscription (what fields are subscribed)
    console.log('📌 Step 4: FB Webhook Subscription Check...');
    try {
        // Check via app subscriptions endpoint
        const resp = await axios.get(
            `https://graph.facebook.com/v21.0/${PAGE_ID}?fields=subscribed_fields&access_token=${PAGE_TOKEN}`
        );
        console.log('   Page subscribed_fields:', JSON.stringify(resp.data));
    } catch (e) {
        console.log('   subscribed_fields check failed:', e.response?.data?.error?.message || e.message);
    }

    // Also check via app webhook
    try {
        const resp2 = await axios.get(
            `https://graph.facebook.com/v21.0/${PAGE_ID}/subscribed_apps?access_token=${PAGE_TOKEN}`
        );
        console.log('   subscribed_apps:', JSON.stringify(resp2.data?.data?.length), 'apps');
        if (resp2.data?.data?.length > 0) {
            const app = resp2.data.data[0];
            console.log('   App name:', app.name);
            console.log('   Subscribed fields:', app.subscribed_fields?.join(', ') || 'NONE');
            const hasFeed = app.subscribed_fields?.includes('feed');
            const hasMessages = app.subscribed_fields?.includes('messages');
            console.log('   feed:', hasFeed ? '✅' : '❌ MISSING!');
            console.log('   messages:', hasMessages ? '✅' : '❌ MISSING!');
        }
    } catch (e) {
        const errCode = e.response?.data?.error?.code;
        const errMsg = e.response?.data?.error?.message || e.message;
        console.log(`   ❌ Error (${errCode}): ${errMsg}`);
        
        if (errCode === 200) {
            console.log('\n   ⚠️  MISSING PERMISSION: pages_manage_metadata');
            console.log('   → Facebook Developer Console-এ app permission add করতে হবে:');
            console.log('   → https://developers.facebook.com/apps/');
            console.log('   → App → Permissions and Features → pages_manage_metadata → Request\n');
        }
    }

    // 5. Simulate a webhook to verify processing works
    console.log('\n📌 Step 5: Webhook URL Verify Check...');
    try {
        const verifyResp = await axios.get(
            'https://metasolution-rho.vercel.app/webhook',
            {
                params: {
                    'hub.mode': 'subscribe',
                    'hub.verify_token': 'myapp4204',
                    'hub.challenge': 'test_challenge_12345'
                }
            }
        );
        if (verifyResp.data === 'test_challenge_12345') {
            console.log('✅ Webhook verify endpoint working correctly!');
        } else {
            console.log('⚠️  Unexpected response:', verifyResp.data);
        }
    } catch (e) {
        console.log('❌ Webhook verify failed:', e.message);
    }

    // 6. Brand document check
    console.log('\n📌 Step 6: Brand "Skinzy" Firestore Document...');
    const brandSnap = await db.collection('brands').doc('Skinzy').get();
    if (brandSnap.exists) {
        const brand = brandSnap.data();
        const cs = brand.commentSettings || {};
        console.log('   ✅ Brand exists');
        console.log('   fbPageToken:', brand.fbPageToken ? '✅ Present' : '❌ MISSING');
        console.log('   facebookPageId:', brand.facebookPageId || '❌ MISSING');
        console.log('   commentSettings.systemAutoReply:', cs.systemAutoReply);
        console.log('   commentSettings.aiReply:', cs.aiReply);
        console.log('   commentSettings.autoLike:', cs.autoLike);
        console.log('   inboxSettings:', JSON.stringify(brand.inboxSettings || {}));
    } else {
        console.log('❌ Brand Skinzy not found in Firestore!');
    }

    // 7. Logs — recent error logs
    console.log('\n📌 Step 7: Recent Error Logs...');
    const logsSnap = await db.collection('logs')
        .where('type', '==', 'send_error')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get();
    if (!logsSnap.empty) {
        console.log(`⚠️  Found ${logsSnap.size} send errors:`);
        logsSnap.docs.forEach((doc, i) => {
            const d = doc.data();
            console.log(`   ${i+1}. ${d.error} (psid: ${d.psid})`);
        });
    } else {
        console.log('✅ No send errors found.');
    }

    console.log('\n======================================');
    console.log('DIAGNOSIS COMPLETE');
    console.log('======================================\n');
    process.exit(0);
}

diagnose().catch(e => { console.error('Diagnosis failed:', e.message); process.exit(1); });
