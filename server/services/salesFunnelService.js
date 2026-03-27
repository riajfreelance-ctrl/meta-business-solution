const { db } = require('./firestoreService');

const STAGES = {
    INQUIRY: 'inquiry',
    CONSIDERATION: 'consideration',
    CLOSING: 'closing',
    COMPLETED: 'completed'
};

/**
 * Detect current funnel stage from message context
 */
async function detectFunnelStage(convoId, lastMessage) {
    const convoRef = db.collection('conversations').doc(convoId);
    const doc = await convoRef.get();
    let currentStage = (doc.exists && doc.data().funnelStage) ? doc.data().funnelStage : STAGES.INQUIRY;
    if (!currentStage) currentStage = STAGES.INQUIRY; // Final safety fallback

    // Simple keyword-based detection for now (could be upgraded to Gemini later)
    const msg = lastMessage.toLowerCase();
    
    if (msg.includes('order') || msg.includes('buy') || msg.includes('price')) {
        currentStage = STAGES.CONSIDERATION;
    }
    
    if (msg.includes('address') || msg.includes('phone') || msg.includes('number')) {
        currentStage = STAGES.CLOSING;
    }

    await convoRef.set({ funnelStage: currentStage }, { merge: true });
    return currentStage;
}

/**
 * Generate targeted prompt to move user to next stage
 */
async function generateFunnelResponse(convoId, stage, persona, originalAIResponse) {
    let funnelPrompt = "";

    switch (stage) {
        case STAGES.INQUIRY:
            funnelPrompt = ` [FUNNEL: Ask if they want to know the special offer for today]`;
            break;
        case STAGES.CONSIDERATION:
            funnelPrompt = ` [FUNNEL: Ask for their delivery location to calculate shipping]`;
            break;
        case STAGES.CLOSING:
            funnelPrompt = ` [FUNNEL: Gently ask for their phone number to confirm the order]`;
            break;
    }

    // Enhance original AI response with funnel logic
    return `${originalAIResponse}${funnelPrompt}`;
}

module.exports = {
    detectFunnelStage,
    generateFunnelResponse,
    STAGES
};
