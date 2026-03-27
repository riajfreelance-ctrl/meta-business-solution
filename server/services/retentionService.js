const { db, admin } = require('./firestoreService');
const axios = require('axios');
const { auditAction } = require('./auditService');
const { isFeatureEnabled } = require('./settingsService');

/**
 * Run Lead Retargeting Logic
 * Finds customers with 'isInterest: true' but no purchase, then sends follow-up.
 */
async function runLeadRetargeting() {
    if (!await isFeatureEnabled('enableRetargeting')) {
        console.log('🚫 Auto-Retargeting is DISABLED in settings. Skipping.');
        return { count: 0 };
    }
    console.log('🚀 Running Lead Retargeting Job...');
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));

    try {
        const querySnapshot = await db.collection('conversations')
            .where('isInterest', '==', true)
            .where('lastLeadRetargeting', '==', null)
            .where('lastMessageContent', '!=', '')
            .limit(50) 
            .get();

        let count = 0;
        for (const doc of querySnapshot.docs) {
            const data = doc.data();
            
            // Send follow-up message (Placeholder logic for Meta API)
            const message = `Hello ${data.customerName || 'there'}! We noticed you were interested in our products. Do you have any questions? We have a special gift for you! 🎁`;
            
            await sendMetaMessage(data.psid, message);
            
            // Mark as retargeted
            await doc.ref.update({
                lastLeadRetargeting: admin.firestore.FieldValue.serverTimestamp(),
                retargetingStatus: 'sent'
            });

            await auditAction('SYSTEM', 'LEAD_RETARGETING', `Sent follow-up to ${data.psid}`);
            count++;
        }

        console.log(`✅ Lead Retargeting complete. Sent ${count} messages.`);
        return { count };
    } catch (error) {
        console.error('❌ Lead Retargeting failed:', error.message);
        throw error;
    }
}

/**
 * Run Churn Prevention Logic
 * Finds old customers who haven't messaged in 30 days.
 */
async function runChurnPrevention() {
    if (!await isFeatureEnabled('enableChurnPrevention')) {
        console.log('🚫 Churn Prevention is DISABLED in settings. Skipping.');
        return { count: 0 };
    }
    console.log('🚀 Running Churn Prevention Job...');
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    try {
        const querySnapshot = await db.collection('conversations')
            .where('isCustomer', '==', true)
            .where('lastInteraction', '<=', thirtyDaysAgo)
            .where('lastChurnPrevention', '==', null)
            .limit(50)
            .get();

        let count = 0;
        for (const doc of querySnapshot.docs) {
            const data = doc.data();
            
            const message = `We miss you, ${data.customerName || 'Customer'}! It's been a while. Come check out our new arrivals! 💖`;
            
            await sendMetaMessage(data.psid, message);
            
            await doc.ref.update({
                lastChurnPrevention: admin.firestore.FieldValue.serverTimestamp(),
                churnStatus: 'recovered_attempt'
            });

            await auditAction('SYSTEM', 'CHURN_PREVENTION', `Sent reactivation to ${data.psid}`);
            count++;
        }

        console.log(`✅ Churn Prevention complete. Sent ${count} messages.`);
        return { count };
    } catch (error) {
        console.error('❌ Churn Prevention failed:', error.message);
        throw error;
    }
}

/**
 * Helper to send Meta Message
 */
async function sendMetaMessage(recipientId, text) {
    const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
    if (!PAGE_ACCESS_TOKEN) return;

    try {
        await axios.post(`https://graph.facebook.com/v21.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
            recipient: { id: recipientId },
            message: { text },
            messaging_type: 'MESSAGE_TAG',
            tag: 'CONFIRMED_EVENT_UPDATE' // Using this tag for non-promotional follow-ups to be safe
        });
    } catch (error) {
        console.error(`Error sending message to ${recipientId}:`, error.response?.data || error.message);
    }
}

module.exports = {
    runLeadRetargeting,
    runChurnPrevention
};
