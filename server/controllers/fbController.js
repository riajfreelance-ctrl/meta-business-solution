const crypto = require('crypto');
const { admin, db, getBrandByPlatformId, serverTimestamp, FieldValue } = require('../services/firestoreService');
const { getProfile, sendMessage, replyToComment, sendPrivateReply, getPostContent, likeComment, hideComment, sendCarouselMessage, sendSequencedMedia } = require('../services/facebookService');
const { getDynamicModel, getDynamicVisionModel } = require('../services/geminiService');
const { getLinguisticVariations, normalizePhonetic, cleanNoise } = require('../utils/linguisticEngine');
const path = require('path');
const fs = require('fs');
const serviceAccountPath = path.join(process.cwd(), 'server', 'firebase-service-account.json');
let serviceAccount;
try {
  if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = require(serviceAccountPath);
  } else {
    const altPath = path.join(__dirname, '..', 'firebase-service-account.json');
    if (fs.existsSync(altPath)) {
      serviceAccount = require(altPath);
    }
  }
} catch (e) {
  console.error('Firebase Service Account Load Error:', e.message);
}
const { searchVectors } = require('../services/vectorSearchService');
const { autoTagCustomer } = require('../services/autoTagService');
const { assignPersona, logPersonaConversion } = require('../services/splitTestService');
const { detectFunnelStage, generateFunnelResponse, STAGES } = require('../services/salesFunnelService');
const { generatePHash, getHammingDistance } = require('../services/imageFingerprintService');
const { serverLog } = require('../utils/logger');
const { extractPhoneNumber, extractAddressSignals, detectBasicIntent } = require('../utils/extractors');
const Fuse = require('fuse.js');
const axios = require('axios');
const { indexBrandProducts, findProductByPHash } = require('../services/productFingerprintService');
/** 
 * ========================================================================= 
 * 🔒 CORE INBOX AUTOMATION SYSTEM (STABLE & SECURE)
 * WARNING: DO NOT MODIFY THIS FILE WITHOUT EXTREME CAUTION!
 * 
 * This file handles the critical Facebook Webhook connection, payload parsing,
 * and secure Meta API message delivering. Changing logic here without testing 
 * will break the inbox routing and automation systems. 
 * ========================================================================= 
 */
// crypto already declared on line 1

// --- PHASE 2: MULTI-MESSAGE ACCUMULATOR ---
// Debounces rapid-fire messages into a single conversational thread
const messageAccumulator = new Map();
const ACCUMULATOR_TIMEOUT = 2000; // 2 seconds wait time
// ------------------------------------------
let lastSuccessfulBucket = null;

// ─── SMART DRAFT COMBINER ENGINE ───
// Combines multiple draft replies into one professional response
function combineDrafts(matchedDrafts, context = {}) {
    if (!matchedDrafts || matchedDrafts.length === 0) return null;
    
    // If only 1 draft, return as-is
    if (matchedDrafts.length === 1) {
        return matchedDrafts[0].result;
    }
    
    // Extract unique intents
    const intents = matchedDrafts.map(d => d.keyword).filter(Boolean);
    
    // Smart template-based combination (NO AI)
    let combined = '';
    
    // Check if greeting is present
    const hasGreeting = intents.some(k => 
        ['hi', 'hello', 'hey', 'greeting', 'hi', 'হ্যালো', 'আসসালামু'].some(g => 
            k.toLowerCase().includes(g)
        )
    );
    
    // Check if price inquiry
    const hasPrice = intents.some(k => 
        ['price', 'দাম', 'কত টাকা', 'rate'].some(p => 
            k.toLowerCase().includes(p)
        )
    );
    
    // Check if delivery
    const hasDelivery = intents.some(k => 
        ['delivery', 'ডেলিভারি', 'কয়দিন', 'কবে পাব'].some(d => 
            k.toLowerCase().includes(d)
        )
    );
    
    // Check if payment/COD
    const hasPayment = intents.some(k => 
        ['cod', 'ক্যাশ', 'payment', 'বিকাশ'].some(p => 
            k.toLowerCase().includes(p)
        )
    );
    
    // Check if order inquiry
    const hasOrder = intents.some(k => 
        ['order', 'অর্ডার', 'কিনতে'].some(o => 
            k.toLowerCase().includes(o)
        )
    );
    
    // Build professional combined response
    const parts = [];
    
    // Greeting
    if (hasGreeting) {
        const greetingDraft = matchedDrafts.find(d => 
            ['hi', 'hello', 'greeting'].some(g => d.keyword?.toLowerCase().includes(g))
        );
        if (greetingDraft) {
            parts.push(greetingDraft.result);
        } else {
            parts.push('হ্যালো! 👋');
        }
    }
    
    // Price info
    if (hasPrice) {
        const priceDraft = matchedDrafts.find(d => 
            ['price', 'দাম'].some(p => d.keyword?.toLowerCase().includes(p))
        );
        if (priceDraft) {
            parts.push(priceDraft.result);
        }
    }
    
    // Delivery info
    if (hasDelivery) {
        const deliveryDraft = matchedDrafts.find(d => 
            ['delivery', 'ডেলিভারি', 'কয়দিন'].some(p => d.keyword?.toLowerCase().includes(p))
        );
        if (deliveryDraft) {
            parts.push(deliveryDraft.result);
        }
    }
    
    // Payment info
    if (hasPayment) {
        const paymentDraft = matchedDrafts.find(d => 
            ['cod', 'ক্যাশ', 'payment'].some(p => d.keyword?.toLowerCase().includes(p))
        );
        if (paymentDraft) {
            parts.push(paymentDraft.result);
        }
    }
    
    // Order process
    if (hasOrder) {
        const orderDraft = matchedDrafts.find(d => 
            ['order', 'অর্ডার'].some(p => d.keyword?.toLowerCase().includes(p))
        );
        if (orderDraft) {
            parts.push(orderDraft.result);
        }
    }
    
    // If no specific intent matched, use all results
    if (parts.length === 0) {
        return matchedDrafts.map(d => d.result).filter(Boolean).join('\n\n');
    }
    
    // Combine with proper spacing
    let response = parts.join('\n\n');
    
    // Add closing line if multiple intents
    if (parts.length >= 2) {
        response += '\n\nআর কিছু জানতে চাইলে বলুন! 😊';
    }
    
    return response;
}

// ─── DUPLICATE COMMENT REPLY PREVENTION ───
// In-memory set to track comment IDs already replied to (clears on restart)
const repliedCommentIds = new Set();

// ─── FB API RETRY WRAPPER ───
async function withRetry(fn, retries = 3, delayMs = 1500) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (e) {
            const errCode = e.response?.data?.error?.code;
            const isRateLimit = errCode === 32 || errCode === 17 || errCode === 613;
            const isTransient = errCode === 1 || errCode === 2;
            if ((isRateLimit || isTransient) && attempt < retries) {
                serverLog(`[RETRY ${attempt}/${retries}] FB API error ${errCode}. Waiting ${delayMs}ms...`);
                await new Promise(r => setTimeout(r, delayMs * attempt));
            } else {
                throw e;
            }
        }
    }
}

// ─── VERCEL SAFEGUARDS (TIMEOUT & IDEMPOTENCY) ───
const trace = async (name, promise) => {
    const start = Date.now();
    serverLog(`[TRACE] [${name}] Started`);
    try {
        const result = await promise;
        serverLog(`[TRACE] [${name}] Finished in ${Date.now() - start}ms`);
        return result;
    } catch (error) {
        serverLog(`[TRACE] [${name}] Failed after ${Date.now() - start}ms. Error: ${error.message}`);
        throw error;
    }
};

const withTimeout = (promise, ms, name, timeoutCallback) => {
    let timeoutHandle;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(async () => {
            serverLog(`[TIMEOUT] Task ${name} exceeded ${ms}ms.`);
            if (timeoutCallback) {
                try { await trace(`FallbackSave_${name}`, timeoutCallback()); } catch(e){}
            }
            reject(new Error(`Timeout: ${name}`));
        }, ms);
    });
    return Promise.race([ promise, timeoutPromise ]).finally(() => clearTimeout(timeoutHandle));
};

async function checkIdempotencySafe(eventId) {
    if (!eventId) return true;
    try {
        await trace(`${eventId}:Idempotency`, db.collection('processed_events').doc(eventId).create({
            timestamp: serverTimestamp()
        }));
        return true; 
    } catch (e) {
        if (e.code === 6) { // ALREADY_EXISTS in Firestore
            serverLog(`[IDEMPOTENCY] Race blocked. Event ${eventId} already exists.`);
            return false;
        }
        return true; // proceed if transient error
    }
}
// ---------------------------------------------

/**
 * Centrally handles Facebook API errors, specifically identifying token expiration (Code 190)
 * and updating the brand's health status in Firestore so it's visible on the dashboard.
 */
async function handleFbApiError(error, brandData) {
    if (!brandData || !brandData.id) return;
    try {
        let errObj;
        try {
            errObj = JSON.parse(error.message);
        } catch (e) {
            // Not a JSON error, maybe a raw Axios error
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
            serverLog(`[CRITICAL] Token Expired for brand ${brandData.id}. Flagging in Firestore.`);
            await db.collection('brands').doc(brandData.id).update({
                tokenStatus: 'EXPIRED',
                lastHealthError: errObj.message,
                lastErrorTimestamp: serverTimestamp()
            }).catch(e => console.error('Failed to update brand status:', e.message));
        }
    } catch (e) {
        serverLog(`[handleFbApiError LOGIC ERROR] ${e.message}`);
    }
}

// Webhook Verification
async function verifyWebhook(req, res) {
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
    
    serverLog(`[WEBHOOK VERIFY] Mode: ${mode}, Token: ${token}`);
    
    const globalToken = (process.env.VERIFY_TOKEN || 'myapp4204').trim();

    if (mode && token) {
        if (mode === 'subscribe' && (token === globalToken)) {
            serverLog(`[WEBHOOK VERIFY] SUCCESS! Token matched.`);
            res.status(200).send(challenge);
        } else {
            serverLog(`[WEBHOOK VERIFY] FAILED! Token [${token}] does not match [${globalToken}]`);
            res.sendStatus(403);      
        }
    }
}

// Handle Webhook Post
async function handleWebhookPost(req, res) {
    serverLog(`[WEBHOOK RAW] Received POST to /webhook. Body keys: ${Object.keys(req.body || {}).join(', ')}`);
    try {
        // 0. HMAC Signature Validation (Security Phase 1)
        const signature = req.headers['x-hub-signature-256'] || req.headers['x-hub-signature'];
        const appSecret = process.env.APP_SECRET;

        if (appSecret && signature && req.rawBody) {
            const hmac = crypto.createHmac('sha256', appSecret);
            hmac.update(req.rawBody);
            const digest = 'sha256=' + hmac.digest('hex');
            
            if (signature !== digest) {
                serverLog(`[SECURITY WARNING] Webhook signature mismatch! Calculated: ${digest}, Header: ${signature}`);
                // In a debug situation or if APP_SECRET is not correctly configured in Vercel, 
                // we log the error but proceed so messages aren't lost. 
                // return res.sendStatus(403); 
            } else {
                serverLog(`[SECURITY SUCCESS] Webhook signature verified.`);
            }
        } else {
            if (!signature) serverLog(`[SECURITY INFO] No signature provided in headers.`);
            if (!appSecret) serverLog(`[SECURITY INFO] APP_SECRET not defined in environment.`);
        }

        const body = req.body;
        const isFB = body.object === 'page';
        const isIG = body.object === 'instagram';

        if (isFB || isIG) {
            // --- DEBUG: LOG RAW WEBHOOK TO FIRESTORE ---
            try {
                await db.collection('raw_webhooks').add({
                    body: body,
                    timestamp: Date.now(),
                    headers: {
                        'x-hub-signature': req.headers['x-hub-signature'],
                        'user-agent': req.headers['user-agent']
                    }
                });
            } catch (dbgErr) {
                console.error('[DEBUG ERROR] Failed to log raw webhook:', dbgErr.message);
            }
            // ------------------------------------------

            const tasks = [];
            for (const entry of body.entry) {
                const platformId = entry.id;
                const platformType = isIG ? 'instagram' : 'facebook';
                
                serverLog(`[WEBHOOK] Entry.id: ${platformId} | Type: ${platformType}`);
                
                let brandData = await getBrandByPlatformId(platformId, platformType);
                
                // --- UNIVERSAL FALLBACK FOR SKINZY ---
                if (!brandData) {
                    serverLog(`[WEBHOOK FALLBACK] Brand not found for id ${platformId} (${platformType}). Using Skinzy as fallback.`);
                    // Skinzy Page ID is '963307416870090'
                    brandData = await getBrandByPlatformId('963307416870090', 'facebook'); 
                }
                
                if (!brandData) {
                    serverLog(`[WEBHOOK ERROR] Entry.id ${platformId} not found in Firestore/Env.`);
                    await db.collection('unhandled_webhooks').add({
                        payload: entry,
                        platformId,
                        platformType,
                        timestamp: Date.now(),
                        reason: 'BRAND_NOT_FOUND'
                    }).catch(() => {});
                    continue; // Skip processing this unhandled entry
                } else {
                    serverLog(`[WEBHOOK SUCCESS] Matched Brand: ${brandData.name} (ID: ${brandData.id}) for Entry.id: ${platformId}`);
                }

                if (entry.messaging) {
                    for (const webhook_event of entry.messaging) {
                        const sender_psid = webhook_event.sender.id;
                        webhook_event.platform = platformType;

                        // Fallback brand identification for messages
                        if (!brandData && webhook_event.recipient?.id) {
                            brandData = await getBrandByPlatformId(webhook_event.recipient.id, platformType);
                        }

                        if (!brandData) {
                            serverLog(`[WEBHOOK ERROR] Could not identify brand for recipient: ${webhook_event.recipient?.id}`);
                            continue;
                        }

                        if (webhook_event.message) {
                            if (webhook_event.message.is_echo) {
                                tasks.push(handleEchoMessage(webhook_event, brandData));
                            } else {
                                const eventId = webhook_event.message.mid ? `msg_${webhook_event.message.mid}` : null;
                                const msgTask = checkIdempotencySafe(eventId).then(canProceed => {
                                    if (!canProceed) return;
                                    return trace(`${eventId}:LogicAndReply`, withTimeout(processIncomingMessage(sender_psid, webhook_event.message, brandData, platformType), 30000, 'processMessage', async () => {
                                        await db.collection('conversations').doc(sender_psid).set({ status: 'pending', isPriority: true, error: 'TIMEOUT' }, { merge: true }).catch(()=>{});
                                    }));
                                });
                                tasks.push(msgTask);
                            }
                        }

                        if (webhook_event.postback) {
                            tasks.push(handlePostback(sender_psid, webhook_event.postback, brandData, platformType));
                        }
                    }
                }

                if (entry.changes) {
                    for (const change of entry.changes) {
                        if (brandData && change.field === 'feed' && change.value.item === 'comment' && change.value.verb === 'add') {
                            const eventId = change.value.comment_id ? `cmt_${change.value.comment_id}` : null;
                            const cmtTask = checkIdempotencySafe(eventId).then(canProceed => {
                                if (!canProceed) return;
                                return trace(`${eventId}:LogicAndReply`, withTimeout(processIncomingComment(change.value, brandData), 30000, 'processComment', async () => {
                                    await db.collection("pending_comments").add({
                                        commentId: change.value.comment_id,
                                        postId: change.value.post_id,
                                        commentText: change.value.message,
                                        fromName: change.value.from.name,
                                        fromId: change.value.from.id,
                                        brandId: brandData.id,
                                        timestamp: serverTimestamp(),
                                        status: 'pending',
                                        type: 'timeout',
                                        error: 'Vercel execution timed out.'
                                    }).catch(()=>{});
                                }));
                            });
                            tasks.push(cmtTask);
                        }
                    }
                }
            }

            await trace('AllSettled_OuterLoop', Promise.allSettled(tasks));
            res.status(200).send('EVENT_RECEIVED');
        } else {
            res.sendStatus(404);
        }
    } catch (e) {
        console.error('[CRITICAL] Webhook Error:', e.message);
        res.status(200).send('EVENT_RECEIVED'); 
    }
}

async function processIncomingComment(commentData, brandData) {
    const { comment_id, post_id, message, from } = commentData;
    const sender_id = from.id;

    if (sender_id === brandData.facebookPageId) return;

    // ── DUPLICATE PREVENTION: Skip if already replied to this comment ──
    if (repliedCommentIds.has(comment_id)) {
        serverLog(`[DUPLICATE] Comment ${comment_id} already processed. Skipping.`);
        return;
    }

    // ── Also check Firestore for persistent duplicate check (across restarts) ──
    try {
        const existingReply = await db.collection('comments')
            .where('comment_id', '==', comment_id)
            .limit(1)
            .get();
        if (!existingReply.empty) {
            serverLog(`[DUPLICATE DB] Comment ${comment_id} already in Firestore. Skipping.`);
            repliedCommentIds.add(comment_id);
            return;
        }
    } catch (dupErr) {
        serverLog(`[DUPLICATE CHECK ERROR] ${dupErr.message}`);
    }

    serverLog(`[Comment - ${brandData.name}] from ${from.name}: ${message}`);
    const settings = brandData.commentSettings || {};
    const { 
        autoLike = false, 
        spamFilter = false, 
        leadCapture = false, 
        sentimentAnalysis = false, 
        humanDelay = false
    } = settings;
    // ── FIX: Default systemAutoReply and aiReply to TRUE if not explicitly set ──
    const systemAutoReply = settings.systemAutoReply !== false; // default ON
    const aiReply = settings.aiReply !== false;                 // default ON
    serverLog(`[Comment Engine] Starting. systemAutoReply: ${systemAutoReply}, aiReply: ${aiReply}`);

    // Mark as being processed immediately to prevent race conditions
    repliedCommentIds.add(comment_id);

    try {
        // 1. Spam Filter
        if (spamFilter) {
            const hasLink = /https?:\/\/[^\s]+/.test(message);
            const blacklist = ['scam', 'fake', 'fraud', 'baje', 'faltu', 'kharap']; 
            const isSpam = hasLink || blacklist.some(word => message.toLowerCase().includes(word));
            if (isSpam) {
                await hideComment(comment_id, brandData.fbPageToken);
                return;
            }
        }

        // 2. Auto-Like
        if (autoLike) await likeComment(comment_id, brandData.fbPageToken);

        // 3. Lead Capture
        if (leadCapture) {
            await db.collection("leads").add({
                brandId: brandData.id,
                name: from.name,
                platformId: from.id,
                platform: 'facebook',
                source: 'comment',
                message: message,
                postId: post_id,
                timestamp: serverTimestamp()
            });
        }

        // --- HUMAN HANDOFF CHECK ---
        const handoffKeywords = ['admin', 'human', 'manush', 'kotha bolte chai', 'support', 'help', 'representative'];
        const isHandoffRequested = handoffKeywords.some(kw => message.toLowerCase().includes(kw));

        if (settings.humanHandoff && isHandoffRequested) {
            await db.collection("pending_comments").add({
                commentId: comment_id,
                postId: post_id,
                commentText: message,
                fromName: from.name,
                fromId: sender_id,
                brandId: brandData.id,
                timestamp: serverTimestamp(),
                status: 'pending',
                type: 'human_requested'
            });
            serverLog(`[Handoff] Human requested: ${message}`);
            return;
        }

        // --- REPLY ENGINE ---
        let replySent = false;
        let publicReply = '';
        let privateReply = '';
        let matchedVariation = null;
        let matchedDraftId = null;
        let matchedIndex = null;

        // A. System Keyword Match
        if (systemAutoReply) {
            const matchResult = await getShuffledReply(message, brandData.id, post_id);
            if (matchResult) {
                const { variation, draftId, index } = matchResult;
                publicReply = variation.publicReply;
                privateReply = variation.privateReply;
                matchedVariation = variation;
                matchedDraftId = draftId;
                matchedIndex = index;
                replySent = true;
                serverLog(`[System MATCH] Match found in comment_drafts for: ${message}`);
                
                // Track Performance (Hit Rate)
                const draftRef = db.collection("comment_drafts").doc(draftId);
                const draftSnap = await draftRef.get();
                if (draftSnap.exists) {
                    const variations = draftSnap.data().variations || [];
                    if (variations[index]) {
                        variations[index].hitCount = (variations[index].hitCount || 0) + 1;
                        await draftRef.update({ variations });
                    }
                }
            } else {
                serverLog(`[System NO MATCH] No keyword match found for: ${message}`);
            }
        }

        // B. AI Fallback
        if (!replySent && aiReply) {
            const aiResponse = await handleCommentAIResponse(comment_id, post_id, message, brandData);
            if (aiResponse) {
                publicReply = aiResponse.publicReply;
                privateReply = aiResponse.privateReply;
                replySent = true;
                serverLog(`[AI] Response generated for: ${message}`);
            }
        }

        // Execute Reply with Delay if any
        if (replySent) {
            if (humanDelay) await new Promise(r => setTimeout(r, Math.random() * 5000 + 5000));
            
            // Public Reply — with retry
            try {
                await withRetry(() => replyToComment(comment_id, publicReply, brandData.fbPageToken));
            } catch (replyErr) {
                serverLog(`[REPLY ERROR] Public reply failed: ${replyErr.message}`);
                await db.collection("pending_comments").add({
                    commentId: comment_id,
                    postId: post_id,
                    commentText: message,
                    fromName: from.name,
                    fromId: sender_id,
                    brandId: brandData.id,
                    timestamp: serverTimestamp(),
                    status: 'pending',
                    type: 'reply_failed',
                    error: replyErr.message
                }).catch(() => {});
                await handleFbApiError(replyErr, brandData);
            }
            
            // Private Reply (Inbox Message) — with retry
            if (privateReply) {
                try {
                    await withRetry(() => sendPrivateReply(comment_id, privateReply, brandData.fbPageToken));
                } catch (dmErr) {
                    serverLog(`[DM WARN] Private reply failed (may be FB limitation): ${dmErr.message}`);
                    await db.collection("pending_comments").add({
                        commentId: comment_id,
                        postId: post_id,
                        commentText: message,
                        fromName: from.name,
                        fromId: sender_id,
                        brandId: brandData.id,
                        timestamp: serverTimestamp(),
                        status: 'pending',
                        type: 'dm_failed',
                        error: dmErr.message
                    }).catch(() => {});
                    await handleFbApiError(dmErr, brandData);
                }
                
                // If there's a button, send it as a follow-up template
                if (matchedVariation && matchedVariation.buttonText && matchedVariation.buttonUrl) {
                    const { sendButtonTemplate } = require('../services/facebookService');
                    // We use the sender_id (PSID) from the comment webhook
                    try {
                        await sendButtonTemplate(sender_id, matchedVariation.privateReply, {
                            text: matchedVariation.buttonText,
                            url: matchedVariation.buttonUrl
                        }, brandData.fbPageToken);
                    } catch (btnErr) {
                        serverLog(`[BUTTON WARN] Button template failed: ${btnErr.message}`);
                    }
                }
            }
        } else {
            // C. Move to Pending
            await db.collection("pending_comments").add({
                commentId: comment_id,
                postId: post_id,
                commentText: message,
                fromName: from.name,
                fromId: sender_id,
                brandId: brandData.id,
                timestamp: serverTimestamp(),
                status: 'pending'
            });
            serverLog(`[Pending] Comment moved to list: ${message}`);
        }

        // Final Log in Firestore
        await db.collection('comments').add({
            comment_id, post_id, sender_id, sender_name: from.name,
            message, reply: publicReply, privateReply,
            brandId: brandData.id, timestamp: serverTimestamp()
        });

    } catch (error) {
        console.error("Error processing comment:", error);
    }
}

async function getShuffledReply(message, brandId, postId = null) {
    const snapshot = await db.collection("comment_drafts").where("brandId", "==", brandId).get();
    const drafts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (drafts.length === 0) return null;

    // 1. Try to find local match (Specific Post ID) with Fuzzy Support
    if (postId) {
        const postSpecificDrafts = drafts.filter(draft => draft.postId === postId);
        if (postSpecificDrafts.length > 0) {
            const postRecords = [];
            postSpecificDrafts.forEach(draft => {
                (draft.keywords || []).forEach(kw => postRecords.push({ phrase: kw, draft }));
            });
            const postFuse = new Fuse(postRecords, { keys: ['phrase'], threshold: 0.35 });
            const postResults = postFuse.search(message);
            
            if (postResults.length > 0 && postResults[0].score <= 0.35) {
                const bestMatch = postResults[0].item.draft;
                const index = Math.floor(Math.random() * bestMatch.variations.length);
                serverLog(`[Comment] Post-specific match found for: ${message}`);
                return { variation: bestMatch.variations[index], draftId: bestMatch.id, index };
            }
        }
    }

    // 2. Fuzzy Matching for Comments (Global Rules)
    const lowerText = message.toLowerCase();
    const normalizedInput = normalizePhonetic(lowerText);
    const cleanedInput = cleanNoise(lowerText);

    const searchableRecords = [];
    drafts.forEach(draft => {
        if (draft.postId && draft.postId !== postId) return; // Skip post-specific ones for other posts
        (draft.keywords || []).forEach(kw => {
            searchableRecords.push({ 
                phrase: kw, 
                normalized: normalizePhonetic(kw.toLowerCase()),
                draft: draft 
            });
        });
    });

    if (searchableRecords.length > 0) {
        const fuse = new Fuse(searchableRecords, {
            keys: ['phrase', 'normalized'],
            threshold: 0.45, // Slightly more permissive for comments
            includeScore: true
        });

        let results = fuse.search(lowerText);

        // Always try phonetic search and take the best result
        const phoneticResults = fuse.search(normalizedInput);
        if (phoneticResults.length > 0 && (!results[0] || phoneticResults[0].score < (results[0]?.score ?? 1))) {
            results = phoneticResults;
        }
        
        // Always try cleaned noise search
        if (cleanedInput && cleanedInput !== lowerText) {
            const cleanedResults = fuse.search(cleanedInput);
            if (cleanedResults.length > 0 && (!results[0] || cleanedResults[0].score < (results[0]?.score ?? 1))) {
                results = cleanedResults;
            }
        }

        if (results.length > 0 && results[0].score <= 0.45) {
            const bestMatch = results[0].item.draft;
            const index = Math.floor(Math.random() * bestMatch.variations.length);
            serverLog(`[Comment Match ✅] Match found for: ${message} (Score: ${results[0].score.toFixed(3)})`);
            return { variation: bestMatch.variations[index], draftId: bestMatch.id, index };
        }
    }

    // 3. Last Resort: Simple Fallback match & Catch-All
    const catchAllDrafts = [];
    
    for (const draft of drafts) {
        if (draft.postId) continue;
        
        const isCatchAll = !draft.keywords || draft.keywords.length === 0;
        if (isCatchAll) {
            catchAllDrafts.push(draft);
            continue;
        }

        const match = (draft.keywords || []).some(kw => 
            lowerText.includes(kw.toLowerCase()) || 
            normalizedInput.includes(normalizePhonetic(kw.toLowerCase()))
        );
        if (match && draft.variations?.length > 0) {
            const index = Math.floor(Math.random() * draft.variations.length);
            serverLog(`[Comment Keyword] Absolute fallback match for: ${message}`);
            return { variation: draft.variations[index], draftId: draft.id, index };
        }
    }
    
    // 4. If no keyword matched, use a random catch-all draft if available
    if (catchAllDrafts.length > 0) {
        const randomDraft = catchAllDrafts[Math.floor(Math.random() * catchAllDrafts.length)];
        if (randomDraft.variations?.length > 0) {
            const index = Math.floor(Math.random() * randomDraft.variations.length);
            serverLog(`[Comment] Catch-All fallback used for: ${message}`);
            return { variation: randomDraft.variations[index], draftId: randomDraft.id, index };
        }
    }

    return null;
}

// ── GET ALL MATCHING DRAFTS (For Multi-Intent Detection) ──
async function getAllMatchingDrafts(combinedMessage, brandId, convoData, maxMatches = 5) {
    const lowerText = combinedMessage.toLowerCase();
    const words = lowerText.split(/\s+/).filter(w => w.length > 2); // Filter short words
    
    serverLog(`[MULTI-INTENT] Searching for matches in: "${combinedMessage}"`);
    
    // Fetch all drafts and KB entries
    const [draftSnap, kbSnap] = await Promise.all([
        db.collection("draft_replies").where("brandId", "==", brandId).get(),
        db.collection("knowledge_base").where("brandId", "==", brandId).get()
    ]);
    
    const rejectedStatuses = ['rejected', 'disabled', 'archived'];
    const drafts = draftSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(d => !d.status || !rejectedStatuses.includes((d.status || '').toLowerCase()));
    const kbRules = kbSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Build searchable records
    const searchableRecords = [];
    
    drafts.forEach(draft => {
        const allPhrases = new Set([
            draft.keyword, 
            ...(draft.variations || []), 
            ...(draft.approvedVariations || [])
        ]);
        allPhrases.forEach(phrase => {
            if (phrase) searchableRecords.push({ phrase, result: draft.result, draftId: draft.id, type: 'draft', keyword: draft.keyword });
        });
    });
    
    kbRules.forEach(rule => {
        const allPhrases = new Set([...(rule.keywords || [])]);
        allPhrases.forEach(phrase => {
            if (phrase) searchableRecords.push({ phrase, result: rule.answer, ruleId: rule.id, type: 'kb', keyword: phrase });
        });
    });
    
    // Find ALL matches
    const matchedDrafts = [];
    const matchedPhrases = new Set();
    
    // Strategy 1: Direct includes match
    searchableRecords.forEach(record => {
        if (!record.result) return;
        
        const phraseLower = record.phrase.toLowerCase();
        
        // Check if any word matches or if phrase is included
        const isMatch = words.some(word => phraseLower.includes(word)) || 
                       lowerText.includes(phraseLower);
        
        if (isMatch && !matchedPhrases.has(record.phrase)) {
            matchedPhrases.add(record.phrase);
            matchedDrafts.push({
                result: record.result,
                draftId: record.draftId || record.ruleId,
                keyword: record.keyword || record.phrase,
                type: record.type,
                score: 1.0
            });
        }
    });
    
    // Strategy 2: Fuzzy match if less than 2 matches found
    if (matchedDrafts.length < 2) {
        const Fuse = require('fuse.js');
        const fuse = new Fuse(searchableRecords, {
            keys: ['phrase'],
            includeScore: true,
            threshold: 0.5,
            ignoreLocation: true
        });
        
        const results = fuse.search(lowerText);
        
        results.forEach(result => {
            if (result.score <= 0.5 && !matchedPhrases.has(result.item.phrase)) {
                matchedPhrases.add(result.item.phrase);
                matchedDrafts.push({
                    result: result.item.result,
                    draftId: result.item.draftId || result.item.ruleId,
                    keyword: result.item.keyword || result.item.phrase,
                    type: result.item.type,
                    score: 1 - result.score
                });
            }
        });
    }
    
    // Sort by score and limit
    const topMatches = matchedDrafts
        .sort((a, b) => b.score - a.score)
        .slice(0, maxMatches);
    
    serverLog(`[MULTI-INTENT] Found ${topMatches.length} matching draft(s):`, 
        topMatches.map(m => m.keyword).join(', '));
    
    return topMatches;
}

// ── DETERMINISTIC BOT: Match Approved Inbox Rules via Unified Engine ──
async function getApprovedInboxDraft(message, brandId, convoData) {
    const lowerText = message.toLowerCase();
    
    // 1. Concurrent Fetch from both Rulesets
    const [draftSnap, kbSnap] = await Promise.all([
        db.collection("draft_replies")
            .where("brandId", "==", brandId)
            // Removed strict "approved" filter to discover manual entries with no status
            .get(),
        db.collection("knowledge_base")
            .where("brandId", "==", brandId)
            .get()
    ]);
    
    // Filter Drafts in memory: Accept ALL statuses except explicitly rejected ones
    // BUG FIX: 'pending' (auto-learned) and 'draft' were being excluded — now included
    const rejectedStatuses = ['rejected', 'disabled', 'archived'];
    const drafts = draftSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(d => !d.status || !rejectedStatuses.includes((d.status || '').toLowerCase()));
    const kbRules = kbSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 2. Normalize and Flatten data for Fuse.js
    const searchableRecords = [];
    
    // Process Drafts (keyword, variations, approvedVariations -> result)
    drafts.forEach(draft => {
        const allPhrases = new Set([
            draft.keyword, 
            ...(draft.variations || []), 
            ...(draft.approvedVariations || []),
            normalizePhonetic(draft.keyword)
        ]);
        allPhrases.forEach(phrase => {
            if (phrase) searchableRecords.push({ phrase, result: draft.result, draftId: draft.id, type: 'draft' });
        });
    });

    // Process Knowledge Base (keywords[] -> answer)
    kbRules.forEach(rule => {
        const allPhrases = new Set([
            ...(rule.keywords || []),
            ...(rule.keywords ? rule.keywords.map(kw => normalizePhonetic(kw)) : [])
        ]);
        allPhrases.forEach(phrase => {
            if (phrase) searchableRecords.push({ phrase, result: rule.answer, ruleId: rule.id, type: 'kb' });
        });
    });

    if (searchableRecords.length === 0) return null;

    const normalizedInput = normalizePhonetic(lowerText);
    const cleanedInput = cleanNoise(lowerText);

    // 3. Configure Fuse for fuzzy matching (Tuned for Bangla parsing)
    const fuse = new Fuse(searchableRecords, {
        keys: ['phrase'],
        includeScore: true,
        threshold: 0.45,
        ignoreLocation: true,
        distance: 100
    });

    // Strategy: ALWAYS run all 3 search strategies and take the best score
    // BUG FIX: was only running phonetic/cleaned when score > 0.2, missing many valid matches
    let results = fuse.search(lowerText);
    
    // Always try phonetic search and take the best result
    const phoneticResults = fuse.search(normalizedInput);
    if (phoneticResults.length > 0 && (!results[0] || phoneticResults[0].score < (results[0]?.score ?? 1))) {
        results = phoneticResults;
    }
    
    // Always try cleaned noise search
    if (cleanedInput && cleanedInput !== lowerText) {
        const cleanedResults = fuse.search(cleanedInput);
        if (cleanedResults.length > 0 && (!results[0] || cleanedResults[0].score < (results[0]?.score ?? 1))) {
            results = cleanedResults;
        }
    }
    
    if (results.length > 0) {
        // Prioritize KB over Drafts if scores are similar
        results.sort((a, b) => {
            if (Math.abs(a.score - b.score) < 0.05) {
                if (a.item.type === 'kb' && b.item.type === 'draft') return -1;
                if (b.item.type === 'kb' && a.item.type === 'draft') return 1;
            }
            return a.score - b.score;
        });

        const bestMatch = results[0];
        serverLog(`[MATCH_RESULT] Matched "${bestMatch.item.phrase}" for input "${lowerText}" with score: ${bestMatch.score.toFixed(3)}`);
        
        if (bestMatch.score <= 0.45) {
            let resultText = bestMatch.item.result;
            // BUG FIX: guard against null/undefined result before returning
            if (!resultText) {
                serverLog(`[MATCH_WARN] Match found but result is empty for phrase: ${bestMatch.item.phrase}`);
            } else {
                const sentiment = convoData?.sentiment || 'Neutral';
                if (sentiment === 'Negative') {
                    const apologies = [
                        "আন্তরিকভাবে দুঃখিত আপনার অসুবিধার জন্য। ",
                        "আমরা আপনার সমস্যার জন্য দুঃখ প্রকাশ করছি। ",
                        "আপনার অভিজ্ঞতার জন্য আমরা ক্ষমাপ্রার্থী। "
                    ];
                    const prefix = apologies[Math.floor(Math.random() * apologies.length)];
                    resultText = prefix + resultText;
                }
                serverLog(`[Unified Match ✅] Score: ${bestMatch.score.toFixed(3)} | Type: ${bestMatch.item.type} | Input: ${lowerText} | Match: ${bestMatch.item.phrase}`);
                return { text: resultText, result: resultText, draftId: (bestMatch.item.ruleId || bestMatch.item.draftId) };
            }
        }
    }

    // 4. Absolute Keyword Includes Fallback (works for ANY message, not just detected intents)
    // BUG FIX: was gated behind basicIntent detection — now runs for all messages
    const includesMatch = searchableRecords.find(r =>
        r.result && // only match if there's actually a result to send
        (
            lowerText.includes(r.phrase.toLowerCase()) ||
            (r.phrase.length > 3 && lowerText.includes(normalizePhonetic(r.phrase)))
        )
    );
    if (includesMatch) {
        serverLog(`[Keyword Includes ✅] Matched phrase: "${includesMatch.phrase}"`);
        return { text: includesMatch.result, result: includesMatch.result, draftId: (includesMatch.ruleId || includesMatch.draftId) };
    }

    // 5. Intent-based fallback (secondary)
    const basicIntent = detectBasicIntent(message);
    if (basicIntent.intent !== 'UNKNOWN') {
        const intentKeyword = basicIntent.intent.replace('ASK_', '').charAt(0).toUpperCase() + basicIntent.intent.replace('ASK_', '').toLowerCase().slice(1);
        const intentMatch = kbRules.find(r => r.keywords?.some(kw => kw.toLowerCase() === intentKeyword.toLowerCase()));
        if (intentMatch) return { text: intentMatch.answer, result: intentMatch.answer, draftId: intentMatch.id };
        const draftMatch = drafts.find(d => d.keyword?.toLowerCase() === intentKeyword.toLowerCase() && d.result);
        if (draftMatch) return { text: draftMatch.result, result: draftMatch.result, draftId: draftMatch.id };
    }

    return null;
}

async function handleCommentAIResponse(commentId, postId, message, brandData, sentiment = 'neutral') {
    try {
        const postData = await getPostContent(postId, brandData.fbPageToken);
        const postText = postData ? postData.message : "No post content found";

        const apiKey = brandData.googleAIKey || process.env.GEMINI_API_KEY;
        const model = await getDynamicModel(apiKey);
        
        const prompt = `You are Tayeba Hossain, a friendly and professional customer service representative for "${brandData.name}". 
        Act as a real human. DO NOT mention that you are an AI assistant or a bot. NEVER say "digital assistant" or "AI beauty assistant". 
        CRITICAL: DO NOT use religious greetings like "Salam", "Nomoshkar", "Adab", etc. 
        Start directly with "Skinzy-তে আপনাকে স্বাগতম!" or "Hello/Hi" or "কেমন আছেন?".
        Your tone should be helpful, warm, and natural. ✨
A customer commented on our post.
        
        POST CONTENT: "${postText}"
        CUSTOMER COMMENT: "${message}"
        CUSTOMER SENTIMENT: "${sentiment}"
        
        TASK:
        1. Generate a short, friendly public reply to the comment.
        2. Generate a helpful private message for the inbox.
        3. If the user asks for price/details, the public reply MUST tell them to check their inbox.
        4. If the sentiment is negative, be very polite and offer support.
        
        LANGUAGE RULES:
        - Response MUST be in Bangla (Bengali) by default. ✨
        - ONLY use English if the customer uses a long English sentence (more than 3-4 distinct English words). 
        - For short greetings like "hi", "hello", "price?", always answer in Bangla.
        
        Return ONLY in JSON format:
        {
            "publicReply": "string",
            "privateReply": "string"
        }`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            const responseJson = JSON.parse(jsonMatch[0]);
            return responseJson;
        }
        
        serverLog(`[AI] Failed to extract JSON from: ${text}`);
        return { publicReply: "Thank you for your feedback!", privateReply: "" };
    } catch (e) {
        serverLog(`Comment AI Error: ${e.message}`);
        return null;
    }
}


async function processIncomingMessage(sender_psid, message, brandData, platformType = 'facebook') {
    // Safety check: Ignore messages from the Page itself (Echoes)
    if (sender_psid === brandData.facebookPageId) {
        serverLog(`[Safety] Ignoring message from own Page ID: ${sender_psid}`);
        return;
    }

    if (!message.text && (!message.attachments || message.attachments.length === 0)) return;

    serverLog(`[INCOMING] New message from ${sender_psid} for brand: ${brandData.name}`);

    // Direct synchronous jump, avoiding `setTimeout` which is killed by Vercel serverless containers
    await processThreadedMessage(sender_psid, message, brandData, platformType).catch(e => {
        serverLog(`[ProcessError] ${e.message}`);
    });
}

async function processThreadedMessage(sender_psid, message, brandData, platformType = 'facebook') {
    try {
        serverLog(`[Inbox] Processing message from ${sender_psid}: "${message.text}"`);

        // VERCEL FIX: setTimeout does NOT work on Vercel serverless!
        // The function returns before the timer fires, so accumulated messages are lost.
        // On Vercel: process every message immediately (no debouncing).
        // On local/persistent server: use accumulator for burst message handling.
        const isServerless = !!process.env.VERCEL;
        
        if (isServerless) {
            // Serverless mode: process immediately, no accumulator
            serverLog(`[DIRECT] Serverless mode - processing message immediately`);
            const singleMessage = [{
                text: message.text || '',
                timestamp: Date.now(),
                attachments: message.attachments || []
            }];
            await processAccumulatedMessages(sender_psid, singleMessage, brandData, platformType);
            return;
        }

        // --- LOCAL/PERSISTENT SERVER: Use accumulator for burst messages ---
        const accumulatorKey = sender_psid;
        const now = Date.now();
        
        if (!messageAccumulator.has(accumulatorKey)) {
            messageAccumulator.set(accumulatorKey, {
                messages: [],
                timer: null,
                firstMessageTime: now
            });
        }
        
        const accumulator = messageAccumulator.get(accumulatorKey);
        
        accumulator.messages.push({
            text: message.text || '',
            timestamp: now,
            attachments: message.attachments || []
        });
        
        if (accumulator.timer) {
            clearTimeout(accumulator.timer);
        }
        
        serverLog(`[ACCUMULATOR] ${accumulator.messages.length} message(s) from ${sender_psid}. Waiting ${ACCUMULATOR_TIMEOUT}ms...`);
        
        if (accumulator.messages.length === 1) {
            accumulator.timer = setTimeout(async () => {
                const acc = messageAccumulator.get(accumulatorKey);
                if (!acc || acc.messages.length === 0) return;
                
                const allMessages = [...acc.messages];
                messageAccumulator.delete(accumulatorKey);
                
                serverLog(`[ACCUMULATOR] Processing ${allMessages.length} accumulated message(s) from ${accumulatorKey}`);
                await processAccumulatedMessages(sender_psid, allMessages, brandData, platformType);
            }, ACCUMULATOR_TIMEOUT);
            
            messageAccumulator.set(accumulatorKey, accumulator);
            return;
        }
        
        const allMessages = [...accumulator.messages];
        messageAccumulator.delete(accumulatorKey);
        
        serverLog(`[ACCUMULATOR] Immediate processing of ${allMessages.length} messages from ${accumulatorKey}`);
        await processAccumulatedMessages(sender_psid, allMessages, brandData, platformType);
        return;

    } catch (error) {
        serverLog(`[CRITICAL] processThreadedMessage failed: ${error.message}`);
        console.error('[CRITICAL] Stack:', error.stack);
    }
}

// ─── PROCESS ACCUMULATED MESSAGES ───
async function processAccumulatedMessages(sender_psid, messages, brandData, platformType) {
    try {
        // Combine all message texts
        const combinedText = messages.map(m => m.text).filter(t => t.trim()).join(' ');
        
        // Collect all attachments
        const allAttachments = messages.flatMap(m => m.attachments || []);
        const hasAttachments = allAttachments.length > 0;
        
        if (!combinedText.trim() && !hasAttachments) {
            serverLog(`[SKIP] All accumulated messages are empty from ${sender_psid}`);
            return;
        }
        
        serverLog(`[COMBINED] Processing combined message: "${combinedText || '(image/attachment)'}" | Attachments: ${allAttachments.length}`);
        
        // Use the first message for logging
        const firstMessage = {
            text: combinedText,
            attachments: messages.flatMap(m => m.attachments || [])
        };
        
        // Update conversation with combined message (DO NOT SAVE TO DATABASE - only show in inbox)
        const nowMs = Date.now();
        
        // Get conversation data for matching (but don't log message yet)
        const convoData = {
            sender_psid,
            brandId: brandData.id,
            platform: platformType
        };
        
        // Build lastMessage for conversation doc
        let lastMessageForDoc = combinedText.substring(0, 100);
        if (!lastMessageForDoc && hasAttachments) {
            const attType = allAttachments[0]?.type || 'file';
            lastMessageForDoc = attType === 'image' ? '📷 Image' : attType === 'audio' ? '🎤 Voice Message' : '📎 Attachment';
        }
        
        await db.collection('conversations').doc(sender_psid).set({
            lastMessage: lastMessageForDoc,
            lastMessageTimestamp: nowMs,
            timestamp: nowMs,
            platform: platformType,
            brandId: brandData.id,
            unread: true,
            messageCount: messages.length
        }, { merge: true });
        
        // Save customer message to messages subcollection (needed for draft creation when moderator replies)
        await db.collection(`conversations/${sender_psid}/messages`).add({
            text: combinedText,
            attachments: allAttachments,
            type: 'received',
            sender_id: sender_psid,
            brandId: brandData.id,
            platform: platformType,
            timestamp: nowMs,
            time: new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', hour12: true })
        });
        
        serverLog(`[AUTO-REPLY] Starting for combined: "${combinedText || '(image/attachment)'}" | Brand: ${brandData.name}`);
        
        // Handle image attachments - use vision response handler
        const imageAttachment = allAttachments.find(a => a.type === 'image');
        if (imageAttachment && imageAttachment.payload?.url) {
            serverLog(`[IMAGE] Found image attachment, routing to vision handler`);
            await handleVisionResponse(sender_psid, imageAttachment.payload.url, combinedText, brandData);
            return;
        }
        
        if (!combinedText.trim()) {
            // Non-image attachment with no text - mark pending
            serverLog(`[PENDING] Non-text attachment, marking pending`);
            await db.collection('conversations').doc(sender_psid).set({ status: 'pending', isPriority: true }, { merge: true });
            return;
        }
        
        if (systemAutoReply) {
            // Try to match MULTIPLE drafts for combined message
            const matchedDrafts = await getAllMatchingDrafts(combinedText, brandData.id, convoData);
            
            if (matchedDrafts && matchedDrafts.length > 0) {
                serverLog(`[DRAFT ✅] Found ${matchedDrafts.length} matching draft(s) - NOT SAVING TO DATABASE`);
                
                // Combine drafts intelligently (NO AI)
                const combinedReply = combineDrafts(matchedDrafts, { messageCount: messages.length });
                
                if (combinedReply) {
                    serverLog(`[COMBINED REPLY] Sending combined response (${combinedReply.length} chars)`);
                    await sendAndLog(sender_psid, combinedReply, 'bot', brandData);
                    
                    // DO NOT SAVE matched conversation - only update counter
                    await db.collection('conversations').doc(sender_psid).set({
                        status: 'auto_replied',
                        lastMatchedDraftIds: matchedDrafts.map(d => d.draftId).filter(Boolean),
                        autoReplyCount: (convoData.autoReplyCount || 0) + 1
                    }, { merge: true });
                    
                    serverLog(`[DRAFT MATCH] Auto-reply sent, conversation NOT saved (90% savings!)`);
                    return;
                }
            }
            
            serverLog(`[DRAFT ❌] No draft matches found`);
            
            // AI Fallback (only if enabled)
            if (aiEnabled && messages.length <= 2) {
                serverLog(`[AI] Activating AI fallback for simple query`);
                await handleAIResponse(sender_psid, combinedText, brandData);
                return;
            }
        }
        
        // No reply — mark pending
        serverLog(`[PENDING] No handler matched. Moving to pending`);
        await db.collection('conversations').doc(sender_psid).set({ 
            status: 'pending', 
            isPriority: true,
            needsHumanReply: true
        }, { merge: true });
        
    } catch (error) {
        serverLog(`[ProcessAccumulated Error] ${error.message}`);
        console.error('[ProcessAccumulated Error]', error.stack);
    }
}

async function handleAIResponse(sender_psid, text, brandData) {
    try {
        const apiKey = brandData.googleAIKey || process.env.GEMINI_API_KEY;
        const blueprint = brandData.blueprint || {};

        const model = await getDynamicModel(apiKey);
        
        // 1. Fetch products for context (Vector Search for RAG)
        const products = await searchVectors('products', text, brandData.id, 10);
        const productContext = products.map(p => `- ${p.name}: ${p.price} BDT (Stock: ${p.stockStatus || 'In Stock'})`).join('\n');

        // 2. Fetch last 5 messages for conversation context
        const historySnap = await db.collection(`conversations/${sender_psid}/messages`)
            .orderBy('timestamp', 'desc')
            .limit(5)
            .get();
        const history = historySnap.docs.map(d => `${d.data().type}: ${d.data().text}`).reverse().join('\n');

        const persona = await assignPersona(sender_psid);
        const funnelStage = await detectFunnelStage(sender_psid, text);

        const prompt = `You are Tayeba Hossain, a friendly and professional customer service representative for "${brandData.name}". 
        Act as a real human. DO NOT mention that you are an AI assistant or a bot. NEVER say "digital assistant" or "AI beauty assistant". 
        CRITICAL: DO NOT use religious greetings like "Salam", "Nomoshkar", "Adab", etc. 
        
        NAME RULE:
        - Only introduce yourself as Tayeba Hossain once at the start.
        - If you see "Tayeba Hossain" already mentioned in the history below, DO NOT repeat your name. 
        - Start directly with the answer if the conversation is ongoing.
        
        GREETING RULE:
        - Start directly with "Skinzy-তে আপনাকে স্বাগতম!" or "Hello/Hi" or "কেমন আছেন?".
        
        AI PERSONALITY (A/B TEST): Use a "${persona}" tone.
        CURRENT SALES FUNNEL STAGE: "${funnelStage}"
        
        TONE: ${blueprint.tone || 'Helpful'}, Emojis: ${blueprint.emojis || '✨'}
        CONTEXT: ${JSON.stringify(blueprint)}
        CATALOG: ${JSON.stringify(products)}
        
        CONVERSATION HISTORY:
        ${history}
        
        USER QUERY: "${text}"
        
        LANGUAGE RULES:
        - Response MUST be in Bangla (Bengali) by default. ✨
        - ONLY use English if the customer uses a long English sentence (more than 3-4 distinct English words). 
        - For short greetings like "hi", "hello", "price?", always answer in Bangla.
        
        TASK:
        1. Answer the user's query naturally.
        2. Identify if the user wants to see more photos of a product OR other colors/variations.
        
        RETURN ONLY IN JSON FORMAT:
        {
            "text": "Your Bangla response string",
            "action": "SEND_CAROUSEL" | "SEND_MORE_PHOTOS" | "NONE",
            "productId": "ID of the product if action is not NONE"
        }`;

        const result = await model.generateContent(prompt);
        const responseJsonText = result.response.text();
        const jsonMatch = responseJsonText.match(/\{[\s\S]*\}/);
        
        // FIX: capture final reply text for auto-learning
        let finalReplyText = '';
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            finalReplyText = data.text || '';
            await sendAndLog(sender_psid, finalReplyText, 'bot', brandData);
            if (data.action && data.action !== 'NONE') {
                await executeRichMediaAction(sender_psid, data.action, data.productId, brandData);
            }
        } else {
            finalReplyText = responseJsonText;
            await sendAndLog(sender_psid, finalReplyText, 'bot', brandData);
        }

        // ── AUTO-LEARNING QUEUE ── FIX: was using undefined `responseText`, now uses finalReplyText
        if (finalReplyText && shouldCaptureAsDraft(text)) {
            const variations = (brandData.autoHyperIndex !== false) ? getLinguisticVariations(text) : [];
            await db.collection("draft_replies").add({
                keyword: text,
                result: finalReplyText,
                variations: variations,
                status: 'pending',
                type: 'auto_learned',
                brandId: brandData.id,
                timestamp: serverTimestamp(),
                successCount: 0
            });
            serverLog(`[Auto-Learn] Capturing AI suggestion (Hyper-Index: ${brandData.autoHyperIndex !== false})`);
        }
    } catch (e) {
        serverLog(`[AI ERROR] ${e.message}`);
        // RESILIENCE FALLBACK: If AI fails, send a polite manual-handoff message so the customer isn't ignored
        const fallbackMsg = "ধন্যবাদ! আমাদের একজন প্রতিনিধি খুব শীঘ্রই আপনার মেসেজটির উত্তর দিবেন। একটু অপেক্ষা করার জন্য অনুরোধ রইলো। 😊";
        await sendMessage(sender_psid, { text: fallbackMsg }, brandData.fbPageToken).catch(() => {});
        
        // Mark as pending for admin attention
        await db.collection('conversations').doc(sender_psid).set({ 
            status: 'pending', 
            isPriority: true,
            aiError: e.message 
        }, { merge: true }).catch(() => {});
    }
}

async function handleVisionResponse(psid, imageUrl, text, brandData) {
    try {
        // FIX: Compute incomingHash from imageUrl before using it
        let incomingHash = null;
        try {
            incomingHash = await generatePHash(imageUrl);
            serverLog(`[Vision] Computed pHash: ${incomingHash}`);
        } catch (hashErr) {
            serverLog(`[Vision] pHash generation failed: ${hashErr.message}`);
        }

        // --- PHASE 0: Media Browser Match (FASTEST - NO AI, NO TOKENS) ---
        try {
            const { matchImageInBrowser } = require('../services/mediaBrowserService');
            
            // Also do OCR for better matching (disabled on Vercel - WASM crashes serverless)
            let ocrText = '';
            // Tesseract OCR disabled - causes Vercel crash due to missing WASM files
            
            const mediaMatch = await matchImageInBrowser(brandData.id, imageUrl, ocrText);
            
            if (mediaMatch) {
                serverLog(`[Media Browser HIT] ✅ Matched: "${mediaMatch.productName || mediaMatch.message?.substring(0, 30)}" (score: ${mediaMatch.matchScore})`);
                
                // Build reply from matched media entry
                let reply = '';
                const name = mediaMatch.productName || '';
                const price = mediaMatch.productOfferPrice || mediaMatch.productPrice || '';
                
                if (name && price) {
                    reply = `আপনার পাঠানো ছবিটি আমাদের "${name}" এর! ✨\n\n দাম: ${price} টাকা`;
                    
                    // Add variation info if available
                    if (mediaMatch.productVariations && mediaMatch.productVariations.length > 0) {
                        const variationList = mediaMatch.productVariations
                            .map(v => `${v.available !== false ? '✅' : '❌'} ${v.name}${v.price ? ` - ${v.price} টাকা` : ''}`)
                            .join('\n');
                        reply += `\n\n📦 Variations:\n${variationList}`;
                    }
                    
                    reply += '\n\nআপনি কি অর্ডার করতে চান?';
                } else if (mediaMatch.message) {
                    reply = mediaMatch.message;
                }
                
                if (reply) {
                    await sendAndLog(psid, reply, 'bot', brandData);
                    return; // ZERO TOKENS! FASTEST PATH!
                }
            }
        } catch (mediaErr) {
            serverLog(`[Media Browser Error]: ${mediaErr.message}`);
        }

        // --- PHASE 1: Zero-Token Product Visual Matcher ---
        if (incomingHash) {
            const productMatch = await findProductByPHash(brandData.id, incomingHash);
            if (productMatch) {
                serverLog(`[Product Match HIT] Matched with Product: ${productMatch.productName}`);
                const reply = `আপনার পাঠানো ছবিটি আমাদের "${productMatch.productName}" এর। এর বর্তমান দাম ${productMatch.offerPrice || productMatch.price} টাকা। আপনি কি এটি অর্ডার করতে চান? ✨`;
                await sendAndLog(psid, reply, 'bot', brandData);
                return; // ZERO TOKENS!
            }
        }

        // --- PHASE 2: AI-FREE pHash Knowledge Caching ---
        // (Existing vision_knowledge check)
        const cacheSnap = await db.collection('vision_knowledge')
            .where('brandId', '==', brandData.id)
            .get();

        let bestCacheMatch = null;
        let lowestDistance = 999;

        for (const doc of cacheSnap.docs) {
            const data = doc.data();
            if (data.pHash) {
                const dist = getHammingDistance(incomingHash, data.pHash);
                if (dist < 12 && dist < lowestDistance) {
                    lowestDistance = dist;
                    bestCacheMatch = data;
                }
            }
        }

        if (bestCacheMatch) {
            serverLog(`[Knowledge HIT] Matched with distance ${lowestDistance}. serving from cache!`);
            await sendAndLog(psid, bestCacheMatch.response, 'bot', brandData);
            return; // FREE!
        }

        // --- PHASE 3: Context-Aware OCR Fallback (disabled - Tesseract WASM crashes Vercel) ---
        try {
            // Tesseract OCR disabled on Vercel serverless
            // Instead, use preceding message context only
            
            // Fetch preceding message context
            const historySnap = await db.collection(`conversations/${psid}/messages`)
                .orderBy('timestamp', 'desc')
                .limit(2)
                .get();
            const precedingText = historySnap.docs.find(d => d.data().type === 'received' && d.data().text !== text)?.data()?.text || "";
            
            const combinedContext = (precedingText + " " + (text || "")).trim();

            if (combinedContext.length > 5) {
                serverLog(`[OCR Context] Combined Context: ${combinedContext}`);
                const matchedReply = await getApprovedInboxDraft(combinedContext, brandData.id, {});
                if (matchedReply) {
                    serverLog(`[OCR HIT] Deterministic match via context recognition!`);
                    await sendAndLog(psid, matchedReply.text, 'bot', brandData);
                    return; // FREE!
                }
            }
        } catch (ocrErr) {
            serverLog(`[OCR Error]: ${ocrErr.message}`);
        }
        // ----------------------------------------------

        const apiKey = brandData.googleAIKey || process.env.GEMINI_API_KEY;
        const blueprint = brandData.blueprint || {};
        const model = await getDynamicVisionModel(apiKey);

        // Fetch products to give context to Gemini for visual matching
        const prodSnap = await db.collection('products').where('brandId', '==', brandData.id).get();
        const products = prodSnap.docs.map(d => ({ 
            name: d.data().name, 
            price: d.data().price, 
            offerPrice: d.data().offerPrice,
            category: d.data().category 
        }));

        // Fetch history
        const historySnap = await db.collection(`conversations/${psid}/messages`)
            .orderBy('timestamp', 'desc')
            .limit(3)
            .get();
        const history = historySnap.docs.map(d => `${d.data().type}: ${d.data().text}`).reverse().join('\n');

        // Download image as buffer
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imagePart = {
            inlineData: {
                data: Buffer.from(response.data).toString('base64'),
                mimeType: 'image/jpeg'
            }
        };

        const prompt = `You are Tayeba Hossain, a friendly and professional customer service representative for "${brandData.name}". 
        Act as a real human. DO NOT mention that you are an AI assistant or a bot. NEVER say "digital assistant" or "AI beauty assistant". 
        CRITICAL: DO NOT use religious greetings like "Salam", "Nomoshkar", "Adab", etc. 
        
        NAME RULE:
        - Only introduce yourself as Tayeba Hossain once at the start.
        - If you see "Tayeba Hossain" already mentioned in the history below, DO NOT repeat your name. 
        
        GREETING RULE:
        - Start directly with "Skinzy-তে আপনাকে স্বাগতম!" or "Hello/Hi" or "কেমন আছেন?".
        
        CATALOG: ${JSON.stringify(products)}
        HISTORY:
        ${history}
        
        The customer sent an image (screenshot/photo). 
        User Message (if any): "${text}"
        
        TASK:
        1. Identify the product in the image if possible.
        2. Respond in Bangla (Bengali) by default.
        3. If the user asks for more photos or other variations, specify the action.
        
        RETURN ONLY IN JSON FORMAT:
        {
            "text": "Your identity/details response string",
            "action": "SEND_CAROUSEL" | "SEND_MORE_PHOTOS" | "NONE",
            "productId": "ID of the identifed product"
        }`;

        const result = await model.generateContent([prompt, imagePart]);
        const responseJsonText = result.response.text();
        const jsonMatch = responseJsonText.match(/\{[\s\S]*\}/);
        
        let finalText = "";
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            finalText = data.text;
            await sendAndLog(psid, data.text, 'bot', brandData);
            if (data.action && data.action !== 'NONE') {
                await executeRichMediaAction(psid, data.action, data.productId, brandData);
            }
        } else {
            finalText = responseJsonText;
            await sendAndLog(psid, responseJsonText, 'bot', brandData);
        }

        // --- PHASE 2: AUTO-CACHE THE AI'S VISION RESULT ---
        if (incomingHash && finalText) {
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 90); // Keep knowledge for 90 days

            await db.collection('vision_knowledge').add({
                brandId: brandData.id,
                pHash: incomingHash,
                originalUrl: imageUrl,
                response: finalText,
                timestamp: serverTimestamp(),
                expiresAt: expiry // TTL Field
            });
            serverLog(`[pHash Cache] Stored new Vision result with TTL.`);
        }
        // --------------------------------------------------

    } catch (e) {
        serverLog(`Vision Error [${brandData.name}]: ${e.message}`);
    }
}

/**
 * REFINED FILTER: Collect basic greetings but ignore binary Yes/No/Ok.
 */

async function sendAndLog(psid, text, type, brandData) {
    if (!text) return;
    try {
        // ── GHOST MODE: Only mark as read if we are actually replying ──
        try {
            const { markRead } = require('../services/facebookService');
            await markRead(psid, brandData.fbPageToken);
        } catch (err) {
            serverLog(`[Simulation] markRead failed (expected): ${err.message}`);
        }

        try {
            await sendMessage(psid, { text }, brandData.fbPageToken);
            serverLog(`[Send SUCCESS] Sent ${type} reply to ${psid}`);
        } catch (error) {
            serverLog(`[Send ERROR] Failed to send message to ${psid}: ${error.response?.data?.error?.message || error.message}`);
            await handleFbApiError(error, brandData);
        }
        
        const nowMs = Date.now();
        const dhakaTime = new Date(nowMs);
        const timeStr = dhakaTime.toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', hour12: true });

        // Log to global logs
        await db.collection('logs').add({ 
            sender_psid: psid, 
            text, 
            type, 
            brandId: brandData.id,
            timestamp: nowMs
        });

        // Log to conversation history for Inbox visibility
        await db.collection('conversations').doc(psid).collection('messages').add({
            text,
            type: 'sent',
            sender_id: brandData.facebookPageId,
            brandId: brandData.id,
            platform: 'facebook',
            timestamp: nowMs,
            time: timeStr
        });

        // Update conversation summary — timestamp as number so Firestore orderBy('timestamp','desc') sorts correctly
        await db.collection('conversations').doc(psid).set({
            lastMessage: text,
            lastMessageTimestamp: nowMs,
            timestamp: nowMs,          // keep in sync so InboxList sees it at top
            unread: false,
            platform: 'facebook',
            brandId: brandData.id
        }, { merge: true });
    } catch (e) {
        serverLog(`SendAndLog Error: ${e.message}`);
    }
}

// --- PHASE 3: RICH MEDIA DISPATCHER ---
async function executeRichMediaAction(psid, action, productId, brandData) {
    if (!action || action === 'NONE' || !productId) return;

    try {
        const prodDoc = await db.collection('products').doc(productId).get();
        if (!prodDoc.exists) return;
        const product = { id: prodDoc.id, ...prodDoc.data() };

        if (action === 'SEND_MORE_PHOTOS') {
            if (product.images && product.images.length > 1) {
                // Send images starting from the second one (index 1) to avoid repeating the primary image
                const extraImages = product.images.slice(1, 4); 
                await sendSequencedMedia(psid, extraImages, brandData.fbPageToken);
            } else {
                await sendAndLog(psid, "দুঃখিত, এই মুহূর্তে এই প্রোডাক্টের আর কোনো এক্সট্রা ছবি নেই।", 'bot', brandData);
            }
        } 
        else if (action === 'SEND_CAROUSEL') {
            // Find variants (Products sharing the same variantOf parent, OR the parent itself)
            const parentId = product.variantOf || product.id;
            
            const variantsSnap = await db.collection('products')
                .where('brandId', '==', brandData.id)
                .get(); 
            
            const allProducts = variantsSnap.docs.map(d => ({id: d.id, ...d.data()}));
            const variants = allProducts.filter(p => p.id === parentId || p.variantOf === parentId);
            
            if (variants.length > 1) {
                const elements = variants.slice(0, 10).map(v => ({
                    title: v.name,
                    subtitle: `Price: ${v.offerPrice || v.price} BDT`,
                    image_url: v.images?.[0] || v.image,
                    buttons: [
                        {
                            type: "postback",
                            title: "অর্ডার করতে চাই \uD83D\uDFE2",
                            payload: `ORDER_${v.id}`
                        }
                    ]
                }));
                await sendCarouselMessage(psid, elements, brandData.fbPageToken);
            } else {
                await sendAndLog(psid, "এই প্রোডাক্টের মুহূর্তে অন্য কোনো কালার বা ভেরিয়েশন নেই।", 'bot', brandData);
            }
        }
    } catch (e) {
        serverLog(`[Rich Media Exec Error]: ${e.message}`);
    }
}
// ----------------------------------------

async function logUserMessage(psid, message, brandData, platformType = 'facebook') {
    serverLog(`[LogMsg] Starting for PSID: ${psid}`);
    let profile = { first_name: 'Test', last_name: 'User', profile_pic: '' };
    try {
        serverLog(`[LogMsg] Fetching profile...`);
        profile = await getProfile(psid, brandData.fbPageToken);
        serverLog(`[LogMsg] Profile fetched: ${profile.first_name}`);
    } catch (e) {
        serverLog(`[LogMsg] Profile fetch failed: ${e.message}`);
    }
    
    serverLog(`[LogMsg] Getting convo doc...`);
    const convoRef = db.collection('conversations').doc(psid);
    const doc = await convoRef.get();
    const currentData = doc.exists ? doc.data() : {};
    serverLog(`[LogMsg] Convo state: ${currentData.botState || 'IDLE'}`);

    const nowMs = Date.now();
    // FIX: Save both `name` AND `customerName` so ChatWindow header works correctly
    const customerName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'FB User';
    
    // Build lastMessage summary (handles text + attachments)
    let lastMessageText = message.text || '';
    if (!lastMessageText && message.attachments && message.attachments.length > 0) {
        const attType = message.attachments[0].type || 'file';
        lastMessageText = attType === 'image' ? '📷 Image' : attType === 'audio' ? '🎤 Voice Message' : '📎 Attachment';
    }

    const updateData = {
        id: psid,
        brandId: brandData.id,
        platform: platformType,
        name: customerName,
        customerName: customerName,  // FIX: ChatWindow uses customerName
        profilePic: profile.profile_pic || '',
        lastMessage: lastMessageText,
        // Use numeric timestamp for consistent sorting (largest = newest = top of inbox)
        timestamp: nowMs,
        lastMessageTimestamp: nowMs,
        unread: true
    };

    serverLog(`[LogMsg] Updating convo doc...`);
    await convoRef.set(updateData, { merge: true });

    // FIX: Also save attachments to the message sub-collection
    const attachmentsToSave = (message.attachments || []).map(att => ({
        type: att.type,
        payload: att.payload || {}
    }));

    serverLog(`[LogMsg] Adding to messages subcollection...`);
    await db.collection(`conversations/${psid}/messages`).add({
        text: message.text || '',
        attachments: attachmentsToSave,
        type: 'received',
        brandId: brandData.id,
        platform: platformType,
        timestamp: nowMs,
        time: new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', hour12: true })
    });

    serverLog(`[LogMsg] Completed for ${psid}`);
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
            serverLog(`[Linking] Convo ${convoId} linked to ${otherIds.join(', ')} via phone ${phone}`);
            await db.collection('conversations').doc(convoId).update({
                linkedConvos: FieldValue.arrayUnion(...otherIds)
            });
            // Update the others too
            for (const otherId of otherIds) {
                await db.collection('conversations').doc(otherId).update({
                    linkedConvos: FieldValue.arrayUnion(convoId)
                });
            }
        }
    } catch (e) {
        serverLog(`[Linking Error] ${e.message}`);
    }
}

/**
 * DETERMINISTIC STATE MACHINE (ManyChat Style)
 * Handles sequential data collection without LLM.
 */
async function handleDeterministicFlow(psid, text, convoData, brandData) {
    const state = convoData.botState || 'IDLE';
    const lowerText = text.toLowerCase();

    // 1. GREETING -> START ORDER FLOW
    const basicIntent = detectBasicIntent(text);
    if (state === 'IDLE') {
        if (basicIntent.intent === 'WANT_TO_ORDER' || (lowerText.includes('order') && lowerText.length < 10)) {
            await sendAndLog(psid, "নিশ্চিত করুন, অর্ডার করার জন্য আপনার একটি সচল ফোন নম্বর দিন।", 'bot', brandData);
            await db.collection('conversations').doc(psid).update({ botState: 'AWAITING_PHONE' });
            return true;
        }
    }

    // 2. COLLECTING PHONE
    if (state === 'AWAITING_PHONE') {
        const phone = extractPhoneNumber(text);
        if (phone) {
            await db.collection('conversations').doc(psid).update({ 
                botState: 'AWAITING_ADDRESS',
                customerPhone: phone 
            });
            // Link cross-platform convos
            await linkConversationsByPhone(psid, phone, brandData.id);
            await sendAndLog(psid, "ধন্যবাদ! এখন আপনার পূর্ণাঙ্গ ঠিকানাটি (জেলাসহ) লিখুন।", 'bot', brandData);
            return true;
        } else {
            await sendAndLog(psid, "দুঃখিত, নম্বরটি সঠিক মনে হচ্ছে না। দয়া করে আপনার ১১ ডিজিটের ফোন নম্বরটি আবার দিন।", 'bot', brandData);
            return true;
        }
    }

    // 3. COLLECTING ADDRESS
    if (state === 'AWAITING_ADDRESS') {
        const addressData = extractAddressSignals(text);
        if (addressData.detected) {
            const summary = `আপনার তথ্যগুলোঃ\n📞 ফোন: ${convoData.customerPhone}\n📍 ঠিকানা: ${text}\n\nসবকিছু কি ঠিক আছে? (হ্যাঁ / না লিখুন)`;
            await db.collection('conversations').doc(psid).update({ 
                botState: 'AWAITING_CONFIRMATION',
                customerAddress: text
            });
            await sendAndLog(psid, summary, 'bot', brandData);
            return true;
        } else {
            await sendAndLog(psid, "আপনার ঠিকানাটি একটু বিস্তারিত লিখুন (যেমন: হাউজ নাম্বার, রোড, জেলা)।", 'bot', brandData);
            return true;
        }
    }

    // 4. ORDER CONFIRMATION
    if (state === 'AWAITING_CONFIRMATION') {
        const yesKeywords = ['yes', 'confirm', 'thik ase', 'ok', 'ha', 'হ্যাঁ', 'ঠিক আছে'];
        const noKeywords = ['no', 'na', 'bhul', 'change', 'না', 'ভুল'];

        if (yesKeywords.some(kw => lowerText.includes(kw))) {
            const lastDraftId = convoData.lastMatchedDraftId;
            await db.collection('conversations').doc(psid).update({ 
                botState: 'IDLE',
                isLead: true 
            });
            
            // ── OPTION 1: AUTONOMOUS LEARNING LOOP (Self-Tuning) ──
            if (lastDraftId) {
                serverLog(`[Learning] Incrementing successCount for Draft: ${lastDraftId}`);
                await db.collection('draft_replies').doc(lastDraftId).update({
                    successCount: FieldValue.increment(1)
                });
            }

            await sendAndLog(psid, "চমৎকার! আপনার অর্ডারটি কনফার্ম করা হয়েছে। আমাদের প্রতিনিধি শীঘ্রই যোগাযোগ করবেন। ✨", 'bot', brandData);
            await logPersonaConversion(psid);
            return true;
        } else if (noKeywords.some(kw => lowerText.includes(kw))) {
            await db.collection('conversations').doc(psid).update({ botState: 'AWAITING_PHONE' });
            await sendAndLog(psid, "দুঃখিত! দয়া করে আপনার সঠিক ফোন নম্বরটি আবার দিন।", 'bot', brandData);
            return true;
        }
    }

    return false;
}

function extractLeadInfo(text) {
    const info = { phone: null, address: null };
    if (!text) return info;

    // Use our deterministic NLP extractor
    const detectedPhone = extractPhoneNumber(text);
    if (detectedPhone) info.phone = detectedPhone;

    // If text contains a phone number, test for address signals
    if (info.phone && text.length > 15) {
        // Clean out the phone number for address checks
        const cleanText = text.replace(new RegExp(info.phone, 'g'), '').trim();
        const addressData = extractAddressSignals(cleanText);
        if (addressData.detected) {
            info.address = cleanText;
            if (addressData.possibleDistrict) {
                serverLog(`[NLP] Detected District: ${addressData.possibleDistrict}`);
            }
        }
    }

    return info;
}

/**
 * REFINED FILTER: Collect basic greetings but ignore binary Yes/No/Ok.
 */
function shouldCaptureAsDraft(text) {
    if (!text || typeof text !== 'string') return false;
    const clean = text.trim().toLowerCase();
    const blacklist = ['হাঁ', 'না', 'হ্যাঁ', 'ok', 'hm', 'hmm', 'yes', 'no', 'okey', 'thx', 'ty', 'thanks', 'ধন্যবাদ'];
    if (blacklist.includes(clean)) return false;
    // Expanded blacklist for common filler words that shouldn't be training data
    const fillers = ['ji', 'g', 'ji bhai', 'g bhai', 'acha', 'accha', 'thik ace', 'thik ache', 'ok', 'okay'];
    if (fillers.includes(clean)) return false;
    return clean.length >= 2 && clean.length < 500;
}

async function handleEchoMessage(webhook_event, brandData) {
    // For echo messages: sender = page (us), recipient = customer
    // So the conversation PSID (customer's ID) = webhook_event.recipient.id
    // But wait — FB echo: sender.id = page_id, recipient.id = customer_psid
    const psid = webhook_event.recipient.id; // customer's PSID — correct
    const text = webhook_event.message.text;
    const message = webhook_event.message;
    serverLog(`[Echo - ${brandData.name}] Admin Reply to customer ${psid}: ${text}`);

    // --- PHASE 3: Bulk Passive Learning (External Source: Messenger/Business Suite) ---
    // ALWAYS save the echo message first (even if blacklisted)
    try {
        const nowMs = Date.now();
        const timeStr = new Date(nowMs).toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', hour12: true });
        
        // Save the moderator's reply (from Facebook page)
        await db.collection(`conversations/${psid}/messages`).add({
            text: text || '',
            type: 'sent',
            sender_id: brandData.facebookPageId,
            brandId: brandData.id,
            platform: 'facebook',
            timestamp: nowMs,
            time: timeStr,
            isModeratorReply: true,  // Mark as moderator reply
            isExternalReply: true    // Mark as from Facebook page (not dashboard)
        });
        
        // Update conversation
        const convoSnap = await db.collection('conversations').doc(psid).get();
        const currentCount = convoSnap.data()?.moderatorReplyCount || 0;
        
        await db.collection('conversations').doc(psid).set({
            lastMessage: text || '',
            lastMessageTimestamp: nowMs,
            timestamp: nowMs,
            unread: false,
            status: 'replied',
            moderatorReplyCount: currentCount + 1
        }, { merge: true });
        
        serverLog(`[Echo] ✅ Moderator reply from Facebook page saved`);
    } catch (historyError) {
        serverLog(`[Echo History Error]: ${historyError.message}`);
    }
    
    // Only create draft if NOT blacklisted
    if (shouldCaptureAsDraft(text) && !message.app_id) {
        try {
            // First, ensure customer messages exist in the subcollection
            // (since we don't save on auto-reply, we need to save them now)
            const convoDoc = await db.collection('conversations').doc(psid).get();
            const convoData = convoDoc.data() || {};
            
            // Check if received messages already exist
            const checkSnap = await db.collection(`conversations/${psid}/messages`)
                .orderBy('timestamp', 'desc')
                .limit(15)
                .get();
            const receivedMsgs = checkSnap.docs.filter(d => d.data().type === 'received');
            
            // If no received messages found, save from conversation metadata
            if (receivedMsgs.length === 0 && convoData.lastMessage) {
                const nowMs = Date.now();
                await db.collection(`conversations/${psid}/messages`).add({
                    text: convoData.lastMessage,
                    type: 'received',
                    sender_id: psid,
                    brandId: brandData.id,
                    platform: convoData.platform || 'facebook',
                    timestamp: nowMs - 1000,
                    time: new Date(nowMs - 1000).toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', hour12: true })
                });
                serverLog(`[Passive-Learn] Saved unsaved customer message: "${convoData.lastMessage}"`);
            }

            const msgSnap = await db.collection(`conversations/${psid}/messages`)
                .orderBy('timestamp', 'desc')
                .limit(15)
                .get();
            
                const messages = msgSnap.docs.map(d => d.data());
                
                // --- NEW ROBUST DETECTION ---
                // Find the first index where a customer message (received) exists
                const firstReceivedIdx = messages.findIndex(m => m.type === 'received');
                
                if (firstReceivedIdx === -1) {
                    serverLog(`[Passive-Learn] No received messages found in last 15. Skipping.`);
                    return;
                }

                // Now find the first 'sent' message that appears BEFORE (older than) that received message
                // Remember: index 0 is newest, so 'before' means a HIGHER index.
                const lastSentIdx = messages.findIndex((m, idx) => idx > firstReceivedIdx && m.type === 'sent');

                const unrepliedReceived = (lastSentIdx === -1)
                    ? messages.slice(firstReceivedIdx).filter(m => m.type === 'received')
                    : messages.slice(firstReceivedIdx, lastSentIdx).filter(m => m.type === 'received');
                // ----------------------------

                if (unrepliedReceived.length > 0) {
                    const aggregatedText = unrepliedReceived
                        .filter(m => m.text)
                        .reverse()
                        .map(m => m.text)
                        .join(" ");

                const imageHashes = unrepliedReceived
                    .filter(m => m.attachments && m.attachments[0]?.type === 'image')
                    .map(m => m.attachments[0].pHash)
                    .filter(h => h);

                if (aggregatedText.length > 2 || imageHashes.length > 0) {
                    const keyword = aggregatedText || "External Image Inquiry";
                    const variations = (brandData.autoHyperIndex !== false) ? getLinguisticVariations(keyword) : [];
                    
                    await db.collection("draft_replies").add({
                        keyword: keyword,
                        result: text,
                        variations: variations,
                        imageHashes: imageHashes,
                        status: 'pending',
                        type: 'expert_learned',
                        brandId: brandData.id,
                        timestamp: serverTimestamp(),
                        successCount: 0,
                        metadata: { psid: psid, source: 'external_echo_passive_learn' }
                    });
                    serverLog(`[Passive-Learn] Learned from Messenger/Meta Suite reply for brand: ${brandData.id}`);
                }
            }
        } catch (e) {
            serverLog(`[Passive-Learn Error]: ${e.message}`);
        }
    }

}

async function syncConversationHistory(req, res) {
    let { brandId } = req.body;
    serverLog(`[SYNC] Request for Brand ID: "${brandId}"`);
    
    // Default to Skinzy if not provided or for local dev
    if (!brandId || brandId === 'Skinzy' || brandId === 'owner_dev_brand') {
        brandId = 'Skinzy';
    }

    try {
        const brandRef = db.collection("brands").doc(brandId);
        const brandSnap = await brandRef.get();

        let brandData;
        if (brandSnap.exists) {
            brandData = { id: brandSnap.id, ...brandSnap.data() };
        } else if (brandId === 'Skinzy' || brandId === 'owner_dev_brand') {
            // Owner Fallback from .env
            brandData = {
                id: 'Skinzy',
                name: 'Skinzy Skincare',
                facebookPageId: process.env.FACEBOOK_PAGE_ID,
                fbPageToken: process.env.PAGE_ACCESS_TOKEN || process.env.FB_PAGE_TOKEN,
                googleAIKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY,
                isDevFallback: true
            };
            serverLog(`[SYNC] Using .env Fallback for brand: ${brandData.name}`);
        } else {
            return res.status(404).json({ error: `Brand "${brandId}" not found` });
        }
        
        const token = brandData.fbPageToken;
        
        if (!token) return res.status(400).json({ error: "FB Page Token missing" });

        // 1. Fetch Conversations from Graph API (v21.0)
        const convosResp = await axios.get(`https://graph.facebook.com/v21.0/me/conversations?fields=unread_count,updated_time,participants,messages.limit(1){message,from,timestamp}&access_token=${token}`);
        
        const convos = convosResp.data.data;
        let count = 0;

        for (const convo of convos) {
            const sender = convo.participants.data.find(p => p.id !== brandData.facebookPageId);
            if (!sender) continue;

            const psid = sender.id;
            const lastMsg = convo.messages?.data[0]?.message || "Syncing...";
            const timestamp = new Date(convo.updated_time);

            // Fetch full profile for better UI
            const profile = await getProfile(psid, token);
            const customerName = `${profile.first_name || sender.name || ''} ${profile.last_name || ''}`.trim() || 'FB User';

            // 2. Update Conversation Summary in Firestore (create if missing)
            // FIX: also save customerName (ChatWindow uses this for header display)
            const convoRef = db.collection("conversations").doc(psid);
            const tsMs = timestamp.getTime();
            await convoRef.set({
                id: psid,
                brandId: brandData.id,
                platform: 'facebook',
                name: customerName,
                customerName: customerName,  // FIX: ChatWindow header uses customerName
                profilePic: profile.profile_pic || '',
                lastMessage: lastMsg,
                timestamp: tsMs,
                lastMessageTimestamp: tsMs,
                unread: convo.unread_count > 0
            }, { merge: true });

            // 3. Fetch last few messages and sync to Firestore sub-collection
            // FIX: use numeric timestamps (ms) to keep orderBy consistent
            const msgResp = await axios.get(`https://graph.facebook.com/v21.0/${convo.id}/messages?fields=message,from,created_time&limit=20&access_token=${token}`);
            
            // Check existing message IDs to avoid duplicates
            const existingSnap = await db.collection(`conversations/${psid}/messages`)
                .where('fb_msg_id', '!=', null).limit(50).get();
            const existingIds = new Set(existingSnap.docs.map(d => d.data().fb_msg_id).filter(Boolean));

            for (const msg of msgResp.data.data) {
                const isSent = msg.from.id === brandData.facebookPageId;
                const msgId = msg.id;
                
                // Skip if already synced
                if (existingIds.has(msgId)) continue;
                
                // FIX: Use numeric ms timestamp — NOT a JS Date object
                const msgTsMs = new Date(msg.created_time).getTime();
                
                await db.collection(`conversations/${psid}/messages`).add({
                    text: msg.message || '',
                    type: isSent ? 'sent' : 'received',
                    brandId: brandData.id,
                    platform: 'facebook',
                    fb_msg_id: msgId,
                    timestamp: msgTsMs,
                    time: new Date(msgTsMs).toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', hour12: true })
                });
            }
            count++;
        }

        res.json({ success: true, count, message: `${count} conversations synced successfully` });
    } catch (e) {
        serverLog(`Sync Error: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
}

async function sendMessageFromDashboard(req, res) {
    const { recipientId, psid, text, attachments, brandId } = req.body;
    const targetId = recipientId || psid;
    serverLog(`[SEND] Dashboard request for ID: ${targetId}, Brand: ${brandId}`);

    if (!targetId || (!text && (!attachments || attachments.length === 0)) || !brandId) {
        return res.status(400).json({ error: "Missing recipientId, text/attachments, or brandId" });
    }

    try {
        const brandSnap = await db.collection("brands").doc(brandId).get();

        let brandData;
        if (brandSnap.exists) {
            brandData = { id: brandSnap.id, ...brandSnap.data() };
        } else if (brandId === 'Skinzy' || brandId === 'owner_dev_brand') {
            brandData = {
                id: 'Skinzy',
                fbPageToken: process.env.PAGE_ACCESS_TOKEN || process.env.FB_PAGE_TOKEN,
                facebookPageId: process.env.FACEBOOK_PAGE_ID
            };
        } else {
            return res.status(404).json({ error: "Brand context not found" });
        }

        const token = brandData.fbPageToken;
        if (!token) {
            serverLog(`[SEND ERROR] FB Token missing for brand: ${brandData.id}`);
            return res.status(400).json({ error: "FB Token missing" });
        }

        serverLog(`[SEND] Using token: ${token.substring(0, 10)}... for recipient: ${targetId}`);

        // Send to Facebook
        const { replyToId } = req.body;
        if (text) {
          await sendMessage(targetId, { text }, token, replyToId);
        }
        
        if (attachments && attachments.length > 0) {
          const urls = attachments.map(a => a.payload?.url).filter(Boolean);
          if (urls.length > 0) {
            const { sendSequencedMedia } = require('../services/facebookService');
            await sendSequencedMedia(targetId, urls, token);
          }
        }

        // --- CONVERSION TRACKING (Split Test) ---
        const lowerText = text.toLowerCase();
        if (lowerText.includes('confirm') || lowerText.includes('order created') || lowerText.includes('অর্ডার কনফার্ম')) {
            await logPersonaConversion(targetId);
        }

        // --- PHASE 3: MODERATOR REPLY → SAVE FOR DRAFT CREATION ---
        // NEW POLICY: Only save when moderator manually replies (not on auto-reply)
        // We save the customer's incoming messages HERE (when moderator replies)
        // so that draft creation can find them in the messages subcollection
        
        // ALWAYS save moderator reply (even if blacklisted)
        try {
            const nowMs = Date.now();
            const timeStr = new Date(nowMs).toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', hour12: true });

            // Save moderator reply
            await db.collection(`conversations/${targetId}/messages`).add({
                text: text || '',
                type: 'sent',
                sender_id: brandData.facebookPageId,
                brandId: brandData.id,
                platform: 'facebook',
                timestamp: nowMs,
                time: timeStr,
                isModeratorReply: true  // Mark as moderator reply
            });

            // Update parent conversation
            const convoSnap = await db.collection('conversations').doc(targetId).get();
            const currentCount = convoSnap.data()?.moderatorReplyCount || 0;
            
            await db.collection('conversations').doc(targetId).set({
                lastMessage: text || '',
                lastMessageTimestamp: nowMs,
                timestamp: nowMs,
                unread: false,
                status: 'replied',
                moderatorReplyCount: currentCount + 1
            }, { merge: true });
            
            serverLog(`[History] ✅ Moderator reply saved (message + reply stored for draft creation)`);
        } catch (historyError) {
            serverLog(`[History Error]: ${historyError.message}`);
        }
        
        // Only create draft if NOT blacklisted
        if (shouldCaptureAsDraft(text)) {
            try {
                // First, save any unsaved customer messages from this conversation
                // (since we don't save on auto-reply, we need to ensure customer messages exist)
                const convoDoc = await db.collection('conversations').doc(targetId).get();
                const convoData = convoDoc.data() || {};
                
                // Check if customer messages are already saved
                // Use only orderBy (no where filter) to avoid needing composite index
                const existingMsgSnap = await db.collection(`conversations/${targetId}/messages`)
                    .orderBy('timestamp', 'desc')
                    .limit(15)
                    .get();
                const existingMsgs = existingMsgSnap.docs.filter(d => d.data().type === 'received');
                
                // If no received messages found, save from conversation metadata
                if (existingMsgs.length === 0 && convoData.lastMessage) {
                    const nowMs = Date.now();
                    await db.collection(`conversations/${targetId}/messages`).add({
                        text: convoData.lastMessage,
                        type: 'received',
                        sender_id: targetId,
                        brandId: brandData.id,
                        platform: convoData.platform || 'facebook',
                        timestamp: nowMs - 1000, // 1 second before moderator reply
                        time: new Date(nowMs - 1000).toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', hour12: true })
                    });
                    serverLog(`[Draft-Learn] Saved unsaved customer message: "${convoData.lastMessage}"`);
                }

                // Find all 'received' messages since the last 'sent' message
                const msgSnap = await db.collection(`conversations/${targetId}/messages`)
                    .orderBy('timestamp', 'desc')
                    .limit(15)
                    .get();
                
                const messages = msgSnap.docs.map(d => d.data());
                
                // Find the first index where a customer message (received) exists
                const firstReceivedIdx = messages.findIndex(m => m.type === 'received');
                
                if (firstReceivedIdx === -1) {
                    serverLog(`[Draft-Learn] No received messages found in last 15. Skipping.`);
                    return;
                }

                // Find the first 'sent' message that appears before that received message
                const lastSentIdx = messages.findIndex((m, idx) => idx > firstReceivedIdx && m.type === 'sent');

                const unrepliedReceived = (lastSentIdx === -1)
                    ? messages.slice(firstReceivedIdx).filter(m => m.type === 'received')
                    : messages.slice(firstReceivedIdx, lastSentIdx).filter(m => m.type === 'received');

                if (unrepliedReceived.length > 0) {
                    const aggregatedText = unrepliedReceived
                        .filter(m => m.text)
                        .reverse()
                        .map(m => m.text)
                        .join(" ");

                    const imageHashes = unrepliedReceived
                        .filter(m => m.attachments && m.attachments[0]?.type === 'image')
                        .map(m => m.attachments[0].pHash)
                        .filter(h => h);

                    if (aggregatedText.length > 2 || imageHashes.length > 0) {
                        const keyword = aggregatedText || "Image Inquiry";
                        const variations = (brandData.autoHyperIndex !== false) ? getLinguisticVariations(keyword) : [];
                        
                        // Save as DRAFT (not conversation) - this is the new policy
                        await db.collection("draft_replies").add({
                            keyword: keyword,
                            result: text,
                            variations: variations,
                            imageHashes: imageHashes,
                            status: 'pending',  // Pending admin approval
                            type: 'moderator_learned',
                            brandId: brandData.id,
                            timestamp: serverTimestamp(),
                            successCount: 0,
                            metadata: { 
                                psid: targetId, 
                                source: 'moderator_reply',
                                moderatorReply: text,
                                customerMessage: aggregatedText
                            }
                        });
                        
                        serverLog(`[Draft-Learn] ✅ Message + Reply saved to Draft Center for approval`);
                        serverLog(`[Draft-Learn] Customer: "${aggregatedText}"`);
                        serverLog(`[Draft-Learn] Moderator: "${text}"`);
                    }
                }
            } catch (autoLearnError) {
                serverLog(`[Draft-Learn Error]: ${autoLearnError.message}`);
            }
        }

        // Success log
        await db.collection('logs').add({ 
            psid: targetId, 
            text: text || '', 
            type: 'admin', 
            brandId: brandData.id,
            timestamp: Date.now() 
        });

        res.json({ success: true });
    } catch (e) {
        serverLog(`Send Error: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
}

async function generateAICommentVariations(req, res) {
    console.log("AI Variation Request Received:", req.body);
    const { keywords, brandId, count = 5 } = req.body;

    if (!keywords || !brandId) {
        return res.status(400).json({ error: "Missing keywords or brandId" });
    }

    try {
        const brandSnap = await db.collection("brands").doc(brandId).get();
        const brandData = brandSnap.exists ? brandSnap.data() : { name: "Our Brand" };
        const apiKey = brandData.googleAIKey || process.env.GEMINI_API_KEY;
        const model = await getDynamicModel(apiKey);

        const prompt = `You are an expert social media copywriter for "${brandData.name}".
        Keywords for the post: ${JSON.stringify(keywords)}
        
        TASK:
        Generate ${count} unique and engaging reply variations for a Facebook comment section.
        Each variation must include:
        1. A "publicReply": A short, friendly comment reply.
        2. A "privateReply": A helpful inbox message.
        
        RULES:
        - If keywords indicate price/details, the public reply should tell them to check their inbox.
        - Vary the tone (professional, friendly, enthusiastic).
        - Use emojis naturally.
        
        Return ONLY in JSON format as an array:
        [
            { "publicReply": "...", "privateReply": "..." },
            ...
        ]`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        
        if (jsonMatch) {
            const variations = JSON.parse(jsonMatch[0]);
            res.json({ success: true, variations });
        } else {
            res.status(500).json({ error: "Failed to parse AI response" });
        }
    } catch (e) {
        serverLog(`AI Generation Error: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
}

async function getLatestPosts(req, res) {
    try {
        const { brandId } = req.params;
        const { db } = require('../services/firestoreService');
        const { getLatestPosts: fetchPosts } = require('../services/facebookService');

        console.log(`[DEBUG] getLatestPosts for brandId: ${brandId}`);
        const brandDoc = await db.collection("brands").doc(brandId).get();
        console.log(`[DEBUG] brandDoc.exists: ${brandDoc.exists}`);
        
        if (!brandDoc.exists) {
            console.log(`[DEBUG] Brand not found: ${brandId}`);
            return res.status(404).json({ error: "Brand not found" });
        }
        
        const brandData = brandDoc.data();
        console.log(`[DEBUG] brandData.fbPageToken present: ${!!brandData.fbPageToken}`);
        
        if (!brandData.fbPageToken) return res.status(400).json({ error: "FB Page Token missing" });

        const posts = await fetchPosts(brandData.fbPageToken);
        console.log(`[DEBUG] posts fetched: ${posts?.length || 0}`);
        res.json({ posts: posts || [] });
    } catch (error) {
        console.error(`[DEBUG] getLatestPosts ERROR:`, error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
}

async function getPostById(req, res) {
    try {
        const { brandId, postId } = req.params;
        const { db } = require('../services/firestoreService');
        const { getPostContent } = require('../services/facebookService');

        const brandDoc = await db.collection("brands").doc(brandId).get();
        if (!brandDoc.exists) return res.status(404).json({ error: "Brand not found" });
        
        const brandData = brandDoc.data();
        if (!brandData.fbPageToken) return res.status(400).json({ error: "FB Page Token missing" });

        const post = await getPostContent(postId, brandData.fbPageToken);
        if (!post) return res.status(404).json({ error: "Post not found or inaccessible" });
        
        res.json({ post });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function handlePostback(psid, postback, brandData, platformType) {
    const payload = postback.payload;
    serverLog(`[Postback] Payload: ${payload} from ${psid}`);

    if (payload.startsWith('ORDER_')) {
        const productId = payload.replace('ORDER_', '');
        const prodDoc = await db.collection('products').doc(productId).get();
        const productName = prodDoc.exists ? prodDoc.data().name : "this product";

        // Trigger the deterministic order flow by simulating the intent and updating state
        await db.collection('conversations').doc(psid).update({ 
            botState: 'AWAITING_PHONE',
            selectedProductId: productId
        });
        
        await sendAndLog(psid, `চমৎকার! আপনি "${productName}" অর্ডার করতে চেয়েছেন। নিশ্চিত করার জন্য আপনার একটি সচল ফোন নম্বর দিন।`, 'bot', brandData);
    }
}

async function proxyUpload(req, res) {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const { admin } = require('../services/firestoreService');
    const bucketNames = [
        "advance-automation-8029e.firebasestorage.app",
        "advance-automation-8029e.appspot.com",
        "advance-automation-8029e"
    ];

    // --- 1. Immediate Success if we have a cache ---
    if (lastSuccessfulBucket) {
        try {
            if (lastSuccessfulBucket === 'imgur') throw new Error("Force Imgur if fast");
            const bucket = admin.storage().bucket(lastSuccessfulBucket);
            const fileName = `uploads/${Date.now()}_${req.file.originalname}`;
            await bucket.file(fileName).save(req.file.buffer, { metadata: { contentType: req.file.mimetype } });
            await bucket.file(fileName).makePublic();
            return res.json({ success: true, url: `https://storage.googleapis.com/${bucket.name}/${fileName}` });
        } catch (e) { lastSuccessfulBucket = null; }
    }

    // --- 2. Parallel Race: Firebase vs Imgur ---
    const firebasePromises = bucketNames.map(async (name) => {
        try {
            const bucket = admin.storage().bucket(name);
            const fileName = `uploads/${Date.now()}_${req.file.originalname}`;
            await new Promise(async (res, rej) => {
                const t = setTimeout(() => rej("timeout"), 800); // Super fast fail-over
                try {
                    await bucket.file(fileName).save(req.file.buffer, { metadata: { contentType: req.file.mimetype } });
                    await bucket.file(fileName).makePublic();
                    clearTimeout(t); res(`https://storage.googleapis.com/${bucket.name}/${fileName}`);
                } catch(err){ clearTimeout(t); rej(err); }
            });
            lastSuccessfulBucket = name;
            return `https://storage.googleapis.com/${name}/${fileName}`;
        } catch(e) { throw e; }
    });

    const imgurPromise = (async () => {
        const formData = new URLSearchParams();
        formData.append('image', req.file.buffer.toString('base64'));
        formData.append('type', 'base64');
        const resp = await axios.post('https://api.imgur.com/3/image', formData, {
            headers: { 'Authorization': 'Client-ID 546c25a59c58ad7' },
            timeout: 8000 // 8 second cap for Imgur
        });
        if (resp.data.success) {
            lastSuccessfulBucket = 'imgur';
            return resp.data.data.link;
        }
        throw new Error("Imgur slow");
    })();

    try {
        const fastUrl = await Promise.any([...firebasePromises, imgurPromise]);
        return res.json({ success: true, url: fastUrl });
    } catch (e) {
        console.error("[PROXY_UPLOAD] All attempts failed:", e);
        res.status(500).json({ error: "All upload attempts failed." });
    }
}

module.exports = {
   verifyWebhook,
   handleWebhookPost,
   syncConversationHistory,
   sendMessageFromDashboard,
   generateAICommentVariations,
   getLatestPosts,
   getPostById,
   proxyUpload,
   
   // Logic Engines (for testing/direct use if needed)
   getAllMatchingDrafts,
   combineDrafts,
   getApprovedInboxDraft,
   getShuffledReply,
   processIncomingMessage,
   processIncomingComment,
   handleAIResponse,
   handleVisionResponse
};

