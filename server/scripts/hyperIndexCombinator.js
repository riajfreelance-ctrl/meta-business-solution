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

// 👑 COMBINATORIAL ENGINE CONFIG 👑
const prefixes = ["", "bhai", "aphu", "admin", "hey", "ei", "hello", "ey", "ji", "ভাই", "আপু", "ভাইয়া", "অ্যাডমিন"];
const suffixes = ["", "bolen", "den", "den plz", "bolun plz", "ache?", "pabo?", "ki", "বলেন", "দাও", "দেন", "পাব", "হবে"];

const coreKeywordMap = {
  "Greeting": ["hi", "hello", "salam", "slm", "hey", "সালাম"],
  "Price": ["price", "dam", "p?", "tk", "taka", "koto", "damm", "প্রাইজ", "দাম", "টাকা"],
  "Delivery": ["delivery", "charge", "dhaka baire", "home delivery", "ডেলিভারি", "চার্জ", "পাসেল"],
  "Authenticity": ["asol", "original", "copy", "brand", "real", "fake", "অরিজিনাল", "আসল"],
  "Location": ["shop", "address", "location", "শোরুম", "ঠিকানা", "আউটলেট", "office", "দোকান"],
  "How to Order": ["order", "buy", "অর্ডার", "নিব", "নিতে চাই", "process", "নিয়ম"],
  "COD": ["cash on delivery", "cod", "হাতে পেয়ে টাকা", "ক্যাশ অন ডেলিভারি", "পেমেন্ট"],
  "Return": ["return", "exchange", "নষ্ট হলে", "পাল্টানো", "রিটার্ন", "এক্সেঞ্জ"],
  "Discount": ["discount", "offer", "অফার", "কম", "রাখেন", "ছাড়", "কম হবে"],
  "Stock": ["stock", "available", "আছে কি", "এভেইলেবল", "পাব", "আছে নাকি"],
  "Trust": ["trust", "fraud", "বিশ্বাস", "ঠকাবেন না", "cheat", "scam", "গ্যারান্টি"],
  "Real Product": ["real pic", "লাইভ ছবি", "video", "ভিডিও", "আসলে কেমন", "original pic"],
  "Wholesale": ["wholesale", "পাইকারি", "বেশি নিলে", "resell", "হোলসেল", "রিসেলার"],
  "Urgent": ["urgent", "জরুরি", "তাড়াতাড়ি", "আজকেই", "fast", "১ দিনে"],
  "Human": ["admin", "মানুষ", "talk to human", "অ্যাডমিন", "কথা বলতে চাই", "speak"],
  "Call Back": ["call me", "ফোন দেন", "নম্বর", "নাম্বার", "কথা বলব", "কল ব্যাক"],
};

function generateVariations(cores) {
  const result = new Set();
  cores.forEach(core => {
    prefixes.forEach(pre => {
      suffixes.forEach(suf => {
        const combined = `${pre} ${core} ${suf}`.trim();
        result.add(combined);
      });
    });
  });
  return Array.from(result);
}

async function hyperIndex() {
  console.log('--- 🛡️ Universal Hyper-Indexing Engine (Combinatorial) ---');
  let totalAdded = 0;

  try {
    const snap = await db.collection('draft_replies').where('brandId', '==', 'Azlaan').get();
    
    for (const doc of snap.docs) {
      const data = doc.data();
      const keyword = data.keyword;
      
      // Find matching core keywords
      let cores = [];
      for (const [key, coreList] of Object.entries(coreKeywordMap)) {
        if (keyword.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(keyword.toLowerCase())) {
          cores = coreList;
          break;
        }
      }

      if (cores.length > 0) {
        const generated = generateVariations(cores);
        const currentVars = data.variations || [];
        const merged = Array.from(new Set([...currentVars, ...generated]));
        
        // Limit to 200 variations to avoid search bloat
        const limited = merged.slice(0, 200);

        await doc.ref.update({ variations: limited });
        console.log(`[HYPER-INDEXED] ${keyword} | Vars: ${limited.length}`);
        totalAdded += (limited.length - currentVars.length);
      }
    }
  } catch (e) {
    console.error(`[ERROR]: ${e.message}`);
  }
  
  console.log(`--- 🏁 Finished | Added ${totalAdded} New Linguistic Patterns ---`);
  process.exit(0);
}

hyperIndex();
