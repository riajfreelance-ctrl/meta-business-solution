#!/usr/bin/env node
/**
 * Facebook Webhook Setup Script
 * 
 * This script helps configure Facebook Webhook for your Vercel deployment
 * 
 * Usage:
 *   node setup_facebook_webhook.js <PAGE_ACCESS_TOKEN> <VERIFY_TOKEN> <APP_SECRET>
 * 
 * Example:
 *   node setup_facebook_webhook.js EAAY... myapp4204 66fec7b28...
 */

const axios = require('axios');

const VERCEL_URL = 'https://metasolution-rho.vercel.app';
const WEBHOOK_URL = `${VERCEL_URL}/webhook`;
const FB_API_VERSION = 'v21.0';

async function setupWebhook() {
    const [,, pageAccessToken, verifyToken, appSecret] = process.argv;

    if (!pageAccessToken || !verifyToken) {
        console.log('❌ Usage: node setup_facebook_webhook.js <PAGE_ACCESS_TOKEN> <VERIFY_TOKEN> [APP_SECRET]');
        console.log('');
        console.log('📋 Required Parameters:');
        console.log('   PAGE_ACCESS_TOKEN - Your Facebook Page Access Token');
        console.log('   VERIFY_TOKEN      - Your webhook verification token (e.g., myapp4204)');
        console.log('   APP_SECRET        - Your Facebook App Secret (optional, for signature verification)');
        console.log('');
        console.log('🔗 Your Webhook URL:');
        console.log(`   ${WEBHOOK_URL}`);
        console.log('');
        console.log('📖 Manual Setup Instructions:');
        console.log('   1. Go to https://developers.facebook.com/apps');
        console.log('   2. Select your app');
        console.log('   3. Go to "Webhooks" section');
        console.log('   4. Select "Page" from the dropdown');
        console.log(`   5. Set Callback URL: ${WEBHOOK_URL}`);
        console.log(`   6. Set Verify Token: ${verifyToken || 'myapp4204'}`);
        console.log('   7. Subscribe to fields: messages, messaging_postbacks, feed');
        process.exit(1);
    }

    console.log('🚀 Facebook Webhook Setup');
    console.log('========================');
    console.log('');
    console.log(`📍 Vercel URL: ${VERCEL_URL}`);
    console.log(`🔗 Webhook URL: ${WEBHOOK_URL}`);
    console.log('');

    try {
        // 1. Verify Page Access Token
        console.log('🔑 Step 1: Verifying Page Access Token...');
        const pageInfo = await axios.get(
            `https://graph.facebook.com/${FB_API_VERSION}/me`,
            { params: { access_token: pageAccessToken } }
        );
        console.log(`   ✅ Page: ${pageInfo.data.name} (ID: ${pageInfo.data.id})`);

        // 2. Get Page ID
        const pageId = pageInfo.data.id;

        // 3. Check current subscriptions
        console.log('');
        console.log('📡 Step 2: Checking current webhook subscriptions...');
        try {
            const subscriptions = await axios.get(
                `https://graph.facebook.com/${FB_API_VERSION}/${pageId}/subscribed_apps`,
                { params: { access_token: pageAccessToken } }
            );
            console.log('   Current subscriptions:', JSON.stringify(subscriptions.data, null, 2));
        } catch (e) {
            console.log('   ⚠️ Could not fetch subscriptions:', e.response?.data?.error?.message || e.message);
        }

        // 4. Subscribe to webhook
        console.log('');
        console.log('📡 Step 3: Subscribing to webhook fields...');
        const subscribedFields = 'messages,messaging_postbacks,feed';
        
        try {
            const subscribeResult = await axios.post(
                `https://graph.facebook.com/${FB_API_VERSION}/${pageId}/subscribed_apps`,
                {
                    subscribed_fields: subscribedFields,
                    access_token: pageAccessToken
                }
            );
            console.log(`   ✅ Subscribed to: ${subscribedFields}`);
            console.log('   Response:', JSON.stringify(subscribeResult.data, null, 2));
        } catch (e) {
            console.log('   ❌ Subscription failed:', e.response?.data?.error?.message || e.message);
        }

        // 5. Verify subscription
        console.log('');
        console.log('✅ Step 4: Verifying webhook setup...');
        try {
            const verifySubs = await axios.get(
                `https://graph.facebook.com/${FB_API_VERSION}/${pageId}/subscribed_apps`,
                { params: { access_token: pageAccessToken } }
            );
            const subs = verifySubs.data.data || [];
            if (subs.length > 0) {
                console.log('   ✅ Webhook is active!');
                console.log('   Subscribed fields:', subs[0].subscribed_fields?.join(', ') || 'None');
            } else {
                console.log('   ⚠️ No active subscriptions found');
            }
        } catch (e) {
            console.log('   ❌ Verification failed:', e.response?.data?.error?.message || e.message);
        }

        // 6. Print summary
        console.log('');
        console.log('📋 Setup Summary');
        console.log('================');
        console.log(`   Webhook URL: ${WEBHOOK_URL}`);
        console.log(`   Verify Token: ${verifyToken}`);
        console.log(`   Page ID: ${pageId}`);
        console.log(`   Page Name: ${pageInfo.data.name}`);
        console.log('');
        console.log('🎯 Next Steps:');
        console.log('   1. Ensure your Vercel deployment has these environment variables:');
        console.log('      - PAGE_ACCESS_TOKEN');
        console.log('      - VERIFY_TOKEN');
        console.log('      - APP_SECRET (for signature verification)');
        console.log('   2. Test the webhook by sending a message to your Facebook page');
        console.log('   3. Check Vercel logs for incoming webhook events');
        console.log('');
        console.log('🔍 Debug URLs:');
        console.log(`   - Health Check: ${VERCEL_URL}/api/health/token`);
        console.log(`   - Webhook Status: ${VERCEL_URL}/api/health/webhook`);
        console.log(`   - Automation Status: ${VERCEL_URL}/api/health/automation`);

    } catch (error) {
        console.error('❌ Error:', error.response?.data?.error?.message || error.message);
        process.exit(1);
    }
}

setupWebhook();
