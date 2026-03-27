const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

/**
 * Generate a vector embedding for the given text.
 * @param {string} text 
 * @param {string} [apiKey] 
 * @returns {Promise<number[]>}
 */
async function getEmbedding(text, apiKey) {
    try {
        const genAI = new GoogleGenerativeAI(apiKey || process.env.GEMINI_API_KEY, { apiVersion: 'v1' });
        const model = genAI.getGenerativeModel({ model: "embedding-001" });
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.warn('⚠️ EMBEDDING_WARNING: Could not generate vector. Falling back to zero-vector.', error.message);
        // Return a zero-vector of the expected size (768 for embedding-001)
        return new Array(768).fill(0);
    }
}

module.exports = { getEmbedding };
