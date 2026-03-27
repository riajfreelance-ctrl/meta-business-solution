const { runLeadRetargeting, runChurnPrevention } = require('../services/retentionService');
const { db } = require('../services/firestoreService');

async function triggerAutomation(req, res) {
    const { type } = req.body;
    
    try {
        let result;
        if (type === 'lead_retargeting') {
            result = await runLeadRetargeting();
        } else if (type === 'churn_prevention') {
            result = await runChurnPrevention();
        } else {
            return res.status(400).json({ error: 'Invalid automation type' });
        }
        
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getStats(req, res) {
    try {
        // Simple aggregation for stats
        const conversations = await db.collection('conversations').get();
        let pendingFollowups = 0;
        let churnRisk = 0;
        let recovered = 0;

        conversations.forEach(doc => {
            const data = doc.data();
            if (data.isInterest && !data.lastLeadRetargeting) pendingFollowups++;
            if (data.isCustomer && data.churnStatus === 'recovered_attempt') recovered++;
            // Logic for risk could be based on time since last interaction
        });

        res.json({
            pendingFollowups,
            churnRisk,
            recovered
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    triggerAutomation,
    getStats
};
