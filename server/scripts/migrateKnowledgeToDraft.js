const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');

if (fs.existsSync(serviceAccountPath)) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath)
  });
} else {
  admin.initializeApp({
    projectId: "advance-automation-8029e"
  });
}

const db = admin.firestore();

async function migrate() {
  console.log('--- Starting Migration: knowledge_base -> draft_replies ---');
  
  try {
    const kbSnapshot = await db.collection('knowledge_base').get();
    let migratedCount = 0;

    for (const docSnap of kbSnapshot.docs) {
      const data = docSnap.data();
      const keywords = data.keywords || [];
      const answer = data.answer || '';
      const brandId = data.brandId || 'Azlaan'; // Default to Azlaan if missing

      // Skip if empty
      if (keywords.length === 0 || !answer) continue;

      const mainKeyword = keywords[0]; // Take the first keyword as the primary keyword
      
      // Check if it already exists to avoid duplicates
      const existQ = await db.collection('draft_replies')
        .where('brandId', '==', brandId)
        .where('keyword', '==', mainKeyword)
        .where('type', '==', 'knowledge_base')
        .get();
        
      if (existQ.empty) {
        await db.collection('draft_replies').add({
          keyword: mainKeyword,
          variations: keywords.slice(1), // Store rest as variations
          result: answer,
          status: 'approved',
          type: 'knowledge_base',
          brandId: brandId,
          successCount: 0,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`[MIGRATED] Keyword: ${mainKeyword}`);
        migratedCount++;
      } else {
        console.log(`[SKIPPED] Already exists: ${mainKeyword}`);
      }
    }

    console.log(`--- Migration Finished. Total newly migrated: ${migratedCount} ---`);
    process.exit(0);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
