/**
 * 🔧 FIX: Force FB Page Webhook Subscription for feed + messages
 * এই script FB Graph API দিয়ে সরাসরি subscription activate করবে
 */
const axios = require('axios');
require('dotenv').config();

const PAGE_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const PAGE_ID = process.env.FACEBOOK_PAGE_ID;

// Skinzy page-এর App ID (from token info)
async function fixWebhookSubscription() {
    console.log('\n🔧 ====== WEBHOOK SUBSCRIPTION FIX ======\n');

    // Step 1: Get token info to find App ID
    console.log('📌 Step 1: Getting token/app info...');
    try {
        const debugResp = await axios.get(
            `https://graph.facebook.com/v21.0/debug_token`,
            { params: { input_token: PAGE_TOKEN, access_token: PAGE_TOKEN } }
        );
        const tokenData = debugResp.data?.data;
        console.log('   App ID:', tokenData?.app_id);
        console.log('   User ID:', tokenData?.user_id);
        console.log('   Scopes:', tokenData?.scopes?.join(', '));
        
        const hasManageMetadata = tokenData?.scopes?.includes('pages_manage_metadata');
        const hasManagePosts = tokenData?.scopes?.includes('pages_manage_posts');
        const hasReadEngagement = tokenData?.scopes?.includes('pages_read_engagement');
        
        console.log('\n   pages_manage_metadata:', hasManageMetadata ? '✅' : '❌ MISSING');
        console.log('   pages_manage_posts:', hasManagePosts ? '✅' : '❌ MISSING');
        console.log('   pages_read_engagement:', hasReadEngagement ? '✅' : '❌ MISSING');
    } catch(e) {
        console.log('   Token debug failed:', e.response?.data?.error?.message || e.message);
    }

    // Step 2: Try subscribing with available permissions
    console.log('\n📌 Step 2: Attempting webhook subscription...');
    const fieldsToSubscribe = [
        'messages',
        'messaging_postbacks', 
        'message_reactions',
        'feed',
        'mention'
    ];

    try {
        const subResp = await axios.post(
            `https://graph.facebook.com/v21.0/${PAGE_ID}/subscribed_apps`,
            null,
            { params: { subscribed_fields: fieldsToSubscribe.join(','), access_token: PAGE_TOKEN } }
        );
        if (subResp.data?.success) {
            console.log('✅ Subscription SUCCESS! Fields:', fieldsToSubscribe.join(', '));
        } else {
            console.log('⚠️  Unexpected response:', JSON.stringify(subResp.data));
        }
    } catch (e) {
        const errCode = e.response?.data?.error?.code;
        const errMsg = e.response?.data?.error?.message || e.message;
        console.log(`❌ Subscription failed (${errCode}): ${errMsg}`);
        
        // Try with fewer fields
        console.log('\n   Trying with minimal fields (messages only)...');
        try {
            const minResp = await axios.post(
                `https://graph.facebook.com/v21.0/${PAGE_ID}/subscribed_apps`,
                null,
                { params: { subscribed_fields: 'messages,messaging_postbacks,feed', access_token: PAGE_TOKEN } }
            );
            console.log('   Minimal subscription:', minResp.data?.success ? '✅ OK' : '❌ Failed');
        } catch (e2) {
            console.log('   Minimal also failed:', e2.response?.data?.error?.message || e2.message);
        }
    }

    // Step 3: Verify current subscriptions
    console.log('\n📌 Step 3: Checking current subscriptions...');
    try {
        const checkResp = await axios.get(
            `https://graph.facebook.com/v21.0/${PAGE_ID}/subscribed_apps`,
            { params: { access_token: PAGE_TOKEN } }
        );
        const apps = checkResp.data?.data || [];
        if (apps.length > 0) {
            apps.forEach(app => {
                console.log(`   App: ${app.name || app.id}`);
                console.log(`   Fields: ${(app.subscribed_fields || []).join(', ')}`);
                console.log(`   feed: ${app.subscribed_fields?.includes('feed') ? '✅' : '❌'}`);
                console.log(`   messages: ${app.subscribed_fields?.includes('messages') ? '✅' : '❌'}`);
            });
        } else {
            console.log('   ❌ No subscriptions found!');
        }
    } catch (e) {
        const errCode = e.response?.data?.error?.code;
        console.log(`   Check failed (${errCode}): ${e.response?.data?.error?.message || e.message}`);
        
        if (errCode === 200) {
            console.log('\n' + '='.repeat(50));
            console.log('⚠️  MANUAL FIX REQUIRED:');
            console.log('='.repeat(50));
            console.log('Facebook Developer Console-এ যান:');
            console.log('https://developers.facebook.com/apps/');
            console.log('');
            console.log('1. আপনার App select করুন');
            console.log('2. "Webhooks" section-এ যান');
            console.log('3. "Page" object select করুন');
            console.log('4. নিচের fields subscribe করুন:');
            console.log('   ✓ feed (comment দেখার জন্য জরুরি!)');
            console.log('   ✓ messages');
            console.log('   ✓ messaging_postbacks');
            console.log('5. Save করুন');
            console.log('='.repeat(50));
        }
    }

    console.log('\n✅ Script complete.\n');
    process.exit(0);
}

fixWebhookSubscription().catch(e => {
    console.error('Failed:', e.message);
    process.exit(1);
});
