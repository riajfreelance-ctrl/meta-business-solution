// Test webhook comment processing
const axios = require('axios');

// Simulate Facebook comment webhook
const testPayload = {
  "object": "page",
  "entry": [{
    "id": "963307416870090", // Your page ID
    "time": 1713600000000,
    "changes": [{
      "field": "feed",
      "value": {
        "comment_id": "test_comment_12345",
        "post_id": "122105925219235530", // Replace with your actual post ID
        "message": "Price koto?",
        "from": {
          "name": "Test User",
          "id": "1234567890"
        },
        "item": "comment",
        "verb": "add",
        "created_time": 1713600000
      }
    }]
  }]
};

async function testWebhook() {
  try {
    console.log('🧪 Testing webhook with comment payload...');
    console.log('Payload:', JSON.stringify(testPayload, null, 2));
    
    const response = await axios.post(
      'https://metasolution-rho.vercel.app/webhook',
      testPayload,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 65000 // 65 seconds
      }
    );
    
    console.log('✅ Response Status:', response.status);
    console.log('✅ Response Data:', response.data);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
}

testWebhook();
