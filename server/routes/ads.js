const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');

/**
 * Meta Ads Management Routes
 */
router.get('/ads/accounts', adController.getAdAccounts);
router.post('/ads/sync-audience', adController.syncLeadsToAudience);

module.exports = router;
