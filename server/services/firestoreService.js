const { initializeApp: initializeFirebase } = require('firebase/app');
const { 
  getFirestore, collection, addDoc, serverTimestamp, 
  query, where, getDocs, updateDoc, doc, limit, orderBy, getDoc, setDoc 
} = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBfGtLofGKrYIXO8Jw1caphsuN014HHiLA",
  authDomain: "advance-automation-8029e.firebaseapp.com",
  projectId: "advance-automation-8029e",
  storageBucket: "advance-automation-8029e.firebasestorage.app",
  messagingSenderId: "240143294821",
  appId: "1:240143294821:web:70b101bf7192f4932d018c"
};

const firebaseApp = initializeFirebase(firebaseConfig);
const db = getFirestore(firebaseApp);

async function getBrandByPlatformId(platformId, type = 'facebook') {
  let field = "facebookPageId";
  if (type === 'instagram') field = "instagramId";
  if (type === 'whatsapp') field = "whatsappPhoneId";

  const q = query(collection(db, "brands"), where(field, "==", platformId));
  const snap = await getDocs(q);
  
  if (!snap.empty) {
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
  }

  // Owner Fallback (.env)
  const envFB = process.env.FACEBOOK_PAGE_ID;
  const envIG = process.env.INSTAGRAM_ID;
  const envWA = process.env.WHATSAPP_PHONE_ID;

  if (platformId && (platformId === envFB || platformId === envIG || platformId === envWA)) {
    return {
      id: 'Azlaan',
      name: 'Azlaan Skincare',
      facebookPageId: envFB,
      instagramId: envIG,
      whatsappPhoneId: envWA,
      fbPageToken: process.env.PAGE_ACCESS_TOKEN || process.env.FB_PAGE_TOKEN,
      googleAIKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY,
      waAccessToken: process.env.WA_ACCESS_TOKEN || process.env.WA_PAGE_TOKEN,
      isDevFallback: true
    };
  }

  return null;
}

module.exports = {
  db,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  limit,
  orderBy,
  getDoc,
  setDoc,
  getBrandByPlatformId
};
