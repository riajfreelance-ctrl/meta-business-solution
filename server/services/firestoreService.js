const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const cache = require('../utils/cache');
require('dotenv').config();

// Use path.join to ensure correct resolution in Vercel environment
const serviceAccountPath = path.join(process.cwd(), 'server', 'firebase-service-account.json');
let serviceAccount;
try {
  const envKey = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || process.env.FIREBASE_SERVICE_ACCOUNT;
  if (envKey) {
    serviceAccount = typeof envKey === 'string' ? JSON.parse(envKey) : envKey;
    // Fix for private key newlines in Vercel env vars
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
  } else if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  } else {
    // Relative fallback
    const altPath = path.join(__dirname, '..', 'firebase-service-account.json');
    if (fs.existsSync(altPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(altPath, 'utf8'));
    }
  }
} catch (e) {
  console.error('Firebase Service Account Load Error:', e.message);
}

if (!admin.apps.length) {
  if (serviceAccount && serviceAccount.private_key) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: "advance-automation-8029e.firebasestorage.app"
    });
    console.log('Firebase initialized with Service Account from Env/File');
  } else {
    // Fallback to project ID (works if authorized via gcloud or on GCP)
    admin.initializeApp({
      projectId: "advance-automation-8029e",
      storageBucket: "advance-automation-8029e.firebasestorage.app"
    });
    console.log('Firebase initialized with Project ID Fallback (might fail without credentials)');
  }
}

const db = admin.firestore();

// Helper to handle the "owner_dev_brand" fallback logic
async function getBrandByPlatformId(platformId, type = 'facebook') {
  const cacheKey = `brand_${type}_${platformId}`;
  const cachedBrand = cache.get(cacheKey);
  if (cachedBrand) return cachedBrand;

  let field = "facebookPageId";
  if (type === 'instagram') field = "instagramId";
  if (type === 'whatsapp') field = "whatsappPhoneId";

  const snap = await db.collection("brands").where(field, "==", platformId).get();
  
  let brandData = null;
  if (!snap.empty) {
    const docData = snap.docs[0];
    brandData = { id: docData.id, ...docData.data() };
  } else {
    // Owner Fallback (.env)
    const envFB = process.env.FACEBOOK_PAGE_ID;
    const envIG = process.env.INSTAGRAM_ID;
    const envWA = process.env.WHATSAPP_PHONE_ID;

    if (platformId && (platformId === envFB || platformId === envIG || platformId === envWA)) {
      brandData = {
        id: 'Skinzy',
        name: 'Skinzy',
        facebookPageId: envFB,
        instagramId: envIG,
        whatsappPhoneId: envWA,
        fbPageToken: process.env.PAGE_ACCESS_TOKEN || process.env.FB_PAGE_TOKEN,
        googleAIKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY,
        waAccessToken: process.env.WA_ACCESS_TOKEN || process.env.WA_PAGE_TOKEN,
        // Automation settings — all ON by default for owner brand
        inboxSettings: {
          systemAutoReply: true,
          aiReply: true,
          humanHandoff: false
        },
        aiSettings: {
          inboxAiEnabled: true
        },
        commentSettings: {
          systemAutoReply: true,
          aiReply: true,
          autoLike: false,
          spamFilter: false,
          humanHandoff: false
        },
        isDevFallback: true
      };
    }
  }

  if (brandData) {
    // Cache for 10 minutes for better performance
    cache.set(cacheKey, brandData, 600000);
  }

  return brandData;
}

// Exports
module.exports = {
  admin,
  db,
  getBrandByPlatformId,
  // Export FieldValue for serverTimestamp
  FieldValue: admin.firestore.FieldValue,
  // Re-export constants/helpers for compatibility if needed (legacy bridges)
  serverTimestamp: admin.firestore.FieldValue.serverTimestamp
};
