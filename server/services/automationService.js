const { db } = require('./firestoreService');
const { sendMessage } = require('../controllers/fbController');
const { serverLog } = require('../utils/logger');

/**
 * Automatically sends a review request 24 hours after an order is delivered.
 * This can be triggered by a cron job or called periodically.
 */
async function processAutoReviews() {
  try {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    // 1. Fetch delivered orders that haven't been followed up yet
    const ordersSnap = await db.collection('orders')
      .where('status', '==', 'Delivered')
      .where('autoReviewSent', '==', false)
      .get();

    if (ordersSnap.empty) {
      serverLog('[AUTO-REVIEW] No pending reviews to send.');
      return;
    }

    for (const doc of ordersSnap.docs) {
      const order = doc.data();
      const deliveryTime = order.deliveryTimestamp?.toDate().getTime() || 0;

      // 2. Check if 24 hours have passed
      if (deliveryTime > 0 && deliveryTime < oneDayAgo) {
        serverLog(`[AUTO-REVIEW] Sending review request for order: ${doc.id}`);

        const message = `আমাদের ${order.productName || 'পণ্যটি'} আপনার কেমন লেগেছে? ভালো লাগলে একটি ছবি শেয়ার করতে পারেন এবং আমাদের সার্ভিস সম্পর্কে আপনার মতামত দিলে আমরা খুশি হব! 😊`;

        // 3. Send message via Platform (FB/WA)
        if (order.platform === 'facebook' && order.psid) {
           const brandSnap = await db.collection('brands').doc(order.brandId).get();
           if (brandSnap.exists) {
             const token = brandSnap.data().fbPageToken;
             await sendMessage(order.psid, { text: message }, token);
           }
        }

        // 4. Mark as sent
        await doc.ref.update({
          autoReviewSent: true,
          autoReviewSentAt: new Date()
        });
      }
    }
  } catch (error) {
    serverLog(`[AUTO-REVIEW ERROR] ${error.message}`);
  }
}

module.exports = { processAutoReviews };
