const axios = require('axios');
const { db } = require('../services/firestoreService');

async function subscribePage() {
  try {
    const brandDoc = await db.collection('brands').doc('Skinzy').get();
    if (!brandDoc.exists) {
      console.log('❌ Error: Skinzy brand not found in Firestore.');
      process.exit(1);
    }

    const { fbPageToken, name, facebookPageId } = brandDoc.data();
    
    if (!fbPageToken) {
      console.log(`❌ Error: No fbPageToken found for brand ${name}. Please update it in Firestore.`);
      process.exit(1);
    }

    console.log(`🚀 Attempting to subscribe Page [${name}] (ID: ${facebookPageId}) to the Meta App...`);

    // 1. Subscribe to Webhooks
    const subscribeResp = await axios.post(`https://graph.facebook.com/v21.0/me/subscribed_apps`, {
      subscribed_fields: ['messages', 'messaging_postbacks', 'messaging_optins']
    }, {
      params: { access_token: fbPageToken }
    });

    console.log('✅ Subscription Response:', JSON.stringify(subscribeResp.data, null, 2));

    if (subscribeResp.data.success) {
      console.log('🎉 Successfully subscribed to Facebook Webhooks!');
    } else {
      console.log('⚠️ Subscription might have failed or returned unexpected response.');
    }

    // 2. Verify Page Settings (Optional)
    const settingsResp = await axios.get(`https://graph.facebook.com/v21.0/me/subscribed_apps`, {
      params: { access_token: fbPageToken }
    });
    console.log('📊 Current Subscriptions:', JSON.stringify(settingsResp.data, null, 2));

  } catch (e) {
    console.error('❌ Subscription Error:', e.response?.data || e.message);
  }
  process.exit(0);
}

subscribePage();
