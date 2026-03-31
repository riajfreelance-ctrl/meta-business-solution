const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const defaultKey = process.env.GEMINI_API_KEY || 'MISSING_API_KEY';
const genAI = new GoogleGenerativeAI(defaultKey);
const defaultModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function getDynamicModel(apiKey) {
    const customKey = apiKey || process.env.GEMINI_API_KEY;
    const customAI = new GoogleGenerativeAI(customKey);
    return customAI.getGenerativeModel({ 
        model: "gemini-pro"
    });
}

async function getDynamicVisionModel(apiKey) {
    const customKey = apiKey || process.env.GEMINI_API_KEY;
    const customAI = new GoogleGenerativeAI(customKey);
    return customAI.getGenerativeModel({ 
        model: "gemini-pro-vision"
    });
}

module.exports = {
    getDynamicModel,
    getDynamicVisionModel
};
