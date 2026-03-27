const axios = require('axios');
const { db } = require('./services/firestoreService');

async function testToken() {
  try {
    const brandDoc = await db.collection('brands').doc('Azlaan').get();
    const { fbPageToken } = brandDoc.data();
    console.log('Testing token starting with:', fbPageToken.substring(0, 10), '...');
    
    // Test me/posts
    try {
      const resp = await axios.get('https://graph.facebook.com/v19.0/me/posts', {
        params: {
          access_token: fbPageToken,
          fields: 'id,message',
          limit: 1
        }
      });
      console.log('Success (v19.0 me/posts):', resp.data.data?.length, 'posts found');
    } catch (e) {
      console.error('Failed (v19.0 me/posts):', e.response?.data || e.message);
    }

    // Test me?fields=id,name
    try {
      const resp = await axios.get('https://graph.facebook.com/v19.0/me', {
        params: {
          access_token: fbPageToken,
          fields: 'id,name'
        }
      });
      console.log('Success (v19.0 me):', resp.data);
    } catch (e) {
      console.error('Failed (v19.0 me):', e.response?.data || e.message);
    }

  } catch (e) {
    console.error('Test script error:', e.message);
  }
  process.exit(0);
}

testToken();
