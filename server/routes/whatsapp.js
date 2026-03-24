const express = require('express');
const router = express.Router();
const { verifyWAWebhook, handleWAWebhook } = require('../controllers/waController');

// Webhook Verification
router.get('/webhook/whatsapp', verifyWAWebhook);

// Handle Webhook Events
router.post('/webhook/whatsapp', handleWAWebhook);

module.exports = router;
