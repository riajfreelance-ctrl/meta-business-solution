/**
 * 🔧 FIX: Generate and Update Facebook Page Access Token
 * This script will guide you through getting a valid token
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

// Initialize Firebase
const serviceAccount = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-service-account.json'), 'utf8'));
if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

async function fixPageToken() {
    console.log('\n🔧 ====== FACEBOOK PAGE TOKEN FIX ======\n');
    
    const APP_ID = '1698854504433245';
    const APP_SECRET = process.env.APP_SECRET;
    
    console.log('📌 STEP 1: Generate User Access Token');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('1. Open this URL in your browser:');
    console.log(`   https://www.facebook.com/v21.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=https://metasolution-rho.vercel.app/auth/fb-callback&scope=pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_engagement,pages_messaging`);
    console.log('');
    console.log('2. Login with your Facebook account (must be Page Admin)');
    console.log('3. Authorize the permissions');
    console.log('4. You will be redirected to a URL like:');
    console.log('   https://metasolution-rho.vercel.app/auth/fb-callback?code=XXXXX');
    console.log('5. Copy the "code" parameter');
    console.log('');
    
    // Alternative: Use Graph API Explorer (Easier)
    console.log('📌 ALTERNATIVE (EASIER METHOD):');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('1. Go to: https://developers.facebook.com/tools/explorer/');
    console.log(`2. Select your App: "MetaSolution" (${APP_ID})`);
    console.log('3. Click "Get Token" → "Get User Token"');
    console.log('4. Check these permissions:');
    console.log('   ✅ pages_show_list');
    console.log('   ✅ pages_read_engagement');
    console.log('   ✅ pages_manage_posts');
    console.log('   ✅ pages_manage_engagement');
    console.log('   ✅ pages_messaging (MOST IMPORTANT!)');
    console.log('5. Click "Generate Access Token"');
    console.log('6. Copy the generated User Token (starts with EAAY...)');
    console.log('');
    
    // Get user token from input
    console.log('📌 STEP 2: Enter Your User Access Token');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('Paste the User Access Token you just generated:');
    console.log('(Token will be read from environment variable USER_ACCESS_TOKEN)');
    console.log('');
    
    const userToken = process.env.USER_ACCESS_TOKEN;
    
    if (!userToken) {
        console.log('❌ USER_ACCESS_TOKEN not found in environment');
        console.log('');
        console.log('💡 HOW TO SET IT:');
        console.log('   export USER_ACCESS_TOKEN="your_token_here"');
        console.log('   node fix_fb_page_token.js');
        console.log('');
        console.log('OR manually update the token:');
        console.log('');
        console.log('📌 MANUAL FIX:');
        console.log('═══════════════════════════════════════');
        console.log('');
        console.log('After getting your User Token from Graph API Explorer:');
        console.log('');
        console.log('1. Get Page Access Token:');
        console.log('   Run this curl command (replace USER_TOKEN):');
        console.log('');
        console.log(`   curl "https://graph.facebook.com/v21.0/me/accounts?access_token=USER_TOKEN"`);
        console.log('');
        console.log('2. You will get a response like:');
        console.log('   {');
        console.log('     "data": [');
        console.log('       {');
        console.log('         "name": "Skinzy",');
        console.log('         "id": "61587065925121",');
        console.log('         "access_token": "EAAY..." ← COPY THIS');
        console.log('       }');
        console.log('     ]');
        console.log('   }');
        console.log('');
        console.log('3. Update Vercel Environment Variable:');
        console.log('   npx vercel env add PAGE_ACCESS_TOKEN production');
        console.log('   (Paste the Page Access Token)');
        console.log('');
        console.log('4. Update Firestore (run this command):');
        console.log('   node update_firestore_token.js NEW_PAGE_TOKEN');
        console.log('');
        console.log('5. Redeploy to Vercel:');
        console.log('   git push');
        console.log('');
        return;
    }
    
    console.log('✅ User Token found');
    console.log('');
    
    // Get Page Access Token
    console.log('📌 STEP 3: Getting Page Access Token...');
    try {
        const pagesResp = await axios.get(
            `https://graph.facebook.com/v21.0/me/accounts`,
            {
                params: { access_token: userToken },
                timeout: 10000
            }
        );
        
        const pages = pagesResp.data.data;
        console.log(`✅ Found ${pages.length} page(s):\n`);
        
        pages.forEach((page, i) => {
            console.log(`${i+1}. Page: ${page.name}`);
            console.log(`   ID: ${page.id}`);
            console.log(`   Token: ${page.access_token ? page.access_token.substring(0, 30) + '...' : 'MISSING'}`);
            console.log('');
        });
        
        // Find Skinzy page
        const skinzyPage = pages.find(p => 
            p.id === '61587065925121' || 
            p.name.toLowerCase().includes('skinzy')
        );
        
        if (!skinzyPage) {
            console.log('❌ Skinzy page not found in your pages!');
            console.log('   Make sure you are an admin of the Skinzy Facebook page');
            return;
        }
        
        const pageToken = skinzyPage.access_token;
        console.log('✅ Skinzy Page Access Token generated!');
        console.log('   Token:', pageToken.substring(0, 30) + '...');
        console.log('');
        
        // Test the token
        console.log('📌 STEP 4: Testing Page Token...');
        try {
            const testResp = await axios.get(
                `https://graph.facebook.com/v21.0/${skinzyPage.id}`,
                {
                    params: { access_token: pageToken },
                    timeout: 5000
                }
            );
            console.log('✅ Token is VALID!');
            console.log('   Page:', testResp.data.name);
            console.log('');
        } catch (e) {
            console.log('❌ Token validation failed:', e.response?.data?.error?.message);
            return;
        }
        
        // Update Firestore
        console.log('📌 STEP 5: Updating Firestore...');
        try {
            await db.collection('brands').doc('Skinzy').update({
                fbPageToken: pageToken,
                facebookPageId: skinzyPage.id,
                lastTokenUpdate: new Date().toISOString()
            });
            console.log('✅ Firestore updated successfully!');
            console.log('');
        } catch (e) {
            console.log('❌ Firestore update failed:', e.message);
            return;
        }
        
        // Test sending a message
        console.log('📌 STEP 6: Test Sending Message...');
        const testPsid = '25798685759834086'; // From earlier test
        try {
            await axios.post(
                `https://graph.facebook.com/v21.0/me/messages`,
                {
                    recipient: { id: testPsid },
                    message: { text: '✅ Token updated! Auto-reply is now working.' }
                },
                {
                    params: { access_token: pageToken },
                    timeout: 10000
                }
            );
            console.log('✅ Test message sent successfully!');
            console.log('');
        } catch (e) {
            console.log('❌ Test message failed:', e.response?.data?.error?.message);
            console.log('');
        }
        
        console.log('═══════════════════════════════════════');
        console.log('🎉 FIX COMPLETED!');
        console.log('═══════════════════════════════════════');
        console.log('');
        console.log('✅ Firestore updated with new Page Token');
        console.log('✅ Facebook Page ID: ' + skinzyPage.id);
        console.log('');
        console.log('⚠️  NEXT STEPS:');
        console.log('   1. Update Vercel environment variable:');
        console.log('      npx vercel env add PAGE_ACCESS_TOKEN production');
        console.log('');
        console.log('   2. Redeploy your application:');
        console.log('      git add .');
        console.log('      git commit -m "Update FB page token"');
        console.log('      git push');
        console.log('');
        console.log('   3. Test by sending a message to Skinzy Facebook page');
        console.log('');
        
    } catch (e) {
        console.log('❌ Error:', e.response?.data?.error?.message || e.message);
        console.log('');
    }
}

fixPageToken().catch(e => {
    console.error('Fatal Error:', e.message);
    process.exit(1);
});
