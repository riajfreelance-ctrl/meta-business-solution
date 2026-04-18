const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
const fbController = require('../controllers/fbController');

router.get('/webhook', fbController.verifyWebhook); // Handle Webhook Events
router.post('/webhook', fbController.handleWebhookPost);
router.post('/sync-history', fbController.syncConversationHistory);
router.post('/messages/send', fbController.sendMessageFromDashboard);
router.post('/upload', upload.single('file'), fbController.proxyUpload);
router.post('/ai/generate-comment-variations', fbController.generateAICommentVariations);
router.post('/ai/hide-comment', async (req, res) => {
    try {
        const { commentId, brandId } = req.body;
        const { db } = require('../services/firestoreService');
        const { hideComment } = require('../services/facebookService');
        
        const brandDoc = await db.collection("brands").doc(brandId).get();
        const brandData = brandDoc.data();
        
        await hideComment(commentId, brandData.fbPageToken);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/brands/:brandId/posts', fbController.getLatestPosts);
router.get('/brands/:brandId/posts/:postId', fbController.getPostById);
router.post('/brands/:brandId/index-products', async (req, res) => {
    try {
        const { brandId } = req.params;
        const { indexBrandProducts } = require('../services/productFingerprintService');
        const count = await indexBrandProducts(brandId);
        res.json({ success: true, indexed: count });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ─── MEDIA BROWSER ROUTES ───

// Get all media browser entries for a brand
router.get('/brands/:brandId/media', async (req, res) => {
    try {
        const { brandId } = req.params;
        const { limit = 50, lastDocId } = req.query;
        const { getMediaBrowserEntries } = require('../services/mediaBrowserService');
        const entries = await getMediaBrowserEntries(brandId, parseInt(limit), lastDocId);
        res.json({ success: true, entries, count: entries.length });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Bulk ingest Facebook posts into Media Browser
router.post('/brands/:brandId/media/ingest', async (req, res) => {
    try {
        const { brandId } = req.params;
        const { limit = 100 } = req.body;
        const { db } = require('../services/firestoreService');
        const brandDoc = await db.collection('brands').doc(brandId).get();
        const brandData = brandDoc.data();
        
        if (!brandData?.fbPageToken) {
            return res.status(400).json({ error: 'Brand FB token not found' });
        }
        
        const { bulkIngestPosts } = require('../services/mediaBrowserService');
        const result = await bulkIngestPosts(brandId, brandData.fbPageToken, limit);
        res.json({ success: true, ...result });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Cleanup expired media
router.post('/media/cleanup', async (req, res) => {
    try {
        const { cleanupExpiredMedia } = require('../services/mediaBrowserService');
        const result = await cleanupExpiredMedia();
        res.json({ success: true, ...result });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update media tier
router.patch('/media/:mediaId/tier', async (req, res) => {
    try {
        const { mediaId } = req.params;
        const { tier } = req.body;
        const { updateMediaTier } = require('../services/mediaBrowserService');
        const result = await updateMediaTier(mediaId, tier);
        res.json({ success: true, ...result });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Match an image against Media Browser
router.post('/brands/:brandId/media/match', async (req, res) => {
    try {
        const { brandId } = req.params;
        const { imageUrl, ocrText } = req.body;
        const { matchImageInBrowser } = require('../services/mediaBrowserService');
        const match = await matchImageInBrowser(brandId, imageUrl, ocrText);
        res.json({ success: true, match });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
