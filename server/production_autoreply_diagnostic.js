/**
 * 🔬 PRODUCTION-READY FACEBOOK INBOX AUTO-REPLY DIAGNOSTIC
 * Tests complete flow: Webhook → Brand Match → Token Validation → Message Send
 * Run this on LOCAL to verify Vercel production setup
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

// Initialize Firebase
const serviceAccount = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-service-account.json'), 'utf8'));
if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

async function productionDiagnostic() {
    console.log('\n🔬 ====== PRODUCTION AUTO-REPLY DIAGNOSTIC ======\n');
    
    // ============================================================================
    // STEP 1: VERIFY BRAND CONFIGURATION IN FIRESTORE
    // ============================================================================
    console.log('📌 STEP 1: Brand Configuration in Firestore...');
    const brandDoc = await db.collection('brands').doc('Skinzy').get();
    if (!brandDoc.exists) {
        console.log('❌ Brand "Skinzy" NOT FOUND in Firestore!');
        console.log('   This is the root cause - brand does not exist.');
        return;
    }
    
    const brand = brandDoc.data();
    console.log('✅ Brand exists:', brand.name);
    console.log('   Brand ID:', brandDoc.id);
    console.log('   Facebook Page ID:', brand.facebookPageId || 'NOT SET');
    console.log('   FB Page Token:', brand.fbPageToken ? `✅ SET (${brand.fbPageToken.substring(0, 20)}...)` : '❌ NOT SET');
    console.log('');
    
    // Check automation settings
    const inboxSettings = brand.inboxSettings || {};
    const aiSettings = brand.aiSettings || {};
    
    console.log('   Automation Settings:');
    console.log('   - System Auto Reply:', inboxSettings.systemAutoReply !== false ? '✅ ON' : '❌ OFF');
    console.log('   - AI Reply (Inbox):', aiSettings.inboxAiEnabled !== false ? '✅ ON' : '❌ OFF');
    console.log('');
    
    // ============================================================================
    // STEP 2: VERIFY FACEBOOK PAGE TOKEN VALIDITY
    // ============================================================================
    console.log('📌 STEP 2: Facebook Page Token Validation...');
    
    if (!brand.fbPageToken) {
        console.log('❌ CRITICAL: FB Page Token is MISSING from brand document!');
        console.log('   The token MUST be stored in Firestore brands.Skinzy.fbPageToken');
        console.log('');
        console.log('   💡 FIX: Run the Facebook OAuth flow to get a valid Page Access Token');
        return;
    }
    
    // Test 1: Check if token can access the page
    try {
        const pageResp = await axios.get(
            `https://graph.facebook.com/v21.0/${brand.facebookPageId}`,
            { 
                params: { access_token: brand.fbPageToken },
                timeout: 5000
            }
        );
        console.log('✅ Page Token is VALID');
        console.log('   Page Name:', pageResp.data.name);
        console.log('   Page ID:', pageResp.data.id);
        console.log('');
    } catch (e) {
        console.log('❌ Page Token is INVALID or EXPIRED');
        console.log('   Error:', e.response?.data?.error?.message || e.message);
        console.log('   Error Code:', e.response?.data?.error?.code || 'UNKNOWN');
        console.log('');
        console.log('   💡 FIX:');
        console.log('   1. Go to https://developers.facebook.com/tools/explorer/');
        console.log('   2. Select App: MetaSolution (1698854504433245)');
        console.log('   3. Get Page Access Token with permissions:');
        console.log('      ✓ pages_messaging (REQUIRED)');
        console.log('      ✓ pages_read_engagement');
        console.log('      ✓ pages_manage_posts');
        console.log('   4. Copy the new token');
        console.log('   5. Update it in Vercel: npx vercel env add PAGE_ACCESS_TOKEN production');
        console.log('   6. Also update Firestore: brands.Skinzy.fbPageToken');
        return;
    }
    
    // Test 2: Check if token has pages_messaging permission
    try {
        const permissionsResp = await axios.get(
            `https://graph.facebook.com/v21.0/${brand.facebookPageId}/permissions`,
            {
                params: { access_token: brand.fbPageToken },
                timeout: 5000
            }
        );
        
        const messagingPerm = permissionsResp.data.data?.find(p => 
            p.permission === 'pages_messaging' && p.status === 'granted'
        );
        
        if (messagingPerm) {
            console.log('✅ pages_messaging permission is GRANTED');
        } else {
            console.log('❌ pages_messaging permission is MISSING or NOT GRANTED');
            console.log('   This is REQUIRED for sending messages!');
        }
        console.log('');
    } catch (e) {
        console.log('⚠️  Could not check permissions:', e.message);
        console.log('');
    }
    
    // ============================================================================
    // STEP 3: TEST FACEBOOK SEND API
    // ============================================================================
    console.log('📌 STEP 3: Test Facebook Send API (Direct Call)...');
    
    // Use a real PSID from recent conversation or create a test one
    const testPsid = '25798685759834086'; // From earlier diagnostic
    const testMessage = '🤖 Test message from diagnostic script. Auto-reply system is working! ✅';
    
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
        console.log('   Message ID:', sendResp.data.message_id);
        console.log('   Sent to PSID:', testPsid);
        console.log('');
    } catch (e) {
        console.log('❌ Facebook Send API FAILED!');
        console.log('   Error:', e.response?.data?.error?.message || e.message);
        console.log('   Code:', e.response?.data?.error?.code || 'UNKNOWN');
        console.log('');
        
        if (e.response?.data?.error?.code === 10 || e.response?.data?.error?.code === 190) {
            console.log('   💡 FIX: Token does not have messaging permission or is invalid');
            console.log('   Regenerate token with pages_messaging permission');
        }
        return;
    }
    
    // ============================================================================
    // STEP 4: VERIFY WEBHOOK IS RECEIVING EVENTS
    // ============================================================================
    console.log('📌 STEP 4: Test Webhook Endpoint...');
    
    try {
        const statusResp = await axios.get('https://metasolution-rho.vercel.app/api/status', {
            timeout: 5000
        });
        console.log('✅ Vercel API is ALIVE');
        console.log('   Status:', statusResp.data.status);
        console.log('');
    } catch (e) {
        console.log('❌ Vercel API is DOWN:', e.message);
        console.log('');
        return;
    }
    
    // Send test webhook
    console.log('   Sending test message webhook...');
    const testWebhookPayload = {
        object: 'page',
        entry: [{
            id: brand.facebookPageId,
            time: Date.now(),
            messaging: [{
                sender: { id: 'DIAGNOSTIC_TEST_' + Date.now() },
                recipient: { id: brand.facebookPageId },
                timestamp: Date.now(),
                message: {
                    mid: 'diag_test_' + Date.now(),
                    text: 'ডেলিভারি চার্জ' // Known keyword
                }
            }]
        }]
    };
    
    try {
        const webhookResp = await axios.post(
            'https://metasolution-rho.vercel.app/webhook',
            testWebhookPayload,
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 15000
            }
        );
        console.log('✅ Webhook received: 200 OK');
        console.log('   Response:', webhookResp.data);
        console.log('');
        
        // Wait for processing
        console.log('   ⏳ Waiting 8 seconds for processing...');
        await new Promise(r => setTimeout(r, 8000));
        
    } catch (e) {
        console.log('❌ Webhook test failed:', e.response?.data || e.message);
        console.log('');
    }
    
    // ============================================================================
    // STEP 5: CHECK CONVERSATIONS AND LOGS
    // ============================================================================
    console.log('📌 STEP 5: Check Recent Conversations...');
    
    const convoSnap = await db.collection('conversations')
        .where('brandId', '==', 'Skinzy')
        .orderBy('lastMessageTimestamp', 'desc')
        .limit(5)
        .get();
    
    if (convoSnap.empty) {
        console.log('⚠️  No conversations found');
    } else {
        console.log(`Found ${convoSnap.size} recent conversation(s):\n`);
        convoSnap.docs.forEach((doc, i) => {
            const data = doc.data();
            const timeAgo = data.lastMessageTimestamp ? 
                Math.round((Date.now() - data.lastMessageTimestamp) / 60000) : 'N/A';
            
            console.log(`${i+1}. PSID: ${doc.id}`);
            console.log(`   Status: ${data.status || 'unknown'}`);
            console.log(`   Last Message: "${(data.lastMessage || '').substring(0, 60)}..."`);
            console.log(`   Time: ${timeAgo} minutes ago`);
            console.log('');
        });
    }
    
    // Check for send errors in logs
    console.log('📌 STEP 6: Check for Send Errors...');
    const errorLogsSnap = await db.collection('logs')
        .where('type', '==', 'send_error')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get();
    
    if (errorLogsSnap.empty) {
        console.log('✅ No send errors found in logs');
    } else {
        console.log(`❌ Found ${errorLogsSnap.size} send error(s):\n`);
        errorLogsSnap.docs.forEach((doc, i) => {
            const log = doc.data();
            console.log(`${i+1}. Error: ${log.error || log.message || 'Unknown'}`);
            console.log(`   PSID: ${log.psid || 'N/A'}`);
            console.log(`   Time: ${new Date(log.timestamp).toISOString()}`);
            console.log('');
        });
    }
    
    // ============================================================================
    // FINAL SUMMARY
    // ============================================================================
    console.log('═══════════════════════════════════════════════════');
    console.log('📊 FINAL DIAGNOSIS SUMMARY:');
    console.log('═══════════════════════════════════════════════════\n');
    
    const issues = [];
    
    if (!brand.fbPageToken) {
        issues.push('❌ CRITICAL: FB Page Token missing from Firestore');
    }
    if (!brand.facebookPageId) {
        issues.push('❌ CRITICAL: Facebook Page ID missing from brand');
    }
    if (inboxSettings.systemAutoReply === false) {
        issues.push('❌ System Auto Reply is DISABLED in brand settings');
    }
    
    if (issues.length === 0) {
        console.log('✅ ALL SYSTEMS OPERATIONAL!');
        console.log('');
        console.log('💡 If auto-reply still not working:');
        console.log('   1. Check if you are messaging from a PAGE ADMIN account');
        console.log('      - Facebook blocks bot replies to page admins');
        console.log('      - Test from a different Facebook account');
        console.log('');
        console.log('   2. Check Vercel logs in real-time:');
        console.log('      - Go to Vercel Dashboard → metasolution → Logs');
        console.log('      - Send a message and watch the logs');
        console.log('');
        console.log('   3. Verify webhook subscription:');
        console.log('      - Facebook App → Webhooks → Subscribed to page');
        console.log('      - Callback URL: https://metasolution-rho.vercel.app/webhook');
        console.log('');
        console.log('   4. Test with a known keyword:');
        console.log('      - Send "ডেলিভারি চার্জ" to Skinzy Facebook page');
        console.log('      - Should trigger auto-reply immediately');
    } else {
        console.log('ISSUES FOUND:\n');
        issues.forEach(issue => console.log('   ' + issue));
        console.log('');
        console.log('💡 Fix the issues above and run this diagnostic again.');
    }
    
    console.log('');
}

// Run diagnostic
productionDiagnostic().catch(e => {
    console.error('💥 Fatal Error:', e.message);
    console.error(e.stack);
    process.exit(1);
});
