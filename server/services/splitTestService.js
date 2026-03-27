const { db } = require('./firestoreService');
const { isFeatureEnabled } = require('./settingsService');

const PERSONAS = ['Friendly', 'Professional', 'Direct', 'Storyteller'];

/**
 * Stickily assign a persona to a conversation
 */
async function assignPersona(convoId) {
    if (!await isFeatureEnabled('enableSplitTesting')) return PERSONAS[1]; 
    try {
        const convoRef = db.collection('conversations').doc(convoId);
        const doc = await convoRef.get();
        
        if (doc.exists && doc.data().aiPersona) {
            return doc.data().aiPersona;
        }

        // Use a simple hash of the convoId to ensure it's sticky but random-enough
        let hash = 0;
        for (let i = 0; i < convoId.length; i++) {
            hash = convoId.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash % PERSONAS.length);
        const persona = PERSONAS[index];

        await convoRef.set({ aiPersona: persona }, { merge: true });
        console.log(`🤖 Assigned Persona [${persona}] to Convo [${convoId}]`);
        return persona;
    } catch (error) {
        console.error('Error assigning persona:', error);
        return PERSONAS[0];
    }
}

/**
 * Log a conversion for a specific persona
 */
async function logPersonaConversion(convoId) {
    try {
        const doc = await db.collection('conversations').doc(convoId).get();
        if (!doc.exists) return;

        const persona = doc.data().aiPersona;
        if (!persona) return;

        // Record conversion in a dedicated collection for easy analytics
        await db.collection('persona_metrics').add({
            persona,
            convoId,
            timestamp: new Date(),
            type: 'order_conversion'
        });
        
        console.log(`📈 Recorded conversion for Persona [${persona}]`);
    } catch (error) {
        console.error('Error logging persona conversion:', error);
    }
}

module.exports = {
    assignPersona,
    logPersonaConversion
};
