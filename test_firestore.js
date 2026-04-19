// Quick diagnostic script to test Firestore connectivity
import { db } from './client/src/firebase-client.js';
import { collection, getDocs, query, where } from 'firebase/firestore';

async function testFirestore() {
  console.log('=== FIRESTORE DIAGNOSTIC TEST ===');
  
  try {
    // Test 1: Check if we can access brands collection
    console.log('\n1. Testing brands collection...');
    const brandsSnap = await getDocs(collection(db, "brands"));
    console.log('✅ Brands accessible:', brandsSnap.docs.length, 'brands found');
    brandsSnap.docs.forEach(doc => {
      console.log('  - Brand:', doc.id, doc.data().name || 'No name');
    });
    
    if (brandsSnap.docs.length > 0) {
      const testBrandId = brandsSnap.docs[0].id;
      console.log('\n2. Testing collections for brandId:', testBrandId);
      
      // Test other collections
      const collections = [
        'products',
        'conversations', 
        'knowledge_base',
        'draft_replies',
        'knowledge_gaps',
        'orders',
        'comment_drafts',
        'pending_comments'
      ];
      
      for (const col of collections) {
        try {
          const q = query(collection(db, col), where("brandId", "==", testBrandId));
          const snap = await getDocs(q);
          console.log(`✅ ${col}:`, snap.docs.length, 'documents');
        } catch (err) {
          console.error(`❌ ${col}:`, err.message);
        }
      }
    }
    
    console.log('\n=== DIAGNOSTIC COMPLETE ===');
  } catch (error) {
    console.error('❌ FIRESTORE ERROR:', error);
    console.error('Error details:', error.code, error.message);
  }
}

testFirestore();
