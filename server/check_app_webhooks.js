const axios = require('axios');
require('dotenv').config();

const APP_ID = '1698854504433245'; // Derived from debug_token
const APP_SECRET = process.env.APP_SECRET;

async function checkAppWebhooks() {
    console.log('--- APP WEBHOOK SETTINGS ---');
    const APP_ACCESS_TOKEN = `${APP_ID}|${APP_SECRET}`;
    
    try {
        console.log('Fetching subscriptions for App ID:', APP_ID);
        const resp = await axios.get(
            `https://graph.facebook.com/v21.0/${APP_ID}/subscriptions?access_token=${APP_ACCESS_TOKEN}`
        );
        
        const subs = resp.data.data || [];
        if (subs.length === 0) {
            console.log('❌ NO WEBHOOKS CONFIGURATION FOUND ON THE APP!');
            console.log('→ আপনি ফেসবুক ড্যাশবোর্ডে গিয়ে Webhooks setup করেননি।');
        } else {
            console.log('✅ Found', subs.length, 'webhook subscriptions:');
            subs.forEach(s => {
                console.log(`\n- Object: ${s.object}`);
                console.log(`  Callback URL: ${s.callback_url}`);
                console.log(`  Verify Token: ${s.verify_token || 'HIDDEN'}`);
                console.log(`  Active: ${s.active}`);
                console.log(`  Fields: ${s.fields.map(f => f.name).join(', ')}`);
            });
        }
    } catch (e) {
        console.log('❌ Error:', e.response?.data?.error?.message || e.message);
        if (e.response?.data?.error?.code === 190) {
            console.log('⚠️  App Secret might be wrong.');
        }
    }
}

checkAppWebhooks();
