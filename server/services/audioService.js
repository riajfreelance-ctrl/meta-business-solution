const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Transcribes a voice message (audio) into Bangla text using Gemini 1.5 Flash.
 * This is a zero-cost solution leveraging the multimodal capabilities of Gemini.
 * @param {string} url - The URL of the audio file (Meta/WhatsApp)
 * @param {object} brandData - Brand settings including API keys
 * @param {string} authToken - (Optional) Token for WhatsApp/Meta Media API
 */
async function transcribeAudio(url, brandData, authToken = null) {
    try {
        const apiKey = brandData.googleAIKey || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("[Audio] No API Key found for transcription.");
            return null;
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // 1. Download audio file
        const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
        const response = await axios.get(url, { responseType: 'arraybuffer', headers });
        const buffer = Buffer.from(response.data);
        const base64Audio = buffer.toString('base64');
        
        const contentType = response.headers['content-type'] || 'audio/ogg';

        // 2. Transcribe using Gemini 1.5 Flash (Multimodal)
        const prompt = "Transcribe this audio precisely into Bangla text. If it is in Banglish or English, transcribe it into exactly what is being said. Return ONLY the transcribed text, no explanations, no punctuation.";
        
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Audio,
                    mimeType: contentType
                }
            }
        ]);

        const transcription = result.response.text().trim();
        console.log(`[Audio Transcription Result] "${transcription}"`);
        return transcription;
    } catch (error) {
        console.error(`[Audio Transcription Error] ${error.message}`);
        return null;
    }
}

module.exports = { transcribeAudio };
