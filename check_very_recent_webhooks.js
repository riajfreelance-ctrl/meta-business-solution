#!/usr/bin/env node
/**
 * Check if NEW webhook events are coming in (last 2 minutes)
 */

const admin = require('firebase-admin');
const serviceAccount = require('./server/firebase-service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkVeryRecentWebhooks() {
    console.log('🔍 Checking VERY RECENT Webhook Events (Last 5 minutes)...\n');

    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);

    // Check raw_webhooks
    const rawWebhooks = await db.collection('raw_webhooks')
        .where('timestamp', '>=', fiveMinutesAgo)
        .orderBy('timestamp', 'desc')
        .get();

    if (rawWebhooks.empty) {
        console.log('❌ NO webhook events received in last 5 minutes!');
        console.log('\n💡 Possible reasons:');
        console.log('   1. Facebook is not sending webhook events');
        console.log('   2. Webhook subscription expired');
        console.log('   3. Wrong Facebook page');
        console.log('\n🔧 Try this:');
        console.log('   node webhook_resubscribe_and_fix.js <PAGE_ACCESS_TOKEN>');
        return;
    }

    console.log(`✅ Found ${rawWebhooks.size} webhook event(s) in last 5 minutes\n`);

    rawWebhooks.forEach((doc, idx) => {
        const data = doc.data();
        const timeAgo = Math.round((Date.now() - data.timestamp) / 1000);
        console.log(`${idx + 1}. Time: ${timeAgo} seconds ago`);
        console.log(`   Object: ${data.body?.object || 'unknown'}`);
        
        if (data.body?.entry?.[0]) {
            const entry = data.body.entry[0];
            console.log(`   Entry ID: ${entry.id}`);
            
            if (entry.messaging) {
                console.log(`   Type: MESSAGE`);
                entry.messaging.forEach(msg => {
                    if (msg.message && !msg.message.is_echo) {
                        console.log(`   ┗━ Text: ${msg.message.text?.substring(0, 50) || '(no text)'}`);
                    }
                });
            }
            
            if (entry.changes) {
                entry.changes.forEach(change => {
                    if (change.field === 'feed') {
                        console.log(`   Type: COMMENT (feed)`);
                        console.log(`   ┣━ Item: ${change.value?.item}`);
                        console.log(`   ┣━ Verb: ${change.value?.verb}`);
                        console.log(`   ┣━ Comment: ${change.value?.message?.substring(0, 50) || '(no message)'}`);
                        console.log(`   ┗━ From: ${change.value?.from?.name || 'unknown'}`);
                    }
                });
            }
        }
        console.log('');
    });

    // Check if comments were processed
    const recentComments = await db.collection('comments')
        .where('timestamp', '>=', new Date(fiveMinutesAgo))
        .get();

    console.log(`\n💬 Comments processed: ${recentComments.size}`);
    
    if (recentComments.size === 0 && rawWebhooks.size > 0) {
        console.log('⚠️ Webhooks received but NO comments processed!');
        console.log('💡 Check pending_comments collection for errors');
    }

    // Check pending comments
    const recentPending = await db.collection('pending_comments')
        .where('timestamp', '>=', new Date(fiveMinutesAgo))
        .get();

    console.log(`\n⏳ Pending comments: ${recentPending.size}`);
    
    if (recentPending.size > 0) {
        console.log('\nRecent pending comments:');
        recentPending.forEach((doc, idx) => {
            const data = doc.data();
            console.log(`\n${idx + 1}. From: ${data.fromName}`);
            console.log(`   Message: ${data.commentText?.substring(0, 60)}`);
            console.log(`   Status: ${data.status}`);
            console.log(`   Type: ${data.type || 'unknown'}`);
            console.log(`   Error: ${data.error || 'None'}`);
        });
    }
}

checkVeryRecentWebhooks()
    .then(() => {
        console.log('\n✅ Check complete!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
