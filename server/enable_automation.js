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

async function fixSkinzy() {
  console.log('Fixing Skinzy Automation...');
  const brandRef = db.collection('brands').doc('Skinzy');
  
  await brandRef.update({
    isLearningMode: false,
    'inboxSettings.systemAutoReply': true,
    'inboxSettings.aiReply': true,
    'aiSettings.inboxAiEnabled': true
  });
  
  console.log('SUCCESS: Learning Mode OFF. Auto-Reply ENABLED.');
  process.exit(0);
}

fixSkinzy();
