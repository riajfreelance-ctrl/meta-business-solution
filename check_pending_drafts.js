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

async function checkPendingDrafts() {
  console.log('=== Checking Pending Drafts ===\n');
  
  // Check all drafts
  const allDraftsSnap = await db.collection('draft_replies').get();
  console.log(`Total drafts in database: ${allDraftsSnap.size}\n`);
  
  // Check pending drafts
  const pendingSnap = await db.collection('draft_replies').where('status', '==', 'pending').get();
  console.log(`Pending drafts: ${pendingSnap.size}\n`);
  
  if (pendingSnap.size > 0) {
    console.log('--- Pending Drafts ---');
    pendingSnap.forEach(doc => {
      const data = doc.data();
      console.log(`ID: ${doc.id}`);
      console.log(`  Brand: ${data.brandId}`);
      console.log(`  Type: ${data.type}`);
      console.log(`  Keyword: ${data.keyword}`);
      console.log(`  Result: ${data.result}`);
      console.log(`  Status: ${data.status}`);
      console.log(`  Timestamp: ${data.timestamp?.toDate ? data.timestamp.toDate() : 'N/A'}`);
      console.log('---');
    });
  }
  
  // Check brand settings
  console.log('\n=== Checking Brand Settings ===\n');
  const brandsSnap = await db.collection('brands').get();
  brandsSnap.forEach(doc => {
    const data = doc.data();
    console.log(`Brand: ${data.name || doc.id}`);
    console.log(`  ID: ${doc.id}`);
    console.log(`  Learning Mode: ${data.isLearningMode}`);
    console.log(`  Auto HyperIndex: ${data.autoHyperIndex}`);
    console.log('---');
  });
  
  // Check approved drafts
  const approvedSnap = await db.collection('draft_replies').where('status', '==', 'approved').get();
  console.log(`\nApproved drafts: ${approvedSnap.size}`);
  
  // Check history drafts
  const historySnap = await db.collection('draft_replies').where('status', '==', 'history').get();
  console.log(`History drafts: ${historySnap.size}`);
  
  // Check drafts with no status
  const noStatusSnap = await db.collection('draft_replies').get();
  const noStatus = noStatusSnap.docs.filter(d => !d.data().status);
  console.log(`Drafts with no status: ${noStatus.length}`);
  
  process.exit(0);
}

checkPendingDrafts().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
