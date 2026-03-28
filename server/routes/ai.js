const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { db, serverTimestamp } = require('../services/firestoreService');
const { getLinguisticVariations } = require('../utils/linguisticEngine');

router.post('/generate_variations', aiController.generateVariations);
router.post('/generate_linguistic_variations', aiController.generateLinguisticVariations);
router.post('/discover_gaps', aiController.discoverGaps);
router.post('/ai/train', aiController.trainAIAssistant);

// Quick save a canned reply draft directly from the Chat UI
router.post('/save_draft', async (req, res) => {
  try {
    const { keyword, result, brandId } = req.body;
    if (!keyword || !result || !brandId) {
      return res.status(400).json({ error: 'keyword, result, brandId are required' });
    }
    const variations = getLinguisticVariations(keyword);
    const docRef = await db.collection('draft_replies').add({
      keyword,
      result,
      variations,
      brandId,
      status: 'approved',
      type: 'quick_added',
      successCount: 0,
      createdAt: serverTimestamp()
    });
    res.json({ success: true, id: docRef.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
