const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const defaultModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

async function getDynamicModel(apiKey) {
    const customAI = new GoogleGenerativeAI(apiKey || process.env.GEMINI_API_KEY);
    return customAI.getGenerativeModel({ model: "gemini-flash-latest" });
}

async function getDynamicVisionModel(apiKey) {
    const customAI = new GoogleGenerativeAI(apiKey || process.env.GEMINI_API_KEY);
    return customAI.getGenerativeModel({ model: "gemini-flash-latest" });
}

module.exports = {
    genAI,
    defaultModel,
    getDynamicModel,
    getDynamicVisionModel
};
