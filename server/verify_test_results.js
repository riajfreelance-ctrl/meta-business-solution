const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const serviceAccount = require('./firebase-service-account.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

async function verifyResponses() {
  console.log('--- 🔎 Verifying Bot Responses for TEST_USER_PSID ---');
  // Fetch messages without orderBy to avoid index requirement
  const messagesSnap = await db.collection('conversations').doc('TEST_USER_PSID').collection('messages').get();

  const messages = messagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  // Sort by timestamp in JS
  messages.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

  messages.slice(0, 5).forEach(msg => {
    console.log(`[${msg.type.toUpperCase()}] ${msg.text}`);
  });

  console.log('\n--- 🔎 Verifying Comment Responses ---');
  // Fetch comments for 'Test User' without composite orderBy
  const commentsSnap = await db.collection('comments').where('sender_name', '==', 'Test User').get();
  const comments = commentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  comments.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

  comments.slice(0, 2).forEach(cmt => {
    console.log(`[COMMENT] User: ${cmt.message} -> Reply: ${cmt.reply}`);
  });

  process.exit(0);
}

verifyResponses();
