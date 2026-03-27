const axios = require('axios');
const { db } = require('./services/firestoreService');

async function testIdV12() {
  try {
    const brandDoc = await db.collection('brands').doc('Azlaan').get();
    const { fbPageToken } = brandDoc.data();
    const id = '963162780217887_980155255185306';

    try {
      const resp = await axios.get(`https://graph.facebook.com/v12.0/${id}`, {
        params: {
          access_token: fbPageToken,
          fields: 'id,message,full_picture'
        }
      });
      console.log(`Success v12.0 with ID ${id}:`, resp.data);
    } catch (e) {
      console.error(`Failed v12.0 with ID ${id}:`, e.response?.data || e.message);
    }

  } catch (e) {
    console.error('Test script error:', e.message);
  }
  process.exit(0);
}

testIdV12();
