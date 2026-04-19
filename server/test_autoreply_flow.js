/**
 * 🔍 Complete Auto-Reply Flow Test
 * Tests: Webhook → Processing → Facebook API Send
 */
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const serviceAccount = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-service-account.json'), 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function testCompleteAutoReplyFlow() {
    console.log('\n🔍 ====== COMPLETE AUTO-REPLY FLOW TEST ======\n');

    // Step 1: Get Brand Data
    console.log('📌 Step 1: Checking Brand Configuration...');
    const brandDoc = await db.collection('brands').doc('Skinzy').get();
    if (!brandDoc.exists) {
        console.log('❌ Brand "Skinzy" not found!');
        return;
    }
    const brand = brandDoc.data();
    console.log('✅ Brand:', brand.name);
    console.log('   Page ID:', brand.facebookPageId);
    console.log('   Page Token:', brand.fbPageToken ? `${brand.fbPageToken.substring(0, 20)}...` : '❌ MISSING');
    console.log('');

    // Step 2: Test Facebook Page Token Validity
    console.log('📌 Step 2: Testing Facebook Page Token...');
    try {
        const fbResp = await axios.get(
            `https://graph.facebook.com/v21.0/${brand.facebookPageId}?access_token=${brand.fbPageToken}`,
            { timeout: 5000 }
        );
        console.log('✅ Page Token is VALID');
        console.log('   Page Name:', fbResp.data.name);
        console.log('');
    } catch (e) {
        console.log('❌ Page Token INVALID:', e.response?.data?.error?.message || e.message);
        console.log('   This is why auto-reply is not working!');
        console.log('');
        return;
    }

    // Step 3: Check Draft Replies
    console.log('📌 Step 3: Checking Draft Replies...');
    const draftsSnap = await db.collection('draft_replies')
        .where('brandId', '==', 'Skinzy')
        .where('status', '==', 'approved')
        .get();
    console.log(`   Found ${draftsSnap.size} approved drafts`);
    if (draftsSnap.size > 0) {
        draftsSnap.docs.slice(0, 3).forEach(doc => {
            const data = doc.data();
            console.log(`   - "${data.keyword}" → "${data.result?.substring(0, 50)}..."`);
        });
    }
    console.log('');

    // Step 4: Check Recent Auto-Reply Attempts
    console.log('📌 Step 4: Checking Recent Auto-Reply Logs...');
    const logsSnap = await db.collection('logs')
        .where('brandId', '==', 'Skinzy')
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();
    
    let botMessages = 0;
    let sendErrors = 0;
    
    logsSnap.forEach(doc => {
        const log = doc.data();
        if (log.type === 'bot') botMessages++;
        if (log.type === 'send_error') sendErrors++;
    });
    
    console.log(`   Bot Messages Sent: ${botMessages}`);
    console.log(`   Send Errors: ${sendErrors}`);
    console.log('');

    // Step 5: Check Conversations with Auto-Reply Status
    console.log('📌 Step 5: Checking Auto-Replied Conversations...');
    const convoSnap = await db.collection('conversations')
        .where('brandId', '==', 'Skinzy')
        .orderBy('lastMessageTimestamp', 'desc')
        .limit(5)
        .get();
    
    if (convoSnap.empty) {
        console.log('   ⚠️  No conversations found');
    } else {
        let autoRepliedCount = 0;
        let pendingCount = 0;
        
        convoSnap.docs.forEach((doc, i) => {
            const data = doc.data();
            const timestamp = data.lastMessageTimestamp ? new Date(data.lastMessageTimestamp).toISOString() : 'N/A';
            
            if (data.status === 'auto_replied') autoRepliedCount++;
            if (data.status === 'pending') pendingCount++;
            
            console.log(`   ${i+1}. PSID: ${doc.id}`);
            console.log(`      Status: ${data.status}`);
            console.log(`      Message: "${data.lastMessage?.substring(0, 60)}..."`);
            console.log(`      Time: ${timestamp}`);
            console.log('');
        });
        
        console.log(`   Summary: ${autoRepliedCount} auto-replied, ${pendingCount} pending`);
    }
    console.log('');

    // Step 6: Test Facebook Send API Directly
    console.log('📌 Step 6: Testing Facebook Send API Directly...');
    const testPsid = '25798685759834086'; // Use a real PSID from recent conversations
    const testMessage = 'এটি একটি টেস্ট মেসেজ। আমাদের বট কাজ করছে! ✅';
    
    try {
        const sendResp = await axios.post(
            `https://graph.facebook.com/v21.0/me/messages`,
            {
                recipient: { id: testPsid },
                message: { text: testMessage }
            },
            {
                params: { access_token: brand.fbPageToken },
                timeout: 10000
            }
        );
        console.log('✅ Facebook Send API is WORKING!');
        console.log('   Response:', JSON.stringify(sendResp.data));
        console.log('   Message sent to PSID:', testPsid);
        console.log('');
    } catch (e) {
        console.log('❌ Facebook Send API FAILED!');
        console.log('   Error:', e.response?.data?.error?.message || e.message);
        console.log('   Code:', e.response?.data?.error?.code || 'UNKNOWN');
        console.log('');
    }

    // Step 7: Summary & Recommendations
    console.log('═══════════════════════════════════════════════');
    console.log('📊 DIAGNOSIS SUMMARY:');
    console.log('═══════════════════════════════════════════════');
    
    if (botMessages > 0 && sendErrors === 0) {
        console.log('✅ Auto-reply IS working based on logs');
        console.log('');
        console.log('💡 If you\'re not seeing replies on Facebook:');
        console.log('   1. Check if you are messaging from an ADMIN/TESTER account');
        console.log('   2. Facebook may block bot replies to page admins');
        console.log('   3. Try messaging from a DIFFERENT Facebook account (not page admin)');
        console.log('   4. Check Vercel logs for real-time webhook processing');
    } else if (sendErrors > 0) {
        console.log('❌ There are send errors in the logs');
        console.log('   Check the error details above for the root cause');
    } else {
        console.log('⚠️  No auto-reply activity detected');
        console.log('   The webhook might not be receiving messages');
    }
    
    console.log('');
}

testCompleteAutoReplyFlow().catch(e => {
    console.error('Fatal Error:', e.message);
    console.error(e.stack);
});
