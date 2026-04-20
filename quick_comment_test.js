#!/usr/bin/env node
/**
 * Quick Comment Automation Test - No Firebase Required
 * Tests Facebook webhook subscription and token validity
 */

const axios = require('axios');
require('dotenv').config({ path: './server/.env' });

const PAGE_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'myapp4204';
const WEBHOOK_URL = 'https://metasolution-rho.vercel.app/webhook';

async function quickTest() {
    console.log('\n🔍 ====== QUICK COMMENT AUTOMATION TEST ======\n');
    console.log(`Page ID: ${PAGE_ID}`);
    console.log(`Page Token: ${PAGE_TOKEN ? '✅ Present' : '❌ MISSING'}`);
    console.log(`Verify Token: ${VERIFY_TOKEN}`);
    console.log('');

    // Test 1: Validate Page Token
    console.log('📌 Test 1: Validating Page Access Token...');
    try {
        const resp = await axios.get(
            `https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${PAGE_TOKEN}`
        );
        console.log(`   ✅ Token is valid! Page: ${resp.data.name} (ID: ${resp.data.id})`);
    } catch (e) {
        const errCode = e.response?.data?.error?.code;
        const errMsg = e.response?.data?.error?.message || e.message;
        console.log(`   ❌ Token INVALID (Error ${errCode}): ${errMsg}`);
        console.log('   → Token expired বা invalid। নতুন token generate করতে হবে।\n');
        return;
    }
    console.log('');

    // Test 2: Check Webhook Subscription
    console.log('📌 Test 2: Checking Webhook Subscription...');
    try {
        // Use the actual page ID from the token response
        const actualPageId = '963307416870090'; // From Test 1 response
        const resp = await axios.get(
            `https://graph.facebook.com/v21.0/${actualPageId}/subscribed_apps?access_token=${PAGE_TOKEN}`
        );
        
        if (resp.data?.data?.length > 0) {
            const app = resp.data.data[0];
            console.log(`   ✅ Webhook subscribed`);
            console.log(`   App: ${app.name}`);
            console.log(`   Fields: ${app.subscribed_fields?.join(', ') || 'NONE'}`);
            
            const hasFeed = app.subscribed_fields?.includes('feed');
            const hasMessages = app.subscribed_fields?.includes('messages');
            
            console.log('');
            console.log(`   feed (comments): ${hasFeed ? '✅' : '❌ MISSING!'}`);
            console.log(`   messages: ${hasMessages ? '✅' : '❌ MISSING!'}`);
            
            if (!hasFeed) {
                console.log('\n   ⚠️  PROBLEM: "feed" field not subscribed!');
                console.log('   → Comment webhooks will NOT work!');
                console.log('   → Run: node webhook_resubscribe_and_fix.js <PAGE_ACCESS_TOKEN>\n');
            }
        } else {
            console.log('   ❌ NO WEBHOOK SUBSCRIPTION!');
            console.log('   → Run: node webhook_resubscribe_and_fix.js <PAGE_ACCESS_TOKEN>\n');
        }
    } catch (e) {
        console.log(`   ❌ Error: ${e.response?.data?.error?.message || e.message}\n`);
    }

    // Test 3: Verify Webhook Endpoint
    console.log('📌 Test 3: Testing Webhook Endpoint...');
    try {
        const resp = await axios.get(WEBHOOK_URL, {
            params: {
                'hub.mode': 'subscribe',
                'hub.verify_token': VERIFY_TOKEN,
                'hub.challenge': 'test_challenge_123'
            }
        });
        
        if (resp.data === 'test_challenge_123') {
            console.log('   ✅ Webhook endpoint is working correctly!');
        } else {
            console.log(`   ⚠️  Unexpected response: ${resp.data}`);
        }
    } catch (e) {
        console.log(`   ❌ Webhook endpoint failed: ${e.message}\n`);
    }
    console.log('');

    // Test 4: Check Recent Posts (to verify token has page permissions)
    console.log('📌 Test 4: Checking Page Posts (testing permissions)...');
    try {
        const actualPageId = '963307416870090'; // From Test 1 response
        const resp = await axios.get(
            `https://graph.facebook.com/v21.0/${actualPageId}/posts`,
            {
                params: {
                    access_token: PAGE_TOKEN,
                    fields: 'id,message,created_time',
                    limit: 3
                }
            }
        );
        
        if (resp.data?.data?.length > 0) {
            console.log(`   ✅ Found ${resp.data.data.length} recent posts`);
            resp.data.data.forEach((post, i) => {
                const msg = post.message ? post.message.substring(0, 50) : '(no message)';
                console.log(`   ${i+1}. ${msg}...`);
            });
        } else {
            console.log('   ⚠️  No posts found');
        }
    } catch (e) {
        console.log(`   ❌ Error: ${e.response?.data?.error?.message || e.message}`);
        console.log('   → Token may not have pages_read_engagement permission\n');
    }
    console.log('');

    // Test 5: Simulate Comment Webhook
    console.log('📌 Test 5: Simulating Comment Webhook...');
    const actualPageId = '963307416870090'; // From Test 1 response
    const testPayload = {
        object: 'page',
        entry: [{
            id: actualPageId,
            time: Date.now(),
            changes: [{
                field: 'feed',
                value: {
                    comment_id: 'test_comment_' + Date.now(),
                    post_id: actualPageId + '_123456',
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
            }]
        }]
    };

    try {
        const resp = await axios.post(WEBHOOK_URL, testPayload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 65000
        });
        
        console.log(`   ✅ Webhook accepted: ${resp.data}`);
        console.log('   → Check Vercel logs to see if comment was processed');
    } catch (e) {
        console.log(`   ❌ Webhook test failed: ${e.message}`);
        if (e.response) {
            console.log(`   Status: ${e.response.status}`);
            console.log(`   Response: ${JSON.stringify(e.response.data)}`);
        }
    }
    console.log('');

    // Summary
    console.log('======================================');
    console.log('📊 SUMMARY');
    console.log('======================================');
    console.log('');
    console.log('✅ = Working');
    console.log('❌ = Problem detected');
    console.log('⚠️  = Warning');
    console.log('');
    console.log('Common fixes:');
    console.log('1. Token expired → Generate new Page Access Token');
    console.log('2. "feed" not subscribed → Run webhook_resubscribe_and_fix.js');
    console.log('3. No comments in logs → Check Facebook page for actual comments');
    console.log('4. Webhook failing → Check Vercel deployment logs');
    console.log('');
    console.log('📝 Next Steps:');
    console.log('   1. Check Vercel logs: https://vercel.com/your-project/logs');
    console.log('   2. Test with real Facebook comment');
    console.log('   3. Run: node webhook_resubscribe_and_fix.js <PAGE_ACCESS_TOKEN>');
    console.log('');
}

quickTest().catch(e => {
    console.error('Test failed:', e.message);
    process.exit(1);
});
