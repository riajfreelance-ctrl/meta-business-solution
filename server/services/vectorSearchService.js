const { db } = require('./firestoreService');
const { getEmbedding } = require('./embeddingService');

/**
 * Perform a semantic vector search on a Firestore collection.
 * @param {string} collectionName 
 * @param {string} queryText 
 * @param {string} brandId 
 * @param {number} [limit=5] 
 * @returns {Promise<any[]>}
 */
async function searchVectors(collectionName, queryText, brandId, limit = 5) {
    try {
        const vector = await getEmbedding(queryText);
        const collectionRef = db.collection(collectionName);
        
        // Use Firestore native vector search (findNearest)
        // Note: Requires a Vector Index on the 'embedding' field.
        const query = collectionRef
            .where('brandId', '==', brandId)
            .findNearest({
                vectorField: 'embedding',
                queryVector: vector,
                distanceMeasure: 'COSINE',
                limit: limit
            });
            
        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            // Remove embedding from result to save bandwidth
            embedding: undefined 
        }));
    } catch (error) {
        console.error(`VECTOR_SEARCH_ERROR [${collectionName}]:`, error.message);
        // Fallback to empty if index is missing or query fails
        return [];
    }
}

/**
 * Generate and save an embedding for a document.
 * @param {string} collectionName 
 * @param {string} docId 
 * @param {string} textToEmbed 
 */
async function updateDocumentEmbedding(collectionName, docId, textToEmbed) {
    try {
        const embedding = await getEmbedding(textToEmbed);
        await db.collection(collectionName).doc(docId).update({
            embedding: embedding
        });
        return true;
    } catch (error) {
        console.error(`EMBEDDING_UPDATE_ERROR [${docId}]:`, error.message);
        return false;
    }
}

module.exports = { searchVectors, updateDocumentEmbedding };
