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

const godModePack = [
  // --- 1. S-TIER SALES & CONVERSION ---
  { keyword: "Why Buy From Us", variations: ["কেন নিব", "কি সুবিধা", "best quality?", "specialty"], result: "আমরা কেবল প্রোডাক্ট বিক্রি করি না, আমরা কোয়ালিটি নিশ্চিত করি। আমাদের ৩-লেয়ার কোয়ালিটি চেক এবং ৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি আপনাকে সব সময় টেনশন-ফ্রি রাখবে। এছাড়া আমাদের প্রতিটি প্রোডাক্ট সরাসরি ইমপোর্টার থেকে সংগৃহীত। 💎✨", status: "approved", type: "god_mode", brandId: "Azlaan", successCount: 0 },
  { keyword: "Comparison", variations: ["অন্যরা কম দিচ্ছে", "price high", "বেশি দাম কেন", "cheap options"], result: "বাজারে কম দামে অনেক কপি প্রোডাক্ট থাকতে পারে, কিন্তু আমরা আমাদের দীর্ঘমেয়াদী স্থায়িত্ব এবং প্রিমিয়াম ফিনিশিংয়ের নিশ্চয়তা দেই। আমাদের প্রোডাক্ট একবার ব্যবহার করলেই আপনি পার্থক্য বুঝতে পারবেন। ভালো জিনিসের দাম একটু বেশি হবেই! 😉", status: "approved", type: "god_mode", brandId: "Azlaan", successCount: 0 },
  { keyword: "Urgency / Stock Out", variations: ["তাড়াতাড়ি চাই", "শেষ হয়ে যাবে", "fast order", "stock out"], result: "আমাদের এই প্রোডাক্টটি এখন সুপার ডিমান্ডে আছে এবং খুব দ্রুত স্টক ফুরিয়ে যাচ্ছে। আপনি যদি আজকেই অর্ডার কনফার্ম করেন, তবে আমরা আপনার জন্য একটি পিস আলাদা করে রাখতে পারব। এখনই লুফে নিন! ⏳🔥", status: "approved", type: "god_mode", brandId: "Azlaan", successCount: 0 },

  // --- 2. CULTURAL & SENTIMENT HANDLING ---
  { keyword: "Friendly / Casual", variations: ["ভাই কেমন আছ", "ব্রো", "brother", "কেমন আছেন"], result: "আলহামদুলিল্লাহ ভাইয়া, অনেক ভালো আছি! আপনি কেমন আছেন? আপনাকে কীভাবে সাহায্য করতে পারি বলুন। 😊🤝", status: "approved", type: "god_mode_cultural", brandId: "Azlaan", successCount: 0 },
  { keyword: "Bargaining (Low Offer)", variations: ["একটু কমান", "রাখা যায় না", "কম হবে", "কিছু রাখেন", "discount details"], result: "আমরা অলরেডি আমাদের হোলসেল প্রাইসেই রিটেইল দিচ্ছি ভাইয়া। বিশ্বাস করুন, এর চেয়ে কমে দিলে আমাদের লস হয়ে যাবে। তবে আপনি যদি ২টি বা তার বেশি প্রোডাক্ট নেন, তবে আমরা 'ফ্রি ডেলিভারি'র বিষয়টি ভেবে দেখতে পারি। 💖💸", status: "approved", type: "god_mode_cultural", brandId: "Azlaan", successCount: 0 },
  { keyword: "Aggressive / Angry", variations: ["এত দেরি কেন", "ফালতু সার্ভিস", "বাজে পেজ", "দেরি হচ্ছে"], result: "আন্তরিকভাবে দুঃখিত আপনার অনাকাঙ্ক্ষিত অভিজ্ঞতার জন্য। 🙏 আমরা আপনার বিষয়টি অত্যন্ত গুরুত্বের সাথে দেখছি। দয়া করে আপনার অর্ডার নম্বরটি দিন, আমি এখনই ব্যক্তিগতভাবে চেক করে আপনাকে ১ ঘণ্টার মধ্যে আপডেট জানাচ্ছি।", status: "approved", type: "god_mode_sentiment", brandId: "Azlaan", successCount: 0 },

  // --- 3. ANTI-FRAUD & VERIFICATION ---
  { keyword: "Payment Verification", variations: ["টাকা পাঠাইছি", "sent money", "পেমেন্ট ডান", "screenshot"], result: "ধন্যবাদ! আপনার ট্রানজেকশন আইডি বা স্ক্রিনশটটি দয়া করে এখানে দিন। আমাদের একাউন্টস টিম ভেরিফাই করার সাথে সাথেই আমরা আপনার অর্ডারটি প্রসেসিংয়ে পাঠিয়ে দিচ্ছি। 💳🛡️", status: "approved", type: "god_mode_security", brandId: "Azlaan", successCount: 0 },
  { keyword: "Scam Warning", variations: ["ফেক পেজ নাকি", "আগের বার ধরা খাইছি", "fake news", "scammer detection"], result: "আমরা সচেতনতার সাথে জানাচ্ছি যে, আমরা কখনোই ইনবক্স ছাড়া অন্য কোথাও কাস্টমারকে পেমেন্ট করতে বলি না। আমাদের অফিশিয়াল নম্বর [নম্বর] ছাড়া অন্য কোথাও টাকা পাঠাবেন না। আমরা একটি ভেরিফাইড বিজনেস। 🛡️🚨", status: "approved", type: "god_mode_security", brandId: "Azlaan", successCount: 0 },

  // --- 4. CATEGORY INTELLIGENCE (Electronics / Gadgets) ---
  { keyword: "Gadget Warranty", variations: ["ওয়ারেন্টি আছে", "garanti", "warranty duration", "service"], result: "জি, এই প্রোডাক্টটির সাথে আমরা [সময়] মাসের ল্যাক্টরি রিপ্লেসমেন্ট ওয়ারেন্টি এবং ২ বছরের সার্ভিস ওয়ারেন্টি দিচ্ছি। ওয়ারেন্টি কার্ডটি বক্সের সাথেই পাবেন। 📱🔌", status: "approved", type: "god_mode_product", brandId: "Azlaan", successCount: 0 },
  { keyword: "Battery Life", variations: ["চার্জ থাকে কতক্ষণ", "battery backup", "কত এমএএইচ", "backup test"], result: "এই গ্যাজেটটিতে হাই-ক্যাপাসিটি ব্যাটারি ব্যবহার করা হয়েছে যা একনাগাড়ে [সময়] ঘণ্টা ব্যাকআপ দিতে সক্ষম। নরমাল ব্যবহারে এটি ১-২ দিন অনায়াসেই চলে যাবে। 🔋⚡", status: "approved", type: "god_mode_product", brandId: "Azlaan", successCount: 0 },

  // --- 5. CATEGORY INTELLIGENCE (Fashion / Apparel) ---
  { keyword: "Fabric Type", variations: ["কি কাপড়", "কটন নাকি", "গরম লাগবে", "fabric quality"], result: "এটি ১০০% প্রিমিয়াম সুতি (Cotton) কাপড় দিয়ে তৈরি। অনেক আরামদায়ক এবং বিশেষ করে বাংলাদেশের গরমের জন্য পারফেক্ট। এর রং গ্যারান্টিড, ধোয়ার পর উঠবে না। 👕🌿", status: "approved", type: "god_mode_product", brandId: "Azlaan", successCount: 0 },
  { keyword: "Color Matching", variations: ["কালার একই হবে তো", "রং সেম পাব", "color accuracy"], result: "ছবিগুলো স্টুডিও লাইটে তোলা, তাই বাস্তব আলোতে সামান্য ৫-১০% এদিক সেদিক হতে পারে। তবে আমরা গ্যারান্টি দিচ্ছি যে আপনি আপনার কাঙ্ক্ষিত কালারটিই পাবেন। 🎨👗", status: "approved", type: "god_mode_product", brandId: "Azlaan", successCount: 0 },

  // --- 6. ADVANCED LOGISTICS ---
  { keyword: "Village Delivery", variations: ["গ্রামে কি দিবেন", "থানায় আসবে", "village delivery", "interior"], result: "জি, আমরা সারা বাংলাদেশের সব থানায় হোম ডেলিভারি দিচ্ছি। তবে একদম গ্রামীণ দুর্গম এলাকায় কাস্টমারকে নিকটস্থ সুন্দরবন বা এসএ পরিবহন অফিস থেকে পার্সেলটি রিসিভ করতে হতে পারে। 🚛🏞️", status: "approved", type: "god_mode_logistics", brandId: "Azlaan", successCount: 0 },
  { keyword: "Tracking Issues", variations: ["পার্সেল কই", "ট্র্যাকিং আপডেট", "tracking code please", "code missing"], result: "আপনার পার্সেলটি বর্তমানে কুরিয়ারের পোর্টালে আছে। আপনার ট্র্যাকিং কোডটি হলো: [কোড]। আপনি [কুরিয়ার নাম] এর ওয়েবসাইট থেকে এটি ট্র্যাক করতে পারবেন। কোনো সমস্যা হলে আমাদের জানান। 📦🔍", status: "approved", type: "god_mode_logistics", brandId: "Azlaan", successCount: 0 },

  // --- 7. BUSINESS GROWTH & EXPANSION ---
  { keyword: "Collaborate / PR", variations: ["প্রমোশন করতে চাই", "PR offer", "influencer", "পার্টনারশিপ"], result: "আমরা সবসময় নতুন কন্টেন্ট ক্রিয়েটর এবং ইনফ্লুয়েন্সারদের সাথে কাজ করতে আগ্রহী। দয়া করে আপনার সোশ্যাল মিডিয়া লিংক এবং ডিটেইলস প্রোফাইল আমাদের ইনবক্সে দিন। আমাদের মার্কেটিং টিম আপনার সাথে যোগাযোগ করবে। 📸🤝", status: "approved", type: "god_mode_biz", brandId: "Azlaan", successCount: 0 },
  { keyword: "Investors", variations: ["ইনভেস্ট করতে চাই", "investment proposal", "funding"], result: "আমাদের ব্র্যান্ডটি দ্রুত বড় হচ্ছে এবং আমরা নতুন বিনিয়োগকারীদের স্বাগত জানাই। দয়া করে আপনার প্রস্তাবটি আমাদের ইমেইল [ইমেইল] এ পাঠান, আমাদের ম্যানেজমেন্ট আপনার সাথে পার্সোনালি যোগাযোগ করবে। 📈🏢", status: "approved", type: "god_mode_biz", brandId: "Azlaan", successCount: 0 },

  // --- 8. HUMAN HANDOVER & CUSTOMER CARE ---
  { keyword: "Manager Please", variations: ["ম্যানেজার চাই", "কথা বলব বড় কেউ", "official talk", "head office"], result: "আমি বিষয়টি আমাদের ডিউটি ম্যানেজারের কাছে ফরওয়ার্ড করছি। তারা কিছুক্ষণের মধ্যেই আপনার ইনবক্সে বিস্তারিত কথা বলবেন। আপনার সমস্যার সমাধান আমাদের কাছে সর্বোচ্চ অগ্রাধিকার। 🫡👤", status: "approved", type: "human_trigger", brandId: "Azlaan", successCount: 0 },
  { keyword: "Address Change", variations: ["ঠিকানা ভুল দিছি", "change address", "location update", "মোবাইল নাম্বার ভুল"], result: "চিন্তা করবেন না! দয়া করে আপনার সঠিক ঠিকানা বা মোবাইল নম্বরটি এখনি এখানে লিখে দিন। পার্সেলটি কুরিয়ারে যাওয়ার আগে আমরা এটি আপডেট করে দিচ্ছি। ✍️📦", status: "approved", type: "god_mode_service", brandId: "Azlaan", successCount: 0 },

  // --- 9. POST-SALES DELIGHT ---
  { keyword: "How to use", variations: ["ব্যবহারের নিয়ম", "কিভাবে চালাব", "manual guide", "usage instructions"], result: "প্রোডাক্টটির সাথে একটি ইউজার ম্যানুয়াল দেওয়া আছে। এছাড়া আপনি আমাদের ইউটিউব চ্যানেলের এই ভিডিওটি [লিংক] দেখতে পারেন যা আপনাকে খুব সহজে ব্যবহার শিখিয়ে দেবে। 📖🎥", status: "approved", type: "god_mode_service", brandId: "Azlaan", successCount: 0 },
  { keyword: "Birthday Gift Order", variations: ["জন্মদিনের গিফট", "মেসেজ লিখা যাবে", "gift wrap", "birthday wish"], result: "অবশ্যই! আমরা গিফট প্যাক করে দিতে পারি এবং ছোট একটি উইশ কার্ডও ফ্রি দিয়ে দেব। আপনি আপনার মেসেজটি লিখে দিন, আমরা তা সুন্দর করে লিখে পার্সেলে যোগ করে দিব। 🎂🎁", status: "approved", type: "god_mode_service", brandId: "Azlaan", successCount: 0 },

  // --- 10. SCALING & SEO LOGIC (Common Search Intents) ---
  { keyword: "Offers / Sales", variations: ["অফার কি আছে", "discount news", "আজকের ডিল", "sale info"], result: "বর্তমানে আমাদের এই মাসের বিশেষ অফারটি চলছে—'বাই ২ গেট ১ ফ্রি!' এছাড়াও ৫০০০ টাকার উপরে কেনাকাটা করলে পাচ্ছেন ফ্রি ডেলিভারি। অফার থাকাকালীন আপনার পছন্দের প্রোডাক্টটি লুফে নিন। 🧧🎉", status: "approved", type: "god_mode_sales", brandId: "Azlaan", successCount: 0 }
];

async function seed() {
  console.log('--- 👑 Seeding God Mode Knowledge Base (Peak Intelligence) ---');
  let addedCount = 0;
  let skippedCount = 0;

  for (const item of godModePack) {
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
        console.log(`[ULTIMATE ADD] ${item.keyword}`);
        addedCount++;
      } else {
        console.log(`[ALREADY MASTERED] ${item.keyword} - skipping`);
        skippedCount++;
      }
    } catch (e) {
      console.error(`[CRITICAL ERROR] ${item.keyword}: ${e.message}`);
    }
  }
  console.log(`--- 🏁 Seeding Finished | Added: ${addedCount} | Skipped: ${skippedCount} ---`);
  process.exit(0);
}

seed();
