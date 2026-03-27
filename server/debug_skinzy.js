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
  const doc = await db.collection('brands').doc('Azlaan').get();
  if (doc.exists) {
    const data = doc.data();
    console.log('--- Brand: Skinzy (Azlaan) ---');
    console.log('AI Key:', data.googleAIKey ? 'Present' : 'Missing');
    console.log('AI Settings:', JSON.stringify(data.aiSettings, null, 2));
    console.log('Comment Settings:', JSON.stringify(data.commentSettings, null, 2));
  } else {
    console.log('Brand Azlaan not found!');
  }
  process.exit(0);
}

checkAds();
