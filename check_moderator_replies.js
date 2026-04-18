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

async function checkModeratorReplies() {
  console.log('=== Moderator Replies চেক করা হচ্ছে ===\n');
  
  // Get all conversations for Skinzy
  const convosSnap = await db.collection('conversations')
    .where('brandId', '==', 'Skinzy')
    .get();
  
  console.log(`মোট conversations: ${convosSnap.size}\n`);
  
  for (const convoDoc of convosSnap.docs) {
    const convoId = convoDoc.id;
    const convoData = convoDoc.data();
    
    // Check messages subcollection
    const messagesSnap = await db.collection(`conversations/${convoId}/messages`)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();
    
    const hasModeratorReply = messagesSnap.docs.some(d => d.data().isModeratorReply === true);
    
    if (hasModeratorReply) {
      console.log(`\n✅ Conversation: ${convoId}`);
      console.log(`   Moderator Reply Count: ${convoData.moderatorReplyCount || 0}`);
      console.log(`   Last Message: "${convoData.lastMessage}"\n`);
      
      console.log('   Recent Messages:');
      messagesSnap.docs.slice(0, 5).forEach(msgDoc => {
        const msg = msgDoc.data();
        const type = msg.isModeratorReply ? '🟢 MODERATOR' : (msg.type === 'sent' ? '🔵 SENT' : '⚪ RECEIVED');
        console.log(`   ${type}: "${msg.text}"`);
      });
      console.log('');
    }
  }
  
  console.log('\n=== ডাটাবেসে মোট moderator রিপ্লাই ===\n');
  
  // Count all messages with isModeratorReply = true
  let totalModeratorReplies = 0;
  for (const convoDoc of convosSnap.docs) {
    const convoId = convoDoc.id;
    const messagesSnap = await db.collection(`conversations/${convoId}/messages`)
      .where('isModeratorReply', '==', true)
      .get();
    totalModeratorReplies += messagesSnap.size;
  }
  
  console.log(`মোট moderator replies: ${totalModeratorReplies}`);
  
  process.exit(0);
}

checkModeratorReplies().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
