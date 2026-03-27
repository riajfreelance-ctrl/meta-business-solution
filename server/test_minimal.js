const axios = require('axios');
const { db } = require('./services/firestoreService');

async function testMinimal() {
  try {
    const brandDoc = await db.collection('brands').doc('Azlaan').get();
    const { fbPageToken } = brandDoc.data();
    const id = '963162780217887_980155255185306';

    try {
      const resp = await axios.get(`https://graph.facebook.com/v19.0/${id}`, {
        params: { access_token: fbPageToken }
      });
      console.log(`Success minimal with ID ${id}:`, resp.data);
    } catch (e) {
      console.error(`Failed minimal with ID ${id}:`, e.response?.data || e.message);
    }

  } catch (e) {
    console.error('Test script error:', e.message);
  }
  process.exit(0);
}

testMinimal();
