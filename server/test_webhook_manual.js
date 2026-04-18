/**
 * 🔧 Manual Webhook Test
 * Simulates a Facebook comment webhook to test the system
 */
const axios = require('axios');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const serviceAccount = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-service-account.json'), 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function testWebhook() {
    console.log('\n🔧 ====== MANUAL WEBHOOK TEST ======\n');

    // Get brand data
    const brandDoc = await db.collection('brands').doc('Skinzy').get();
    const brand = brandDoc.data();

    console.log('Brand:', brand.name);
    console.log('Page ID:', brand.facebookPageId);
    console.log('');

    // Simulate a comment webhook payload
    const testPayload = {
        object: 'page',
        entry: [{
            id: brand.facebookPageId,
            time: Date.now(),
            changes: [{
                field: 'feed',
                value: {
                    comment_id: 'test_comment_' + Date.now(),
                    post_id: 'test_post_123',
                    item: 'comment',
                    verb: 'add',
                    message: 'price koto?',
                    from: {
                        id: 'test_user_123',
                        name: 'Test User'
                    }
                }
            }]
        }]
    };

    console.log('📤 Sending test webhook to Vercel...');
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
                timeout: 10000
            }
        );

        console.log('✅ Webhook sent successfully!');
        console.log('Response:', response.data);
        console.log('');
        console.log('⏳ Waiting 5 seconds for processing...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Check if comment was processed
        console.log('\n📊 Checking if comment was processed...');
        const commentsSnap = await db.collection('comments')
            .orderBy('timestamp', 'desc')
            .limit(1)
            .get();

        if (!commentsSnap.empty) {
            const latestComment = commentsSnap.docs[0].data();
            const timestamp = latestComment.timestamp?.toDate ? latestComment.timestamp.toDate() : new Date(latestComment.timestamp);
            const timeDiff = Date.now() - timestamp.getTime();

            if (timeDiff < 60000) { // Less than 1 minute ago
                console.log('✅ Comment processed successfully!');
                console.log('Message:', latestComment.message);
                console.log('Reply:', latestComment.reply || 'None');
            } else {
                console.log('⚠️  Comment not processed yet (old comment shown)');
            }
        } else {
            console.log('❌ No comments found in database');
        }

    } catch (error) {
        console.log('❌ Webhook test failed!');
        console.log('Error:', error.response?.data || error.message);
    }

    console.log('');
}

testWebhook().catch(e => console.error(e.message));
