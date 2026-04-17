const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });

const serviceAccount = require('../server/firebase-service-account.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

// We need to simulate the error object thrown by the fbController/facebookService
const error = new Error(JSON.stringify({
    classification: 'PERMISSION_ERROR',
    code: 190,
    message: 'Error validating access token: Session has expired...'
}));

const brandData = { id: 'Skinzy', name: 'Skinzy' };

async function simulate() {
    console.log('--- Simulating Token Expiration Error Handling ---');
    
    // Manual import because we can't easily require fbController which starts express
    const serverTimestamp = admin.firestore.FieldValue.serverTimestamp;
    
    async function handleFbApiError(error, brandData) {
        if (!brandData || !brandData.id) return;
        try {
            let errObj;
            try {
                errObj = JSON.parse(error.message);
            } catch (e) {
                const msg = error.response?.data?.error?.message || error.message || "";
                const code = error.response?.data?.error?.code;
                errObj = { classification: 'OTHER', code, message: msg };
            }

            const isExpired = 
                errObj.code === 190 || 
                errObj.code === 10 || 
                errObj.code === 2022 ||
                (errObj.message && (errObj.message.includes('expired') || errObj.message.includes('access token')));

            if (isExpired) {
                console.log(`[SIM] Flagging ${brandData.id} as EXPIRED in Firestore...`);
                await db.collection('brands').doc(brandData.id).update({
                    tokenStatus: 'EXPIRED',
                    lastHealthError: errObj.message,
                    lastErrorTimestamp: serverTimestamp()
                });
                console.log('✅ Update successful!');
            }
        } catch (e) {
            console.error('Sim error:', e.message);
        }
    }

    await handleFbApiError(error, brandData);
    
    // Check results
    const doc = await db.collection('brands').doc('Skinzy').get();
    console.log('--- Brand Status After Simulation ---');
    console.log('tokenStatus:', doc.data().tokenStatus);
    console.log('lastHealthError:', doc.data().lastHealthError);
    
    process.exit(0);
}

simulate();
