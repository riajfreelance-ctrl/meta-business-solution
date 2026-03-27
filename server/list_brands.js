const admin = require('firebase-admin');
const { db } = require('./services/firestoreService');

console.log('Starting Firestore check from server directory...');

async function list() {
  try {
    console.log('Fetching brands collection...');
    const snap = await db.collection('brands').get();
    console.log('Total brands found:', snap.size);
    snap.forEach(doc => {
      console.log('ID:', doc.id);
      console.log('Name:', doc.data().name);
      console.log('fbPageId:', doc.data().facebookPageId);
      console.log('fbPageToken:', doc.data().fbPageToken ? 'PRESENT' : 'MISSING');
    });
  } catch (e) {
    console.error('Error during fetch:', e.message);
  }
  console.log('Check complete.');
  process.exit(0);
}

list();
