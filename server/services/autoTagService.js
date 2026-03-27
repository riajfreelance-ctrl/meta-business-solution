const { db } = require('./firestoreService');
const { serverLog } = require('../utils/logger');
const { 
  extractPhoneNumber, 
  extractAddressSignals, 
  detectBasicIntent, 
  detectGender,
  normalizeBanglish,
  detectSentiment
} = require('../utils/extractors');

/**
 * Analyze the last N messages of a conversation and extract customer profile tags.
 * DETERMINISTIC VERSION: Uses Regex and Keywords instead of Gemini AI.
 */
async function autoTagCustomer(convoId, brandId) {
  try {
    // 1. Fetch last 15 messages for context
    const msgSnap = await db
      .collection(`conversations/${convoId}/messages`)
      .orderBy('timestamp', 'desc')
      .limit(15)
      .get();

    if (msgSnap.empty) return;

    const messages = msgSnap.docs.map(d => d.data());
    
    // 2. Aggregate signals from messages
    let detectedLocation = null;
    let detectedGender = 'Unknown';
    let maxIntentScore = 0;
    let interests = new Set();
    let hasPhone = false;
    let sentimentCount = { Positive: 0, Negative: 0, Neutral: 0 };
    let detectedCampaign = null;

    for (const m of messages) {
      if (m.type !== 'received') continue;
      const text = m.text || '';
      
      // Sentiment Check
      const sentiment = detectSentiment(text);
      sentimentCount[sentiment]++;

      // Gender check
      const gender = detectGender(text);
      if (gender !== 'Unknown') detectedGender = gender;
      
      // Normalize text for other matches
      const normText = normalizeBanglish(text);
      
      // Campaign check
      if (normText.includes('eid') || normText.includes('ঈদ')) detectedCampaign = 'Eid Campaign';
      if (normText.includes('sale') || normText.includes('off')) detectedCampaign = 'Flash Sale';
      if (normText.includes('summer')) detectedCampaign = 'Summer Deal';

      // Location check
      const addr = extractAddressSignals(text);
      if (addr.possibleDistrict) detectedLocation = addr.possibleDistrict;

      // Intent check
      const { score } = detectBasicIntent(text);
      if (score > maxIntentScore) maxIntentScore = score;

      // Phone check
      if (extractPhoneNumber(text)) hasPhone = true;

      // Basic interest extraction
      if (normText.includes('skin') || normText.includes('mukh')) interests.add('Skincare');
      if (normText.includes('hair') || normText.includes('cul')) interests.add('Haircare');
      if (normText.includes('kombo') || normText.includes('package')) interests.add('Combos');
    }

    // Determine overall sentiment
    let finalSentiment = 'Neutral';
    if (sentimentCount.Negative > 0) finalSentiment = 'Negative'; 
    else if (sentimentCount.Positive > sentimentCount.Neutral) finalSentiment = 'Positive';

    // 3. Heuristic Segment & Lead Score
    let segment = 'Window Shopper';
    if (detectedCampaign) segment = `${detectedCampaign} Lead`;
    let leadScore = maxIntentScore;

    if (hasPhone) leadScore += 10;
    if (detectedLocation) leadScore += 10;

    if (leadScore >= 80) segment = 'Hot Lead';
    else if (leadScore >= 50) segment = 'Interested';
    else if (messages.length > 5) segment = 'Regular Inquirer';

    const tags = {
      location: detectedLocation,
      gender: detectedGender,
      interests: Array.from(interests),
      buyingIntent: maxIntentScore >= 80 ? 'High' : (maxIntentScore >= 40 ? 'Medium' : 'Low'),
      leadScore: Math.min(leadScore, 100),
      segment: segment,
      sentiment: finalSentiment,
      ageRange: null 
    };

    // 4. Save tags to the conversation document
    const convoRef = db.collection('conversations').doc(convoId);
    await convoRef.set({
      ...tags,
      tagsUpdatedAt: new Date().toISOString(),
      brandId
    }, { merge: true });

    serverLog(`[DET-TAG] Convo ${convoId} synced → Seg: ${segment}, Score: ${tags.leadScore}`);
  } catch (error) {
    serverLog(`[DET-TAG ERROR] ${convoId}: ${error.message}`);
  }
}

module.exports = { autoTagCustomer };
