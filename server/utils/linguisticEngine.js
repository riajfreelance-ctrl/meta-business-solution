/**
 * 👑 ULTIMATE PHONETIC BRIDGE: Bangla <-> Romanized (Benglish) Convergence 👑
 * Maps native script to romanized phonetics for seamless matching.
 */

const phoneticMap = {
  'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng',
  'চ': 'ch', 'ছ': 'chh', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'n',
  'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n',
  'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
  'প': 'p', 'ফ': 'f', 'ব': 'b', 'ভ': 'bh', 'ম': 'm',
  'য': 'j', 'র': 'r', 'ল': 'l', 'শ': 'sh', 'ষ': 'sh', 'স': 's', 'হ': 'h',
  'ড়': 'r', 'ঢ়': 'rh', 'য়': 'y', 'ৎ': 't',
  'া': 'a', 'ি': 'i', 'ী': 'ee', 'ু': 'u', 'ূ': 'oo', 'ৃ': 'ri', 'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou'
};

/**
 * Normalizes any text (Bangla or English) into a standard "Phonetic ID"
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
    .replace(/h/g, '') // Flatten kh/gh/ph to base sounds for wider matching
    .replace(/aa/g, 'a').replace(/ee/g, 'i').replace(/oo/g, 'u')
    .replace(/s/g, 'sh').replace(/z/g, 'j')
    .replace(/(.)\1+/g, '$1'); // Remove double letters (damm -> dam)

  return phonetic;
}

const prefixes = ["", "bhai", "aphu", "admin", "hey", "ei", "hello", "ey", "ji"];
const suffixes = ["", "bolen", "den", "den plz", "bolun plz", "ache?", "pabo?", "ki"];

const coreKeywordMap = {
  "Greeting": ["hi", "hello", "salam", "slm", "hey"],
  "Price": ["price", "dam", "p?", "tk", "taka", "koto", "damm"],
  "Delivery": ["delivery", "charge", "dhaka baire", "home delivery", "charge koto"],
  "Authenticity": ["asol", "original", "copy", "brand", "real", "fake"],
  "Location": ["shop", "address", "location", "শোরুম", "ঠিকানা", "আউটলেট"],
  "How to Order": ["order", "buy", "নিব", "নিতে চাই", "process"],
  "COD": ["cash on delivery", "cod", "হাতে পেয়ে টাকা", "পেমেন্ট"],
  "Return": ["return", "exchange", "নষ্ট হলে", "পাল্টানো", "রিটার্ন"],
  "Discount": ["discount", "offer", "অফার", "কম", "রাখেন", "ছাড়"],
  "Stock": ["stock", "available", "আছে কি", "এভেইলেবল", "পাব"],
};

function getLinguisticVariations(keyword) {
  if (!keyword || typeof keyword !== 'string') return [];
  
  let result = new Set();
  const phoneticBase = normalizePhonetic(keyword);
  result.add(phoneticBase);

  // Find matching core keywords
  let cores = [keyword.toLowerCase()];
  for (const [key, coreList] of Object.entries(coreKeywordMap)) {
    if (keyword.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(keyword.toLowerCase())) {
      cores = Array.from(new Set([...cores, ...coreList]));
      break;
    }
  }

  cores.forEach(core => {
    prefixes.forEach(pre => {
      suffixes.forEach(suf => {
        const combined = `${pre} ${core} ${suf}`.trim();
        result.add(combined);
        result.add(normalizePhonetic(combined)); // Add phonetic versions too
      });
    });
  });

  return Array.from(result).slice(0, 150);
}

module.exports = { getLinguisticVariations, normalizePhonetic };
