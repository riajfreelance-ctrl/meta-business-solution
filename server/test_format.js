const axios = require('axios');
const { db } = require('./services/firestoreService');

async function testFormat() {
  try {
    const brandDoc = await db.collection('brands').doc('Azlaan').get();
    const { fbPageToken, facebookPageId } = brandDoc.data();
    
    const itemId = '980155255185306';
    const formattedId = `${facebookPageId}_${itemId}`;
    
    console.log(`Testing formatted ID: ${formattedId}`);

    try {
      const resp = await axios.get(`https://graph.facebook.com/v19.0/${formattedId}`, {
        params: {
          access_token: fbPageToken,
          fields: 'id,message'
        }
      });
      console.log(`Success with formatted ID:`, resp.data);
    } catch (e) {
      console.error(`Failed with formatted ID:`, e.response?.data || e.message);
    }

  } catch (e) {
    console.error('Test script error:', e.message);
  }
  process.exit(0);
}

testFormat();
