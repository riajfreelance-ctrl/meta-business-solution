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

async function fullSystemCheck() {
  console.log('🔍 ======================================\n');
  console.log('   পূর্ণ সিস্টেম চেক - Draft Creation\n');
  console.log('======================================\n');
  
  // ১. Brand Settings চেক
  console.log('📌 ধাপ ১: Brand Settings চেক\n');
  const brandDoc = await db.collection('brands').doc('Skinzy').get();
  if (brandDoc.exists) {
    const brandData = brandDoc.data();
    console.log(`Brand: Skinzy`);
    console.log(`  ✅ Learning Mode: ${brandData.isLearningMode ? 'ON' : 'OFF'}`);
    console.log(`  ✅ Auto HyperIndex: ${brandData.autoHyperIndex !== false ? 'ON' : 'OFF'}`);
    console.log('');
    
    if (!brandData.isLearningMode) {
      console.log('❌ সমস্যা: Learning Mode OFF আছে!');
      console.log('   সমাধান: Dashboard থেকে Learning Mode ON করুন\n');
    }
  }
  
  // ২. Recent Conversations চেক
  console.log('📌 ধাপ ২: Recent Conversations চেক\n');
  const convosSnap = await db.collection('conversations')
    .where('brandId', '==', 'Skinzy')
    .get();
  
  console.log(`মোট conversations: ${convosSnap.size}\n`);
  
  let foundModeratorReply = false;
  
  for (const convoDoc of convosSnap.docs) {
    const convoId = convoDoc.id;
    const convoData = convoDoc.data();
    
    // Get messages
    const messagesSnap = await db.collection(`conversations/${convoId}/messages`)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();
    
    const messages = messagesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Check for moderator reply
    const moderatorReplies = messages.filter(m => m.isModeratorReply === true);
    
    if (moderatorReplies.length > 0) {
      foundModeratorReply = true;
      console.log(`\n💬 Conversation: ${convoId}`);
      console.log(`   Moderator Reply Count: ${convoData.moderatorReplyCount || 0}`);
      console.log(`   Status: ${convoData.status || 'N/A'}`);
      console.log('');
      
      // Show last 5 messages
      console.log('   সাম্প্রতিক মেসেজসমূহ:');
      messages.slice(0, 5).forEach((msg, idx) => {
        const type = msg.isModeratorReply ? '🟢 MODERATOR' : (msg.type === 'sent' ? '🔵 BOT' : '⚪ CUSTOMER');
        const time = msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString('bn-BD', { timeZone: 'Asia/Dhaka' }) : 'N/A';
        console.log(`   ${idx + 1}. ${type} [${time}]`);
        console.log(`      "${msg.text}"`);
      });
      console.log('');
      
      // Check if customer message exists
      const customerMessages = messages.filter(m => m.type === 'received' && m.text && m.text.length > 2);
      
      if (customerMessages.length === 0) {
        console.log('   ❌ সমস্যা: Customer-এর মেসেজ save নেই (অথবা ২ অক্ষরের কম)');
        console.log('   তাই draft তৈরি হয়নি!\n');
      } else {
        console.log(`   ✅ Customer message পাওয়া গেছে: ${customerMessages.length} টি`);
        console.log(`   Keyword হবে: "${customerMessages[0].text}"\n`);
      }
    }
  }
  
  if (!foundModeratorReply) {
    console.log('❌ কোনো moderator reply পাওয়া যায়নি!');
    console.log('   আপনি কি Dashboard থেকে রিপ্লাই দিয়েছেন?\n');
  }
  
  // ৩. Drafts চেক
  console.log('📌 ধাপ ৩: Drafts Status চেক\n');
  const allDraftsSnap = await db.collection('draft_replies')
    .where('brandId', '==', 'Skinzy')
    .get();
  
  const drafts = allDraftsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const pending = drafts.filter(d => d.status === 'pending');
  const approved = drafts.filter(d => d.status === 'approved');
  const history = drafts.filter(d => d.status === 'history');
  const noStatus = drafts.filter(d => !d.status);
  
  console.log(`মোট drafts: ${drafts.length}`);
  console.log(`  ⏳ Pending: ${pending.length}`);
  console.log(`  ✅ Approved: ${approved.length}`);
  console.log(`  📚 History: ${history.length}`);
  console.log(`  ❓ No Status: ${noStatus.length}\n`);
  
  // ৪. Test: Manual draft creation check
  console.log('📌 ধাপ ৪: Draft Creation Logic Test\n');
  
  // Check the blacklist
  const blacklist = ['হাঁ', 'না', 'হ্যাঁ', 'ok', 'hm', 'hmm', 'yes', 'no', 'okey', 'thx', 'ty', 'thanks', 'ধন্যবাদ'];
  const fillers = ['ji', 'g', 'ji bhai', 'g bhai', 'acha', 'accha', 'thik ace', 'thik ache', 'ok', 'okay'];
  
  console.log('Blacklist Words:', blacklist.join(', '));
  console.log('Filler Words:', fillers.join(', '));
  console.log('');
  
  // ৫. Final Summary
  console.log('\n======================================');
  console.log('   📊 চূড়ান্ত সারাংশ');
  console.log('======================================\n');
  
  if (pending.length > 0) {
    console.log('✅ Pending drafts আছে!');
    console.log(`   সংখ্যা: ${pending.length}`);
    console.log('');
    pending.slice(0, 3).forEach((draft, idx) => {
      console.log(`${idx + 1}. Keyword: "${draft.keyword}"`);
      console.log(`   Result: "${draft.result}"`);
      console.log(`   Type: ${draft.type}`);
      console.log('');
    });
  } else {
    console.log('❌ Pending drafts নেই\n');
    console.log('সম্ভাব্য কারণসমূহ:');
    console.log('');
    
    if (!brandDoc.data()?.isLearningMode) {
      console.log('১. ❌ Learning Mode OFF আছে');
      console.log('   → Dashboard থেকে ON করুন\n');
    }
    
    if (!foundModeratorReply) {
      console.log('২. ❌ কোনো moderator reply পাওয়া যায়নি');
      console.log('   → Dashboard থেকে কোনো conversation-এ রিপ্লাই দিন\n');
    }
    
    console.log('৩. ⚠️ Moderator reply blacklist-এ থাকতে পারে');
    console.log('   → দীর্ঘ, অর্থবহ রিপ্লাই দিন (যেমন: "আপনার প্রশ্নের উত্তর হলো...")\n');
    
    console.log('৪. ⚠️ Customer message ২ অক্ষরের কম হতে পারে');
    console.log('   → Customer যেন কমপক্ষে ৩ অক্ষরের মেসেজ দেয়\n');
    
    console.log('৫. ⚠️ Server restart প্রয়োজন হতে পারে');
    console.log('   → Server restart দিন\n');
  }
  
  process.exit(0);
}

fullSystemCheck().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
