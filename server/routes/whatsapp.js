const express = require('express');
const router = express.Router();
const { verifyWAWebhook, handleWAWebhook, sendMessageFromDashboard } = require('../controllers/waController');

// Webhook Verification
router.get('/webhook/whatsapp', verifyWAWebhook);

// Handle Webhook Events
router.post('/webhook/whatsapp', handleWAWebhook);

// Send Message from Dashboard
router.post('/whatsapp/send', sendMessageFromDashboard);

module.exports = router;
