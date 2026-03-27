const admin = require('firebase-admin');
const { db } = require('./server/services/firestoreService');

console.log('Starting Firestore check...');

async function list() {
  try {
    console.log('Fetching brands collection...');
    const snap = await db.collection('brands').get();
    console.log('Total brands found:', snap.size);
    snap.forEach(doc => {
      console.log('ID:', doc.id);
      console.log('Name:', doc.data().name);
    });
  } catch (e) {
    console.error('Error during fetch:', e.message);
  }
  console.log('Check complete.');
  process.exit(0);
}

list();
