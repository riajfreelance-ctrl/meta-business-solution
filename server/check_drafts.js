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

async function checkDrafts() {
  const snapshot = await db.collection('draft_replies').where('brandId', '==', 'Azlaan').get();
  console.log(`Found ${snapshot.size} drafts for Skinzy (Azlaan)`);
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`- Keyword: ${data.keyword}, Status: ${data.status}`);
  });
  process.exit(0);
}

checkDrafts();
