const { db, serverTimestamp, getBrandByPlatformId } = require('../services/firestoreService');
const { getDynamicModel } = require('../services/geminiService');
const { getLinguisticVariations, normalizePhonetic, cleanNoise } = require('../utils/linguisticEngine');

const serverLog = (msg) => console.log(`[WA Controller] ${msg}`);
const { extractPhoneNumber, extractAddressSignals, detectBasicIntent } = require('../utils/extractors');
const Fuse = require('fuse.js');
const axios = require('axios');
const crypto = require('crypto');
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
    // HMAC Signature Validation (Security Phase 1)
    const signature = req.headers['x-hub-signature-256'] || req.headers['x-hub-signature'];
    const appSecret = process.env.WA_APP_SECRET || process.env.APP_SECRET;

    if (appSecret && signature && req.rawBody) {
        const hmac = crypto.createHmac('sha256', appSecret);
        hmac.update(req.rawBody);
        const digest = 'sha256=' + hmac.digest('hex');
        
        if (signature !== digest) {
            serverLog(`[SECURITY] WA Webhook signature mismatch!`);
            if (process.env.NODE_ENV === 'production') return res.sendStatus(403);
        }
    }

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

            if (message.text) {
                const text = message.text.body;
                processIncomingWAMessage(sender_wa_id, text, brandData, message.id).catch(console.error);
            } else if (message.image) {
                processIncomingWAMessage(sender_wa_id, null, brandData, message.id, message.image).catch(console.error);
            } else if (message.voice || message.audio) {
                const audioObj = message.voice || message.audio;
                processIncomingWAMessage(sender_wa_id, null, brandData, message.id, null, audioObj).catch(console.error);
            }
        }
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
}

async function processIncomingWAMessage(wa_id, text, brandData, messageId, imageObj = null, audioObj = null) {
    // 1. Log and get current state
    const convoData = await logWAMessage(wa_id, text || "[Image]", brandData);

    if (imageObj) {
        // Handle image via WhatsApp media API
        const mediaUrl = await getWAMediaUrl(imageObj.id, brandData);
        if (mediaUrl) {
            await handleWAVisionResponse(wa_id, mediaUrl, text, brandData);
        }
        return;
    }

    if (audioObj) {
        // Handle voice/audio transcription (Phase 5)
        const mediaUrl = await getWAMediaUrl(audioObj.id, brandData);
        if (mediaUrl) {
            const { transcribeAudio } = require('../services/audioService');
            const transcription = await transcribeAudio(mediaUrl, brandData, brandData.whatsappToken);
            if (transcription) {
                serverLog(`[WA VOICE] Transcribed ${wa_id}: "${transcription}"`);
                text = transcription;
                // Continue to normal text matching
            }
        }
    }

    if (!text) return;

    // ── NEW DETERMINISTIC FLOW (ManyChat Style) ──
    const lowerText = (text || "").toLowerCase();
    const flowHandled = await handleDeterministicFlow(wa_id, text || "", convoData, brandData);
    if (flowHandled) return;

    // --- PHASE 4: Learning Mode (Passive Training) ---
    if (brandData.isLearningMode) {
        serverLog(`[WA LEARNING MODE] Active for ${brandData.name}. Skipping automated responses.`);
        await db.collection('conversations').doc(wa_id).update({
            status: 'pending',
            isPriority: true,
            lastUpdate: Date.now()
        });
        return; 
    }

    // 2. Automated Lead Capture via Regex Extractors (Passive capture)
    const detectedPhone = extractPhoneNumber(text);
    let detectedAddress = null;
    
    if (detectedPhone && text.length > 15) {
        const cleanText = text.replace(new RegExp(detectedPhone, 'g'), '').trim();
        const addressData = extractAddressSignals(cleanText);
        if (addressData.detected) detectedAddress = cleanText;
    }

    if (detectedPhone || detectedAddress) {
        serverLog(`[WA Lead] Captured Phone: ${detectedPhone}, Address: ${detectedAddress}`);
        const convoRef = db.collection('conversations').doc(wa_id);
        const updateData = { isLead: true };
        if (detectedPhone) updateData.customerPhone = detectedPhone;
        if (detectedAddress) updateData.customerAddress = detectedAddress;
        await convoRef.set(updateData, { merge: true });
    }

    // 3. Knowledge Base Check
    const kbSnap = await db.collection('knowledge_base')
        .where('brandId', '==', brandData.id)
        .where('keywords', 'array-contains', lowerText)
        .get();
    
    if (!kbSnap.empty) {
        const answer = kbSnap.docs[0].data().answer;
        await sendWAMessage(wa_id, answer, brandData, messageId);
        return;
    }

    // 4. Draft First Check (Fuzzy match)
    const matchedReply = await getApprovedInboxDraft(text, brandData.id, convoData);
    if (matchedReply) {
        serverLog(`[WA DRAFT] Approved match found: ${text}`);
        await sendWAMessage(wa_id, matchedReply.text, brandData, messageId);
        // Track last matched draft for autonomous learning
        await db.collection('conversations').doc(wa_id).update({
            lastMatchedDraftId: matchedReply.draftId || null
        });
        return;
    }

    // 5. AI Fallback
    await handleWAAIResponse(wa_id, text, brandData, messageId);
}

// ── DETERMINISTIC BOT: Match Approved Inbox Drafts via Fuzzy NLP ──
async function getApprovedInboxDraft(message, brandId, convoData) {
    // ── KNOWLEDGE BASE SEARCH (Fuzzy + Phonetic) ──
    const knowledgeBase = await db.collection("draft_replies")
        .where("brandId", "==", brandId)
        .where("status", "==", "approved")
        .get();

    const drafts = knowledgeBase.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const searchableRecords = [];

    drafts.forEach(draft => {
        // Collect all variations including phonetic ones
        const allPhrases = new Set([
            draft.keyword, 
            ...(draft.variations || []), 
            normalizePhonetic(draft.keyword)
        ]);
        
        allPhrases.forEach(phrase => {
            if (phrase) searchableRecords.push({ phrase, result: draft.result, draftId: draft.id });
        });
    });

    if (searchableRecords.length === 0) return null;

    const lowerText = message.toLowerCase();
    const normalizedInput = normalizePhonetic(lowerText);
    const cleanedInput = cleanNoise(lowerText);

    const fuse = new Fuse(searchableRecords, {
        keys: ['phrase'],
        includeScore: true,
        threshold: 0.3,
        ignoreLocation: true
    });

    // Try primary match, then phonetic, then noise-cleaned fallback
    let results = fuse.search(lowerText);
    if (results.length === 0 || results[0].score > 0.2) {
        const phoneticResults = fuse.search(normalizedInput);
        if (phoneticResults.length > 0 && (!results[0] || phoneticResults[0].score < results[0].score)) {
            results = phoneticResults;
        }
    }
    // 3rd pass: noise-stripped input (e.g. 'bhai dam koto?' -> 'dam koto?')
    if ((results.length === 0 || results[0].score > 0.2) && cleanedInput !== lowerText) {
        const cleanedResults = fuse.search(cleanedInput);
        if (cleanedResults.length > 0 && (!results[0] || cleanedResults[0].score < results[0].score)) {
            results = cleanedResults;
        }
    }

    if (results.length > 0) {
        // ── OPTION 1: PRIORITIZE SUCCESSFUL REPLIES ──
        results.sort((a, b) => {
            if (a.score < 0.1 && b.score >= 0.1) return -1;
            if (b.score < 0.1 && a.score >= 0.1) return 1;
            const countA = drafts.find(d => d.id === a.item.draftId)?.successCount || 0;
            const countB = drafts.find(d => d.id === b.item.draftId)?.successCount || 0;
            return countB - countA;
        });

        const bestMatch = results[0];
        if (bestMatch.score <= 0.35) {
            let resultText = bestMatch.item.result;
            
            // ── MOOD-TARGETED TONE INJECTION ──
            const sentiment = convoData?.sentiment || 'Neutral';
            if (sentiment === 'Negative') {
                const apologies = [
                    "আন্তরিকভাবে দুঃখিত আপনার অসুবিধার জন্য। ",
                    "আমরা আপনার সমস্যার জন্য দুঃখ প্রকাশ করছি। ",
                    "আপনার অভিজ্ঞতার জন্য আমরা ক্ষমাবপ্রার্থী। "
                ];
                const prefix = apologies[Math.floor(Math.random() * apologies.length)];
                resultText = prefix + resultText;
            }

            serverLog(`[WA Phonetic Match] Score: ${bestMatch.score.toFixed(3)} | Input: ${lowerText} | Match: ${bestMatch.item.phrase}`);
            return { text: resultText, draftId: bestMatch.item.draftId };
        }
    }

    return null;
}

/**
 * REFINED FILTER: Collect basic greetings but ignore binary Yes/No/Ok.
 */
function shouldCaptureAsDraft(text) {
    if (!text || typeof text !== 'string') return false;
    const clean = text.trim().toLowerCase();
    const blacklist = ['হাঁ', 'না', 'হ্যাঁ', 'ok', 'hm', 'hmm', 'yes', 'no', 'okey', 'thx', 'ty', 'thanks', 'ধন্যবাদ'];
    if (blacklist.includes(clean)) return false;
    return clean.length >= 2 && clean.length < 200;
}

async function handleWAAIResponse(wa_id, text, brandData, messageId) {
    try {
        const apiKey = brandData.googleAIKey || process.env.GEMINI_API_KEY;
        const blueprint = brandData.blueprint || {};
        const model = await getDynamicModel(apiKey);

        // Fetch products for context
        const prodSnap = await db.collection('products').where('brandId', '==', brandData.id).get();
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
        
        await sendWAMessage(wa_id, responseText, brandData, messageId);

        // ── AUTO-LEARNING QUEUE (Capture AI for future rules) ──
        if (shouldCaptureAsDraft(text)) {
            const variations = (brandData.autoHyperIndex !== false) ? getLinguisticVariations(text) : [];
            await db.collection("draft_replies").add({
                keyword: text,
                result: responseText,
                variations: variations,
                status: 'pending',
                type: 'auto_learned',
                brandId: brandData.id,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                successCount: 0
            });
            serverLog(`[Auto-Learn] Capturing AI suggestion (Hyper-Index: ${brandData.autoHyperIndex !== false})`);
        }
    } catch (e) {
        serverLog(`[WA AI Error]: ${e.message}`);
    }
}

async function sendWAMessage(wa_id, text, brandData, messageId) {
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

        // ── GHOST MODE: Mark message as read ONLY when replying ──
        if (messageId) {
            await axios.post(
                `https://graph.facebook.com/v17.0/${brandData.whatsappPhoneId}/messages`,
                {
                    messaging_product: "whatsapp",
                    status: "read",
                    message_id: messageId
                },
                { headers: { Authorization: `Bearer ${brandData.waAccessToken}` } }
            ).catch(err => serverLog(`[WA Read Receipt Error]: ${err.message}`));
        }
        
        // Log outgoing and clear unread flag
        await db.collection('conversations').doc(wa_id).update({ unread: false });

        // EXPERT CAPTURE: If an agent sends a manual message, save it as a potential draft
        if (shouldCaptureAsDraft(text) && !messageId) {
            const history = await db.collection(`conversations/${wa_id}/messages`)
                .orderBy('timestamp', 'desc')
                .limit(2)
                .get();
            const lastMsg = history.docs.find(d => d.data().type === 'received')?.data().text;

            if (lastMsg && shouldCaptureAsDraft(lastMsg)) {
                const variations = (brandData.autoHyperIndex !== false) ? getLinguisticVariations(lastMsg) : [];
                await db.collection("draft_replies").add({
                    keyword: lastMsg,
                    result: text,
                    variations: variations,
                    status: 'pending',
                    type: 'expert_learned',
                    brandId: brandData.id,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    successCount: 0
                });
                serverLog(`[Expert-Learn] Agent teaching bot (Hyper-Index: ${brandData.autoHyperIndex !== false})`);
            }
        }

        await db.collection('logs').add({ 
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
    const convoRef = db.collection('conversations').doc(wa_id);
    
    const doc = await convoRef.get();
    const currentData = doc.exists ? doc.data() : {};

    const updateData = {
        id: wa_id,
        brandId: brandData.id,
        platform: 'whatsapp',
        name: currentData.name || `WA User (${wa_id})`,
        lastMessage: text || '',
        timestamp: serverTimestamp(),
        unread: true
    };

    await convoRef.set(updateData, { merge: true });

    await db.collection(`conversations/${wa_id}/messages`).add({
        text: text || '',
        type: 'received',
        brandId: brandData.id,
        platform: 'whatsapp',
        timestamp: serverTimestamp(),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    });

    return { ...currentData, ...updateData };
}

/**
 * Cross-platform linking: If a phone number is detected, find other convos with same phone.
 */
async function linkConversationsByPhone(convoId, phone, brandId) {
    if (!phone) return;
    try {
        const snapshot = await db.collection('conversations')
            .where('brandId', '==', brandId)
            .where('customerPhone', '==', phone)
            .get();

        const otherIds = snapshot.docs
            .map(doc => doc.id)
            .filter(id => id !== convoId);

        if (otherIds.length > 0) {
            serverLog(`[WA Linking] Convo ${convoId} linked to ${otherIds.join(', ')} via phone ${phone}`);
            await db.collection('conversations').doc(convoId).update({
                linkedConvos: admin.firestore.FieldValue.arrayUnion(...otherIds)
            });
            for (const otherId of otherIds) {
                await db.collection('conversations').doc(otherId).update({
                    linkedConvos: admin.firestore.FieldValue.arrayUnion(convoId)
                });
            }
        }
    } catch (e) {
        serverLog(`[WA Linking Error] ${e.message}`);
    }
}

/**
 * DETERMINISTIC STATE MACHINE (ManyChat Style)
 */
async function handleDeterministicFlow(wa_id, text, convoData, brandData) {
    const state = convoData.botState || 'IDLE';
    const lowerText = (text || "").toLowerCase();

    // 1. GREETING -> START ORDER FLOW
    const basicIntent = detectBasicIntent(text);
    if (state === 'IDLE') {
        if (basicIntent.intent === 'WANT_TO_ORDER' || (lowerText.includes('order') && lowerText.length < 10)) {
            await sendWAMessage(wa_id, "নিশ্চিত করুন, অর্ডার করার জন্য আপনার একটি সচল ফোন নম্বর দিন।", brandData);
            await db.collection('conversations').doc(wa_id).update({ botState: 'AWAITING_PHONE' });
            return true;
        }
    }

    // 2. COLLECTING PHONE
    if (state === 'AWAITING_PHONE') {
        const phone = extractPhoneNumber(text);
        if (phone) {
            await db.collection('conversations').doc(wa_id).update({ 
                botState: 'AWAITING_ADDRESS',
                customerPhone: phone 
            });
            // Link cross-platform convos
            await linkConversationsByPhone(wa_id, phone, brandId);
            await sendWAMessage(wa_id, "ধন্যবাদ! এখন আপনার পূর্ণাঙ্গ ঠিকানাটি (জেলাসহ) লিখুন।", brandData);
            return true;
        } else {
            await sendWAMessage(wa_id, "দুঃখিত, নম্বরটি সঠিক মনে হচ্ছে না। দয়া করে আপনার ১১ ডিজিটের ফোন নম্বরটি আবার দিন।", brandData);
            return true;
        }
    }

    // 3. COLLECTING ADDRESS
    if (state === 'AWAITING_ADDRESS') {
        const addressData = extractAddressSignals(text);
        if (addressData.detected) {
            const summary = `আপনার তথ্যগুলোঃ\n📞 ফোন: ${convoData.customerPhone}\n📍 ঠিকানা: ${text}\n\nসবকিছু কি ঠিক আছে? (হ্যাঁ / না লিখুন)`;
            await db.collection('conversations').doc(wa_id).update({ 
                botState: 'AWAITING_CONFIRMATION',
                customerAddress: text
            });
            await sendWAMessage(wa_id, summary, brandData);
            return true;
        } else {
            await sendWAMessage(wa_id, "আপনার ঠিকানাটি একটু বিস্তারিত লিখুন (যেমন: হাউজ নাম্বার, রোড, জেলা)।", brandData);
            return true;
        }
    }

    // 4. ORDER CONFIRMATION
    if (state === 'AWAITING_CONFIRMATION') {
        const yesKeywords = ['yes', 'confirm', 'thik ase', 'ok', 'ha', 'হ্যাঁ', 'ঠিক আছে'];
        const noKeywords = ['no', 'na', 'bhul', 'change', 'না', 'ভুল'];

        if (yesKeywords.some(kw => lowerText.includes(kw))) {
            const lastDraftId = convoData.lastMatchedDraftId;
            await db.collection('conversations').doc(wa_id).update({ 
                botState: 'IDLE',
                isLead: true 
            });

            // ── OPTION 1: AUTONOMOUS LEARNING LOOP (Self-Tuning) ──
            if (lastDraftId) {
                serverLog(`[WA Learning] Incrementing successCount for Draft: ${lastDraftId}`);
                await db.collection('draft_replies').doc(lastDraftId).update({
                    successCount: admin.firestore.FieldValue.increment(1)
                });
            }

            await sendWAMessage(wa_id, "চমৎকার! আপনার অর্ডারটি কনফার্ম করা হয়েছে। আমাদের প্রতিনিধি শীঘ্রই যোগাযোগ করবেন। ✨", brandData);
            return true;
        } else if (noKeywords.some(kw => lowerText.includes(kw))) {
            await db.collection('conversations').doc(wa_id).update({ botState: 'AWAITING_PHONE' });
            await sendWAMessage(wa_id, "দুঃখিত! দয়া করে আপনার সঠিক ফোন নম্বরটি আবার দিন।", brandData);
            return true;
        }
    }

    return false;
}

async function sendMessageFromDashboard(req, res) {
    const { recipientId, text, brandId } = req.body;
    if (!recipientId || !text || !brandId) return res.status(400).send('Missing fields');

    try {
        const brandDoc = await db.collection('brands').doc(brandId).get();
        if (!brandDoc.exists) return res.status(404).send('Brand not found');
        const brandData = brandDoc.data();
        brandData.id = brandId;

        await sendWAMessage(recipientId, text, brandData);

        // --- PHASE 3: Bulk Auto-Learning (Staff Training) ---
        if (text && text.length > 2) {
            try {
                const msgSnap = await db.collection(`conversations/${recipientId}/messages`)
                    .orderBy('timestamp', 'desc')
                    .limit(15)
                    .get();
                
                const messages = msgSnap.docs.map(d => d.data());
                const firstSentIdx = messages.findIndex(m => m.type === 'sent');
                const unrepliedReceived = (firstSentIdx === -1) 
                    ? messages.filter(m => m.type === 'received')
                    : messages.slice(0, (firstSentIdx === -1 ? messages.length : firstSentIdx)).filter(m => m.type === 'received');

                if (unrepliedReceived.length > 0) {
                    const aggregatedText = unrepliedReceived
                        .filter(m => m.text && m.text !== "[Image]")
                        .reverse()
                        .map(m => m.text)
                        .join(" ");

                    // WhatsApp image handling might vary, assuming we store it simply
                    if (aggregatedText.length > 2) {
                        const variations = (brandData.autoHyperIndex !== false) ? getLinguisticVariations(aggregatedText) : [];
                        await db.collection("draft_replies").add({
                            keyword: aggregatedText,
                            result: text,
                            variations: variations,
                            status: 'pending',
                            type: 'expert_learned',
                            brandId: brandData.id,
                            timestamp: serverTimestamp(),
                            successCount: 0,
                            metadata: { wa_id: recipientId, source: 'wa_dashboard_bulk_learn' }
                        });
                        serverLog(`[WA Bulk-Learn] Captured context for brand: ${brandId}`);
                    }
                }
            } catch (e) {
                serverLog(`[WA Auto-Learn Error]: ${e.message}`);
            }
        }

        res.json({ success: true });
    } catch (error) {
        serverLog(`[WA SEND ERROR]: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
}

/**
 * WhatsApp Vision Handler (Non-AI Focus)
 */
async function handleWAVisionResponse(wa_id, imageUrl, text, brandData) {
    try {
        // --- PHASE 4: Learning Mode Check ---
        if (brandData.isLearningMode) {
            serverLog(`[WA Vision Learning Mode] Skipping auto-reply for image.`);
            await db.collection('conversations').doc(wa_id).update({
                status: 'pending',
                isPriority: true,
                lastUpdate: Date.now()
            });
            return;
        }

        const { generatePHash, getHammingDistance } = require('../services/imageFingerprintService');
        const { findProductByPHash } = require('../services/productFingerprintService');
        
        const incomingHash = await generatePHash(imageUrl);
        if (!incomingHash) return;

        // 1. Zero-Token Product Match
        const productMatch = await findProductByPHash(brandData.id, incomingHash);
        if (productMatch) {
            const reply = `আপনার পাঠানো ছবিটি আমাদের "${productMatch.productName}" এর। এর দাম ${productMatch.offerPrice || productMatch.price} টাকা। আপনি কি এটি অর্ডার করতে চান? ✨`;
            await sendWAMessage(wa_id, reply, brandData);
            return;
        }

        // 2. OCR + Context Fallback (Tesseract)
        try {
            const Tesseract = require('tesseract.js');
            const { data: { text: ocrText } } = await Tesseract.recognize(imageUrl, 'ben+eng');
            
            const historySnap = await db.collection(`conversations/${wa_id}/messages`)
                .orderBy('timestamp', 'desc')
                .limit(2)
                .get();
            const precedingText = historySnap.docs.find(d => d.data().type === 'received' && d.data().text !== "[Image]")?.data()?.text || "";
            const context = (precedingText + " " + (ocrText || "")).trim();

            if (context.length > 5) {
                const matchedReply = await getApprovedInboxDraft(context, brandData.id, {});
                if (matchedReply) {
                    await sendWAMessage(wa_id, matchedReply.text, brandData);
                    return;
                }
            }
        } catch (e) { console.error(e); }

        serverLog(`[WA Vision] No non-AI match found. Moving to staff dashboard.`);
    } catch (e) {
        serverLog(`[WA Vision Error]: ${e.message}`);
    }
}

async function getWAMediaUrl(mediaId, brandData) {
    try {
        const response = await axios.get(
            `https://graph.facebook.com/v17.0/${mediaId}`,
            { headers: { Authorization: `Bearer ${brandData.waAccessToken}` } }
        );
        return response.data.url;
    } catch (e) {
        serverLog(`[WA Media Error]: ${e.message}`);
        return null;
    }
}

module.exports = {
    verifyWAWebhook,
    handleWAWebhook,
    sendMessageFromDashboard
};
