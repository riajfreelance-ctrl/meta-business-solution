const axios = require('axios');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

async function checkConnectivity() {
    console.log('--- Connectivity Check ---');
    try {
        console.log('Testing reachability of graph.facebook.com...');
        const resp = await axios.get('https://graph.facebook.com/v21.0/me?access_token=' + process.env.PAGE_ACCESS_TOKEN);
        console.log('SUCCESS: Reachable! Page name:', resp.data.name);
    } catch (e) {
        console.error('FAILED: Cannot reach Facebook Graph API:', e.message);
    }

    try {
        console.log('\nTesting reachability of Gemini API...');
        const Gemini = require('@google/generative-ai').GoogleGenerativeAI;
        const genAI = new Gemini(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Say hello");
        console.log('SUCCESS: Reachable! Response:', result.response.text());
    } catch (e) {
        console.error('FAILED: Cannot reach Gemini API:', e.message);
    }
    process.exit(0);
}

checkConnectivity();
