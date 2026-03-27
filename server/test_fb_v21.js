const axios = require('axios');
const { db } = require('./services/firestoreService');

async function testToken() {
  try {
    const brandDoc = await db.collection('brands').doc('Azlaan').get();
    const { fbPageToken } = brandDoc.data();
    
    // Test v21.0 me/posts
    try {
      const resp = await axios.get('https://graph.facebook.com/v21.0/me/posts', {
        params: {
          access_token: fbPageToken,
          fields: 'id,message,created_time,full_picture,permalink_url',
          limit: 10
        }
      });
      console.log('Success (v21.0 me/posts):', resp.data.data?.length, 'posts found');
      console.log('Sample Post ID:', resp.data.data?.[0]?.id);
    } catch (e) {
      console.error('Failed (v21.0 me/posts):', e.response?.data || e.message);
    }

  } catch (e) {
    console.error('Test script error:', e.message);
  }
  process.exit(0);
}

testToken();
