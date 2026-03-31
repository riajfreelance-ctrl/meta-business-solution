const axios = require('axios');
require('dotenv').config();

const TOKEN = process.env.PAGE_ACCESS_TOKEN;
const PAGE_ID = process.env.FACEBOOK_PAGE_ID;

async function debug() {
    console.log('--- TOKEN DEBUG ---');
    try {
        console.log('1. Checking /me/accounts to see if this is a User token...');
        const accountsResp = await axios.get(`https://graph.facebook.com/v21.0/me/accounts?access_token=${TOKEN}`);
        const accounts = accountsResp.data.data || [];
        const page = accounts.find(p => p.id === PAGE_ID);
        
        if (page) {
            console.log('✅ Found Page in /me/accounts!');
            console.log('FULL_PAGE_TOKEN_START');
            console.log(page.access_token);
            console.log('FULL_PAGE_TOKEN_END');
            process.env.REAL_PAGE_TOKEN = page.access_token;
        } else {
            console.log('❌ Page ID not found in /me/accounts. This token might be for a different user/page.');
        }

        console.log('\n2. Testing /me with current token...');
        const meResp = await axios.get(`https://graph.facebook.com/v21.0/me?access_token=${TOKEN}`);
        console.log('   Token belongs to:', meResp.data.name, '(ID:', meResp.data.id, ')');

        if (process.env.REAL_PAGE_TOKEN) {
             console.log('\n3. Retrying subscription with REAL Page Token...');
             const subResp = await axios.post(
                `https://graph.facebook.com/v21.0/${PAGE_ID}/subscribed_apps`,
                null,
                { params: { subscribed_fields: 'messages,messaging_postbacks,feed,mention', access_token: process.env.REAL_PAGE_TOKEN } }
            );
            console.log('   Subscription result:', subResp.data.success ? '✅ SUCCESS' : '❌ FAILED');
        }

    } catch (e) {
        console.log('❌ Error:', e.response?.data?.error?.message || e.message);
    }
}

debug();
