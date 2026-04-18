#!/usr/bin/env node
/**
 * Check Comment Drafts for Skinzy Brand
 */

const admin = require('firebase-admin');
const serviceAccount = require('./server/firebase-service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkCommentDrafts() {
    console.log('🔍 Checking Comment Drafts for Skinzy...\n');

    const drafts = await db.collection('comment_drafts')
        .where('brandId', '==', 'Skinzy')
        .get();

    if (drafts.empty) {
        console.log('⚠️ No comment drafts found for Skinzy');
        console.log('💡 Create drafts in Dashboard → Comment Automation');
        return;
    }

    console.log(`✅ Found ${drafts.size} comment drafts\n`);

    drafts.forEach((doc, idx) => {
        const data = doc.data();
        console.log(`${idx + 1}. Draft ID: ${doc.id}`);
        console.log(`   Post ID: ${data.postId || 'Global'}`);
        console.log(`   Keywords: ${(data.keywords || []).join(', ')}`);
        console.log(`   Variations: ${(data.variations || []).length}`);
        
        if (data.variations && data.variations.length > 0) {
            data.variations.forEach((variation, vIdx) => {
                console.log(`\n   Variation ${vIdx + 1}:`);
                console.log(`   ┣━ Public: ${variation.publicReply?.substring(0, 80) || 'Empty'}`);
                console.log(`   ┗━ Private: ${variation.privateReply?.substring(0, 80) || 'Empty'}`);
            });
        }
        console.log('');
    });
}

checkCommentDrafts()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
