const axios = require('axios');
require('dotenv').config();

const APP_ID = '1698854504433245';
const APP_SECRET = process.env.APP_SECRET;

async function checkAppStatus() {
    console.log('--- APP STATUS DIAGNOSIS ---');
    const APP_ACCESS_TOKEN = `${APP_ID}|${APP_SECRET}`;
    
    try {
        const resp = await axios.get(
            `https://graph.facebook.com/v21.0/${APP_ID}?fields=name,link,category,is_app_shareable_preview,roles,daily_active_users,app_type,website_url&access_token=${APP_ACCESS_TOKEN}`
        );
        console.log('App Name:', resp.data.name);
        console.log('Category:', resp.data.category);
        
        // This is a direct indicator often linked to live mode for small apps
        // but let's check a more explicit one if possible
        
        // Roles can show us who can test
        try {
            const rolesResp = await axios.get(`https://graph.facebook.com/v21.0/${APP_ID}/roles?access_token=${APP_ACCESS_TOKEN}`);
            console.log('\nApp Roles (Devs/Testers):');
            rolesResp.data.data.forEach(r => {
                console.log(`- ${r.role}: ${r.user}`);
            });
        } catch(e) {}

    } catch (e) {
        console.log('❌ Error:', e.response?.data?.error?.message || e.message);
    }
}

checkAppStatus();
