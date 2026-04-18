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

async function findSpecificConversation() {
  console.log('=== "এটি আমাদের প্রডাক্ট নয় স্যার" রিপ্লাই খোঁজা হচ্ছে ===\n');
  
  // Get all conversations for Skinzy
  const convosSnap = await db.collection('conversations')
    .where('brandId', '==', 'Skinzy')
    .get();
  
  for (const convoDoc of convosSnap.docs) {
    const convoId = convoDoc.id;
    
    // Check messages for the moderator reply
    const messagesSnap = await db.collection(`conversations/${convoId}/messages`)
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();
    
    const hasTargetReply = messagesSnap.docs.some(d => {
      const text = d.data().text || '';
      return text.includes('আমাদের প্রডাক্ট নয়');
    });
    
    if (hasTargetReply) {
      console.log(`✅ Conversation Found: ${convoId}\n`);
      
      console.log('--- All Messages (newest first) ---\n');
      messagesSnap.docs.forEach((msgDoc, idx) => {
        const msg = msgDoc.data();
        const type = msg.isModeratorReply ? '🟢 MODERATOR' : (msg.type === 'sent' ? '🔵 BOT SENT' : '⚪ CUSTOMER');
        const time = msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' }) : 'N/A';
        
        console.log(`${idx + 1}. ${type}`);
        console.log(`   "${msg.text}"`);
        console.log(`   Time: ${time}`);
        console.log('');
      });
      
      // Check if customer message exists
      const customerMessages = messagesSnap.docs.filter(d => d.data().type === 'received' && d.data().text);
      
      if (customerMessages.length === 0) {
        console.log('\n❌ সমস্যা: Customer-এর কোনো মেসেজ save নেই!');
        console.log('   তাই draft তৈরি হয়নি।');
      } else {
        console.log(`\n✅ Customer messages found: ${customerMessages.length}`);
      }
      
      break;
    }
  }
  
  process.exit(0);
}

findSpecificConversation().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
