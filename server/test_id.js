const axios = require('axios');
const { db } = require('./services/firestoreService');

async function testId() {
  try {
    const brandDoc = await db.collection('brands').doc('Azlaan').get();
    const { fbPageToken } = brandDoc.data();
    
    const ids = [
      '963162780217887_980155255185306',
      '980155255185306'
    ];

    for (const id of ids) {
      try {
        const resp = await axios.get(`https://graph.facebook.com/v21.0/${id}`, {
          params: {
            access_token: fbPageToken,
            fields: 'id,message'
          }
        });
        console.log(`Success with ID ${id}:`, resp.data);
      } catch (e) {
        console.error(`Failed with ID ${id}:`, e.response?.data || e.message);
      }
    }

  } catch (e) {
    console.error('Test script error:', e.message);
  }
  process.exit(0);
}

testId();
