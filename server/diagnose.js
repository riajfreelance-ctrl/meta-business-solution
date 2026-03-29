const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
let serviceAccount;

async function diagnose() {
    console.log('--- Environment Check ---');
    console.log('FACEBOOK_PAGE_ID:', process.env.FACEBOOK_PAGE_ID);
    console.log('APP_SECRET:', process.env.APP_SECRET ? 'SET' : 'MISSING');
    console.log('PAGE_ACCESS_TOKEN:', process.env.PAGE_ACCESS_TOKEN ? 'SET' : 'MISSING');
    console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET' : 'MISSING');

    console.log('\n--- Firebase Check ---');
    if (fs.existsSync(serviceAccountPath)) {
        console.log('Firebase Service Account file found.');
        try {
            serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
            console.log('Service Account project_id:', serviceAccount.project_id);
        } catch (e) {
            console.error('Error parsing service account:', e.message);
        }
    } else {
        console.log('Firebase Service Account file NOT found at:', serviceAccountPath);
    }

    if (!admin.apps.length) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount?.project_id || "advance-automation-8029e"
            });
            console.log('Firebase initialized successfully.');
        } catch (e) {
            console.error('Firebase initialization FAILED:', e.message);
        }
    }

    const db = admin.firestore();
    try {
        const pageId = process.env.FACEBOOK_PAGE_ID;
        if (!pageId) {
            console.error('\nERROR: FACEBOOK_PAGE_ID is missing from .env!');
        } else {
            const snap = await db.collection("brands").where("facebookPageId", "==", pageId).get();
            if (snap.empty) {
                console.log('\nBrand fallback check:');
                console.log('No brand found in Firestore for FACEBOOK_PAGE_ID:', pageId);
                console.log('System will use "Skinzy" hardcoded fallback.');
            } else {
                console.log('\nBrand found in Firestore:', snap.docs[0].data().name);
            }
        }
    } catch (e) {
        console.error('\nFirestore query FAILED:', e.message);
    }

    process.exit(0);
}

diagnose();
