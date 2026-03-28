const { db, serverTimestamp } = require('../services/firestoreService');
const { defaultModel } = require('../services/geminiService');
const { serverLog } = require('../utils/logger');

async function generateVariations(req, res) {
    const { draftId, keyword, brandId } = req.body;
    if (!draftId || !keyword) return res.status(400).send('Missing ID or Keyword');

    try {
        serverLog(`Generating variations for [Brand: ${brandId}]: ${keyword}`);
        const prompt = `Generate 30 short, conversational, and semantic variations or synonyms (in both English and Bengali if possible) for the following user intention/keyword: "${keyword}". These variations will be used to train an AI chatbot. Return ONLY a valid JSON array of strings. No extra text, no markdown code blocks.`;
        
        const result = await defaultModel.generateContent(prompt);
        const response = await result.response;
        let text = response.text().replace(/```json|```/g, '').trim();
        
        const variations = JSON.parse(text);
        const draftRef = db.collection('draft_replies').doc(draftId);
        await draftRef.update({ variations: variations });
        
        res.json({ success: true, variations });
    } catch (error) {
        serverLog('VARIATION ERROR: ' + error.message);
        res.status(500).json({ error: error.message });
    }
}

async function generateLinguisticVariations(req, res) {
    const { draftId, keyword } = req.body;
    if (!draftId || !keyword) return res.status(400).send('Missing ID or Keyword');

    try {
        const { getLinguisticVariations } = require('../utils/linguisticEngine');
        const variations = getLinguisticVariations(keyword);
        
        const draftRef = db.collection('draft_replies').doc(draftId);
        await draftRef.update({ variations: variations });
        
        res.json({ success: true, variations });
    } catch (error) {
        serverLog('LINGUISTIC VARIATION ERROR: ' + error.message);
        res.status(500).json({ error: error.message });
    }
}

async function discoverGaps(req, res) {
    const { brandId } = req.body;
    if (!brandId) return res.status(400).send('Missing Brand ID');

    try {
        serverLog(`Generating Discovery Questions for Brand: ${brandId}`);
        const snapshot = await db.collection('knowledge_base').where('brandId', '==', brandId).get();
        const existingKWs = snapshot.docs.map(doc => doc.data().keywords).flat();

        const prompt = `You are an AI analyst. Your task is to identify 5 essential but missing pieces of information in this brand's knowledge base. 
        Existing context: [${existingKWs.slice(0, 40).join(', ')}]. 
        Generate 5 logical "Gaps" (questions customers might ask). 
        For each gap, provide:
        1. "question": The missing question.
        2. "category": e.g., "Pricing", "Delivery", "Product Detail".
        3. "suggestions": 3 possible variations of the question.
        4. "suggestedAnswer": A professional, helpful draft answer in Bengali that the brand can review and adopt.

        Return ONLY a valid JSON array of objects.`;
        
        const result = await defaultModel.generateContent(prompt);
        const response = await result.response;
        let text = response.text().replace(/```json|```/g, '').trim();
        
        const newGaps = JSON.parse(text);
        for (const gap of newGaps) {
            await db.collection("knowledge_gaps").add({
                ...gap,
                brandId,
                status: 'new',
                timestamp: serverTimestamp(),
                isDiscovery: true 
            });
        }
        res.json({ success: true, questions: newGaps });
    } catch (error) {
        serverLog('DISCOVERY ERROR: ' + error.message);
        res.status(500).json({ error: error.message });
    }
}

async function trainAIAssistant(req, res) {
    const { brandId, message, history } = req.body;
    if (!brandId || !message) return res.status(400).send('Missing Brand ID or Message');

    try {
        serverLog(`AI Training request for Brand: ${brandId}`);
        // Format history for Gemini
        let chatContext = '';
        if (history && history.length > 0) {
            chatContext = history.map(h => `${h.role === 'user' ? 'Brand Owner' : 'AI Trainer'}: ${h.content}`).join('\n');
        }

        const prompt = `You are the AI configuration assistant (AI Trainer) for a brand. A brand owner is chatting with you to teach you how to behave when you talk to their customers.
        Your goal is to converse casually in clear Bengali, understand their instructions, and confirm you've learned them.
        
        Recent Conversation History:
        ${chatContext}
        
        Brand Owner's New Message: "${message}"
        
        If the brand owner gives a clear new rule for the AI (like tone, language, greetings, or specific behavior), append the following marker exactly at the very end of your response:
        --RULE: <the summary of the rule in English>--
        
        Do not output the rule marker if they are just saying hello or asking a question. Only if they are giving an instruction to remember.
        Keep your response friendly, enthusiastic, and conversational.`;

        const result = await defaultModel.generateContent(prompt);
        const response = await result.response;
        let aiReply = response.text().trim();

        // Extract rule if present
        const ruleMatch = aiReply.match(/--RULE:\s*(.*?)--/);
        if (ruleMatch) {
            const newRule = ruleMatch[1].trim();
            // Remove the secret marker from the visible reply
            aiReply = aiReply.replace(/--RULE:\s*(.*?)--/, '').trim();
            
            // Append to Firestore blueprint or AI Instructions
            const brandRef = db.collection('brands').doc(brandId);
            const snap = await brandRef.get();
            if (snap.exists) {
                const currentBlueprint = snap.data().blueprint || '';
                const updatedBlueprint = currentBlueprint + `\n- ${newRule}`;
                await brandRef.update({ blueprint: updatedBlueprint });
                serverLog(`Appended Rule to Brand Blueprint: ${newRule}`);
            }
        }

        res.json({ success: true, reply: aiReply });
    } catch (error) {
        serverLog('TRAINING ERROR: ' + error.message);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    generateVariations,
    generateLinguisticVariations,
    discoverGaps,
    trainAIAssistant
};
