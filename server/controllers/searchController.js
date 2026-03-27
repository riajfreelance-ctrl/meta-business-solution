const { db } = require('../services/firestoreService');
const { searchVectors } = require('../services/vectorSearchService');

/**
 * Perform a unified search across multiple modules.
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
async function unifiedSearch(req, res) {
    const { query, brandId, modules } = req.query;
    if (!query || !brandId) {
        return res.status(400).json({ error: 'Missing query or brandId' });
    }

    const searchModules = modules ? modules.split(',') : ['conversations', 'products', 'leads'];
    const results = {};

    try {
        const promises = searchModules.map(async (mod) => {
            if (mod === 'products') {
                // Vector search for products
                results.products = await searchVectors('products', query, brandId, 5);
            } else if (mod === 'conversations') {
                // Prefix search for conversations in Firestore
                const snap = await db.collection('conversations')
                    .where('brandId', '==', brandId)
                    .orderBy('name')
                    .startAt(query)
                    .endAt(query + '\uf8ff')
                    .limit(5)
                    .get();
                results.conversations = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            } else if (mod === 'leads') {
                // Prefix search for leads
                const snap = await db.collection('leads')
                    .where('brandId', '==', brandId)
                    .orderBy('name')
                    .startAt(query)
                    .endAt(query + '\uf8ff')
                    .limit(5)
                    .get();
                results.leads = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            }
        });

        await Promise.all(promises);
        res.json({ success: true, results });
    } catch (error) {
        console.error('UNIFIED_SEARCH_ERROR:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = { unifiedSearch };
