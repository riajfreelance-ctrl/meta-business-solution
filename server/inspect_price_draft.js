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

async function inspectPriceDraft() {
  const snapshot = await db.collection('draft_replies')
    .where('brandId', '==', 'Azlaan')
    .where('keyword', '==', 'Price')
    .get();

  if (snapshot.empty) {
    console.log('No "Price" draft found!');
  } else {
    const data = snapshot.docs[0].data();
    console.log('--- Price Draft ---');
    console.log('Keyword:', data.keyword);
    console.log('Status:', data.status);
    console.log('Result:', data.result);
    console.log('Variations:', JSON.stringify(data.variations, null, 2));
    console.log('Approved Variations:', JSON.stringify(data.approvedVariations, null, 2));
  }
  process.exit(0);
}

inspectPriceDraft();
