#!/usr/bin/env node
/**
 * Webhook Resubscribe & Comment Automation Fix Script
 * 
 * This script:
 * 1. Verifies webhook endpoint is accessible
 * 2. Resubscribes to Facebook webhook fields (messages, feed, messaging_postbacks)
 * 3. Checks comment automation settings for all brands
 * 4. Provides detailed status report
 * 
 * Usage:
 *   node webhook_resubscribe_and_fix.js <PAGE_ACCESS_TOKEN> [VERIFY_TOKEN]
 * 
 * Example:
 *   node webhook_resubscribe_and_fix.js EAAY... myapp4204
 */

const axios = require('axios');

const VERCEL_URL = 'https://metasolution-rho.vercel.app';
const WEBHOOK_URL = `${VERCEL_URL}/webhook`;
const FB_API_VERSION = 'v21.0';

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkWebhookEndpoint() {
    console.log('\n🔍 Step 1: Checking webhook endpoint accessibility...');
    try {
        const response = await axios.get(WEBHOOK_URL, {
            params: {
                'hub.mode': 'subscribe',
                'hub.verify_token': 'myapp4204',
                'hub.challenge': 'test_challenge'
            },
            timeout: 10000
        });
        
        if (response.data === 'test_challenge') {
            console.log('   ✅ Webhook endpoint is accessible and responding correctly');
            return true;
        } else {
            console.log('   ⚠️ Webhook responded but with unexpected data');
            return false;
        }
    } catch (error) {
        console.log('   ❌ Webhook endpoint not accessible:', error.message);
        console.log('   💡 Make sure your Vercel deployment is live');
        return false;
    }
}

async function verifyToken(pageAccessToken) {
    console.log('\n🔑 Step 2: Verifying Page Access Token...');
    try {
        const response = await axios.get(
            `https://graph.facebook.com/${FB_API_VERSION}/me`,
            { params: { access_token: pageAccessToken } }
        );
        console.log(`   ✅ Page: ${response.data.name} (ID: ${response.data.id})`);
        return response.data;
    } catch (error) {
        console.log('   ❌ Token verification failed:', error.response?.data?.error?.message || error.message);
        return null;
    }
}

async function checkCurrentSubscriptions(pageId, pageAccessToken) {
    console.log('\n📡 Step 3: Checking current webhook subscriptions...');
    try {
        const response = await axios.get(
            `https://graph.facebook.com/${FB_API_VERSION}/${pageId}/subscribed_apps`,
            { params: { access_token: pageAccessToken } }
        );
        
        const subscriptions = response.data.data || [];
        if (subscriptions.length > 0) {
            const sub = subscriptions[0];
            console.log('   ✅ Current subscriptions found:');
            console.log('   App ID:', sub.app_id);
            console.log('   Fields:', sub.subscribed_fields?.join(', ') || 'None');
            return sub.subscribed_fields || [];
        } else {
            console.log('   ⚠️ No active subscriptions found');
            return [];
        }
    } catch (error) {
        console.log('   ❌ Failed to check subscriptions:', error.response?.data?.error?.message || error.message);
        return [];
    }
}

async function resubscribeWebhook(pageId, pageAccessToken) {
    console.log('\n🔄 Step 4: Resubscribing to webhook fields...');
    const requiredFields = 'messages,messaging_postbacks,feed';
    
    try {
        const response = await axios.post(
            `https://graph.facebook.com/${FB_API_VERSION}/${pageId}/subscribed_apps`,
            {
                subscribed_fields: requiredFields,
                access_token: pageAccessToken
            }
        );
        
        if (response.data.success) {
            console.log('   ✅ Successfully subscribed to:', requiredFields);
            return true;
        } else {
            console.log('   ⚠️ Subscription response:', response.data);
            return false;
        }
    } catch (error) {
        console.log('   ❌ Subscription failed:', error.response?.data?.error?.message || error.message);
        return false;
    }
}

async function verifySubscription(pageId, pageAccessToken) {
    console.log('\n✅ Step 5: Verifying webhook subscription...');
    try {
        const response = await axios.get(
            `https://graph.facebook.com/${FB_API_VERSION}/${pageId}/subscribed_apps`,
            { params: { access_token: pageAccessToken } }
        );
        
        const subscriptions = response.data.data || [];
        if (subscriptions.length > 0) {
            const fields = subscriptions[0].subscribed_fields || [];
            const hasFeed = fields.includes('feed');
            const hasMessages = fields.includes('messages');
            
            console.log('   ✅ Webhook is active!');
            console.log('   Subscribed fields:', fields.join(', '));
            console.log('   📝 Feed (comments):', hasFeed ? '✅' : '❌');
            console.log('   💬 Messages:', hasMessages ? '✅' : '❌');
            
            return { hasFeed, hasMessages, fields };
        } else {
            console.log('   ❌ No active subscriptions found');
            return { hasFeed: false, hasMessages: false, fields: [] };
        }
    } catch (error) {
        console.log('   ❌ Verification failed:', error.response?.data?.error?.message || error.message);
        return { hasFeed: false, hasMessages: false, fields: [] };
    }
}

async function checkCommentAutomationStatus(pageAccessToken) {
    console.log('\n🤖 Step 6: Checking comment automation status...');
    try {
        const response = await axios.get(`${VERCEL_URL}/api/health/automation`, {
            timeout: 10000
        });
        
        if (response.data.success && response.data.report.length > 0) {
            console.log('   ✅ Automation status retrieved:');
            response.data.report.forEach(brand => {
                console.log(`\n   Brand: ${brand.brand}`);
                console.log(`   ┣━ Token: ${brand.tokenPresent ? '✅' : '❌'}`);
                console.log(`   ┣━ Comment Auto Reply: ${brand.commentAutoReply ? '✅ ON' : '❌ OFF'}`);
                console.log(`   ┣━ Comment AI: ${brand.commentAI ? '✅ ON' : '❌ OFF'}`);
                console.log(`   ┣━ Comment Auto Like: ${brand.commentAutoLike ? '✅ ON' : '❌ OFF'}`);
                console.log(`   ┣━ Comment Drafts: ${brand.hasCommentDrafts ? '✅ Available' : '⚠️ None'}`);
                console.log(`   ┗━ Knowledge Base: ${brand.hasKnowledgeBase ? '✅ Available' : '⚠️ None'}`);
            });
            return response.data.report;
        } else {
            console.log('   ⚠️ No brands found or automation not configured');
            return [];
        }
    } catch (error) {
        console.log('   ❌ Failed to check automation:', error.message);
        console.log('   💡 Make sure your Vercel deployment is running');
        return [];
    }
}

async function checkWebhookSubscriptionStatus(pageAccessToken) {
    console.log('\n📊 Step 7: Checking webhook subscription for all brands...');
    try {
        const response = await axios.get(`${VERCEL_URL}/api/health/webhook`, {
            timeout: 10000
        });
        
        if (response.data.success && response.data.webhooks.length > 0) {
            console.log('   ✅ Webhook subscription status:');
            response.data.webhooks.forEach(brand => {
                console.log(`\n   Brand: ${brand.brand}`);
                if (brand.error) {
                    console.log(`   ┗━ Error: ${brand.error}`);
                } else {
                    console.log(`   ┣━ Has Subscription: ${brand.hasSubscription ? '✅' : '❌'}`);
                    console.log(`   ┣━ Feed Subscribed: ${brand.feedSubscribed ? '✅' : '❌'}`);
                    console.log(`   ┗━ Messages Subscribed: ${brand.messagesSubscribed ? '✅' : '❌'}`);
                }
            });
            return response.data.webhooks;
        } else {
            console.log('   ⚠️ No webhook data available');
            return [];
        }
    } catch (error) {
        console.log('   ❌ Failed to check webhook status:', error.message);
        return [];
    }
}

async function main() {
    const [,, pageAccessToken, verifyTokenArg] = process.argv;

    if (!pageAccessToken) {
        console.log('❌ Usage: node webhook_resubscribe_and_fix.js <PAGE_ACCESS_TOKEN> [VERIFY_TOKEN]');
        console.log('');
        console.log('📋 Required Parameters:');
        console.log('   PAGE_ACCESS_TOKEN - Your Facebook Page Access Token');
        console.log('   VERIFY_TOKEN      - Your webhook verification token (default: myapp4204)');
        console.log('');
        console.log('🔗 Your Webhook URL:');
        console.log(`   ${WEBHOOK_URL}`);
        console.log('');
        console.log('📖 Manual Setup:');
        console.log('   1. Go to https://developers.facebook.com/apps');
        console.log('   2. Select your app → Webhooks');
        console.log('   3. Configure Callback URL:', WEBHOOK_URL);
        console.log('   4. Verify Token:', verifyTokenArg || 'myapp4204');
        console.log('   5. Subscribe to: messages, messaging_postbacks, feed');
        process.exit(1);
    }

    console.log('🚀 Webhook Resubscribe & Comment Automation Fix');
    console.log('================================================');
    console.log(`📍 Vercel URL: ${VERCEL_URL}`);
    console.log(`🔗 Webhook URL: ${WEBHOOK_URL}`);
    console.log(`🔑 Verify Token: ${verifyTokenArg || 'myapp4204'}`);

    // Step 1: Check webhook endpoint
    const endpointOk = await checkWebhookEndpoint();
    await sleep(1000);

    // Step 2: Verify token
    const pageInfo = await verifyToken(pageAccessToken);
    if (!pageInfo) {
        console.log('\n❌ Invalid Page Access Token. Exiting.');
        process.exit(1);
    }
    await sleep(1000);

    // Step 3: Check current subscriptions
    const currentFields = await checkCurrentSubscriptions(pageInfo.id, pageAccessToken);
    await sleep(1000);

    // Step 4: Resubscribe
    const subscribeOk = await resubscribeWebhook(pageInfo.id, pageAccessToken);
    await sleep(2000);

    // Step 5: Verify subscription
    const subscription = await verifySubscription(pageInfo.id, pageAccessToken);
    await sleep(1000);

    // Step 6: Check comment automation
    const automationReport = await checkCommentAutomationStatus(pageAccessToken);
    await sleep(1000);

    // Step 7: Check webhook status for all brands
    const webhookReport = await checkWebhookSubscriptionStatus(pageAccessToken);

    // Summary
    console.log('\n\n📋 SUMMARY');
    console.log('==========');
    console.log(`Webhook Endpoint: ${endpointOk ? '✅ Accessible' : '❌ Not Accessible'}`);
    console.log(`Page: ${pageInfo.name} (${pageInfo.id})`);
    console.log(`Feed (Comments) Subscribed: ${subscription.hasFeed ? '✅ YES' : '❌ NO'}`);
    console.log(`Messages Subscribed: ${subscription.hasMessages ? '✅ YES' : '❌ NO'}`);
    
    console.log('\n🎯 RECOMMENDATIONS:');
    if (!subscription.hasFeed) {
        console.log('   ⚠️ Feed subscription missing - Comment automation will NOT work');
        console.log('   → Run this script again to resubscribe');
    }
    if (!subscription.hasMessages) {
        console.log('   ⚠️ Messages subscription missing - Inbox automation will NOT work');
        console.log('   → Run this script again to resubscribe');
    }
    if (automationReport.length === 0) {
        console.log('   ⚠️ No brands configured - Add brands in the dashboard');
    } else {
        const hasIssues = automationReport.some(b => !b.commentAutoReply || !b.commentAI);
        if (hasIssues) {
            console.log('   ⚠️ Some brands have comment automation disabled');
            console.log('   → Enable in Dashboard → Brand Settings → Comment Automation');
        }
    }

    console.log('\n✅ Setup Complete!');
    console.log('📝 Test by commenting on a Facebook post');
    console.log('🔍 Check Vercel logs for webhook events');
}

main().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
});
