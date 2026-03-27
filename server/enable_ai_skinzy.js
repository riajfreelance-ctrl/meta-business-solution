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

async function enableAi() {
  const docRef = db.collection('brands').doc('Azlaan');
  await docRef.update({
    aiSettings: {
      inboxAiEnabled: true,
      commentAiEnabled: true,
      autoLearningEnabled: true
    }
  });
  console.log('✅ AI Enabled for Skinzy (Azlaan)');
  process.exit(0);
}

enableAi();
