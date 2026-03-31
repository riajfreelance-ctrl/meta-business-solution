const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const defaultKey = process.env.GEMINI_API_KEY || 'MISSING_API_KEY';
const genAI = new GoogleGenerativeAI(defaultKey);
const defaultModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function getDynamicModel(apiKey) {
    const customKey = apiKey || process.env.GEMINI_API_KEY;
    const customAI = new GoogleGenerativeAI(customKey);
    // Use gemini-1.5-flash-latest or gemini-pro if flash is failing
    return customAI.getGenerativeModel({ 
        model: "gemini-1.5-flash-latest"
    });
}

async function getDynamicVisionModel(apiKey) {
    const customKey = apiKey || process.env.GEMINI_API_KEY;
    const customAI = new GoogleGenerativeAI(customKey);
    return customAI.getGenerativeModel({ 
        model: "gemini-1.5-flash-latest"
    });
}

module.exports = {
    getDynamicModel,
    getDynamicVisionModel
};
