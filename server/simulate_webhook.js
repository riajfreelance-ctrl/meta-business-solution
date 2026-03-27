const axios = require('axios');

const PORT = 3000; // Server port
const BRAND_FB_ID = '963307416870090'; // Skinzy FB ID
const WEBHOOK_URL = `http://localhost:${PORT}/webhook`;

async function simulateInbox(text) {
    console.log(`\n--- 📥 Simulating Inbox Message: "${text}" ---`);
    const payload = {
        object: 'page',
        entry: [{
            id: BRAND_FB_ID,
            messaging: [{
                sender: { id: 'TEST_USER_PSID' },
                recipient: { id: BRAND_FB_ID },
                timestamp: Date.now(),
                message: { text: text }
            }]
        }]
    };
    try {
        const res = await axios.post(WEBHOOK_URL, payload);
        console.log('Response:', res.data);
    } catch (e) {
        console.error('Error:', e.message);
    }
}

async function simulateComment(text) {
    console.log(`\n--- 💬 Simulating Comment: "${text}" ---`);
    const payload = {
        object: 'page',
        entry: [{
            id: BRAND_FB_ID,
            changes: [{
                field: 'feed',
                value: {
                    item: 'comment',
                    verb: 'add',
                    comment_id: 'cmt_' + Date.now(),
                    post_id: 'post_12345',
                    message: text,
                    from: { id: 'TEST_USER_ID', name: 'Test User' }
                }
            }]
        }]
    };
    try {
        const res = await axios.post(WEBHOOK_URL, payload);
        console.log('Response:', res.data);
    } catch (e) {
        console.error('Error:', e.message);
    }
}

async function runTests() {
    // 1. Inbox - Deterministic (Price)
    await simulateInbox('দাম কত?');
    
    // 2. Inbox - Generative (Skin type)
    await simulateInbox('আমার স্কিন অনেক অয়েলি, কি কি প্রোডাক্ট পাবো?');

    // 3. Comment - AI Discovery
    await simulateComment('প্রোডাক্ট টি খুব ভালো মনে হচ্ছে!');

    console.log('\n✅ Simulation Triggered. Check the Dashboard (Inbox & Logs).');
}

runTests();
