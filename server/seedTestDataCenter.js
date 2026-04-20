/**
 * Comprehensive Test Data for Comment Data Center
 * This script seeds ALL types of common Facebook comments for testing
 */

const { db } = require('./services/firestoreService');

console.log('🚀 Seeding comprehensive test data...\n');

// First, delete existing entries to avoid duplicates
async function clearExisting() {
  const snap = await db.collection('comment_data_center').get();
  const batch = db.batch();
  snap.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  console.log(`✅ Cleared ${snap.size} existing entries\n`);
}

const testData = [
  // ===== POST 1: Comprehensive Test Data =====
  {
    postId: "122105925219235530",
    postLink: "https://web.facebook.com/photo/?fbid=122105925219235530",
    brandId: "Skinzy",
    isActive: true,
    isUniversal: true,
    questions: [
      {
        keywords: ["price", "দাম", "rate", "কত", "koto", "dam", "price ki", "দাম কত", "koto taka", "tk"],
        replies: [
          { public: "ভাই/আপা, ইনবক্স দেখুন বিস্তারিত জানানো হয়েছে 💙", private: "Skinzy-তে স্বাগতম! 🌟\n\n💰 মূল্য: ৫৫০ টাকা\n✅ অরিজিনাল প্রোডাক্ট\n✅ ক্যাশ অন ডেলিভারি\n\nঅর্ডার করতে নাম, ঠিকানা ও ফোন নম্বর পাঠান 😊" },
          { public: "ইনবক্সে চেক করুন, সব ডিটেইলস দেওয়া হয়েছে ✨", private: "হ্যালো! 😊\n\nপ্রোডাক্ট প্রাইস: ৫৫০ BDT\n📦 হোম ডেলিভারি available\n💯 ১০০% অরিজিনাল\n\nঅর্ডার করতে ইনফো দিন ⬇️" },
          { public: "প্রাইস জানতে মেসেজ দেখুন 💌", private: "আসসালামু আলাইকুম! 💙\n\n✅ মূল্য: ৫৫০ টাকা\n✅ সারা বাংলাদেশে ডেলিভারি\n✅ প্রোডাক্ট রিসিভ করে পেমেন্ট\n\nঅর্ডার করতে তথ্য দিন 📝" },
          { public: "ডিটেইলস ইনবক্সে পাঠিয়ে দিয়েছি 📩", private: "কেমন আছেন? 🌸\n\n💰 প্রাইস: ৫৫০ টাকা\n🚚 ডেলিভারি চার্জ: ৬০ টাকা\n⏱️ ডেলিভারি: ২-৩ দিন\n\nঅর্ডার কনফার্ম করুন!" },
          { public: "চেক করুন inbox, সব জানানো হয়েছে 💫", private: "হাই! 😍\n\n✨ প্রোডাক্ট প্রাইস: ৫৫০ টাকা\n✨ COD available\n✨ ৭ দিন রিপ্লেসমেন্ট\n\nঅর্ডার করতে ডিটেইলস পাঠান 👇" }
        ]
      },
      {
        keywords: ["order", "অর্ডার", "কিনতে চাই", "নিতে চাই", "order korbo", "buy", "কিনব", "want to buy"],
        replies: [
          { public: "অর্ডার করতে ইনবক্স দেখুন 🛍️", private: "অর্ডার করতে তথ্য দিন ⬇️\n\n👤 নাম:\n📍 ঠিকানা:\n📱 ফোন:\n📦 পরিমাণ:\n\nধন্যবাদ! 💙" },
          { public: "ইনবক্সে অর্ডার ফর্ম পাঠানো হয়েছে 📋", private: "অর্ডার প্রসেস:\n\n1️⃣ তথ্য দিন\n2️⃣ কনফার্মেশন পাবেন\n3️⃣ ২-৩ দিনে ডেলিভারি\n4️⃣ পেয়ে পেমেন্ট\n\nশুরু করুন! 😊" },
          { public: "মেসেজে অর্ডারের নিয়ম বলা আছে 📩", private: "অর্ডার করতে চাইলে 👇\n\n✅ নাম\n✅ ঠিকানা\n✅ ফোন নম্বর\n✅ প্রোডাক্ট\n\nCOD available! 💰" },
          { public: "অর্ডারের জন্য inbox চেক করুন 💌", private: "হ্যালো! অর্ডার করতে:\n\n📝 নাম:\n📍 ঠিকানা:\n📱 ফোন:\n🛍️ প্রোডাক্ট:\n\n২৪ ঘণ্টায় শিপ! 🚀" },
          { public: "ইনবক্সে সব ডিটেইলস দেওয়া হয়েছে ✨", private: "ধন্যবাদ! 🙏\n\nতথ্য দিন:\n• নাম\n• ঠিকানা\n• ফোন\n\nদ্রুত ডেলিভারি! 📦" }
        ]
      },
      {
        keywords: ["delivery", "ডেলিভারি", "কতদিন", "shipping", "কখন পাব", "delivery time", "koto din"],
        replies: [
          { public: "ডেলিভারি তথ্য ইনবক্সে দেওয়া আছে 📦", private: "ডেলিভারি তথ্য:\n\n⏱️ ঢাকা: ১-২ দিন\n⏱️ বাইরে: ২-৩ দিন\n💰 চার্জ: ৬০ টাকা\n🆓 ১০০০+ টাকায় ফ্রি!" },
          { public: "ইনবক্সে ডেলিভারি ডিটেইলস চেক করুন 🚚", private: "শিপিং ইনফো:\n\n📍 সারা বাংলাদেশে\n⏰ ২৪-৭২ ঘণ্টা\n💵 COD available\n📱 ট্র্যাকিং নম্বর দেওয়া হবে" },
          { public: "মেসেজে সব ডেলিভারি ইনফো আছে 📩", private: "ডেলিভারি:\n\n✅ ঢাকা: ১-২ দিন\n✅ বাইরে: ২-৩ দিন\n✅ চার্জ: ৬০ টাকা\n✅ ২ আইটেমে ফ্রি!" },
          { public: "চেক করুন inbox, ডেলিভারি ইনফো দেওয়া আছে 💫", private: "ডেলিভারি পলিসি:\n\n🚚 কুরিয়ার: পেপারফ্লাই\n⏱️ ১-৩ দিন\n💰 ৬০ টাকা\n🎁 ১০০০+ টাকায় ফ্রি!" },
          { public: "ইনবক্সে ডেলিভারি চার্জ ও টাইম জানানো হয়েছে 📋", private: "ডেলিভারি ডিটেইলস:\n\n📦 ঢাকা: ২৪-৪৮ ঘণ্টা\n📦 বাইরে: ৪৮-৭২ ঘণ্টা\n💵 ৬০ টাকা\n🆓 ২+ আইটেমে ফ্রি!" }
        ]
      },
      {
        keywords: ["original", "আসল", "quality", "গুণগত", "fake", "নকল", "authentic"],
        replies: [
          { public: "১০০% অরিজিনাল প্রোডাক্ট, ইনবক্সে ডিটেইলস দেখুন ✅", private: "আমরা ১০০% অরিজিনাল প্রোডাক্ট বিক্রি করি! 💯\n\n✅ কোম্পানি থেকে আমদানি\n✅ ব্যাচ নম্বর সহ\n✅ ৭ দিন রিপ্লেসমেন্ট\n\nনিশ্চিন্তে অর্ডার করুন 😊" },
          { public: "গুণগত মান নিয়ে চিন্তা নেই, inbox দেখুন 💎", private: "কোয়ালিটি গ্যারান্টি:\n\n🏆 ১০০% অরিজিনাল\n🏆 রিসিভ করে চেক করুন\n🏆 সমস্যা হলে রিপ্লেসমেন্ট\n🏆 COD available" },
          { public: "অরিজিনালিটি গ্যারান্টি, মেসেজ চেক করুন 🌟", private: "প্রোডাক্ট কোয়ালিটি:\n\n✨ অথেন্টিক\n✨ প্রপার প্যাকেজিং\n✨ এক্সপায়ারি ২০২৫+\n✨ রিভিউ ৪.৮/৫ ⭐" },
          { public: "ফেক প্রোডাক্ট সেল করি না, ইনবক্স দেখুন 🔒", private: "১০০% অরিজিনাল গ্যারান্টি!\n\n✅ ব্র্যান্ড থেকে\n✅ হলোগ্রাম স্টিকার\n✅ ভেরিফাই করতে পারবেন\n✅ মানি ব্যাক গ্যারান্টি" },
          { public: "কোয়ালিটি নিয়ে ১০০% নিশ্চিন্ত, inbox চেক করুন ✨", private: "কোয়ালিটি:\n\n🔒 অরিজিনাল\n🔒 প্রপার বিল\n🔒 ৭ দিন রিটার্ন\n🔒 COD\n\n১০,০০০+ হ্যাপি কাস্টমার! 🎉" }
        ]
      },
      {
        keywords: ["available", "আছে", "stock", "ইন স্টক", "in stock", "pawa jabe"],
        replies: [
          { public: "হ্যাঁ স্টকে আছে, inbox দেখুন ✅", private: "হ্যাঁ! স্টকে available ✅\n\n📦 in stock\n⚠️ সীমিত স্টক\n🚚 আজই শিপ\n\nঅর্ডার করুন 😊" },
          { public: "ইনবক্সে স্টক স্ট্যাটাস চেক করুন 📦", private: "স্টক আপডেট:\n\n✅ available\n⏰ সীমিত\n🔥 দ্রুত শেষ হচ্ছে\n\nআজই অর্ডার করুন! 🛍️" },
          { public: "স্টকে আছে, মেসেজ দেখুন 🌟", private: "স্টক স্ট্যাটাস:\n\n💚 in stock\n💚 দ্রুত শিপিং\n✅ COD\n\nঅর্ডার করুন ⬇️" },
          { public: "হ্যাঁ available, inbox চেক করুন 💫", private: "কেমন আছেন? 🌸\n\n✅ স্টকে আছে\n✅ দ্রুত শিপিং\n✅ COD\n\nঅর্ডার করুন ⬇️" },
          { public: "স্টক ডিটেইলস মেসেজে পাবেন 📩", private: "স্টক ইনফো:\n\n📦 available\n🚚 daily shipping\n⚡ limited\n\nঅর্ডার করুন 😊" }
        ]
      },
      {
        keywords: ["discount", "ছাড়", "offer", "অফার", "কম", "combo", "deal", "best price"],
        replies: [
          { public: "স্পেশাল অফার inbox-এ দেখুন 🎁", private: "🎉 স্পেশাল অফার!\n\n💰 ২ আইটেম: ১০% ছাড়\n💰 ৩ আইটেম: ১৫% ছাড়\n💰 ১০০০+ টাকায়: ফ্রি ডেলিভারি!" },
          { public: "কম্বো অফার মেসেজে চেক করুন 💫", private: "কম্বো ডিল:\n\n🎁 ২ আইটেম: ১০% ছাড়\n🎁 ৩ আইটেম: ১৫% ছাড়\n🎁 ফ্রি ডেলিভারি ১০০০+ টাকায়!" },
          { public: "ডিসকাউন্ট ডিটেইলস inbox-এ আছে 📩", private: "বর্তমান অফার:\n\n✅ প্রথম অর্ডার: ৫% ছাড়\n✅ ২+ আইটেম: ফ্রি শিপিং\n✅ রেগুলার: ১০% ছাড়" },
          { public: "অফারের জন্য inbox দেখুন 🌟", private: "বর্তমান ডিল:\n\n🔥 ফ্ল্যাশ সেল active\n🔥 কম্বো available\n🔥 ফ্রি গিফট ১৫০০+ টাকায়" },
          { public: "স্পেশাল প্রাইস মেসেজে পাবেন 💌", private: "স্পেশাল প্রাইস:\n\n💵 সিঙ্গেল: ৫৫০ টাকা\n💵 ডাবল: ১০০০ টাকা (সাশ্রয় ১০০!)\n💵 ট্রিপল: ১৪৫০ টাকা (সাশ্রয় ২০০!)" }
        ]
      },
      {
        keywords: ["payment", "পেমেন্ট", "bkash", "নগদ", "cash", "cod", "কিভাবে pay"],
        replies: [
          { public: "পেমেন্ট তথ্য inbox-এ দেখুন 💳", private: "পেমেন্ট অপশন:\n\n💵 COD (popular!)\n📱 bKash\n📱 Nagad\n\nCOD available! 😊" },
          { public: "ইনবক্সে পেমেন্ট মেথড আছে 💰", private: "পেমেন্ট:\n\n1️⃣ COD ⭐\n2️⃣ bKash\n3️⃣ Nagad\n\nCOD তে extra charge নেই! 💙" },
          { public: "মেসেজে সব পেমেন্ট ইনফো আছে 📩", private: "পেমেন্ট পলিসি:\n\n✅ COD available\n✅ bKash/Nagad\n✅ পেয়ে পেমেন্ট (COD)" },
          { public: "পেমেন্ট ডিটেইলস inbox চেক করুন 💳", private: "পেমেন্ট অপশন:\n\n💰 COD\n💰 bKash\n💰 Nagad\n\nCOD safest! 😊" },
          { public: "ইনবক্সে পেমেন্ট গাইডলাইন আছে 📋", private: "পেমেন্ট গাইড:\n\n⭐ COD: পেয়ে পেমেন্ট\n⭐ bKash/Nagad available\n\nসুবিধামতো বেছে নিন! 💙" }
        ]
      },
      {
        keywords: ["hi", "hello", "হ্যালো", "সalam", "কেমন আছেন"],
        replies: [
          { public: "কেমন আছেন? 😊 কিভাবে সাহায্য করতে পারি?", private: "Skinzy-তে স্বাগতম! 🌟\n\n📦 প্রোডাক্ট ইনফো\n💰 প্রাইস লিস্ট\n🎁 বর্তমান অফার\n\nজানতে চান? 😊" },
          { public: "হ্যালো! কিভাবে সাহায্য করবো? 💙", private: "হাই! 😍\n\nআমাদের কাছে পাচ্ছেন:\n✅ স্কিনকেয়ার\n✅ হেয়ারকেয়ার\n✅ বিউটি এসেনশিয়ালস\n\nকি লাগবে জানান!" },
          { public: "হ্যালো! জিজ্ঞেস করুন, আছি 😊", private: "কেমন আছেন? 🌸\n\n💬 প্রোডাক্ট ইনফো\n💬 প্রাইস\n💬 অর্ডার\n\nযে কোনো প্রশ্ন করুন 😊" },
          { public: "হ্যালো! inbox-এ বিস্তারিত আছে 📩", private: "হ্যালো! 🎉\n\n🌟 অরিজিনাল প্রোডাক্ট\n🌟 COD available\n🌟 ফ্রি শিপিং ২+ আইটেমে\n\nকিভাবে সাহায্য করবো?" },
          { public: "হ্যালো! কি জানতে চান? ✨", private: "হাই! 😊\n\n✅ ১০০% অরিজিনাল\n✅ ১০,০০০+ কাস্টমার\n✅ সারা বাংলাদেশে ডেলিভারি\n\nপ্রশ্ন করুন!" }
        ]
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // ===== POST 2 =====
  {
    postId: "122105788083235530",
    postLink: "https://web.facebook.com/photo?fbid=122105788083235530",
    brandId: "Skinzy",
    isActive: true,
    isUniversal: true,
    questions: [
      {
        keywords: ["price", "দাম", "rate", "কত", "koto", "dam"],
        replies: [
          { public: "প্রাইস ইনবক্সে জানানো হয়েছে 💙", private: "Skinzy-তে স্বাগতম! 🌟\n\n💰 মূল্য: ৬৫০ টাকা\n✅ অরিজিনাল\n✅ COD\n✅ ফ্রি শিপিং ২+ আইটেমে" },
          { public: "ইনবক্সে প্রাইস ডিটেইলস দেখুন ✨", private: "হ্যালো! 😊\n\n📦 প্রাইস: ৬৫০ BDT\n🚚 ডেলিভারি: ৬০ টাকা\n⏱️ ২-৩ দিন\n\nঅর্ডার করুন ⬇️" },
          { public: "মেসেজে সব প্রাইস ইনফো আছে 📩", private: "কেমন আছেন? 🌸\n\n✅ প্রাইস: ৬৫০ টাকা\n✅ সারা বাংলাদেশে\n✅ পেয়ে পেমেন্ট" },
          { public: "ডিটেইলস inbox-এ পেয়ে যাবেন 💌", private: "হাই! 😍\n\n💵 মূল্য: ৬৫০ BDT\n📦 হোম ডেলিভারি\n💯 ১০০% অরিজিনাল" },
          { public: "চেক করুন inbox, প্রাইস জানানো আছে 💫", private: "ধন্যবাদ! 🙏\n\n✨ প্রাইস: ৬৫০ টাকা\n✨ COD\n✨ ৭ দিন রিপ্লেসমেন্ট" }
        ]
      },
      {
        keywords: ["order", "অর্ডার", "কিনতে চাই", "order korbo", "buy"],
        replies: [
          { public: "অর্ডার করতে inbox দেখুন 🛍️", private: "অর্ডার করুন ⬇️\n\n👤 নাম:\n📍 ঠিকানা:\n📱 ফোন:\n📦 পরিমাণ:" },
          { public: "ইনবক্সে অর্ডার ফর্ম আছে 📋", private: "অর্ডার প্রসেস:\n\n1️⃣ তথ্য দিন\n2️⃣ কনফার্মেশন\n3️⃣ ডেলিভারি\n4️⃣ পেমেন্ট" },
          { public: "মেসেজে অর্ডার নিয়ম বলা আছে 📩", private: "অর্ডার 👇\n\n✅ নাম\n✅ ঠিকানা\n✅ ফোন\n✅ প্রোডাক্ট" },
          { public: "অর্ডারের জন্য inbox চেক করুন 💌", private: "অর্ডার করতে:\n\n📝 নাম:\n📍 ঠিকানা:\n📱 ফোন:\n🛍️ প্রোডাক্ট:" },
          { public: "ইনবক্সে সব অর্ডার ডিটেইলস আছে ✨", private: "ধন্যবাদ! 🙏\n\nতথ্য দিন:\n• নাম\n• ঠিকানা\n• ফোন" }
        ]
      },
      {
        keywords: ["discount", "ছাড়", "offer", "কম", "combo"],
        replies: [
          { public: "স্পেশাল অফার inbox-এ দেখুন 🎁", private: "🎉 অফার!\n\n💰 ২ আইটেম: ১০% ছাড়\n💰 ৩ আইটেম: ১৫% ছাড়\n💰 ১০০০+ টাকায়: ফ্রি!" },
          { public: "কম্বো অফার মেসেজে চেক করুন 💫", private: "কম্বো:\n\n🎁 ২ আইটেম: ১০% ছাড়\n🎁 ৩ আইটেম: ১৫% ছাড়\n🎁 ফ্রি ডেলিভারি!" },
          { public: "ডিসকাউন্ট ডিটেইলস inbox-এ আছে 📩", private: "অফার:\n\n✅ প্রথম: ৫% ছাড়\n✅ ২+: ফ্রি শিপিং\n✅ রেগুলার: ১০%" },
          { public: "অফারের জন্য inbox দেখুন 🌟", private: "ডিল:\n\n🔥 ফ্ল্যাশ সেল\n🔥 কম্বো available\n🔥 ফ্রি গিফট ১৫০০+" },
          { public: "স্পেশাল প্রাইস মেসেজে পাবেন 💌", private: "প্রাইস:\n\n💵 সিঙ্গেল: ৬৫০\n💵 ডাবল: ১১৫০ (সাশ্রয় ১৫০!)\n💵 ট্রিপল: ১৬৫০ (সাশ্রয় ৩০০!)" }
        ]
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // ===== POST 3 =====
  {
    postId: "122103514521235530",
    postLink: "https://web.facebook.com/photo?fbid=122103514521235530",
    brandId: "Skinzy",
    isActive: true,
    isUniversal: true,
    questions: [
      {
        keywords: ["price", "দাম", "rate", "কত", "koto"],
        replies: [
          { public: "প্রাইস জানতে inbox চেক করুন 💙", private: "Skinzy-তে স্বাগতম! 🌟\n\n💰 কম্বো: ১২০০ টাকা\n💰 আলাদা: ১৫০০ টাকা\n💰 সাশ্রয়: ৩০০ টাকা!" },
          { public: "ইনবক্সে কম্বো প্রাইস দেখুন ✨", private: "হ্যালো! 😊\n\n🎁 কম্বো: ১২০০ BDT\n📦 আলাদা: ১৫০০ BDT\n🚚 ফ্রি ডেলিভারি!" },
          { public: "মেসেজে সব প্রাইস ডিটেইলস আছে 📩", private: "কেমন আছেন? 🌸\n\n✅ কম্বো: ১২০০ টাকা\n✅ আলাদা: ১৫০০ টাকা\n✅ সাশ্রয়: ৩০০ টাকা!" },
          { public: "ডিটেইলস inbox-এ দেওয়া আছে 💌", private: "হাই! 😍\n\n💵 কম্বো: ১২০০ টাকা\n💵 সিঙ্গেল: ৫৫০-৬৫০ টাকা\n🎁 কম্বোতে ফ্রি ডেলিভারি!" },
          { public: "চেক করুন inbox, প্রাইস জানানো আছে 💫", private: "ধন্যবাদ! 🙏\n\n✨ কম্বো: ১২০০ টাকা\n✨ আলাদা: ১৫০০ টাকা\n✨ সাশ্রয়: ৩০০ টাকা!" }
        ]
      },
      {
        keywords: ["order", "অর্ডার", "কিনতে চাই", "order korbo"],
        replies: [
          { public: "অর্ডার করতে inbox দেখুন 🛍️", private: "কম্বো অর্ডার ⬇️\n\n👤 নাম:\n📍 ঠিকানা:\n📱 ফোন:\n📦 কোন কম্বো:" },
          { public: "ইনবক্সে অর্ডার ফর্ম আছে 📋", private: "অর্ডার:\n\n1️⃣ তথ্য দিন\n2️⃣ কনফার্মেশন\n3️⃣ ডেলিভারি\n4️⃣ পেমেন্ট" },
          { public: "মেসেজে অর্ডার নিয়ম বলা আছে 📩", private: "কম্বো অর্ডার 👇\n\n✅ নাম\n✅ ঠিকানা\n✅ ফোন\n✅ কম্বো টাইপ" },
          { public: "অর্ডারের জন্য inbox চেক করুন 💌", private: "কম্বো অর্ডার:\n\n📝 নাম:\n📍 ঠিকানা:\n📱 ফোন:\n🛍️ কম্বো:" },
          { public: "ইনবক্সে সব ডিটেইলস আছে ✨", private: "ধন্যবাদ! 🙏\n\nতথ্য দিন:\n• নাম\n• ঠিকানা\n• ফোন\n• কম্বো" }
        ]
      },
      {
        keywords: ["available", "আছে", "stock", "ইন স্টক"],
        replies: [
          { public: "হ্যাঁ স্টকে আছে, inbox দেখুন ✅", private: "হ্যাঁ! available ✅\n\n📦 কম্বো: in stock\n📦 সিঙ্গেল: in stock\n⚠️ সীমিত স্টক!" },
          { public: "ইনবক্সে স্টক স্ট্যাটাস চেক করুন 📦", private: "স্টক:\n\n✅ কম্বো: available\n✅ সিঙ্গেল: available\n⏰ সীমিত!" },
          { public: "স্টকে আছে, মেসেজ দেখুন 🌟", private: "স্টক:\n\n💚 কম্বো: in stock\n💚 সিঙ্গেল: in stock\n⚡ দ্রুত শেষ হচ্ছে!" },
          { public: "হ্যাঁ available, inbox চেক করুন 💫", private: "কেমন আছেন? 🌸\n\n✅ স্টকে আছে\n✅ দ্রুত শিপিং\n✅ COD" },
          { public: "স্টক ডিটেইলস মেসেজে পাবেন 📩", private: "স্টক:\n\n📦 কম্বো: ৫০+ available\n📦 সিঙ্গেল: ১০০+ available\n🚚 daily shipping!" }
        ]
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedTestData() {
  try {
    await clearExisting();

    console.log('📝 Adding comprehensive test entries...\n');

    for (const entry of testData) {
      const docRef = await db.collection('comment_data_center').add(entry);
      const totalReplies = entry.questions.reduce((sum, q) => sum + q.replies.length, 0);
      console.log(`✅ Added: Post ${entry.postId}`);
      console.log(`   → ${entry.questions.length} question sets`);
      console.log(`   → ${totalReplies} reply variations\n`);
    }

    const totalQuestions = testData.reduce((sum, e) => sum + e.questions.length, 0);
    const totalReplies = testData.reduce((sum, e) => sum + e.questions.reduce((qSum, q) => qSum + q.replies.length, 0), 0);

    console.log('\n🎉 Comprehensive test data seeded successfully!');
    console.log(`📊 Total posts: ${testData.length}`);
    console.log(`📝 Total question sets: ${totalQuestions}`);
    console.log(`💬 Total reply variations: ${totalReplies}`);
    console.log('\n🧪 Ready to test with Facebook comments!');
    
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
  }
}

seedTestData();
