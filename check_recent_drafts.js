const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server/.env') });

const serviceAccount = require('./server/firebase-service-account.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

async function checkRecentDrafts() {
  console.log('=== সাম্প্রতিক Drafts চেক করা হচ্ছে ===\n');
  
  // Check Skinzy brand settings
  const brandDoc = await db.collection('brands').doc('Skinzy').get();
  if (brandDoc.exists) {
    const brandData = brandDoc.data();
    console.log('Brand: Skinzy');
    console.log(`  Learning Mode: ${brandData.isLearningMode}`);
    console.log(`  Auto HyperIndex: ${brandData.autoHyperIndex}`);
    console.log('');
  }
  
  // Get ALL drafts for Skinzy
  const allDraftsSnap = await db.collection('draft_replies')
    .where('brandId', '==', 'Skinzy')
    .get();
  
  console.log(`Skinzy-এর মোট drafts: ${allDraftsSnap.size}\n`);
  
  if (allDraftsSnap.size > 0) {
    console.log('--- সকল Drafts (নতুন থেকে পুরনো) ---\n');
    
    // Sort by timestamp in JS
    const drafts = allDraftsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      ts: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : new Date(0)
    }));
    
    drafts.sort((a, b) => b.ts - a.ts);
    
    drafts.slice(0, 10).forEach((draft, idx) => {
      console.log(`${idx + 1}. ID: ${draft.id}`);
      console.log(`   Status: ${draft.status || 'NO STATUS'}`);
      console.log(`   Type: ${draft.type || 'N/A'}`);
      console.log(`   Keyword: "${draft.keyword}"`);
      console.log(`   Result: "${draft.result}"`);
      console.log(`   Time: ${draft.ts.toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })}`);
      console.log('');
    });
  }
  
  // Check recent conversations
  console.log('\n=== সাম্প্রতিক Conversations ===\n');
  const convosSnap = await db.collection('conversations')
    .where('brandId', '==', 'Skinzy')
    .get();
  
  console.log(`মোট conversations: ${convosSnap.size}`);
  
  const convos = convosSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  // Show last 5 with their status
  convos.slice(-5).forEach(convo => {
    console.log(`\nPSID: ${convo.id}`);
    console.log(`  Status: ${convo.status}`);
    console.log(`  Last Message: "${convo.lastMessage}"`);
    console.log(`  Auto Reply Count: ${convo.autoReplyCount || 0}`);
    console.log(`  Moderator Reply Count: ${convo.moderatorReplyCount || 0}`);
  });
  
  process.exit(0);
}

checkRecentDrafts().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
