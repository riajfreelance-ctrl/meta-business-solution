const admin = require('firebase-admin');
const { db } = require('../services/firestoreService');

async function migrateBrand(oldId, newId) {
  try {
    console.log(`🚀 Starting migration from ${oldId} to ${newId}...`);
    
    // 1. Get the old brand document
    const oldDocRef = db.collection('brands').doc(oldId);
    const oldDoc = await oldDocRef.get();
    
    if (!oldDoc.exists) {
      console.log(`❌ Error: Brand document ${oldId} not found.`);
      return;
    }

    const brandData = oldDoc.data();
    // Update name to match the new ID if it wasn't already
    brandData.name = newId; 
    
    // 2. Create the new brand document
    const newDocRef = db.collection('brands').doc(newId);
    await newDocRef.set({
      ...brandData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`✅ Created brand document with ID ${newId}`);

    // 3. Migrate related collections
    const collections = ['draft_replies', 'orders', 'customers', 'conversations', 'leads', 'comments', 'comment_drafts'];
    
    for (const cName of collections) {
      console.log(`🔍 Checking collection: ${cName}...`);
      const snap = await db.collection(cName).where('brandId', '==', oldId).get();
      
      if (snap.empty) {
        console.log(`   No documents to migrate in ${cName}.`);
        continue;
      }

      console.log(`   Found ${snap.size} documents to migrate in ${cName}. Updating...`);
      const batch = db.batch();
      snap.forEach(doc => {
        batch.update(doc.ref, { brandId: newId });
      });
      await batch.commit();
      console.log(`   ✅ Migrated ${snap.size} documents in ${cName}.`);
    }

    // 4. Delete the old brand document (optional but cleaner)
    await oldDocRef.delete();
    console.log(`✅ Deleted old brand document ${oldId}`);

    console.log(`🎉 Migration complete! Brand ${oldId} is now ${newId}.`);

  } catch (e) {
    console.error(`❌ Migration failed: ${e.message}`);
  }
  process.exit(0);
}

// Execute migration
migrateBrand('Azlaan', 'Skinzy');
