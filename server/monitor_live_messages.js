/**
 * 📡 REAL-TIME MESSAGE MONITOR
 * Run this script, then send a message to your Facebook Page
 * It will monitor for new conversations and logs
 */
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const serviceAccount = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-service-account.json'), 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

console.log('\n📡 ====== REAL-TIME MESSAGE MONITOR ======');
console.log('📱 Now send a message to your Facebook Page...');
console.log('⏳ Monitoring for new activity...\n');

let lastCheck = Date.now();

async function monitorMessages() {
    try {
        // Check for new conversations
        const convoSnap = await db.collection('conversations')
            .orderBy('lastMessageTimestamp', 'desc')
            .limit(3)
            .get();
        
        convoSnap.forEach(doc => {
            const data = doc.data();
            if (data.lastMessageTimestamp > lastCheck) {
                const timeAgo = Math.round((Date.now() - data.lastMessageTimestamp) / 1000);
                console.log(`\n💬 NEW CONVERSATION (${timeAgo}s ago):`);
                console.log(`   PSID: ${doc.id}`);
                console.log(`   Message: "${data.lastMessage}"`);
                console.log(`   Status: ${data.status || 'new'}`);
                console.log(`   Platform: ${data.platform || 'facebook'}`);
            }
        });

        // Check for new logs
        const logsSnap = await db.collection('logs')
            .orderBy('timestamp', 'desc')
            .limit(5)
            .get();
        
        logsSnap.forEach(doc => {
            const log = doc.data();
            if (log.timestamp > lastCheck) {
                const timeAgo = Math.round((Date.now() - log.timestamp) / 1000);
                console.log(`\n📝 LOG (${timeAgo}s ago):`);
                console.log(`   Type: ${log.type}`);
                console.log(`   Text: "${log.text?.substring(0, 80)}..."`);
            }
        });

        lastCheck = Date.now();
    } catch (e) {
        console.error('Monitor Error:', e.message);
    }
}

// Check every 2 seconds
setInterval(monitorMessages, 2000);

// Initial check
monitorMessages();

console.log('✅ Monitor started. Press Ctrl+C to stop.\n');
