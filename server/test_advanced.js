require('dotenv').config();
const { db, collection, addDoc, doc, updateDoc, getDoc, setDoc, query, where } = require('./services/firestoreService');
const axios = require('axios');

async function runTest() {
    console.log("--- STARTING INTERNAL ADVANCED VERIFICATION ---");

    const brandId = 'Azlaan'; 
    const pageId = process.env.FACEBOOK_PAGE_ID || '123456789';
    
    // 1. Create/Update Brand Settings
    console.log(`Ensuring brand ${brandId} exists with settings...`);
    const brandRef = doc(db, "brands", brandId);
    await setDoc(brandRef, {
        name: 'Azlaan Skincare',
        facebookPageId: pageId,
        fbPageToken: process.env.PAGE_ACCESS_TOKEN || process.env.FB_PAGE_TOKEN,
        googleAIKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY,
        commentSettings: {
            autoLike: true,
            spamFilter: true,
            leadCapture: true,
            sentimentAnalysis: true,
            humanDelay: true
        }
    }, { merge: true });

    // 2. Mock Webhook Data
    const positiveComment = {
        object: 'page',
        entry: [{
            id: pageId,
            changes: [{
                field: 'feed',
                value: {
                    item: 'comment',
                    verb: 'add',
                    comment_id: 'test_pos_' + Date.now(),
                    post_id: 'test_post_123',
                    message: 'I really love this page! Best quality ever.',
                    from: { id: 'user_999', name: 'Happy Customer' }
                }
            }]
        }]
    };

    const spamComment = {
        object: 'page',
        entry: [{
            id: pageId,
            changes: [{
                field: 'feed',
                value: {
                    item: 'comment',
                    verb: 'add',
                    comment_id: 'test_spam_' + Date.now(),
                    post_id: 'test_post_123',
                    message: 'FREE WIN MONEY SCAM HERE -> http://fraud.com',
                    from: { id: 'bad_user', name: 'Scammer' }
                }
            }]
        }]
    };

    try {
        console.log("Sending positive comment...");
        await axios.post('http://localhost:3000/webhook', positiveComment);
        
        console.log("Sending spam comment...");
        await axios.post('http://localhost:3000/webhook', spamComment);
        
    } catch (e) {
        console.error("Webhook trigger error:", e.response ? e.response.data : e.message);
    }

    console.log("--- TEST TRIGGERED ---");
    console.log("Check logs for Spam Detection and Sentiment Analysis.");
    process.exit(0);
}

runTest();
