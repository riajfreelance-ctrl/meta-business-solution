/**
 * Update Facebook Page Token in Firestore
 * Usage: node update_firestore_token.js YOUR_NEW_PAGE_ACCESS_TOKEN
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Initialize Firebase
const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ firebase-service-account.json not found!');
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

async function updateToken(newToken) {
    console.log('\n🔧 ====== UPDATE FIRESTORE PAGE TOKEN ======\n');
    
    if (!newToken) {
        console.log('❌ Usage: node update_firestore_token.js YOUR_PAGE_ACCESS_TOKEN');
        console.log('');
        console.log('Get your Page Access Token from:');
        console.log('https://developers.facebook.com/tools/explorer/');
        process.exit(1);
    }
    
    console.log('📌 Validating token...');
    console.log('   Token:', newToken.substring(0, 30) + '...');
    console.log('');
    
    // Test token validity
    try {
        const resp = await axios.get(
            'https://graph.facebook.com/v21.0/me',
            {
                params: { 
                    access_token: newToken,
                    fields: 'id,name'
                },
                timeout: 5000
            }
        );
        
        console.log('✅ Token is valid!');
        console.log('   Page ID:', resp.data.id);
        console.log('   Page Name:', resp.data.name);
        console.log('');
        
        // Update Firestore
        console.log('📌 Updating Firestore...');
        await db.collection('brands').doc('Skinzy').update({
            fbPageToken: newToken,
            facebookPageId: resp.data.id,
            lastTokenUpdate: new Date().toISOString()
        });
        
        console.log('✅ Firestore updated successfully!');
        console.log('');
        
        // Test sending a message
        console.log('📌 Testing message send...');
        const testPsid = '25798685759834086'; // From previous conversations
        try {
            await axios.post(
                `https://graph.facebook.com/v21.0/me/messages`,
                {
                    recipient: { id: testPsid },
                    message: { text: '✅ Token updated successfully! Auto-reply is now active.' }
                },
                {
                    params: { access_token: newToken },
                    timeout: 10000
                }
            );
            console.log('✅ Test message sent!');
        } catch (e) {
            console.log('⚠️  Test message failed:', e.response?.data?.error?.message);
            console.log('   (This is okay - the token is still valid)');
        }
        
        console.log('');
        console.log('═══════════════════════════════════════');
        console.log('🎉 TOKEN UPDATED SUCCESSFULLY!');
        console.log('═══════════════════════════════════════');
        console.log('');
        console.log('⚠️  IMPORTANT: You must also update Vercel!');
        console.log('');
        console.log('Run this command:');
        console.log('   npx vercel env add PAGE_ACCESS_TOKEN production');
        console.log('');
        console.log('Then paste the same token when prompted.');
        console.log('');
        console.log('After that, your auto-reply will work! 🚀');
        console.log('');
        
    } catch (e) {
        console.log('❌ Token validation failed!');
        console.log('   Error:', e.response?.data?.error?.message || e.message);
        console.log('');
        console.log('💡 This token is invalid. Please get a new one from:');
        console.log('   https://developers.facebook.com/tools/explorer/');
        console.log('');
        console.log('Make sure to select these permissions:');
        console.log('   ✅ pages_messaging');
        console.log('   ✅ pages_show_list');
        console.log('   ✅ pages_read_engagement');
        console.log('   ✅ pages_manage_posts');
        console.log('');
        process.exit(1);
    }
}

// Get token from command line argument
const newToken = process.argv[2];
updateToken(newToken).catch(e => {
    console.error('Fatal Error:', e.message);
    process.exit(1);
});
