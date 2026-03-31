const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin (using local service account)
const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');

if (fs.existsSync(serviceAccountPath)) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath)
  });
} else {
  // Fallback to project ID
  admin.initializeApp({
    projectId: "advance-automation-8029e"
  });
}

const db = admin.firestore();

const starterPack = [
  {
    keyword: "Greeting",
    variations: ["Hi", "Hello", "সালাম", "কেউ আছেন?", "hi there"],
    result: "ওয়ালাইকুম আসসালাম/নমস্কার! আপনাকে কীভাবে সাহায্য করতে পারি? 😊",
    status: "approved",
    type: "starter_pack",
    brandId: "Skinzy",
    successCount: 0
  },
  {
    keyword: "Price",
    variations: ["দাম কত", "কতো", "P?", "price please", "প্রাইজ"],
    result: "আপনি কোন প্রোডাক্টটির প্রাইজ জানতে চাইছেন? ছবি বা লিংক দিলে আমি সঠিক দামটি বলে দিচ্ছি। 😊",
    status: "approved",
    type: "starter_pack",
    brandId: "Skinzy",
    successCount: 0
  },
  {
    keyword: "Delivery",
    variations: ["ডেলিভারি চার্জ", "চার্জ কত", "ঢাকার বাইরে", "delivery charge"],
    result: "ঢাকা সিটির ভেতরে ডেলিভারি চার্জ ৮০ টাকা এবং ঢাকার বাইরে ১৫০ টাকা। (পুরো টাকা ক্যাশ অন ডেলিভারি) 🚛",
    status: "approved",
    type: "starter_pack",
    brandId: "Skinzy",
    successCount: 0
  },
  {
    keyword: "Authenticity",
    variations: ["আসল তো", "Original?", "অরিজিনাল", "copy?", "নকল"],
    result: "আমাদের সব প্রোডাক্ট ১০০% অরিজিনাল এবং অথেনটিক। আমরা আমাদের কোয়ালিটি নিয়ে কোনো আপোষ করি না। ✨",
    status: "approved",
    type: "starter_pack",
    brandId: "Skinzy",
    successCount: 0
  },
  {
    keyword: "Location",
    variations: ["আপনাদের শপ কই", "শোরুম কোথায়", "আউটলেট", "location", "address"],
    result: "আমাদের বর্তমান শোরুমটি [আপনার লোকেশন] এ অবস্থিত। সপ্তাহের প্রতিদিন সকাল ১০টা থেকে রাত ৮টা পর্যন্ত খোলা থাকে। 📍",
    status: "approved",
    type: "starter_pack",
    brandId: "Skinzy",
    successCount: 0
  },
  {
    keyword: "How to Order",
    variations: ["অর্ডার করব কীভাবে", "How to order?", "process", "অর্ডার করার নিয়ম"],
    result: "অর্ডার করতে আপনার নাম, মোবাইল নম্বর এবং পূর্ণাঙ্গ ঠিকানা (জেলাসহ) এখানে লিখুন। আমাদের প্রতিনিধি শীঘ্রই কনফার্ম করবে। 📦",
    status: "approved",
    type: "starter_pack",
    brandId: "Skinzy",
    successCount: 0
  },
  {
    keyword: "COD",
    variations: ["ক্যাশ অন ডেলিভারি আছে", "হাতে পেয়ে টাকা", "COD?"],
    result: "হ্যাঁ, আমরা সারা বাংলাদেশে ক্যাশ অন ডেলিভারি দিচ্ছি। প্রোডাক্ট হাতে পেয়ে চেক করে টাকা দিতে পারবেন। ✅",
    status: "approved",
    type: "starter_pack",
    brandId: "Skinzy",
    successCount: 0
  },
  {
    keyword: "Return",
    variations: ["নষ্ট হলে কি হবে", "Return কি হবে", "পাল্টানো যাবে?"],
    result: "প্রোডাক্টে কোনো সমস্যা থাকলে ডেলিভারি ম্যানের সামনেই চেক করে রিটার্ন করতে পারবেন। পরবর্তী ৭ দিনের মধ্যে এক্সচেঞ্জ সুবিধা রয়েছে। 🔄",
    status: "approved",
    type: "starter_pack",
    brandId: "Skinzy",
    successCount: 0
  },
  {
    keyword: "Discount",
    variations: ["ডিসকাউন্ট আছে", "কিছু কমান", "discount?", "offer?"],
    result: "আমাদের এই প্রোডাক্টগুলো অলরেডি সেরা দামে দিচ্ছি। তবে বড় অর্ডারের ক্ষেত্রে আমরা বিশেষ গিফট বা ফ্রি ডেলিভারি দিয়ে থাকি। 🎁",
    status: "approved",
    type: "starter_pack",
    brandId: "Skinzy",
    successCount: 0
  },
  {
    keyword: "Stock",
    variations: ["স্টক আছে", "এভেইলেবল?", "stock?", "আছে কি?"],
    result: "জি, বর্তমান আমাদের কাছে স্টক এভেইলেবল আছে। আপনি চাইলে এখনই অর্ডার কনফার্ম করতে পারেন স্টক ফুরানোর আগে। ⏳",
    status: "approved",
    type: "starter_pack",
    brandId: "Skinzy",
    successCount: 0
  }
];

async function seed() {
  console.log('--- Seeding BD Starter Pack ---');
  for (const item of starterPack) {
    try {
      const q = await db.collection('draft_replies')
        .where('brandId', '==', item.brandId)
        .where('keyword', '==', item.keyword)
        .get();
      
      if (q.empty) {
        await db.collection('draft_replies').add({
          ...item,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`[ADDED] ${item.keyword}`);
      } else {
        console.log(`[EXISTS] ${item.keyword} - skipping`);
      }
    } catch (e) {
      console.error(`[ERROR] ${item.keyword}: ${e.message}`);
    }
  }
  console.log('--- Seeding Finished ---');
  process.exit(0);
}

seed();
