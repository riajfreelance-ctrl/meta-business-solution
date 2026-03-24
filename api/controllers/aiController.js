const { db, collection, addDoc, serverTimestamp, getDocs, doc, updateDoc, query, where } = require('../services/firestoreService');
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
        const draftRef = doc(db, 'draft_replies', draftId);
        await updateDoc(draftRef, { variations: variations });
        
        res.json({ success: true, variations });
    } catch (error) {
        serverLog('VARIATION ERROR: ' + error.message);
        res.status(500).json({ error: error.message });
    }
}

async function discoverGaps(req, res) {
    const { brandId } = req.body;
    if (!brandId) return res.status(400).send('Missing Brand ID');

    try {
        serverLog(`Generating Discovery Questions for Brand: ${brandId}`);
        const q = query(collection(db, 'knowledge_base'), where('brandId', '==', brandId));
        const snapshot = await getDocs(q);
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
            await addDoc(collection(db, "knowledge_gaps"), {
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

module.exports = {
    generateVariations,
    discoverGaps
};
