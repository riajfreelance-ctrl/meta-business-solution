/**
 * 🔧 Test Facebook INBOX Message Webhook (not comment)
 * This simulates a direct message to the Facebook Page
 */
const axios = require('axios');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const serviceAccount = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-service-account.json'), 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function testInboxMessageWebhook() {
    console.log('\n🔧 ====== INBOX MESSAGE WEBHOOK TEST ======\n');

    // Get brand data
    const brandDoc = await db.collection('brands').doc('Skinzy').get();
    if (!brandDoc.exists) {
        console.log('❌ Brand "Skinzy" not found!');
        return;
    }
    const brand = brandDoc.data();

    console.log('📌 Brand:', brand.name);
    console.log('   Facebook Page ID:', brand.facebookPageId);
    console.log('   Inbox Auto Reply:', (brand.inboxSettings?.systemAutoReply !== false) ? '✅ ON' : '❌ OFF');
    console.log('   Inbox AI:', (brand.aiSettings?.inboxAiEnabled !== false) ? '✅ ON' : '❌ OFF');
    console.log('');

    // Simulate an INBOX message webhook payload (NOT a comment)
    const testPayload = {
        object: 'page',
        entry: [{
            id: brand.facebookPageId,
            time: Date.now(),
            messaging: [{
                sender: {
                    id: 'TEST_USER_' + Date.now()
                },
                recipient: {
                    id: brand.facebookPageId
                },
                timestamp: Date.now(),
                message: {
                    mid: 'test_msg_' + Date.now(),
                    text: 'ডেলিভারি চার্জ'  // Test with a keyword that exists in drafts
                }
            }]
        }]
    };

    console.log('📤 Sending test INBOX message to Vercel webhook...');
    console.log('Payload:', JSON.stringify(testPayload, null, 2));
    console.log('');

    try {
        const response = await axios.post(
            'https://metasolution-rho.vercel.app/webhook',
            testPayload,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            }
        );

        console.log('✅ Webhook sent successfully!');
        console.log('Response Status:', response.status);
        console.log('Response:', response.data);
        console.log('');
        console.log('⏳ Waiting 8 seconds for processing...');
        await new Promise(resolve => setTimeout(resolve, 8000));

        // Check if conversation was created/updated
        console.log('\n📊 Checking for processed conversations...');
        const convoSnap = await db.collection('conversations')
            .orderBy('lastMessageTimestamp', 'desc')
            .limit(3)
            .get();

        if (!convoSnap.empty) {
            console.log(`Found ${convoSnap.size} recent conversations:`);
            convoSnap.docs.forEach((doc, i) => {
                const data = doc.data();
                const timestamp = data.lastMessageTimestamp ? new Date(data.lastMessageTimestamp).toISOString() : 'N/A';
                console.log(`\n${i+1}. PSID: ${doc.id}`);
                console.log(`   Last Message: "${data.lastMessage?.substring(0, 60)}..."`);
                console.log(`   Status: ${data.status || 'unknown'}`);
                console.log(`   Timestamp: ${timestamp}`);
                if (data.replies && data.replies.length > 0) {
                    console.log(`   Bot Reply: "${data.replies[0]?.text?.substring(0, 60)}..."`);
                }
            });
        } else {
            console.log('❌ No conversations found');
        }

        // Check recent logs
        console.log('\n📊 Checking recent logs...');
        const logsSnap = await db.collection('logs')
            .orderBy('timestamp', 'desc')
            .limit(5)
            .get();

        if (!logsSnap.empty) {
            logsSnap.docs.forEach((doc, i) => {
                const log = doc.data();
                const timestamp = log.timestamp?.toDate ? log.timestamp.toDate().toISOString() : 'N/A';
                console.log(`${i+1}. [${log.type?.toUpperCase() || 'UNKNOWN'}] ${timestamp}`);
                console.log(`   ${log.message?.substring(0, 80) || 'No message'}`);
            });
        } else {
            console.log('❌ No logs found');
        }

    } catch (error) {
        console.log('❌ Webhook test failed!');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }

    console.log('');
}

testInboxMessageWebhook().catch(e => {
    console.error('Fatal Error:', e.message);
    console.error(e.stack);
});
