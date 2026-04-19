/**
 * 🚀 ONE-CLICK TOKEN GENERATOR
 * This script opens the Facebook OAuth URL for you
 * and provides step-by-step instructions
 */

const { exec } = require('child_process');
const os = require('os');

function openURL(url) {
    switch (os.platform()) {
        case 'darwin': // macOS
            exec(`open "${url}"`);
            break;
        case 'win32': // Windows
            exec(`start "${url}"`);
            break;
        default: // Linux
            exec(`xdg-open "${url}"`);
            break;
    }
}

console.log('\n🚀 ====== FACEBOOK TOKEN GENERATOR ======\n');

const APP_ID = '1698854504433245';
const REDIRECT_URI = 'https://metasolution-rho.vercel.app/auth/fb-callback';

const oauthURL = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=pages_show_list,pages_read_engagement,pages_manage_posts,pages_manage_engagement,pages_messaging`;

console.log('📌 STEP 1: Opening Facebook OAuth...');
console.log('');
console.log('Your browser will open. Please:');
console.log('1. Login with your Facebook account');
console.log('2. Click "Continue as [Your Name]"');
console.log('3. Click "Continue" to authorize permissions');
console.log('4. You will be redirected to a page');
console.log('5. Copy the URL from the address bar');
console.log('');
console.log('Press Enter to open browser...');

process.stdin.once('data', () => {
    openURL(oauthURL);
    
    console.log('✅ Browser opened!');
    console.log('');
    console.log('📌 STEP 2: After Authorization');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('After you are redirected, you will see a URL like:');
    console.log('https://metasolution-rho.vercel.app/auth/fb-callback?code=AQD...');
    console.log('');
    console.log('Copy the "code" parameter (everything after ?code=)');
    console.log('');
    console.log('Then run this command (replace CODE_HERE):');
    console.log('');
    console.log('   export FB_AUTH_CODE="CODE_HERE"');
    console.log('   node exchange_code_for_token.js');
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('💡 ALTERNATIVE (Easier):');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('If the OAuth flow is complicated, use Graph API Explorer instead:');
    console.log('');
    console.log('1. Open: https://developers.facebook.com/tools/explorer/');
    console.log(`2. Select App: MetaSolution (${APP_ID})`);
    console.log('3. Click "Get Token" → "Get User Token"');
    console.log('4. Check these permissions:');
    console.log('   ✅ pages_show_list');
    console.log('   ✅ pages_read_engagement');
    console.log('   ✅ pages_manage_posts');
    console.log('   ✅ pages_manage_engagement');
    console.log('   ✅ pages_messaging ← MOST IMPORTANT!');
    console.log('5. Click "Generate Access Token"');
    console.log('6. Then run:');
    console.log('   node update_firestore_token.js "YOUR_TOKEN"');
    console.log('');
});
