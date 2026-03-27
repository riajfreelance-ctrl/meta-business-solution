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

const elitePack = [
  // 1. Trust & Authority
  {
    keyword: "Trust / Fraud",
    variations: ["ফ্রড নাকি", "বিশ্বাস করব কেমনে", "আগে ঠকেছি", "গ্যারান্টি কি", "trust you?"],
    result: "আমরা দীর্ঘদিন ধরে সততার সাথে ব্যবসা করছি। আপনি আমাদের কাস্টমার রিভিউ এবং পেজ ট্রান্সপারেন্সি চেক করতে পারেন। এছাড়া আমরা কোনো অগ্রিম টাকা ছাড়াই ‘ক্যাশ অন ডেলিভারি’ দিচ্ছি, যাতে আপনি প্রোডাক্ট হাতে পেয়েই নিশ্চিত হয়ে টাকা দিতে পারেন। 😊",
    status: "approved", type: "elite_scaling", brandId: "Azlaan", successCount: 0
  },
  {
    keyword: "Real Product",
    variations: ["ছবির মত হবে তো", "ভিডিও হবে", "আসলে কেমন", "real pic please"],
    result: "আমাদের সব ছবি অরিজিনাল প্রোডাক্টেরই তোলা। আপনি চাইলে আমাদের ইনবক্সে নক দিন, আমরা আপনাকে লাইভ ছবি বা ছোট একটি ভিডিও পাঠিয়ে দিচ্ছি যাতে আপনি ১০০% নিশ্চিত হতে পারেন। ✨",
    status: "approved", type: "elite_scaling", brandId: "Azlaan", successCount: 0
  },

  // 2. Business & Bulk
  {
    keyword: "Wholesale / Bulk",
    variations: ["পাইকারি", "বেশি নিলে কত", "wholesale", "resale করা যাবে", "১০ পিস"],
    result: "জি, আমরা পাইকারি বা হোলসেল দিয়ে থাকি। আমাদের থেকে নিয়ে আপনি রিসেল করতে পারবেন। পাইকারি রেট এবং মিনিমাম কোয়ান্টিটি জানতে দয়া করে আপনার 'শপের নাম' এবং 'ফ্রিকোয়েন্সি' লিখে আমাদের জানান। আমাদের হোলসেল টিম আপনার সাথে যোগাযোগ করবে। 🤝",
    status: "approved", type: "elite_scaling", brandId: "Azlaan", successCount: 0
  },
  {
    keyword: "Business Partnership",
    variations: ["business proposal", "পার্টনারশিপ", "সাপ্লায়ার হতে চাই", "partnership"],
    result: "আমরা যেকোনো ধরনের দীর্ঘমেয়াদী বিজনেস প্রপোজালকে স্বাগত জানাই। দয়া করে আপনার বিস্তারিত প্রস্তাবটি আমাদের ইনবক্সে দিন অথবা আমাদের ইমেইলে পাঠিয়ে দিন। আমাদের বিজনেস ডেভেলপমেন্ট টিম শীঘ্রই আপনার সাথে বসবে। 💼",
    status: "approved", type: "elite_scaling", brandId: "Azlaan", successCount: 0
  },

  // 3. Logistics & Urgency
  {
    keyword: "Urgent Delivery",
    variations: ["আজকেই লাগবে", "১ দিনে হবে", "কালকে বিয়ে", "urgent", "fast delivery"],
    result: "আমরা সাধারণত ২৪-৪৮ ঘণ্টার মধ্যে ডেলিভারি দেই। তবে আপনার যদি খুব জরুরি হয়, তবে আমাদের প্রতিনিধিকে বিষয়টি আলাদাভাবে জানান। আমরা 'স্পেশাল ডেলিভারি'র মাধ্যমে দ্রুত পৌঁছানোর সর্বোচ্চ চেষ্টা করব। ⏳🚀",
    status: "approved", type: "elite_scaling", brandId: "Azlaan", successCount: 0
  },
  {
    keyword: "Office Visit",
    variations: ["অফিসে আসব", "সরাসরি দেখব", "visit office", "দোকান কোথায়", "map location"],
    result: "অবশ্যই! আমাদের অফিস বা শোরুমে এসে আপনি সরাসরি প্রোডাক্ট দেখে নিতে পারেন। আমাদের ঠিকানা: [আপনার এড্রেস]। সপ্তাহের প্রতিদিন সকাল ১০টা থেকে রাত ৮টা পর্যন্ত আমরা খোলা থাকি। আসার আগে দয়া করে একবার কনফার্ম করবেন। 📍",
    status: "approved", type: "elite_scaling", brandId: "Azlaan", successCount: 0
  },

  // 4. Payments & Security
  {
    keyword: "Payment Security",
    variations: ["বিকাশ নম্বর", "মার্চেন্ট নাকি পার্সোনাল", "অগ্রিম টাকা", "payment secure?"],
    result: "আমরা সবসময় সিকিউর পেমেন্ট প্রিফার করি। আপনি আমাদের ভেরিফাইড মার্চেন্ট নম্বর [নম্বর] এ সেন্ড মানি বা পেমেন্ট করতে পারেন। পেমেন্ট করার পর দয়া করে ট্রানজেকশন আইডির শেষ ৪টি ডিজিট আমাদের জানাবেন। 💳✅",
    status: "approved", type: "elite_scaling", brandId: "Azlaan", successCount: 0
  },
  {
    keyword: "Refund Policy",
    variations: ["টাকা ফেরত দিবে", "refund policy", "রিফান্ড পাব", "তাক ফেরত"],
    result: "যদি আমাদের প্রোডাক্টে কোনো সমস্যা থাকে এবং আমরা তা এক্সচেঞ্জ করে দিতে না পারি, তবে আমরা অবশ্যই ৭ কার্যদিবসের মধ্যে আপনার টাকা রিফান্ড করে দেব। কাস্টমার স্যাটিসফ্যাকশন আমাদের কাছে সবার আগে। 💰🔄",
    status: "approved", type: "elite_scaling", brandId: "Azlaan", successCount: 0
  },

  // 5. Product Specifics
  {
    keyword: "Quality Check",
    variations: ["খারাপ হবে না তো", "রং উঠবে", "QC করা হয়", "quality check"],
    result: "আমাদের প্রতিটি পার্সেল পাঠানোর আগে ৩টি ধাপে কোয়ালিটি চের করা হয়। নষ্ট বা ছেঁড়া প্রোডাক্ট যাওয়ার কোনো সম্ভাবনা নেই। এরপরও কোনো সমস্যা হলে আমরা সম্পূর্ণ দায়িত্ব নেব। 🛡️✨",
    status: "approved", type: "elite_scaling", brandId: "Azlaan", successCount: 0
  },
  {
    keyword: "Size Selection",
    variations: ["সাইজ চার্ট", "size chart", "মাপ কি হবে", "fit হবে তো"],
    result: "আমরা আমাদের প্রতিটি প্রোডাক্টের সাথে একটি এ্যাকুরেট 'সাইজ চার্ট' দিয়ে থাকি। আপনার ওজন এবং উচ্চতা বললে আমরাই আপনাকে বেস্ট ফিটিং সাইজটি সাজেস্ট করতে পারি। 📏👕",
    status: "approved", type: "elite_scaling", brandId: "Azlaan", successCount: 0
  },

  // 6. Human Connection (Handover Triggers)
  {
    keyword: "Human / Admin Please",
    variations: ["মানুষ চাই", "অ্যাডমিন কই", "speak to human", "talk to official", "অ্যাডমিনের সাথে"],
    result: "আমি আপনাকে আমাদের একজন সিনিয়র কাস্টমার কেয়ার রিপ্রেজেন্টেটিভের কাছে হ্যান্ডওভার করছি। দয়া করে ২-৩ মিনিট সময় দিন, তারা আপনার প্রশ্নের উত্তর দিতে দ্রুত জয়েন করবেন। 🤝📞",
    status: "approved", type: "human_trigger", brandId: "Azlaan", successCount: 0
  },
  {
    keyword: "Call Back",
    variations: ["ফোন দেন", "call me", "নাম্বার দেন কথা বলব", "call back"],
    result: "অবশ্যই! দয়া করে আপনার মোবাইল নম্বরটি এখানে দিন, আমাদের একজন প্রতিনিধি আগামী ১৫-৩০ মিনিটের মধ্যে আপনাকে কল করবেন। আমাদের নম্বর: [আপনার নম্বর]। 📱☎️",
    status: "approved", type: "human_trigger", brandId: "Azlaan", successCount: 0
  },

  // 7. Post-Purchase Satisfaction
  {
    keyword: "Review / Feedback",
    variations: ["রিভিউ দিব", "ভাল লেগেছে", "thanks for product", "great service"],
    result: "আপনার ভালো লেগেছে শুনে আমরা অনেক আনন্দিত! দয়া করে আপনার একটি ফটো রিভিউ আমাদের পেজে শেয়ার করবেন, এটি আমাদের এগিয়ে যেতে অনেক সাহায্য করবে। আপনার পরবর্তী অর্ডারে আমাদের পক্ষ থেকে ভালোবাসাস্বরূপ একটি সারপ্রাইজ গিফট থাকবে! 🎉💖",
    status: "approved", type: "elite_scaling", brandId: "Azlaan", successCount: 0
  }
];

async function seed() {
  console.log('--- Seeding Elite Hyper-Scaling Pack ---');
  for (const item of elitePack) {
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
  console.log('--- Elite Seeding Finished ---');
  process.exit(0);
}

seed();
