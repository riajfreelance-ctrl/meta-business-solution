const { db, serverTimestamp } = require('./services/firestoreService');

const brandId = 'Azlaan';

async function seed() {
  console.log('Seeding demo data for Brand: Azlaan...');
  
  // 1. CLEAR OLD DEMO PRODUCTS (Optional for clean test)
  // const snap = await db.collection('products').where('brandId', '==', brandId).get();
  // for (const doc of snap.docs) await doc.ref.delete();

  // 2. ADD PARENT PRODUCT
  const RoseGold = await db.collection('products').add({
    name: "Vitamin C Serum (Rose Gold)",
    price: "1200",
    offerPrice: "999",
    stock: "In Stock",
    category: "Serum",
    description: "Our premium Rose Gold serum for a deep morning glow. ✨",
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1601049541289-9b1b7abc74a4?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1620917670397-dc71bce6d014?auto=format&fit=crop&q=80&w=600"
    ],
    brandId: brandId,
    createdAt: serverTimestamp()
  });
  console.log('Added Parent Serum ID:', RoseGold.id);

  // 3. ADD VARIANT
  await db.collection('products').add({
    name: "Vitamin C Serum (Crystal White)",
    price: "1200",
    offerPrice: "999",
    stock: "Low Stock",
    category: "Serum",
    description: "The White Crystal edition for sensitive nighttime skin.",
    variantOf: RoseGold.id, // Linked to the parent
    images: [
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=600"
    ],
    brandId: brandId,
    createdAt: serverTimestamp()
  });
  console.log('Added Variant Serum.');

  // 4. ADD STANDALONE
  await db.collection('products').add({
    name: "Deep Hydration Cleanser",
    price: "850",
    offerPrice: "",
    stock: "In Stock",
    category: "Cleanser",
    description: "Gentle cleanser for all skin types. Removes oil and dirt instantly. 🫧",
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600"
    ],
    brandId: brandId,
    createdAt: serverTimestamp()
  });
  console.log('Added Standalone Cleanser.');

  console.log('Demo Data Seeded Successfully! Check Product Hub.');
  process.exit(0);
}

seed().catch(console.error);
