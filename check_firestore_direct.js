#!/usr/bin/env node
/**
 * Direct Firestore check - look for ANY recent activity
 */

const admin = require('firebase-admin');
const serviceAccount = require('./server/firebase-service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkAllRecent() {
    console.log('🔍 Checking ALL Firestore Collections for Recent Activity...\n');

    const oneHourAgo = Date.now() - (60 * 60 * 1000);

    // Check raw_webhooks
    const rawWebhooks = await db.collection('raw_webhooks')
        .orderBy('timestamp', 'desc')
        .limit(3)
        .get();

    console.log('📡 raw_webhooks (Last 3):');
    if (rawWebhooks.empty) {
        console.log('   ⚠️ EMPTY - No webhooks logged\n');
    } else {
        rawWebhooks.forEach((doc, idx) => {
            const data = doc.data();
            const timeAgo = Math.round((Date.now() - data.timestamp) / 60000);
            console.log(`   ${idx + 1}. ${timeAgo} minutes ago`);
            console.log(`      Object: ${data.body?.object}`);
            console.log(`      Entry ID: ${data.body?.entry?.[0]?.id}\n`);
        });
    }

    // Check comments
    const comments = await db.collection('comments')
        .orderBy('timestamp', 'desc')
        .limit(3)
        .get();

    console.log('💬 comments (Last 3):');
    if (comments.empty) {
        console.log('   ⚠️ EMPTY\n');
    } else {
        comments.forEach((doc, idx) => {
            const data = doc.data();
            const ts = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
            const timeAgo = Math.round((Date.now() - ts.getTime()) / 60000);
            console.log(`   ${idx + 1}. ${timeAgo} minutes ago`);
            console.log(`      Message: ${data.message?.substring(0, 50)}`);
            console.log(`      Reply: ${data.reply?.substring(0, 50) || 'None'}\n`);
        });
    }

    // Check pending_comments
    const pending = await db.collection('pending_comments')
        .orderBy('timestamp', 'desc')
        .limit(3)
        .get();

    console.log('⏳ pending_comments (Last 3):');
    if (pending.empty) {
        console.log('   ⚠️ EMPTY\n');
    } else {
        pending.forEach((doc, idx) => {
            const data = doc.data();
            const ts = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
            const timeAgo = Math.round((Date.now() - ts.getTime()) / 60000);
            console.log(`   ${idx + 1}. ${timeAgo} minutes ago`);
            console.log(`      Message: ${data.commentText?.substring(0, 50)}`);
            console.log(`      Status: ${data.status}\n`);
        });
    }
}

checkAllRecent()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
