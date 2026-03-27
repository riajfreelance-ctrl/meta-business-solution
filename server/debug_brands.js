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

async function checkBrands() {
  const snapshot = await db.collection('brands').get();
  snapshot.forEach(doc => {
    console.log(`Brand: ${doc.data().name}, ID: ${doc.id}, FB_ID: ${doc.data().facebookPageId}`);
  });
  process.exit(0);
}

checkBrands();
