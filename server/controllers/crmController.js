const { db } = require('../services/firestoreService');
const { serverLog } = require('../utils/logger');

/**
 * Run a batch segmentation job for all conversations of a brand.
 * Groups customers by: Hot Lead, Regular Customer, Window Shopper, Returning Buyer.
 * Writes segment tags back to each conversation doc.
 */
async function runSegmentation(req, res) {
  const { brandId } = req.body;
  if (!brandId) return res.status(400).send('Missing brandId');

  try {
    const snapshot = await db.collection('conversations')
      .where('brandId', '==', brandId)
      .get();

    let updated = 0;
    const batch = db.batch();

    snapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      let segment = 'Window Shopper';

      const score = data.leadScore || 0;
      const hasBought = data.hasBought || false;

      if (hasBought && score >= 60) segment = 'Returning Buyer';
      else if (score >= 75) segment = 'Hot Lead';
      else if (score >= 40 || data.isLead) segment = 'Regular Customer';

      batch.set(docSnap.ref, { segment }, { merge: true });
      updated++;
    });

    await batch.commit();
    serverLog(`[SEGMENTATION] Updated ${updated} conversations for Brand: ${brandId}`);
    res.json({ success: true, updated });
  } catch (error) {
    serverLog('[SEGMENTATION ERROR]: ' + error.message);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get segment distribution stats for a brand.
 */
async function getSegmentStats(req, res) {
  const { brandId } = req.query;
  if (!brandId) return res.status(400).send('Missing brandId');

  try {
    const snapshot = await db.collection('conversations')
      .where('brandId', '==', brandId)
      .get();

    const stats = {
      'Hot Lead': 0,
      'Regular Customer': 0,
      'Window Shopper': 0,
      'Returning Buyer': 0,
      'Untagged': 0
    };

    snapshot.docs.forEach(d => {
      const seg = d.data().segment;
      if (stats[seg] !== undefined) stats[seg]++;
      else stats['Untagged']++;
    });

    res.json({ success: true, stats, total: snapshot.size });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { runSegmentation, getSegmentStats };
