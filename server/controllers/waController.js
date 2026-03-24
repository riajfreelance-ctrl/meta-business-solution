const { db, collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc, getBrandByPlatformId } = require('../services/firestoreService');
const { getDynamicModel } = require('../services/geminiService');
const { serverLog } = require('../utils/logger');
const axios = require('axios');

// Webhook Verification for WhatsApp
async function verifyWAWebhook(req, res) {
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
    
    const globalToken = process.env.WA_VERIFY_TOKEN || 'whatsapp_token_123';

    if (mode && token) {
        if (mode === 'subscribe' && token === globalToken) {
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);      
        }
    }
}

// Handle WhatsApp Webhook Post
async function handleWAWebhook(req, res) {
    const body = req.body;
    console.log("-----------------------------------------");
    console.log(`[WA WEBHOOK] Object: ${body.object}`);
    if (body.object === 'whatsapp_business_account') {
        if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
            const change = body.entry[0].changes[0].value;
            const phone_number_id = change.metadata.phone_number_id;
            const message = change.messages[0];
            const sender_wa_id = message.from;

            const brandData = await getBrandByPlatformId(phone_number_id, 'whatsapp');
            
            if (!brandData) {
                serverLog(`[WA WARNING] No brand found for Phone ID: ${phone_number_id}`);
                return res.sendStatus(200);
            }

            // Reuse the same logic as FB/IG
            await processIncomingWAMessage(sender_wa_id, text, brandData);
        }
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
}

async function processIncomingWAMessage(wa_id, text, brandData) {
    if (!text) return;

    // 1. Log to Firestore
    await logWAMessage(wa_id, text, brandData);

    // 2. AI Response
    await handleWAAIResponse(wa_id, text, brandData);
}

async function handleWAAIResponse(wa_id, text, brandData) {
    try {
        const apiKey = brandData.googleAIKey || process.env.GEMINI_API_KEY;
        const blueprint = brandData.blueprint || {};
        const model = await getDynamicModel(apiKey);

        // Fetch products for context
        const prodSnap = await getDocs(query(collection(db, 'products'), where('brandId', '==', brandData.id)));
        const products = prodSnap.docs.map(d => ({ 
            name: d.data().name, 
            price: d.data().price, 
            stock: d.data().stockStatus || 'In Stock'
        }));

        const prompt = `You are a WhatsApp sales assistant for "${brandData.name}". 
        Our Catalog: ${JSON.stringify(products)}
        User Query: "${text}"`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        await sendWAMessage(wa_id, responseText, brandData);
    } catch (e) {
        serverLog(`[WA AI Error]: ${e.message}`);
    }
}

async function sendWAMessage(wa_id, text, brandData) {
    if (!brandData.waAccessToken || !brandData.whatsappPhoneId) {
        serverLog(`[WA Error] Missing tokens for Brand: ${brandData.name}`);
        return;
    }

    try {
        await axios.post(
            `https://graph.facebook.com/v17.0/${brandData.whatsappPhoneId}/messages`,
            {
                messaging_product: "whatsapp",
                to: wa_id,
                text: { body: text },
            },
            { headers: { Authorization: `Bearer ${brandData.waAccessToken}` } }
        );
        
        // Log outgoing
        await addDoc(collection(db, 'logs'), { 
            sender_wa_id: wa_id, 
            text, 
            type: 'bot', 
            platform: 'whatsapp',
            brandId: brandData.id,
            timestamp: Date.now() 
        });
    } catch (error) {
        serverLog("WA SEND ERROR: " + (error.response?.data?.error?.message || error.message));
    }
}

async function logWAMessage(wa_id, text, brandData) {
    const convoRef = doc(db, 'conversations', wa_id);
    await updateDoc(convoRef, {
        id: wa_id,
        brandId: brandData.id,
        platform: 'whatsapp',
        name: `WA User (${wa_id})`,
        lastMessage: text,
        timestamp: serverTimestamp(),
        unread: true
    }, { merge: true });

    await addDoc(collection(db, `conversations/${wa_id}/messages`), {
        text,
        type: 'received',
        brandId: brandData.id,
        platform: 'whatsapp',
        timestamp: serverTimestamp()
    });
}

module.exports = {
    verifyWAWebhook,
    handleWAWebhook
};
