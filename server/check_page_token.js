/**
 * 🔧 Check Facebook Page Token Details
 * Find out what permissions the token has and which page it belongs to
 */
const axios = require('axios');
require('dotenv').config();

async function checkPageToken() {
    console.log('\n🔧 ====== FACEBOOK PAGE TOKEN CHECK ======\n');

    // Use the token from environment or prompt user
    const PAGE_TOKEN = process.env.FB_PAGE_TOKEN || 'EAAYJGWNDBl0BRDVLvc7ZBZCj3qZCq5ZBqZCZCQZCZCQZCZCQ'; // Replace with your actual token

    console.log('📌 Step 1: Check Token Info (Debug Token)...');
    try {
        const appId = '1698854504433245';
        const appSecret = process.env.APP_SECRET;
        const appAccessToken = `${appId}|${appSecret}`;

        // Debug the token to see what permissions it has
        const debugResp = await axios.get('https://graph.facebook.com/debug_token', {
            params: {
                input_token: PAGE_TOKEN,
                access_token: appAccessToken
            },
            timeout: 5000
        });

        console.log('✅ Token Debug Info:');
        console.log('   App ID:', debugResp.data.data.app_id);
        console.log('   User ID:', debugResp.data.data.user_id);
        console.log('   Expires:', new Date(debugResp.data.data.expires_at * 1000).toISOString());
        console.log('   Valid:', debugResp.data.data.is_valid);
        console.log('   Scopes:', debugResp.data.data.scopes?.join(', '));
        console.log('');

        // Check what pages this token can access
        console.log('📌 Step 2: Check Pages Accessible...');
        const pagesResp = await axios.get('https://graph.facebook.com/v21.0/me/accounts', {
            params: { access_token: PAGE_TOKEN },
            timeout: 5000
        });

        console.log(`✅ Found ${pagesResp.data.data.length} page(s):`);
        pagesResp.data.data.forEach((page, i) => {
            console.log(`   ${i+1}. Page: ${page.name}`);
            console.log(`      ID: ${page.id}`);
            console.log(`      Access Token: ${page.access_token ? 'PRESENT' : 'MISSING'}`);
            console.log('');
        });

    } catch (e) {
        console.log('❌ Error:', e.response?.data?.error?.message || e.message);
        console.log('');
        console.log('💡 SOLUTION:');
        console.log('   1. Go to Facebook Graph API Explorer:');
        console.log('      https://developers.facebook.com/tools/explorer/');
        console.log('   2. Select your App: "MetaSolution"');
        console.log('   3. Click "Get Token" → "Get Page Access Token"');
        console.log('   4. Select the "Skinzy" page');
        console.log('   5. Make sure these permissions are checked:');
        console.log('      - pages_show_list');
        console.log('      - pages_read_engagement');
        console.log('      - pages_manage_posts');
        console.log('      - pages_manage_engagement');
        console.log('      - pages_messaging');
        console.log('   6. Copy the generated Page Access Token');
        console.log('   7. Update it in Vercel:');
        console.log('      vercel env add FB_PAGE_TOKEN production');
        console.log('');
    }

    console.log('');
}

checkPageToken().catch(e => {
    console.error('Fatal Error:', e.message);
});
