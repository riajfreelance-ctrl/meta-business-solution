const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const serviceAccount = require('../firebase-service-account.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

async function updateToken(brandId, newToken) {
  if (!brandId || !newToken) {
    console.error('Usage: node server/scripts/update_brand_token.js <brandId> <newToken>');
    process.exit(1);
  }

  try {
    const brandRef = db.collection('brands').doc(brandId);
    const doc = await brandRef.get();
    
    if (!doc.exists) {
      console.error(`Brand [${brandId}] not found in Firestore.`);
      process.exit(1);
    }

    await brandRef.update({
      fbPageToken: newToken,
      facebookPageToken: newToken, // Keeping both for compatibility
      tokenStatus: 'ACTIVE',
      lastTokenUpdate: admin.firestore.FieldValue.serverTimestamp(),
      error: admin.firestore.FieldValue.delete()
    });

    console.log(`✅ Token updated for brand: ${brandId}`);
    console.log(`Brand Health: ACTIVE`);
  } catch (e) {
    console.error('❌ Update failed:', e.message);
  }
  process.exit(0);
}

const [,, brandId, newToken] = process.argv;
updateToken(brandId, newToken);
