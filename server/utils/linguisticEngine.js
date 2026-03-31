/**
 * 👑 ULTIMATE PHONETIC BRIDGE: Bangla <-> Romanized (Benglish) Convergence 👑
 * Maps native script to romanized phonetics for seamless matching.
 */

const phoneticMap = {
  'ক': 'k', 'খ': 'k', 'গ': 'g', 'ঘ': 'g', 'ঙ': 'ng',
  'চ': 'ch', 'ছ': 'ch', 'জ': 'j', 'ঝ': 'j', 'ঞ': 'n',
  'ট': 't', 'ঠ': 't', 'ড': 'd', 'ঢ': 'd', 'ণ': 'n',
  'ত': 't', 'থ': 't', 'দ': 'd', 'ধ': 'd', 'ন': 'n',
  'প': 'p', 'ফ': 'f', 'ব': 'b', 'ভ': 'b', 'ম': 'm',
  'য': 'j', 'র': 'r', 'ল': 'l', 'শ': 'sh', 'ষ': 'sh', 'স': 's', 'হ': 'h',
  'ড়': 'r', 'ঢ়': 'r', 'য়': 'y', 'ৎ': 't',
  'া': 'a', 'ি': 'i', 'ী': 'i', 'ু': 'u', 'ূ': 'u', 'ৃ': 'ri', 'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou',
  'ং': 'ng', 'ঃ': 'h', 'ঁ': 'n'
};

/**
 * Normalizes any text (Bangla or English) into a standard "Phonetic ID"
 * Highly aggressive for fuzzy matching.
 */
function normalizePhonetic(text) {
  if (!text) return '';
  let str = text.toLowerCase().trim();
  
  // 1. Convert Bangla characters to Romanized phonetics
  let phonetic = '';
  for (let char of str) {
    phonetic += phoneticMap[char] || char;
  }

  // 2. Clear common filler sounds & duplications
  phonetic = phonetic
    .replace(/h/g, '') // Flatten kh/gh/ph to base sounds
    .replace(/aa/g, 'a').replace(/ee/g, 'i').replace(/oo/g, 'u')
    .replace(/y/g, 'i').replace(/w/g, 'u')
    .replace(/s/g, 'sh').replace(/z/g, 'j').replace(/c/g, 'k').replace(/q/g, 'k')
    .replace(/(.)\1+/g, '$1') // Remove double letters
    .replace(/[^a-z0-9]/g, ''); // Keep only alphanumeric

  return phonetic;
}

const noiseWords = [
  "bhai", "vai", "aphu", "apu", "sister", "sir", "madam", "admin", 
  "hey", "ei", "hello", "hi", "ey", "ji", "ha", "yes", "please", "plz",
  "bolun", "bolen", "details", "din", "dekhai", "eita", "seta", "ki",
  "koto", "hobe", "ase", "ache", "pabo", "nibo", "নিতে", "চাই", "ভাই", "আপু"
];

const prefixes = [
  "", "bhai", "admin", "hey", "hello", "ji", "apu", "aphu", "sister", "vai", "sir", "madam",
  "assalamu alaikum", "slm", "hey bro", "hlw", "oi", "excuse me", "please", "can you", 
  "ভাই", "আপু", "আসসালামু আলাইকুম", "শুনুন", "বলছি"
];
const suffixes = [
  "", "bolen", "den", "plz", "ache?", "pabo?", "koto", "dekhai", "eita", "seta", 
  "details", "details hobe?", "pic hobe?", "picture den", "lagbe", "nibo", "kinbo",
  "জানান", "হবে?", "কত", "আছে?", "দেখি", "দেন", "পাবো?", "নিবো", "কিনবো"
];

const coreKeywordMap = {
  "Greeting": ["hi", "hello", "salam", "slm", "hey", "oi", "bro", "hlw", "আসসালামু আলাইকুম", "হাই", "হ্যালো"],
  "Price": ["price", "dam", "p?", "tk", "taka", "koto", "damm", "prais", "কত", "দাম", "টাকা", "প্রাইস"],
  "Delivery": ["delivery", "charge", "dhaka baire", "home delivery", "delvry", "delevery", "shipping", "ডেলিভারি", "চার্জ"],
  "Authenticity": ["asol", "original", "copy", "brand", "real", "fake", "orginal", "অরিজিনাল", "আসল", "নকল"],
  "Location": ["shop", "address", "location", "शोरूम", "ঠিকানা", "আউটলেট", "কোথায়", "location kothay"],
  "How to Order": ["order", "buy", "নিব", "নিতে চাই", "process", "অর্ডার", "কিনব", "কিভাবে", "how to buy"],
  "COD": ["cash on delivery", "cod", "হাতে পেয়ে টাকা", "পেমেন্ট", "ক্যাশ অন ডেলিভারি"],
  "Return": ["return", "exchange", "নষ্ট হলে", "পাল্টানো", "রিটার্ন", "চেঞ্জ", "change", "replace"],
  "Discount": ["discount", "offer", "অফার", "কম", "রাখেন", "ছাড়", "ডিসকাউন্ট", "less", "honor", "koman"],
  "Stock": ["stock", "available", "আছে কি", "এভেইলেবল", "পাব", "stock out", "আছে", "পাবেন"],
  "Size": ["size", "measurement", "long", "inch", "বড়", "ছোট", "মাপ", "সাইজ", "কয় ইঞ্চি", "size ki ase"],
  "Color": ["color", "colour", "rong", "red", "black", "white", "রঙ", "কালার", "কি কি কালার"],
  "Material": ["material", "fabric", "kapdor", "quality", "সুতি", "কাপড়", "ফেব্রিক", "কোয়ালিটি"],
  "Contact": ["phone", "number", "contact", "call", "মোবাইল", "নাম্বার", "ফোন", "যোগাযোগ"],
  "Booking": ["book", "advance", "booking", "এডভান্স", "বুকিং"],
};

function cleanNoise(text) {
  if (!text) return "";
  let words = text.toLowerCase().split(/\s+/);
  return words.filter(w => !noiseWords.includes(w)).join(" ");
}

function getLinguisticVariations(keyword) {
  if (!keyword || typeof keyword !== 'string') return [];
  
  let result = new Set();
  const lowerKw = keyword.toLowerCase();
  result.add(lowerKw);
  
  // 1. Identify Intent Category
  let detectedCores = [];
  const cleanedKw = cleanNoise(lowerKw);
  const phoneticKw = normalizePhonetic(lowerKw);

  for (const [category, variants] of Object.entries(coreKeywordMap)) {
    const isMatch = variants.some(v => 
      lowerKw.includes(v.toLowerCase()) || 
      cleanedKw.includes(v.toLowerCase()) ||
      v.toLowerCase().includes(cleanedKw) ||
      normalizePhonetic(v) === phoneticKw
    );

    if (isMatch || category.toLowerCase() === lowerKw) {
      detectedCores = [...detectedCores, ...variants];
    }
  }

  // If no category matched, use the keyword itself as core
  if (detectedCores.length === 0) {
    detectedCores = [lowerKw];
  }

  // 2. Generate Permutations (Max SEO & Typo Coverage)
  detectedCores.forEach(core => {
    result.add(core);
    result.add(normalizePhonetic(core));
    
    // Mix with common conversational wrappers
    prefixes.forEach(pre => {
      suffixes.forEach(suf => {
        const combined = `${pre} ${core} ${suf}`.trim();
        if (combined) {
          result.add(combined);
          // Add common "Benglish" phonetic variations
          if (core === "price" || core === "dam") {
            result.add(`${pre} price koto`.trim());
            result.add(`${pre} dam koto`.trim());
          }
        }
      });
    });
  });

  // 3. Final Polish: Filter unique and limit
  return Array.from(result)
    .filter(v => v.length > 1)
    .slice(0, 200);
}

module.exports = { getLinguisticVariations, normalizePhonetic, cleanNoise };
