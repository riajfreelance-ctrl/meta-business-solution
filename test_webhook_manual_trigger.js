#!/usr/bin/env node
/**
 * Manually trigger webhook to test if endpoint works
 */

const axios = require('axios');

const WEBHOOK_URL = 'https://metasolution-rho.vercel.app/webhook';

async function testWebhook() {
    console.log('🧪 Testing Webhook Endpoint with Simulated Comment...\n');

    // Simulate a Facebook comment webhook
    const testPayload = {
        object: 'page',
        entry: [
            {
                id: '963307416870090', // Skinzy Page ID
                time: Date.now(),
                changes: [
                    {
                        field: 'feed',
                        value: {
                            comment_id: 'test_comment_' + Date.now(),
                            post_id: '963307416870090_123456',
                            item: 'comment',
                            verb: 'add',
                            sender_name: 'Test User',
                            message: 'price koto?',
                            from: {
                                id: '123456789',
                                name: 'Test User'
                            },
                            created_time: Math.floor(Date.now() / 1000)
                        }
                    }
                ]
            }
        ]
    };

    console.log('📤 Sending test comment: "price koto?"');
    console.log(`🔗 URL: ${WEBHOOK_URL}\n`);

    try {
        const response = await axios.post(WEBHOOK_URL, testPayload, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        console.log('✅ Webhook Response:', response.data);
        console.log('\n⏳ Wait 10 seconds, then check Firestore for the comment...');
        console.log('Run: node check_very_recent_webhooks.js');

    } catch (error) {
        console.error('❌ Webhook Test Failed:');
        console.error('   Status:', error.response?.status);
        console.error('   Data:', error.response?.data);
        console.error('   Error:', error.message);
    }
}

testWebhook();
