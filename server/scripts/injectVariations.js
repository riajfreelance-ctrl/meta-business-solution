const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');
if (fs.existsSync(serviceAccountPath)) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccountPath) });
} else {
  admin.initializeApp({ projectId: "advance-automation-8029e" });
}

const db = admin.firestore();

// SEO-Style Variation Dictionary for BD Audience
const variationDictionary = {
  "Greeting": ["hi", "hello", "salam", "assalamu alaikum", "ভাইয়া", "আপু", "slm", "hey", "halo", "help"],
  "Price": ["price", "p?", "dam", "koto", "damm", "dam bolen", "koto tk", "Tk?", "price please", "প্রাইজ", "দাম কত", "কত টাকা", "কি দাম", "how much", "rate?"],
  "Delivery": ["delivery", "charge", "dhaka baire", "home delivery", "ডেলিভারি", "চার্জ", "পাসেল", "dhaka outside", "shipping", "কুরিয়ার", "delivery koto", "charge koto"],
  "Authenticity": ["asol", "original", "copy", "brand", "অরিজিনাল", "আসল", "real", "fake", "authenticity", "verify", "অরিজিনাল তো", "আসল নাকি"],
  "Location": ["shop", "address", "location", "শোরুম", "ঠিকানা", "আউটলেট", "office", "দোকান", "কোথায়", "where is shop", "ম্যাপ"],
  "How to Order": ["order", "how to buy", "অর্ডার", "নিব", "নিতে চাই", "process", "নিয়ম কি", "অর্ডার করার নিয়ম", "অর্ডার কনফার্ম"],
  "COD": ["cash on delivery", "cod", "হাতে পেয়ে টাকা", "ক্যাশ অন ডেলিভারি", "পেমেন্ট সিস্টেম", "হাতে পাওয়ার পর", "পেমেন্ট কীভাবে"],
  "Return": ["return", "exchange", "নষ্ট হলে", "পাল্টানো", "রিটার্ন", "policy", "এক্সেঞ্জ", "ফেরত", "সাইজ না হলে"],
  "Discount": ["discount", "offer", "অফার", "কিছু কমান", "রাখেন", "কম হবে", "কিছু কম রাখেন", "special offer", "ছাড়"],
  "Stock": ["stock", "available", "আছে কি", "এভেইলেবল", "পাব", "stock calculation", "আছে নাকি"],
  "Trust / Fraud": ["trust", "fraud", "বিশ্বাস", "ঠকাবেন না তো", "cheat", "scam", "sure?", "গ্যারান্টি"],
  "Real Product": ["real pic", "লাইভ ছবি", "video", "ভিডিও", "আসলে কেমন", "original pic", "ছবির মত"],
  "Wholesale / Bulk": ["wholesale", "পাইকারি", "বেশি নিলে", "resell", "হোলসেল", "থোক", "রিসেলার"],
  "Urgent Delivery": ["urgent", "জরুরি", "তাড়াতাড়ি", "আজকেই", "fast", "জরুরী", "১ দিনে"],
  "Human / Admin Please": ["admin", "মানুষ", "talk to human", "অ্যাডমিন", "কথা বলতে চাই", "speak", "রিপ্রেজেন্টেটিভ"],
  "Call Back": ["call me", "ফোন দেন", "নম্বর", "নাম্বার", "কথা বলব", "ফোন দিবেন", "কল ব্যাক"],
};

async function inject() {
  console.log('--- 🚀 SEO Variation Injection (Hyper-Indexing) ---');
  let updateCount = 0;

  try {
    const snap = await db.collection('draft_replies').where('brandId', '==', 'Azlaan').get();
    
    for (const doc of snap.docs) {
      const data = doc.data();
      const keyword = data.keyword;
      
      // Find matching dictionary entry
      let newVariations = [...(data.variations || [])];
      
      for (const [key, vars] of Object.entries(variationDictionary)) {
        if (keyword.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(keyword.toLowerCase())) {
          // Merge unique variations
          vars.forEach(v => {
            if (!newVariations.includes(v)) newVariations.push(v);
          });
        }
      }

      if (newVariations.length > (data.variations?.length || 0)) {
        await doc.ref.update({ variations: newVariations });
        console.log(`[INDEXED] ${keyword} | Total Vars: ${newVariations.length}`);
        updateCount++;
      }
    }
  } catch (e) {
    console.error(`[CRITICAL ERROR]: ${e.message}`);
  }
  
  console.log(`--- 🏁 Injection Finished | Updated: ${updateCount} Rules ---`);
  process.exit(0);
}

inject();
