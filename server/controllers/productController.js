const { db } = require('../services/firestoreService');
const { updateDocumentEmbedding } = require('../services/vectorSearchService');
const { serverLog } = require('../utils/logger');
const { syncInventoryWithAds } = require('../services/inventorySyncService');

async function bulkUpdateProducts(req, res) {
    const { brandId, updates } = req.body;
    if (!brandId || !updates || !Array.isArray(updates)) {
        return res.status(400).send('Missing Brand ID or Updates array');
    }

    try {
        serverLog(`Bulk Update Request for [Brand: ${brandId}] - ${updates.length} items`);
        
        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        const batchPromises = updates.map(async (item) => {
            const { code, price, stock } = item;
            if (!code) {
                results.failed++;
                results.errors.push(`Missing code for item`);
                return;
            }

            try {
                // Find product by item_code and brandId
                const snapshot = await db.collection('products')
                    .where('brandId', '==', brandId)
                    .where('item_code', '==', code.toString())
                    .get();

                if (snapshot.empty) {
                    results.failed++;
                    results.errors.push(`Product not found: ${code}`);
                    return;
                }

                const productDoc = snapshot.docs[0];
                const updateData = {};
                if (price !== undefined) updateData.price = Number(price);
                if (stock !== undefined) updateData.stock = Number(stock);
                
                if (Object.keys(updateData).length > 0) {
                    await db.collection('products').doc(productDoc.id).update(updateData);
                    
                    // Trigger Smart Inventory Sync (Ad Pausing)
                    if (updateData.stock !== undefined) {
                        syncInventoryWithAds(productDoc.id, updateData.stock);
                    }
                    
                    // Trigger async embedding update (Don't await to keep response fast)
                    const data = { ...productDoc.data(), ...updateData };
                    const textToEmbed = `${data.name} ${data.category || ''} ${data.description || ''} ${data.price || ''}`;
                    updateDocumentEmbedding('products', productDoc.id, textToEmbed);
                    
                    results.success++;
                } else {
                    results.failed++;
                    results.errors.push(`No data to update for: ${code}`);
                }
            } catch (err) {
                serverLog(`Error updating ${code}: ${err.message}`);
                results.failed++;
                results.errors.push(`Error updating ${code}: ${err.message}`);
            }
        });

        await Promise.all(batchPromises);

        res.json({
            success: true,
            summary: results
        });
    } catch (error) {
        serverLog('BULK UPDATE ERROR: ' + error.message);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    bulkUpdateProducts
};
