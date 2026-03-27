const { db } = require('./firestoreService');
const axios = require('axios');
const { isFeatureEnabled } = require('./settingsService');

/**
 * Sync Inventory with Meta Ads
 */
async function syncInventoryWithAds(productId, newStock) {
    if (!await isFeatureEnabled('enableInventorySync')) {
        console.log('🚫 Inventory Sync is DISABLED in settings. Skipping.');
        return;
    }
    console.log(`📦 Syncing Inventory for Product [${productId}], Stock: ${newStock}`);
    
    try {
        const productRef = db.collection('products').doc(productId);
        const productDoc = await productRef.get();
        if (!productDoc.exists) return;

        const data = productDoc.data();
        const adSetId = data.metaAdSetId; // Assumption: Meta AdSet ID is stored in product doc

        if (!adSetId) {
            console.log('ℹ️ No Meta AdSet ID linked to this product. Skipping sync.');
            return;
        }

        if (newStock <= 0) {
            await setAdSetStatus(adSetId, 'PAUSED');
        } else if (newStock > 0 && data.status === 'paused_by_inventory') {
            await setAdSetStatus(adSetId, 'ACTIVE');
        }
    } catch (error) {
        console.error('❌ Inventory Sync failed:', error.message);
    }
}

async function setAdSetStatus(adSetId, status) {
    const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
    if (!PAGE_ACCESS_TOKEN) return;

    try {
        await axios.post(`https://graph.facebook.com/v21.0/${adSetId}`, {
            status: status,
            access_token: PAGE_ACCESS_TOKEN
        });
        console.log(`✅ Meta AdSet [${adSetId}] set to ${status}.`);
    } catch (error) {
        console.error(`Error updating AdSet status for ${adSetId}:`, error.response?.data || error.message);
    }
}

module.exports = {
    syncInventoryWithAds
};
