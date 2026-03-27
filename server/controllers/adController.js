const adService = require('../services/adService');
const { db } = require('../services/firestoreService');
const { serverLog } = require('../utils/logger');
const crypto = require('crypto');

/**
 * Get Ad Accounts for a specific brand.
 */
async function getAdAccounts(req, res) {
    const { brandId } = req.query;
    if (!brandId) return res.status(400).send('Missing brandId');

    try {
        const brandSnap = await db.collection('brands').doc(brandId).get();
        if (!brandSnap.exists) return res.status(404).send('Brand not found');
        const brandData = brandSnap.data();

        const token = brandData.fbPageToken || process.env.FB_PAGE_TOKEN;
        const accounts = await adService.getAdAccounts(token);
        
        res.json({ success: true, accounts });
    } catch (error) {
        serverLog(`[ADS CONTROLLER ERROR]: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
}

/**
 * Sync leads to a Custom Audience.
 */
async function syncLeadsToAudience(req, res) {
    const { brandId, adAccountId, audienceName, segment } = req.body;
    if (!brandId || !adAccountId || !audienceName) return res.status(400).send('Missing fields');

    try {
        const brandSnap = await db.collection('brands').doc(brandId).get();
        const brandData = brandSnap.data();
        const token = brandData.fbPageToken || process.env.FB_PAGE_TOKEN;

        // Fetch leads for the brand/segment
        let query = db.collection('leads').where('brandId', '==', brandId);
        if (segment) query = query.where('segment', '==', segment);
        
        const leadSnap = await query.get();
        const emails = leadSnap.docs
            .map(d => d.data().email)
            .filter(e => !!e)
            .map(e => crypto.createHash('sha256').update(e.toLowerCase().trim()).digest('hex'));

        if (emails.length === 0) {
            return res.status(400).json({ error: 'No leads with email found for this segment' });
        }

        const audienceId = await adService.syncCustomAudience(adAccountId, audienceName, emails, token);
        
        res.json({ success: true, audienceId, syncedCount: emails.length });
    } catch (error) {
        serverLog(`[AUDIENCE SYNC ERROR]: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAdAccounts,
    syncLeadsToAudience
};
