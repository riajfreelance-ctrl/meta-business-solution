/**
 * extractors.js
 * Utility functions for local deterministic entity extraction.
 * Replaces expensive LLM calls for standard data pulling (Phone, Address, Names).
 */

// Matches BD Phone Numbers: 013, 014, 015, 016, 017, 018, 019 with optional +88 or 88 prefix
const BD_PHONE_REGEX = /(?:\+88|88)?(01[3-9]\d{8})/g;

// Simple list of BD districts to help with address detection
const BD_DISTRICTS = [
  'dhaka', 'faridpur', 'gazipur', 'gopalganj', 'jamalpur', 'kishoreganj', 'madaripur', 'manikganj', 'munshiganj', 'mymensingh', 'narayanganj', 'narsingdi', 'netrokona', 'rajbari', 'shariatpur', 'sherpur', 'tangail',
  'bogura', 'joypurhat', 'naogaon', 'natore', 'nawabganj', 'pabna', 'rajshahi', 'sirajgonj',
  'dinajpur', 'gaibandha', 'kurigram', 'lalmonirhat', 'nilphamari', 'panchagarh', 'rangpur', 'thakurgaon',
  'habiganj', 'maulvibazar', 'sunamganj', 'sylhet',
  'bandarban', 'brahmanbaria', 'chandpur', 'chattogram', 'chittagong', 'cumilla', 'comilla', 'cox\'s bazar', 'feni', 'khagrachari', 'lakshmipur', 'noakhali', 'rangamati',
  'bagerhat', 'chuadanga', 'jashore', 'jhenaidah', 'khulna', 'kushtia', 'magura', 'meherpur', 'narail', 'satkhira',
  'barguna', 'barishal', 'bhola', 'jhalokati', 'patuakhali', 'pirojpur'
];

/**
 * Extracts a Bangladeshi phone number from a text string.
 * @param {string} text 
 * @returns {string|null} The phone number or null if not found
 */
const extractPhoneNumber = (text) => {
  if (!text) return null;
  const matches = text.match(BD_PHONE_REGEX);
  if (matches && matches.length > 0) {
    // Return the absolute matched core block, stripping +88/88 if needed or just saving raw
    return matches[0].replace(/\+88|88/, '');
  }
  return null;
};

/**
 * Super lightweight address detection.
 * Checks if the text has standard address keywords or district names.
 * @param {string} text 
 * @returns {Object} { detected: boolean, possibleDistrict: string }
 */
const extractAddressSignals = (text) => {
  if (!text) return { detected: false, possibleDistrict: null };
  const lowerText = text.toLowerCase();
  
  let possibleDistrict = null;
  // Check for districts
  for (const district of BD_DISTRICTS) {
    if (lowerText.includes(district)) {
      possibleDistrict = district;
      break;
    }
  }

  // Address keywords in BN/EN
  const addressKeywords = ['basha', 'bari', 'road', 'road no', 'block', 'sector', 'thana', 'zila', 'village', 'gram', 'post office', 'ps', 'dist', 'apartment', 'flat'];
  const hasKeyword = addressKeywords.some(kw => lowerText.includes(kw));

  const detected = !!possibleDistrict || hasKeyword || text.length > 20;

  return { detected, possibleDistrict };
};

/**
 * Detects Gender signals based on common addressing keywords in BN/EN.
 */
const detectGender = (text) => {
  if (!text) return 'Unknown';
  const lowerText = text.toLowerCase();
  
  const femaleKeywords = ['apu', 'apa', 'sister', 'sis', 'ma\'am', 'madam', 'mrs', 'miss', 'mam', 'আপু', 'আপা', 'ম্যাম'];
  const maleKeywords = ['vai', 'bhai', 'brother', 'bro', 'sir', 'mr', 'mister', 'ভাই', 'ব্রো', 'স্যার'];

  if (femaleKeywords.some(kw => lowerText.includes(kw))) return 'Female';
  if (maleKeywords.some(kw => lowerText.includes(kw))) return 'Male';
  return 'Unknown';
}

/**
 * Detects common intents based strictly on keywords. No LLM needed.
 */
const detectBasicIntent = (text) => {
  if (!text) return { intent: 'UNKNOWN', score: 0 };
  const lowerText = text.toLowerCase();
  
  let intent = 'UNKNOWN';
  let score = 20;

  const priceKeywords = ['price', 'koto', 'dam', 'daam', 'tk', 'taka koto', 'দাম'];
  const orderKeywords = ['order', 'kinbo', 'nibo', 'lagbe', 'konfirm', 'confirm', 'অর্ডার'];
  const locationKeywords = ['location', 'address', 'thikana', 'kothay', 'ঠিকানা'];

  if (priceKeywords.some(kw => lowerText.includes(kw))) {
    intent = 'ASK_PRICE';
    score = 40;
  }
  if (locationKeywords.some(kw => lowerText.includes(kw))) {
    intent = 'ASK_LOCATION';
    score = 60;
  }
  if (orderKeywords.some(kw => lowerText.includes(kw))) {
    intent = 'WANT_TO_ORDER';
    score = 90;
  }

  return { intent, score };
}

/**
 * Normalizes common Banglish spelling variations for better matching/search.
 * e.g. "daam" -> "dam", "kotto" -> "koto", "valo" -> "valo"
 */
const normalizeBanglish = (text) => {
  if (!text) return '';
  return text.toLowerCase()
    .replace(/aa/g, 'a')
    .replace(/ee/g, 'e')
    .replace(/oo/g, 'o')
    .replace(/tt/g, 't')
    .replace(/kk/g, 'k')
    .replace(/pp/g, 'p')
    .replace(/ss/g, 's')
    .replace(/sh/g, 's') // Standardizing sh -> s for fuzzy matching
    .replace(/z/g, 'j')  // Standardizing z -> j
    .replace(/v/g, 'b')  // Standardizing v -> b (common in BN/EN overlap)
    .trim();
}

/**
 * Detects Sentiment based on simple keyword sets.
 */
const detectSentiment = (text) => {
  if (!text) return 'Neutral';
  const normText = normalizeBanglish(text);
  
  const negativeKeywords = ['faker', 'baje', 'kharap', 'faltu', 'slow', 'hate', 'deri', 'paini', 'palam na', 'bad', 'fraud', 'খারাপ', 'ভুয়া', 'পেলুম না'];
  const positiveKeywords = ['valo', 'good', 'nice', 'awesome', 'wow', 'tnx', 'thanks', 'dhonnobad', 'valagse', 'khushi', 'satisfied', 'ভালো', 'ধন্যবাদ', 'পছন্দ'];

  if (negativeKeywords.some(kw => normText.includes(normalizeBanglish(kw)))) return 'Negative';
  if (positiveKeywords.some(kw => normText.includes(normalizeBanglish(kw)))) return 'Positive';
  
  return 'Neutral';
}

module.exports = {
  extractPhoneNumber,
  extractAddressSignals,
  detectBasicIntent,
  detectGender,
  normalizeBanglish,
  detectSentiment,
  BD_DISTRICTS
};
