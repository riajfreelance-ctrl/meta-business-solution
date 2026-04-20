const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require('./firebase-service-account.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

async function migrate() {
  console.log('🚀 Starting Data Migration to Comment Data Center...');

  // 1. Fetch Legacy Drafts (41 items)
  const draftRepliesSnap = await db.collection('draft_replies').get();
  console.log(`📂 Found ${draftRepliesSnap.size} legacy draft replies.`);

  // 2. Fetch Comment Drafts (33 items)
  const commentDraftsSnap = await db.collection('comment_drafts').get();
  console.log(`📂 Found ${commentDraftsSnap.size} comment drafts.`);

  let migratedCount = 0;

  // Process legacy draft_replies
  for (const doc of draftRepliesSnap.docs) {
    const data = doc.data();
    
    // Convert current structure to Comment Data Center structure
    // We'll create a "Global Template" for these since they don't have a specific PostID
    const entry = {
      postId: null, // Mark as Global Template
      postLink: null,
      isActive: true,
      isUniversal: true,
      brandId: data.brandId || 'Skinzy',
      questions: [
        {
          keywords: [data.keyword, ...(data.variations || [])].map(k => k.trim()).filter(Boolean),
          replies: Array(5).fill({
            public: data.result,
            private: data.result
          })
        }
      ],
      migratedFrom: 'draft_replies',
      legacyId: doc.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('comment_data_center').add(entry);
    migratedCount++;
    console.log(`✅ Migrated legacy draft: ${data.keyword}`);
  }

  // Process comment_drafts
  for (const doc of commentDraftsSnap.docs) {
    const data = doc.data();
    
    const entry = {
      postId: null,
      postLink: null,
      isActive: true,
      isUniversal: true,
      brandId: data.brandId || 'Skinzy',
      questions: [
        {
          keywords: data.keywords || [],
          replies: (data.variations || []).map(v => ({
            public: v.publicReply || '',
            private: v.privateReply || ''
          }))
        }
      ],
      migratedFrom: 'comment_drafts',
      legacyId: doc.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Pad replies to 5 if necessary
    const q = entry.questions[0];
    while (q.replies.length < 5 && q.replies.length > 0) {
      q.replies.push(q.replies[0]);
    }
    if (q.replies.length === 0) {
       q.replies = Array(5).fill({ public: 'Please check inbox 💙', private: 'Hello! How can we help?' });
    }

    await db.collection('comment_data_center').add(entry);
    migratedCount++;
    console.log(`✅ Migrated comment draft with ${data.keywords?.length || 0} keywords`);
  }

  console.log(`\n🎉 Migration Complete! Total migrated: ${migratedCount}`);
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
