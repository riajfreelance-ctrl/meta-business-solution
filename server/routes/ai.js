const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/generate_variations', aiController.generateVariations);
router.post('/discover_gaps', aiController.discoverGaps);

module.exports = router;
