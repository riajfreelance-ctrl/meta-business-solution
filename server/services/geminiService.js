const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const defaultKey = process.env.GEMINI_API_KEY || 'MISSING_API_KEY';
const genAI = new GoogleGenerativeAI(defaultKey);
const defaultModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function getDynamicModel(apiKey) {
    const customAI = new GoogleGenerativeAI(apiKey || process.env.GEMINI_API_KEY);
    return customAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

async function getDynamicVisionModel(apiKey) {
    const customAI = new GoogleGenerativeAI(apiKey || process.env.GEMINI_API_KEY);
    return customAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

module.exports = {
    genAI,
    defaultModel,
    getDynamicModel,
    getDynamicVisionModel
};
