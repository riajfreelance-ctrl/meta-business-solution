/**
 * Quick test to verify Firestore client can read comment_data_center
 */

import { db } from './firebase-client';
import { collection, getDocs } from 'firebase/firestore';

async function testFirestoreConnection() {
  console.log('🧪 Testing Firestore Connection...');
  const start = Date.now();
  
  try {
    console.log('📡 Fetching comment_data_center...');
    const snapshot = await getDocs(collection(db, 'comment_data_center'));
    const elapsed = Date.now() - start;
    
    console.log(`✅ SUCCESS! Fetched ${snapshot.size} documents in ${elapsed}ms`);
    
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n📄 Document ${index + 1}:`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   PostId: ${data.postId}`);
      console.log(`   Questions: ${data.questions?.length || 0}`);
      console.log(`   Total Replies: ${data.questions?.reduce((sum, q) => sum + q.replies.length, 0) || 0}`);
    });
    
    return { success: true, count: snapshot.size, elapsed };
  } catch (error) {
    const elapsed = Date.now() - start;
    console.error(`❌ FAILED after ${elapsed}ms:`, error);
    console.error('Error code:', error?.code);
    console.error('Error message:', error?.message);
    console.error('Full error:', error);
    return { success: false, error: error.message, elapsed };
  }
}

// Run test
testFirestoreConnection().then(result => {
  console.log('\n🏁 Test Result:', result);
  if (result.success) {
    console.log('\n✅ Firestore is working perfectly!');
    console.log('✅ Data Center should load instantly!');
  } else {
    console.log('\n❌ Firestore connection failed!');
    console.log('❌ Check error details above');
  }
});
