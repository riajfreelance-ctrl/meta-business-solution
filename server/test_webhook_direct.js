/**
 * 🧪 DIRECT WEBHOOK TEST - Check if auto-reply works
 * This simulates Facebook sending a webhook to your app
 */
const axios = require('axios');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const serviceAccount = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-service-account.json'), 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function testWebhookFlow() {
    console.log('\n🧪 ====== DIRECT WEBHOOK TEST ======\n');

    const testPSID = 'YOUR_TEST_PSID_' + Date.now(); // Unique PSID for this test
    const testMessage = 'Hi, I want to know the price';
    const pageId = '963307416870090';

    console.log('📤 Sending test webhook...');
    console.log(`   PSID: ${testPSID}`);
    console.log(`   Message: "${testMessage}"`);
    console.log('');

    try {
        // Step 1: Send webhook to Vercel
        const webhookPayload = {
            object: 'page',
            entry: [{
                id: pageId,
                time: Date.now(),
                messaging: [{
                    sender: { id: testPSID },
                    recipient: { id: pageId },
                    timestamp: Date.now(),
                    message: {
                        mid: 'msg_test_' + Date.now(),
                        text: testMessage
                    }
                }]
            }]
        };

        const response = await axios.post(
            'https://metasolution-rho.vercel.app/api/webhook',
            webhookPayload,
            { 
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
        );

        console.log('✅ Webhook sent successfully');
        console.log(`   HTTP Status: ${response.status}`);
        console.log(`   Response: ${response.data}`);
        console.log('');

        // Step 2: Wait 3 seconds for processing
        console.log('⏳ Waiting 3 seconds for processing...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log('');

        // Step 3: Check if conversation was created
        console.log('🔍 Checking for conversation...');
        const convoDoc = await db.collection('conversations').doc(testPSID).get();
        
        if (convoDoc.exists) {
            const convoData = convoDoc.data();
            console.log('✅ Conversation created!');
            console.log(`   Last Message: "${convoData.lastMessage}"`);
            console.log(`   Status: ${convoData.status || 'unknown'}`);
            console.log(`   Timestamp: ${new Date(convoData.timestamp).toLocaleString()}`);
            console.log('');

            // Step 4: Check messages subcollection
            console.log('🔍 Checking messages...');
            const msgSnap = await db.collection(`conversations/${testPSID}/messages`)
                .orderBy('timestamp', 'asc')
                .get();
            
            console.log(`   Found ${msgSnap.size} messages:\n`);
            msgSnap.forEach((doc, i) => {
                const data = doc.data();
                console.log(`   ${i+1}. [${data.type}] ${data.text?.substring(0, 80) || '(no text)'}`);
            });
            console.log('');

            // Step 5: Check logs
            console.log('🔍 Checking logs...');
            const logsSnap = await db.collection('logs')
                .where('sender_psid', '==', testPSID)
                .get();
            
            console.log(`   Found ${logsSnap.size} log entries:\n`);
            logsSnap.forEach((doc, i) => {
                const data = doc.data();
                console.log(`   ${i+1}. [${data.type}] ${data.text?.substring(0, 80) || '(no text)'}`);
            });

        } else {
            console.log('❌ Conversation NOT found!');
            console.log('   Webhook was received but not processed.');
            console.log('   Check Vercel logs for errors.');
        }

        console.log('\n═══════════════════════════════════════════');
        console.log('📊 TEST RESULT:');
        console.log('═══════════════════════════════════════════\n');

        if (convoDoc.exists) {
            const msgSnap = await db.collection(`conversations/${testPSID}/messages`).get();
            const hasBotReply = msgSnap.docs.some(d => d.data().type === 'sent');
            
            if (hasBotReply) {
                console.log('✅ AUTO-REPLY IS WORKING!');
                console.log('   Bot successfully replied to test message.');
            } else {
                console.log('⚠️  MESSAGE RECEIVED BUT NO BOT REPLY');
                console.log('   Possible reasons:');
                console.log('   - AI failed to generate response');
                console.log('   - Token expired or invalid');
                console.log('   - Knowledge base empty');
            }
        } else {
            console.log('❌ WEBHOOK NOT PROCESSED');
            console.log('   Check Vercel deployment logs');
        }
        console.log('');

    } catch (error) {
        console.log('❌ Test failed!');
        console.log(`   Error: ${error.message}`);
        if (error.response) {
            console.log(`   HTTP Status: ${error.response.status}`);
            console.log(`   Response: ${JSON.stringify(error.response.data)}`);
        }
    }
}

testWebhookFlow().catch(e => console.error('Fatal Error:', e.message));
