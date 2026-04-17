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

async function fixBrands() {
  const snapshot = await db.collection('brands').get();
  const brands = [];
  snapshot.forEach(doc => {
    brands.push({ id: doc.id, ...doc.data() });
  });

  console.log("Current Brands in Firestore:");
  brands.forEach(b => {
    console.log(`- ID: ${b.id}, Name: ${b.name}, CreatedAt: ${b.createdAt ? b.createdAt.toDate().toISOString() : 'N/A'}`);
  });

  // Sort by createdAt to find the latest one
  const sorted = brands.filter(b => b.createdAt).sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  
  if (sorted.length > 0) {
    const latest = sorted[0];
    if (latest.name === 'Orgaa Food' || latest.name.includes('Orgaa')) {
      console.log(`\nDeleting newest brand: ${latest.name} (ID: ${latest.id})`);
      await db.collection('brands').doc(latest.id).delete();
    }
  }

  // Find any brand that has ID contains 'Skinzy' or was previously Skinzy
  // The user says "skinzy er name o orgaa food name a hoye geche"
  // Let's look for "Orgaa Food" which is NOT the newest one and maybe has ID 'Skinzy'
  for (const b of brands) {
    if (b.id === 'Skinzy' && b.name !== 'Skinzy') {
      console.log(`\nRenaming brand ID 'Skinzy' back to 'Skinzy' (current name: ${b.name})`);
      await db.collection('brands').doc(b.id).update({ name: 'Skinzy' });
    }
    // Check if rS6MilMuUNkwJ4xGSSZn or 2VPaon5DupvrB38kHXNo was meant to be Skinzy
    // Usually the user has a brand with ID 'Skinzy' for the main one.
  }

  console.log("\nCleanup Complete.");
  process.exit(0);
}

fixBrands();
