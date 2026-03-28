const { db, admin } = require('./firestoreService');
const { generatePHash, getHammingDistance } = require('./imageFingerprintService');
const { serverLog } = require('../utils/logger');

/**
 * Indexes all images for a brand's products into the product_fingerprints collection.
 */
async function indexBrandProducts(brandId) {
    serverLog(`[Fingerprint] Starting indexing for brand: ${brandId}`);
    try {
        const prodSnap = await db.collection('products').where('brandId', '==', brandId).get();
        let totalIndexed = 0;

        for (const doc of prodSnap.docs) {
            const product = doc.data();
            const productId = doc.id;
            const images = product.images || (product.image ? [product.image] : []);

            for (const imageUrl of images) {
                if (!imageUrl) continue;

                // Check if already indexed
                const existing = await db.collection('product_fingerprints')
                    .where('brandId', '==', brandId)
                    .where('imageUrl', '==', imageUrl)
                    .get();

                if (existing.empty) {
                    const pHash = await generatePHash(imageUrl);
                    if (pHash) {
                        await db.collection('product_fingerprints').add({
                            brandId,
                            productId,
                            imageUrl,
                            pHash,
                            productName: product.name,
                            price: product.price,
                            offerPrice: product.offerPrice || null,
                            timestamp: admin.firestore.FieldValue.serverTimestamp()
                        });
                        totalIndexed++;
                    }
                }
            }
        }
        serverLog(`[Fingerprint] Completed! Indexed ${totalIndexed} new images for brand ${brandId}`);
        return totalIndexed;
    } catch (error) {
        serverLog(`[Fingerprint Error]: ${error.message}`);
        throw error;
    }
}

/**
 * Finds the best matching product for a given image pHash.
 */
async function findProductByPHash(brandId, incomingHash, threshold = 12) {
    try {
        const fingerprintSnap = await db.collection('product_fingerprints')
            .where('brandId', '==', brandId)
            .get();

        let bestMatch = null;
        let lowestDistance = 999;

        for (const doc of fingerprintSnap.docs) {
            const data = doc.data();
            if (data.pHash) {
                const dist = getHammingDistance(incomingHash, data.pHash);
                if (dist < threshold && dist < lowestDistance) {
                    lowestDistance = dist;
                    bestMatch = data;
                }
            }
        }

        return bestMatch;
    } catch (error) {
        serverLog(`[Fingerprint Search Error]: ${error.message}`);
        return null;
    }
}

module.exports = {
    indexBrandProducts,
    findProductByPHash
};
