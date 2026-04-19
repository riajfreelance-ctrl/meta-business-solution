/**
 * 🔍 COMPLETE MESSAGE AUTOMATION DIAGNOSTIC
 * Checks: Webhook → Brand Settings → Message Flow → Auto Reply
 */
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const serviceAccount = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-service-account.json'), 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function diagnoseMessageAutomation() {
    console.log('\n🔍 ====== MESSAGE AUTOMATION DIAGNOSTIC ======\n');

    // Step 1: Check Brand Configuration
    console.log('📌 Step 1: Brand Configuration...');
    const brandSnap = await db.collection('brands').doc('Skinzy').get();
    if (!brandSnap.exists) {
        console.log('❌ Brand "Skinzy" not found!');
        return;
    }
    const brand = brandSnap.data();
    console.log('✅ Brand:', brand.name);
    console.log('   Facebook Page ID:', brand.facebookPageId);
    console.log('   FB Page Token:', brand.fbPageToken ? '✅ PRESENT' : '❌ MISSING');
    console.log('');

    // Step 2: Check Automation Settings
    console.log('📌 Step 2: Automation Settings...');
    const inboxSettings = brand.inboxSettings || {};
    const aiSettings = brand.aiSettings || {};
    console.log('   Inbox Auto Reply:', inboxSettings.systemAutoReply !== false ? '✅ ON' : '❌ OFF');
    console.log('   Inbox AI Reply:', aiSettings.inboxAiEnabled !== false ? '✅ ON' : '❌ OFF');
    console.log('   AI Reply (legacy):', inboxSettings.aiReply !== false ? '✅ ON' : '❌ OFF');
    console.log('');

    // Step 3: Check Knowledge Base
    console.log('📌 Step 3: Knowledge Base...');
    const kbSnap = await db.collection('knowledge_base').where('brandId', '==', 'Skinzy').get();
    console.log('   Knowledge Articles:', kbSnap.size);
    if (kbSnap.size > 0) {
        kbSnap.docs.slice(0, 3).forEach(doc => {
            console.log('   -', doc.data().title || doc.data().keyword);
        });
    }
    console.log('');

    // Step 4: Check Draft Replies
    console.log('📌 Step 4: Draft Replies...');
    const draftsSnap = await db.collection('draft_replies').where('brandId', '==', 'Skinzy').get();
    console.log('   Draft Replies:', draftsSnap.size);
    if (draftsSnap.size > 0) {
        draftsSnap.docs.slice(0, 5).forEach(doc => {
            const data = doc.data();
            console.log(`   - "${data.keyword}" → "${data.result?.substring(0, 40)}..."`);
        });
    }
    console.log('');

    // Step 5: Check Recent Conversations
    console.log('📌 Step 5: Recent Conversations (Last 5)...');
    const convoSnap = await db.collection('conversations').orderBy('lastMessageTimestamp', 'desc').limit(5).get();
    if (convoSnap.empty) {
        console.log('   ⚠️  No conversations found');
    } else {
        convoSnap.docs.forEach((doc, i) => {
            const data = doc.data();
            const timeAgo = Math.round((Date.now() - data.lastMessageTimestamp) / 60000);
            console.log(`   ${i+1}. PSID: ${doc.id}`);
            console.log(`      Last Message: "${data.lastMessage?.substring(0, 50)}..."`);
            console.log(`      Status: ${data.status || 'unknown'}`);
            console.log(`      ${timeAgo} minutes ago`);
            console.log('');
        });
    }

    // Step 6: Check Recent Logs
    console.log('📌 Step 6: Recent Message Logs...');
    const logsSnap = await db.collection('logs').orderBy('timestamp', 'desc').limit(10).get();
    let botCount = 0, userCount = 0;
    logsSnap.forEach(doc => {
        const log = doc.data();
        if (log.type === 'bot') botCount++;
        if (log.type === 'user') userCount++;
    });
    console.log(`   Bot Messages: ${botCount}`);
    console.log(`   User Messages: ${userCount}`);
    console.log('');

    // Step 7: Test Webhook Endpoint
    console.log('📌 Step 7: Webhook Endpoint Test...');
    try {
        const resp = await axios.get('https://metasolution-rho.vercel.app/api/status', { timeout: 5000 });
        console.log('   ✅ API Status:', resp.data.status);
    } catch (e) {
        console.log('   ❌ API Error:', e.message);
    }
    console.log('');

    // Step 8: Check Webhook Subscription
    console.log('📌 Step 8: Facebook Webhook Subscription...');
    try {
        const APP_ID = '1698854504433245';
        const APP_SECRET = process.env.APP_SECRET;
        const APP_ACCESS_TOKEN = `${APP_ID}|${APP_SECRET}`;
        const resp = await axios.get(
            `https://graph.facebook.com/v21.0/${APP_ID}/subscriptions?access_token=${APP_ACCESS_TOKEN}`,
            { timeout: 5000 }
        );
        const subs = resp.data.data || [];
        const pageSub = subs.find(s => s.object === 'page');
        if (pageSub) {
            console.log('   ✅ Page webhook subscribed');
            console.log('   Callback URL:', pageSub.callback_url);
            console.log('   Active:', pageSub.active);
            console.log('   Fields:', pageSub.fields?.map(f => f.name).join(', '));
        } else {
            console.log('   ❌ Page webhook NOT found');
        }
    } catch (e) {
        console.log('   ❌ Error:', e.response?.data?.error?.message || e.message);
    }
    console.log('');

    // Step 9: Check for Blocked/Blacklisted Users
    console.log('📌 Step 9: Common Issues...');
    console.log('   ✅ Check if your Facebook ID is blocked in brand settings');
    console.log('   ✅ Ensure you\'re messaging the correct Facebook Page');
    console.log('   ✅ Verify webhook is receiving events (check Vercel logs)');
    console.log('');

    // Summary
    console.log('═══════════════════════════════════════════');
    console.log('📊 SUMMARY:');
    console.log('═══════════════════════════════════════════');
    
    const issues = [];
    if (!brand.fbPageToken) issues.push('❌ Missing FB Page Token');
    if (inboxSettings.systemAutoReply === false) issues.push('❌ Inbox Auto Reply is OFF');
    if (aiSettings.inboxAiEnabled === false) issues.push('❌ Inbox AI is OFF');
    if (kbSnap.size === 0 && draftsSnap.size === 0) issues.push('⚠️  No knowledge base or draft replies');
    
    if (issues.length === 0) {
        console.log('✅ All systems look GOOD!');
        console.log('');
        console.log('💡 If auto-reply still not working:');
        console.log('   1. Check Vercel logs for incoming webhook events');
        console.log('   2. Send a test message and wait 2-3 seconds');
        console.log('   3. Check if message is from your personal ID (not page)');
        console.log('   4. Verify Facebook Page is connected correctly');
    } else {
        issues.forEach(issue => console.log('   ' + issue));
    }
    console.log('');
}

diagnoseMessageAutomation().catch(e => console.error('Diagnostic Error:', e.message));
