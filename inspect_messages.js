
const { db } = require('./server/services/firestoreService');

async function inspect() {
  const snapshot = await db.collection('conversations').where('name', '>=', 'Riajul').get();
  if (snapshot.empty) {
    console.log("No convo found with name Riajul");
    return;
  }

  for (const doc of snapshot.docs) {
    const data = doc.data();
    console.log(`--- Conversation: ${data.name} (ID: ${doc.id}) ---`);
    const msgSnap = await db.collection(`conversations/${doc.id}/messages`).orderBy('timestamp', 'desc').limit(10).get();
    msgSnap.docs.reverse().forEach(m => {
      const md = m.data();
      console.log(`[${md.type}] ${md.text} | Timestamp: ${md.timestamp?.constructor?.name || typeof md.timestamp} | Value: ${JSON.stringify(md.timestamp)}`);
    });
  }
}

inspect().then(() => process.exit());
