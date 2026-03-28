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

module.exports = router;
