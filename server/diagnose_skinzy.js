const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const serviceAccount = require('./firebase-service-account.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

async function checkAds() {
  const brandSnap = await db.collection('brands').doc('Skinzy').get();
  if (brandSnap.exists) {
    const data = brandSnap.data();
    console.log('--- Brand: Skinzy ---');
    console.log('fbPageId:', data.facebookPageId || data.fbPageId);
    console.log('fbPageToken Status:', (data.fbPageToken || data.facebookPageToken) ? 'PRESENT' : 'MISSING');
    console.log('Inbox Settings:', JSON.stringify(data.inboxSettings, null, 2));
    console.log('Learning Mode:', data.isLearningMode);
    console.log('AI Key:', data.googleAIKey ? 'Present' : 'Missing');
    console.log('AI Enabled (inboxAiEnabled):', data.aiSettings?.inboxAiEnabled);
  } else {
    console.log('Brand Skinzy not found!');
  }
  process.exit(0);
}

checkAds();
