/**
 * 📊 Real-time Comment Monitor
 * Check for new comments processed in the last 5 minutes
 */
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const serviceAccount = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-service-account.json'), 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function monitorComments() {
    console.log('\n📊 ====== COMMENT MONITOR ======');
    console.log('Checking for recent activity...\n');

    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);

    // 1. Check recent webhooks
    console.log('📌 Recent Webhooks (last 5 minutes):');
    const webhookSnap = await db.collection('raw_webhooks')
        .where('timestamp', '>=', fiveMinutesAgo)
        .get();
    
    if (webhookSnap.empty) {
        console.log('   ⏳ No webhooks received yet');
    } else {
        console.log(`   ✅ ${webhookSnap.size} webhook(s) received`);
        webhookSnap.docs.forEach((doc, i) => {
            const data = doc.data();
            const time = new Date(data.timestamp).toLocaleTimeString('en-US', { 
                timeZone: 'Asia/Dhaka', 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
            console.log(`   ${i + 1}. [${time}] Type: ${data.body?.object || 'unknown'}`);
        });
    }
    console.log('');

    // 2. Check recent comments
    console.log('📌 Recent Comments Processed (last 5 minutes):');
    const commentsSnap = await db.collection('comments')
        .where('timestamp', '>=', fiveMinutesAgo)
        .orderBy('timestamp', 'desc')
        .get();
    
    if (commentsSnap.empty) {
        console.log('   ⏳ No comments processed yet');
    } else {
        console.log(`   ✅ ${commentsSnap.size} comment(s) processed`);
        commentsSnap.docs.forEach((doc, i) => {
            const data = doc.data();
            const time = new Date(data.timestamp?.toDate ? data.timestamp.toDate() : data.timestamp)
                .toLocaleTimeString('en-US', { 
                    timeZone: 'Asia/Dhaka', 
                    hour: '2-digit', 
                    minute: '2-digit'
                });
            console.log(`\n   ${i + 1}. [${time}] From: ${data.sender_name || 'Unknown'}`);
            console.log(`      Message: "${data.message || 'N/A'}"`);
            console.log(`      Public Reply: ${data.reply ? '✅ ' + data.reply.substring(0, 60) + '...' : '❌ None'}`);
            console.log(`      Private Reply: ${data.privateReply ? '✅ Sent' : '❌ None'}`);
        });
    }
    console.log('');

    // 3. Check recent leads
    console.log('📌 Recent Leads Captured (last 5 minutes):');
    const leadsSnap = await db.collection('leads')
        .where('timestamp', '>=', fiveMinutesAgo)
        .get();
    
    if (leadsSnap.empty) {
        console.log('   ⏳ No new leads');
    } else {
        console.log(`   ✅ ${leadsSnap.size} lead(s) captured`);
        leadsSnap.docs.forEach((doc, i) => {
            const data = doc.data();
            console.log(`   ${i + 1}. ${data.name || 'Unknown'} - ${data.source || 'unknown'}`);
        });
    }
    console.log('');

    // 4. Check pending comments
    console.log('📌 Pending Comments (need attention):');
    const pendingSnap = await db.collection('pending_comments')
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();
    
    // Filter pending comments in memory
    const pendingDocs = pendingSnap.docs.filter(doc => doc.data().status === 'pending').slice(0, 5);
    
    if (pendingDocs.length === 0) {
        console.log('   ✅ No pending comments');
    } else {
        console.log(`   ⚠️  ${pendingDocs.length} pending comment(s):`);
        pendingDocs.forEach((doc, i) => {
            const data = doc.data();
            console.log(`   ${i + 1}. ${data.fromName || 'Unknown'}: "${data.commentText?.substring(0, 50) || 'N/A'}"`);
        });
    }
    console.log('');

    // 5. Check for errors
    console.log('📌 Recent Errors (last 5 minutes):');
    const errorSnap = await db.collection('logs')
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();
    
    // Filter errors in memory
    const errorDocs = errorSnap.docs.filter(doc => {
        const data = doc.data();
        return data.timestamp >= fiveMinutesAgo && 
               (data.type === 'comment_error' || data.type === 'api_error');
    });
    
    if (errorDocs.length === 0) {
        console.log('   ✅ No errors');
    } else {
        console.log(`   ❌ ${errorDocs.length} error(s) found:`);
        errorDocs.forEach((doc, i) => {
            const data = doc.data();
            console.log(`   ${i + 1}. ${data.classification || 'Unknown'}: ${data.error?.substring(0, 80) || 'N/A'}`);
        });
    }
    console.log('');

    // Summary
    console.log('======================================');
    console.log('📊 SUMMARY');
    console.log('======================================');
    console.log(`Webhooks: ${webhookSnap.size}`);
    console.log(`Comments Processed: ${commentsSnap.size}`);
    console.log(`Leads Captured: ${leadsSnap.size}`);
    console.log(`Pending Comments: ${pendingSnap.size}`);
    console.log(`Errors: ${errorSnap.size}`);
    console.log('');
    
    if (commentsSnap.size > 0) {
        console.log('🎉 Automation is working! Comments are being processed.');
    } else {
        console.log('⏳ Waiting for comments...');
        console.log('');
        console.log('📝 To test:');
        console.log('   1. Go to your Facebook page');
        console.log('   2. Create a post or use existing one');
        console.log('   3. Comment with: "price koto?"');
        console.log('   4. Wait 5-10 seconds');
        console.log('   5. Run this script again');
    }
    console.log('');
}

monitorComments().catch(e => {
    console.error('Monitor failed:', e.message);
    process.exit(1);
});
