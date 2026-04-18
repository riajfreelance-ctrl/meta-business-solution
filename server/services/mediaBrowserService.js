const { db, admin } = require('./firestoreService');
const { generatePHash, getHammingDistance } = require('./imageFingerprintService');
const { serverLog } = require('../utils/logger');
const axios = require('axios');
const sharp = require('sharp');

const MEDIA_COLLECTION = 'media_browser';

/**
 * Compress an image buffer to a small thumbnail (max 200px, quality 60)
 * Returns compressed buffer (typically 20-50 KB)
 */
async function compressImage(imageBuffer) {
    try {
        const compressed = await sharp(imageBuffer)
            .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 60 })
            .toBuffer();
        serverLog(`[Media] Compressed: ${imageBuffer.length} → ${compressed.length} bytes`);
        return compressed;
    } catch (err) {
        serverLog(`[Media Compress Error]: ${err.message}`);
        return null;
    }
}

/**
 * Download image from URL and return buffer
 */
async function downloadImage(imageUrl) {
    try {
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 10000
        });
        return Buffer.from(response.data);
    } catch (err) {
        serverLog(`[Media Download Error]: ${err.message}`);
        return null;
    }
}

/**
 * Ingest a Facebook post's image/video into the Media Browser.
 * Called automatically when a new post is detected.
 * 
 * @param {Object} params
 * @param {string} params.brandId - Brand ID
 * @param {string} params.postId - Facebook Post ID
 * @param {string} params.imageUrl - Full picture URL from post
 * @param {string} params.message - Post caption/text
 * @param {string} params.permalinkUrl - Permanent link to post
 * @param {string} params.type - 'image' | 'video' | 'carousel'
 * @param {Object} params.metadata - Extra data (product info, tags, etc.)
 */
async function ingestPostToMediaBrowser({ brandId, postId, imageUrl, message, permalinkUrl, type = 'image', metadata = {} }) {
    try {
        // Check if already ingested (avoid duplicates)
        const existing = await db.collection(MEDIA_COLLECTION)
            .where('brandId', '==', brandId)
            .where('postId', '==', postId)
            .get();

        if (!existing.empty) {
            serverLog(`[Media] Post ${postId} already in Media Browser. Skipping.`);
            return { status: 'duplicate', id: existing.docs[0].id };
        }

        // Download image
        const imageBuffer = await downloadImage(imageUrl);
        if (!imageBuffer) {
            serverLog(`[Media] Failed to download image for post ${postId}`);
            return { status: 'download_failed' };
        }

        // Compress image (store as base64 in Firestore - small size only)
        const compressed = await compressImage(imageBuffer);
        const compressedBase64 = compressed ? compressed.toString('base64') : null;

        // Generate perceptual hash for matching
        let pHash = null;
        try {
            pHash = await generatePHash(imageUrl);
        } catch (hashErr) {
            serverLog(`[Media] pHash generation failed: ${hashErr.message}`);
        }

        // Extract keywords from post message
        const keywords = extractKeywords(message || '');

        // Extract product info from metadata or message
        const productInfo = metadata.productInfo || {};

        // Create media browser entry
        const mediaEntry = {
            brandId,
            postId,
            imageUrl,               // Original Facebook URL (temporary)
            compressedBase64,       // Compressed base64 (~30-50 KB)
            pHash,                  // Perceptual hash for matching
            message: message || '',
            permalinkUrl: permalinkUrl || '',
            keywords,               // Extracted keywords for text matching
            type,                   // image | video | carousel
            status: 'active',       // active | archived
            storageTier: 2,         // Default tier (30 days)
            autoDeleteAt: admin.firestore.Timestamp.fromDate(
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
            ),
            // Product info
            productName: productInfo.name || null,
            productPrice: productInfo.price || null,
            productOfferPrice: productInfo.offerPrice || null,
            productId: productInfo.id || null,
            productCategory: productInfo.category || null,
            productVariations: productInfo.variations || [],
            // Metadata
            matchCount: 0,          // How many times matched
            lastMatchedAt: null,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: Date.now()
        };

        const docRef = await db.collection(MEDIA_COLLECTION).add(mediaEntry);
        serverLog(`[Media] ✅ Ingested post ${postId} → Media Browser entry: ${docRef.id}`);

        return { status: 'created', id: docRef.id };
    } catch (err) {
        serverLog(`[Media Ingest Error]: ${err.message}`);
        return { status: 'error', error: err.message };
    }
}

/**
 * Bulk ingest all Facebook posts for a brand into Media Browser.
 * Fetches latest posts from Facebook Page and ingests them all.
 * 
 * @param {string} brandId - Brand ID
 * @param {string} pageToken - Facebook Page Access Token
 * @param {number} limit - Max posts to fetch (default 100)
 */
async function bulkIngestPosts(brandId, pageToken, limit = 100) {
    try {
        const { getLatestPosts } = require('./facebookService');
        const posts = await getLatestPosts(pageToken, limit);

        let created = 0;
        let duplicates = 0;
        let errors = 0;

        for (const post of posts) {
            const result = await ingestPostToMediaBrowser({
                brandId,
                postId: post.id,
                imageUrl: post.full_picture || '',
                message: post.message || '',
                permalinkUrl: post.permalink_url || '',
                type: post.full_picture ? 'image' : 'text'
            });

            if (result.status === 'created') created++;
            else if (result.status === 'duplicate') duplicates++;
            else errors++;
        }

        serverLog(`[Media Bulk Ingest] Created: ${created}, Duplicates: ${duplicates}, Errors: ${errors}`);
        return { created, duplicates, errors, total: posts.length };
    } catch (err) {
        serverLog(`[Media Bulk Ingest Error]: ${err.message}`);
        throw err;
    }
}

/**
 * Match an incoming image against the Media Browser.
 * Uses pHash (visual matching) + keyword matching (OCR text).
 * 
 * @param {string} brandId - Brand ID
 * @param {string} imageUrl - Customer's image URL
 * @param {string} ocrText - OCR extracted text (optional)
 * @returns {Object|null} - Best matching media entry or null
 */
async function matchImageInBrowser(brandId, imageUrl, ocrText = '') {
    try {
        // Step 1: Generate pHash for incoming image
        let incomingHash = null;
        try {
            incomingHash = await generatePHash(imageUrl);
        } catch (hashErr) {
            serverLog(`[Media Match] pHash generation failed: ${hashErr.message}`);
        }

        // Step 2: Fetch all active media entries for brand
        const mediaSnap = await db.collection(MEDIA_COLLECTION)
            .where('brandId', '==', brandId)
            .where('status', '==', 'active')
            .get();

        if (mediaSnap.empty) {
            serverLog(`[Media Match] No active media entries for brand ${brandId}`);
            return null;
        }

        let bestMatch = null;
        let bestScore = 0;
        let bestDistance = 999;

        for (const doc of mediaSnap.docs) {
            const data = doc.data();
            let score = 0;

            // Strategy 1: pHash visual matching (weight: 50)
            if (incomingHash && data.pHash) {
                const dist = getHammingDistance(incomingHash, data.pHash);
                if (dist < 12) {
                    // Distance 0 = exact same image (50 pts)
                    // Distance 12 = barely similar (1 pt)
                    const phashScore = Math.max(0, 50 - (dist * 4));
                    score += phashScore;

                    if (dist < bestDistance) {
                        bestDistance = dist;
                    }
                }
            }

            // Strategy 2: Keyword text matching (weight: 30)
            if (ocrText && data.keywords && data.keywords.length > 0) {
                const lowerOcr = ocrText.toLowerCase();
                const matchedKeywords = data.keywords.filter(kw =>
                    lowerOcr.includes(kw.toLowerCase())
                );
                if (matchedKeywords.length > 0) {
                    const keywordScore = Math.min(30, matchedKeywords.length * 10);
                    score += keywordScore;
                }
            }

            // Strategy 3: Product name match (weight: 20)
            if (data.productName && ocrText) {
                const lowerOcr = ocrText.toLowerCase();
                const lowerName = data.productName.toLowerCase();
                if (lowerOcr.includes(lowerName) || lowerName.includes(lowerOcr)) {
                    score += 20;
                }
            }

            // Update best match
            if (score > bestScore && score >= 15) {
                bestScore = score;
                bestMatch = { id: doc.id, ...data, matchScore: score, hammingDistance: bestDistance };
            }
        }

        // If match found, update match count
        if (bestMatch) {
            await db.collection(MEDIA_COLLECTION).doc(bestMatch.id).set({
                matchCount: admin.firestore.FieldValue.increment(1),
                lastMatchedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            serverLog(`[Media Match] ✅ Found match: "${bestMatch.productName || bestMatch.message?.substring(0, 30)}" (score: ${bestMatch}, distance: ${bestDistance})`);
        } else {
            serverLog(`[Media Match] ❌ No match found in Media Browser`);
        }

        return bestMatch;
    } catch (err) {
        serverLog(`[Media Match Error]: ${err.message}`);
        return null;
    }
}

/**
 * Auto-cleanup: Archive/delete old media entries based on tier
 * Should be called daily via cron or scheduled task
 */
async function cleanupExpiredMedia() {
    try {
        const now = admin.firestore.Timestamp.now();

        // Find entries past their auto-delete date
        const expiredSnap = await db.collection(MEDIA_COLLECTION)
            .where('autoDeleteAt', '<=', now)
            .where('status', '==', 'active')
            .get();

        let archived = 0;
        let deleted = 0;

        for (const doc of expiredSnap.docs) {
            const data = doc.data();

            // Tier 1: Never delete (just archive)
            if (data.storageTier === 1) {
                await db.collection(MEDIA_COLLECTION).doc(doc.id).set({
                    status: 'archived',
                    compressedBase64: null  // Free the base64 storage
                }, { merge: true });
                archived++;
            }
            // Tier 2-3: Delete entirely
            else {
                await db.collection(MEDIA_COLLECTION).doc(doc.id).delete();
                deleted++;
            }
        }

        serverLog(`[Media Cleanup] Archived: ${archived}, Deleted: ${deleted}`);
        return { archived, deleted };
    } catch (err) {
        serverLog(`[Media Cleanup Error]: ${err.message}`);
        return { archived: 0, deleted: 0 };
    }
}

/**
 * Get all media entries for a brand (for Media Browser UI)
 */
async function getMediaBrowserEntries(brandId, limit = 50, lastDocId = null) {
    try {
        // Simple query without orderBy (avoids composite index requirement)
        let query = db.collection(MEDIA_COLLECTION)
            .where('brandId', '==', brandId)
            .where('status', '==', 'active')
            .limit(limit);

        const snap = await query.get();
        const entries = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            compressedBase64: undefined  // Don't send base64 to client (too heavy)
        }));

        // Sort by createdAt descending in memory
        entries.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        return entries;
    } catch (err) {
        serverLog(`[Media Browser Get Error]: ${err.message}`);
        return [];
    }
}

/**
 * Extract keywords from text for matching
 */
function extractKeywords(text) {
    if (!text) return [];
    
    const stopWords = new Set([
        'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
        'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
        'before', 'after', 'above', 'below', 'between', 'and', 'but', 'or',
        'not', 'no', 'this', 'that', 'it', 'its', 'i', 'me', 'my', 'we',
        'our', 'you', 'your', 'he', 'she', 'they', 'them', 'what', 'which',
        'who', 'when', 'where', 'how', 'all', 'each', 'every', 'both',
        'few', 'more', 'most', 'other', 'some', 'such', 'than', 'too',
        'very', 'just', 'about', 'also', 'now', 'here', 'there', 'then',
        'like', 'comment', 'share', 'post', 'shop', 'order', 'buy',
        'price', 'please', 'hello', 'hi', 'hey', 'dm', 'inbox'
    ]);

    const words = text.toLowerCase()
        .replace(/[^\w\sািীুূৃৄেৈোৌৎংঃঁ]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.has(w));

    // Deduplicate
    return [...new Set(words)];
}

/**
 * Update storage tier for a media entry
 */
async function updateMediaTier(mediaId, tier) {
    const tierDays = { 1: 36500, 2: 30, 3: 7, 4: 0 }; // Tier 1 = forever, 4 = delete now

    if (tier === 4) {
        await db.collection(MEDIA_COLLECTION).doc(mediaId).delete();
        return { status: 'deleted' };
    }

    const days = tierDays[tier] || 30;
    await db.collection(MEDIA_COLLECTION).doc(mediaId).set({
        storageTier: tier,
        autoDeleteAt: admin.firestore.Timestamp.fromDate(
            new Date(Date.now() + days * 24 * 60 * 60 * 1000)
        )
    }, { merge: true });

    return { status: 'updated', tier };
}

module.exports = {
    ingestPostToMediaBrowser,
    bulkIngestPosts,
    matchImageInBrowser,
    cleanupExpiredMedia,
    getMediaBrowserEntries,
    updateMediaTier,
    compressImage,
    extractKeywords
};

