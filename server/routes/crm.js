const express = require('express');
const router = express.Router();
const { runSegmentation, getSegmentStats } = require('../controllers/crmController');

router.post('/crm/segment', runSegmentation);
router.get('/crm/stats', getSegmentStats);

module.exports = router;
