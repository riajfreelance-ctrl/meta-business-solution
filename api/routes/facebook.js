const express = require('express');
const router = express.Router();
const fbController = require('../controllers/fbController');

router.get('/webhook', fbController.verifyWebhook);
router.post('/webhook', fbController.handleWebhookPost);
router.post('/api/sync-history', fbController.syncConversationHistory);
router.post('/api/messages/send', fbController.sendMessageFromDashboard);
router.post('/api/ai/generate-comment-variations', fbController.generateAICommentVariations);
router.post('/api/ai/hide-comment', async (req, res) => {
    try {
        const { commentId, brandId } = req.body;
        const { db, doc, getDoc } = require('../services/firestoreService');
        const { hideComment } = require('../services/facebookService');
        
        const brandDoc = await getDoc(doc(db, "brands", brandId));
        const brandData = brandDoc.data();
        
        await hideComment(commentId, brandData.fbPageToken);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/api/brands/:brandId/posts', fbController.getLatestPosts);

module.exports = router;
