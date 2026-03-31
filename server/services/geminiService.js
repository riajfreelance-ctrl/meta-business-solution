const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const defaultKey = process.env.GEMINI_API_KEY || 'MISSING_API_KEY';
const genAI = new GoogleGenerativeAI(defaultKey);
const defaultModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function getDynamicModel(apiKey) {
    // The second argument is for options in newer SDKs
    const customKey = apiKey || process.env.GEMINI_API_KEY;
    const customAI = new GoogleGenerativeAI(customKey);
    // Explicitly using the v1 model if v1beta is failing
    return customAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        apiVersion: 'v1' 
    });
}

async function getDynamicVisionModel(apiKey) {
    const customKey = apiKey || process.env.GEMINI_API_KEY;
    const customAI = new GoogleGenerativeAI(customKey);
    return customAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        apiVersion: 'v1' 
    });
}

module.exports = {
    genAI,
    defaultModel,
    getDynamicModel,
    getDynamicVisionModel
};
