const { db } = require('./services/firestoreService');
async function fix() {
  const snap = await db.collection('brands').where('facebookPageId', '==', '963307416870090').get();
  if (snap.empty) { console.log('Skinzy not found!'); process.exit(1); }
  const doc = snap.docs[0];
  await db.collection('brands').doc(doc.id).update({ autoReply: true });
  console.log('✅ Skinzy autoReply: true — Done!');
  process.exit();
}
fix().catch(e => { console.error(e.message); process.exit(1); });
