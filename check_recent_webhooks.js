#!/usr/bin/env node
/**
 * Check Recent Webhook Events and Comment Processing
 */

const admin = require('firebase-admin');
const serviceAccount = require('./server/firebase-service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkRecentWebhooks() {
    console.log('🔍 Checking Recent Webhook Events...\n');

    // Check raw_webhooks (last 10)
    console.log('📡 Raw Webhooks (Last 10):');
    const rawWebhooks = await db.collection('raw_webhooks')
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();

    if (rawWebhooks.empty) {
        console.log('   ⚠️ No webhook events received');
        console.log('   💡 Facebook may not be sending events');
    } else {
        console.log(`   ✅ Found ${rawWebhooks.size} webhook events\n`);
        rawWebhooks.forEach((doc, idx) => {
            const data = doc.data();
            const timestamp = new Date(data.timestamp).toLocaleString();
            console.log(`   ${idx + 1}. Time: ${timestamp}`);
            console.log(`      Object: ${data.body?.object || 'unknown'}`);
            if (data.body?.entry?.[0]) {
                console.log(`      Entry ID: ${data.body.entry[0].id}`);
                if (data.body.entry[0].changes?.[0]) {
                    const change = data.body.entry[0].changes[0];
                    console.log(`      Field: ${change.field}`);
                    console.log(`      Item: ${change.value?.item}`);
                }
            }
            console.log('');
        });
    }

    // Check unhandled_webhooks
    console.log('\n❌ Unhandled Webhooks (Last 5):');
    const unhandled = await db.collection('unhandled_webhooks')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get();

    if (unhandled.empty) {
        console.log('   ✅ No unhandled webhooks');
    } else {
        console.log(`   ⚠️ Found ${unhandled.size} unhandled webhooks\n`);
        unhandled.forEach((doc, idx) => {
            const data = doc.data();
            console.log(`   ${idx + 1}. Platform ID: ${data.platformId}`);
            console.log(`      Reason: ${data.reason}`);
            console.log(`      Time: ${new Date(data.timestamp).toLocaleString()}`);
            console.log('');
        });
    }

    // Check recent comments
    console.log('\n💬 Recent Comments (Last 5):');
    const comments = await db.collection('comments')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get();

    if (comments.empty) {
        console.log('   ⚠️ No comments processed');
    } else {
        console.log(`   ✅ Found ${comments.size} comments\n`);
        comments.forEach((doc, idx) => {
            const data = doc.data();
            console.log(`   ${idx + 1}. From: ${data.sender_name}`);
            console.log(`      Message: ${data.message?.substring(0, 50)}`);
            console.log(`      Reply: ${data.reply?.substring(0, 50) || 'None'}`);
            console.log(`      Time: ${data.timestamp ? new Date(data.timestamp.toDate()).toLocaleString() : 'Unknown'}`);
            console.log('');
        });
    }

    // Check pending comments
    console.log('\n⏳ Pending Comments (Last 5):');
    const pending = await db.collection('pending_comments')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get();

    if (pending.empty) {
        console.log('   ✅ No pending comments');
    } else {
        console.log(`   ⚠️ Found ${pending.size} pending comments\n`);
        pending.forEach((doc, idx) => {
            const data = doc.data();
            console.log(`   ${idx + 1}. From: ${data.fromName}`);
            console.log(`      Message: ${data.commentText?.substring(0, 50)}`);
            console.log(`      Status: ${data.status}`);
            console.log(`      Type: ${data.type || 'unknown'}`);
            console.log(`      Error: ${data.error || 'None'}`);
            console.log('');
        });
    }
}

checkRecentWebhooks()
    .then(() => {
        console.log('\n✅ Check complete!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
