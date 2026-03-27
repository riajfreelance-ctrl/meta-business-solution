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

async function updatePriceDraft() {
  const snapshot = await db.collection('draft_replies')
    .where('brandId', '==', 'Azlaan')
    .where('keyword', '==', 'Price')
    .get();

  if (snapshot.empty) {
    console.log('No "Price" draft found!');
  } else {
    const docRef = snapshot.docs[0].ref;
    const data = snapshot.docs[0].data();
    const variations = new Set(data.variations || []);
    variations.add('দাম কত');
    variations.add('koto');
    variations.add('কত');
    variations.add('দাম');
    
    await docRef.update({
      variations: Array.from(variations),
      status: 'approved'
    });
    console.log('✅ Price Draft Updated with Bangla variations.');
  }
  process.exit(0);
}

updatePriceDraft();
