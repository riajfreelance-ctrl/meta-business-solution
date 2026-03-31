const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

async function testGemini() {
    console.log('Testing Gemini Key:', API_KEY.substring(0, 5) + '...');
    try {
        const genAI = new GoogleGenerativeAI(API_KEY, { apiVersion: 'v1' });
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Say hello in Bangla.");
        console.log('✅ Gemini Response:', result.response.text());
    } catch (e) {
        console.log('❌ Gemini Failed:', e.message);
    }
}

testGemini();
