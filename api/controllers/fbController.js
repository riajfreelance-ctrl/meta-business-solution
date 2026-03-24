const { db, collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc, limit, orderBy, getDoc, getBrandByPlatformId } = require('../services/firestoreService');
const { getProfile, sendMessage, replyToComment, sendPrivateReply, getPostContent, likeComment, hideComment } = require('../services/facebookService');
const { getDynamicModel, getDynamicVisionModel } = require('../services/geminiService');
const { serverLog } = require('../utils/logger');
const axios = require('axios');

// Webhook Verification
async function verifyWebhook(req, res) {
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
    
    // In a multi-tenant setup, we can either use a platform-wide verify token 
    // or validate against a specific brand. For now, we'll use a global one
    // or check if it matches ANY brand's verify token.
    const globalToken = process.env.VERIFY_TOKEN || 'myapp4204';

    if (mode && token) {
        if (mode === 'subscribe' && (token === globalToken)) {
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);      
        }
    }
}

// Handle Webhook Post
async function handleWebhookPost(req, res) {
    let body = req.body;
    serverLog(`[WEBHOOK] Object: ${body.object}`);
    
    const isFB = body.object === 'page';
    const isIG = body.object === 'instagram';

    if (isFB || isIG) {
        for (const entry of body.entry) {
            const platformId = entry.id;
            const platformType = isIG ? 'instagram' : 'facebook';
            const brandData = await getBrandByPlatformId(platformId, platformType);
            
            if (!brandData) {
                serverLog(`[WARNING] No brand found for ${platformType} ID: ${platformId}`);
                continue;
            }

            // 1. Handle Private Messaging
            if (entry.messaging) {
                const webhook_event = entry.messaging[0];
                const sender_psid = webhook_event.sender.id;
                webhook_event.platform = platformType;

                if (webhook_event.message) {
                    if (webhook_event.message.is_echo) {
                        handleEchoMessage(webhook_event, brandData);
                    } else {
                        await processIncomingMessage(sender_psid, webhook_event.message, brandData, platformType);
                    }
                }
            }

            // 2. Handle Comments (Feed Changes)
            if (entry.changes) {
                for (const change of entry.changes) {
                    if (change.field === 'feed' && change.value.item === 'comment' && change.value.verb === 'add') {
                        await processIncomingComment(change.value, brandData);
                    }
                }
            }
        }
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
}

async function processIncomingComment(commentData, brandData) {
    const { comment_id, post_id, message, from } = commentData;
    const sender_id = from.id;

    if (sender_id === brandData.facebookPageId) return;

    serverLog(`[Comment - ${brandData.name}] from ${from.name}: ${message}`);
    const settings = brandData.commentSettings || {};
    const { 
        autoLike = false, 
        spamFilter = false, 
        leadCapture = false, 
        sentimentAnalysis = false, 
        humanDelay = false,
        aiReply = true,
        systemAutoReply = true
    } = settings;

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
            await addDoc(collection(db, "leads"), {
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
            await addDoc(collection(db, "pending_comments"), {
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
                serverLog(`[System] Match found for: ${message}`);
                
                // Track Performance (Hit Rate)
                const { getDoc, doc, updateDoc } = require('../services/firestoreService');
                const draftRef = doc(db, "comment_drafts", draftId);
                const draftSnap = await getDoc(draftRef);
                if (draftSnap.exists()) {
                    const variations = draftSnap.data().variations || [];
                    if (variations[index]) {
                        variations[index].hitCount = (variations[index].hitCount || 0) + 1;
                        await updateDoc(draftRef, { variations });
                    }
                }
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
            
            // Public Reply
            await replyToComment(comment_id, publicReply, brandData.fbPageToken);
            
            // Private Reply (Inbox Message)
            if (privateReply) {
                await sendPrivateReply(comment_id, privateReply, brandData.fbPageToken);
                
                // If there's a button, send it as a follow-up template
                if (matchedVariation && matchedVariation.buttonText && matchedVariation.buttonUrl) {
                    const { sendButtonTemplate } = require('../services/facebookService');
                    // We use the sender_id (PSID) from the comment webhook
                    await sendButtonTemplate(sender_id, matchedVariation.privateReply, {
                        text: matchedVariation.buttonText,
                        url: matchedVariation.buttonUrl
                    }, brandData.fbPageToken);
                }
            }
        } else {
            // C. Move to Pending
            await addDoc(collection(db, "pending_comments"), {
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
        await addDoc(collection(db, 'comments'), {
            comment_id, post_id, sender_id, sender_name: from.name,
            message, reply: publicReply, privateReply,
            brandId: brandData.id, timestamp: serverTimestamp()
        });

    } catch (error) {
        console.error("Error processing comment:", error);
    }
}

async function getShuffledReply(message, brandId, postId = null) {
    const { db, collection, query, where, getDocs } = require('../services/firestoreService');
    const q = query(collection(db, "comment_drafts"), where("brandId", "==", brandId));
    const snapshot = await getDocs(q);
    const drafts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 1. Try to find local match (Specific Post ID)
    if (postId) {
        const postSpecificMatch = drafts.find(draft => 
            draft.postId === postId && 
            draft.keywords.some(kw => message.toLowerCase().includes(kw.toLowerCase()))
        );
        if (postSpecificMatch && postSpecificMatch.variations?.length > 0) {
            const index = Math.floor(Math.random() * postSpecificMatch.variations.length);
            return { variation: postSpecificMatch.variations[index], draftId: postSpecificMatch.id, index };
        }
    }

    // 2. Fallback to Global match (No Post ID)
    for (const draft of drafts) {
        if (draft.postId) continue; // Skip post-specific ones in global search
        const match = draft.keywords.some(kw => message.toLowerCase().includes(kw.toLowerCase()));
        if (match && draft.variations?.length > 0) {
            const index = Math.floor(Math.random() * draft.variations.length);
            return { variation: draft.variations[index], draftId: draft.id, index };
        }
    }
    return null;
}

async function handleCommentAIResponse(commentId, postId, message, brandData, sentiment = 'neutral') {
    try {
        const postData = await getPostContent(postId, brandData.fbPageToken);
        const postText = postData ? postData.message : "No post content found";

        const apiKey = brandData.googleAIKey || process.env.GEMINI_API_KEY;
        const model = await getDynamicModel(apiKey);
        
        const prompt = `You are a social media assistant for "${brandData.name}". 
        A customer commented on our post.
        
        POST CONTENT: "${postText}"
        CUSTOMER COMMENT: "${message}"
        CUSTOMER SENTIMENT: "${sentiment}"
        
        TASK:
        1. Generate a short, friendly public reply to the comment.
        2. Generate a helpful private message for the inbox.
        3. If the user asks for price/details, the public reply MUST tell them to check their inbox.
        4. If the sentiment is negative, be very polite and offer support.
        
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

    // Persist to Firestore with brandId
    await logUserMessage(sender_psid, message, brandData, platformType);

    // 1. Handle Image Attachments (Visual Shopping)
    if (message.attachments && message.attachments.length > 0) {
        const imageAtt = message.attachments.find(att => att.type === 'image');
        if (imageAtt) {
            await handleVisionResponse(sender_psid, imageAtt.payload.url, message.text || "", brandData);
            return; // Vision handles it
        }
    }

    if (!message.text) return;

    // 2. Automated Lead Capture (Phone & Address)
    const leadInfo = extractLeadInfo(message.text);
    if (leadInfo.phone || leadInfo.address) {
        serverLog(`[Lead Captured - ${brandData.name}] Phone: ${leadInfo.phone}, Address: ${leadInfo.address}`);
        const { setDoc } = require('firebase/firestore');
        const convoRef = doc(db, 'conversations', sender_psid);
        const updateData = { isLead: true };
        if (leadInfo.phone) updateData.customerPhone = leadInfo.phone;
        if (leadInfo.address) updateData.customerAddress = leadInfo.address;
        await setDoc(convoRef, updateData, { merge: true });
    }

    serverLog(`[Brand: ${brandData.name}] Incoming from ${sender_psid}: ${message.text}`);
    // AI/Keyword Logic (Isolated by brandId)
    const lowerText = message.text.toLowerCase();
    const q = query(
        collection(db, 'knowledge_base'), 
        where('brandId', '==', brandData.id),
        where('keywords', 'array-contains', lowerText) // Optimized keyword search
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
        const answer = snapshot.docs[0].data().answer;
        await sendAndLog(sender_psid, answer, 'bot', brandData);
    } else {
        await handleAIResponse(sender_psid, message.text, brandData);
    }
}

async function handleAIResponse(sender_psid, text, brandData) {
    try {
        const apiKey = brandData.googleAIKey || process.env.GEMINI_API_KEY;
        const blueprint = brandData.blueprint || {};

        const model = await getDynamicModel(apiKey);
        
        // Fetch products for context
        const prodSnap = await getDocs(query(collection(db, 'products'), where('brandId', '==', brandData.id)));
        const products = prodSnap.docs.map(d => ({ 
            name: d.data().name, 
            price: d.data().price, 
            offerPrice: d.data().offerPrice,
            stock: d.data().stockStatus || 'In Stock'
        }));

        const prompt = `You are an expert sales assistant for "${brandData.name}". 
        Tone: ${blueprint.tone || 'Helpful'}, Emojis: ${blueprint.emojis || '✨'}
        Context: ${JSON.stringify(blueprint)}
        
        Our Catalog: ${JSON.stringify(products)}
        
        TASK:
        1. Answer the user's query based on our catalog and brand context.
        2. If they ask for something not in the catalog, politely guide them to available options.
        3. Use a conversational, persuasive tone to drive sales.
        
        User Query: "${text}"`;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        await sendAndLog(sender_psid, responseText, 'bot', brandData);
    } catch (e) {
        serverLog(`AI Error [${brandData.name}]: ${e.message}`);
    }
}

async function handleVisionResponse(psid, imageUrl, text, brandData) {
    try {
        const apiKey = brandData.googleAIKey || process.env.GEMINI_API_KEY;
        const blueprint = brandData.blueprint || {};
        const model = await getDynamicVisionModel(apiKey);

        // Fetch products to give context to Gemini for visual matching
        const prodSnap = await getDocs(query(collection(db, 'products'), where('brandId', '==', brandData.id)));
        const products = prodSnap.docs.map(d => ({ 
            name: d.data().name, 
            price: d.data().price, 
            offerPrice: d.data().offerPrice,
            category: d.data().category 
        }));

        // Download image as buffer
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imagePart = {
            inlineData: {
                data: Buffer.from(response.data).toString('base64'),
                mimeType: 'image/jpeg'
            }
        };

        const prompt = `You are a visual sales assistant for "${brandData.name}". 
        The customer sent an image (screenshot/photo). 
        Tone: ${blueprint.tone || 'Helpful'}, Emojis: ${blueprint.emojis || '✨'}
        
        Our Catalog: ${JSON.stringify(products)}
        
        TASK:
        1. Look at the image and check if it shows any of our products.
        2. If it matches, tell the user you identified it and provide its details (price/stock).
        3. If it looks like a frame from a video or a partial screenshot, use your "A I" intelligence to match it with our descriptions.
        4. If it's NOT our product, politely say so.
        
        User Message (if any): "${text}"`;

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();

        await sendAndLog(psid, responseText, 'bot', brandData);
    } catch (e) {
        serverLog(`Vision AI Error [${brandData.name}]: ${e.message}`);
    }
}
async function sendAndLog(psid, text, type, brandData) {
    await sendMessage(psid, { text }, brandData.fbPageToken);
    await addDoc(collection(db, 'logs'), { 
        sender_psid: psid, 
        text, 
        type, 
        brandId: brandData.id,
        timestamp: Date.now() 
    });
}

async function logUserMessage(psid, message, brandData, platformType = 'facebook') {
    const profile = await getProfile(psid, brandData.fbPageToken);
    const { setDoc } = require('firebase/firestore');
    const convoRef = doc(db, 'conversations', psid);
    
    await setDoc(convoRef, {
        id: psid,
        brandId: brandData.id,
        platform: platformType,
        name: `${profile.first_name} ${profile.last_name}`,
        profilePic: profile.profile_pic,
        lastMessage: message.text,
        timestamp: serverTimestamp(),
        unread: true
    }, { merge: true });

    await addDoc(collection(db, `conversations/${psid}/messages`), {
        text: message.text,
        type: 'received',
        brandId: brandData.id,
        platform: platformType,
        timestamp: serverTimestamp()
    });
}

function extractLeadInfo(text) {
    const info = { phone: null, address: null };
    if (!text) return info;

    // Bangladeshi Phone Number Regex (01xxx-xxxxxx)
    const phoneRegex = /(01[3-9]\d{8})/g; 
    const phoneMatch = text.match(phoneRegex);
    if (phoneMatch) info.phone = phoneMatch[0];

    // Simple Address Keywords (Basic extraction)
    const addressKeywords = ['dhaka', 'chittagong', 'sylhet', 'khulna', 'rajshahi', 'barisal', 'rangpur', 'mymensingh', 'road', 'house', 'block', 'sector', 'area', 'address', 'thana', 'zilla'];
    const lowerText = text.toLowerCase();
    
    // If text contains a phone number and is long enough, it might contain an address
    if (info.phone && text.length > 20) {
        const hasAddressKeywords = addressKeywords.some(kw => lowerText.includes(kw));
        if (hasAddressKeywords) {
            info.address = text.replace(phoneMatch[0], '').trim();
        }
    }

    return info;
}

async function handleEchoMessage(webhook_event, brandData) {
    const psid = webhook_event.recipient.id;
    const text = webhook_event.message.text;
    serverLog(`[Echo - ${brandData.name}] Admin Reply for ${psid}: ${text}`);
}

async function syncConversationHistory(req, res) {
    let { brandId } = req.body;
    serverLog(`[SYNC] Request for Brand ID: "${brandId}"`);
    
    // Default to owner_dev_brand if not provided or for local dev
    if (!brandId || brandId === 'Azlaan' || brandId === 'owner_dev_brand') {
        brandId = 'owner_dev_brand';
    }

    try {
        const { getDoc } = require('firebase/firestore');
        const brandRef = doc(db, "brands", brandId);
        const brandSnap = await getDoc(brandRef);

        let brandData;
        if (brandSnap.exists()) {
            brandData = { id: brandSnap.id, ...brandSnap.data() };
        } else if (brandId === 'owner_dev_brand' || brandId === 'Azlaan') {
            // Owner Fallback from .env
            brandData = {
                id: 'Azlaan',
                name: 'Azlaan Skincare',
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

        // 1. Fetch Conversations from Graph API
        const convosResp = await axios.get(`https://graph.facebook.com/v12.0/me/conversations?fields=unread_count,updated_time,participants,messages.limit(1){message,from,timestamp}&access_token=${token}`);
        
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

            // 2. Update Conversation Summary in Firestore (use setDoc with merge to create if missing)
            const { setDoc } = require('firebase/firestore');
            const convoRef = doc(db, "conversations", psid);
            await setDoc(convoRef, {
                id: psid,
                brandId: brandData.id,
                platform: 'facebook',
                name: `${profile.first_name || sender.name} ${profile.last_name || ''}`,
                profilePic: profile.profile_pic || '',
                lastMessage: lastMsg,
                timestamp: timestamp,
                unread: convo.unread_count > 0
            }, { merge: true });

            // 3. (Optional) Fetch last few messages for this conversation
            const msgResp = await axios.get(`https://graph.facebook.com/v12.0/${convo.id}/messages?fields=message,from,created_time&limit=20&access_token=${token}`);
            
            for (const msg of msgResp.data.data) {
                const isSent = msg.from.id === brandData.facebookPageId;
                const msgId = msg.id;
                
                // Add to sub-collection
                await addDoc(collection(db, `conversations/${psid}/messages`), {
                    text: msg.message,
                    type: isSent ? 'sent' : 'received',
                    brandId: brandData.id,
                    platform: 'facebook',
                    fb_msg_id: msgId,
                    timestamp: new Date(msg.created_time)
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
    const { psid, text, brandId } = req.body;
    serverLog(`[SEND] Dashboard request for PSID: ${psid}, Brand: ${brandId}`);

    if (!psid || !text || !brandId) {
        return res.status(400).json({ error: "Missing psid, text, or brandId" });
    }

    try {
        const { getDoc } = require('firebase/firestore');
        const brandRef = doc(db, "brands", brandId);
        const brandSnap = await getDoc(brandRef);

        let brandData;
        if (brandSnap.exists()) {
            brandData = { id: brandSnap.id, ...brandSnap.data() };
        } else if (brandId === 'Azlaan' || brandId === 'owner_dev_brand') {
            brandData = {
                id: 'Azlaan',
                fbPageToken: process.env.PAGE_ACCESS_TOKEN || process.env.FB_PAGE_TOKEN,
                facebookPageId: process.env.FACEBOOK_PAGE_ID
            };
        } else {
            return res.status(404).json({ error: "Brand context not found" });
        }

        const token = brandData.fbPageToken;
        if (!token) return res.status(400).json({ error: "FB Token missing" });

        // Send to Facebook
        await sendMessage(psid, { text }, token);

        // --- AUTO-LEARNING LOGIC ---
        try {
            // 1. Fetch recent messages and filter for 'received' in memory to avoid index requirement
            const messagesRef = collection(db, `conversations/${psid}/messages`);
            const recentMsgsQuery = query(
                messagesRef, 
                orderBy('timestamp', 'desc'), 
                limit(10)
            );
            const msgSnap = await getDocs(recentMsgsQuery);
            const lastReceivedMsg = msgSnap.docs
                .map(d => d.data())
                .find(m => m.type === 'received');

            if (lastReceivedMsg) {
                const questionText = lastReceivedMsg.text || (lastReceivedMsg.attachments?.[0]?.type === 'image' ? '[Image Attachment]' : 'Untitled Question');
                const lowerQuestion = questionText.toLowerCase();
                serverLog(`[Auto-Learning] Found last received message: ${questionText}`);

                // 2. Duplicate Check: Is this already in the Knowledge Base?
                const kbQuery = query(
                    collection(db, 'knowledge_base'),
                    where('brandId', '==', brandData.id),
                    where('keywords', 'array-contains', lowerQuestion)
                );
                const kbSnap = await getDocs(kbQuery);
                serverLog(`[Auto-Learning] KB Duplicate Check: ${!kbSnap.empty}`);

                if (kbSnap.empty) {
                    // 3. Grouping Check: Does another draft already use this exact same answer?
                    const draftQuery = query(
                        collection(db, 'draft_replies'),
                        where('brandId', '==', brandId),
                        where('result', '==', text)
                    );
                    const draftSnap = await getDocs(draftQuery);
                    serverLog(`[Auto-Learning] Grouping Check (Answer match): ${!draftSnap.empty}`);

                    if (!draftSnap.empty) {
                        // Update existing draft with this new question variation
                        const draftDoc = draftSnap.docs[0];
                        const existingVariations = draftDoc.data().variations || [];
                        if (!existingVariations.includes(questionText) && draftDoc.data().keyword !== questionText) {
                            await updateDoc(draftDoc.ref, {
                                variations: [...existingVariations, questionText]
                            });
                            serverLog(`[Auto-Learning] Grouped new question under existing reply for brand: ${brandId}`);
                        }
                    } else {
                        // 4. Check if the question itself is already a draft
                        const questionDraftQuery = query(
                            collection(db, 'draft_replies'),
                            where('brandId', '==', brandId),
                            where('keyword', '==', questionText)
                        );
                        const qDraftSnap = await getDocs(questionDraftQuery);

                        if (qDraftSnap.empty) {
                            // Create new draft entry in draft_replies
                            await addDoc(collection(db, 'draft_replies'), {
                                brandId: brandData.id,
                                keyword: questionText,
                                result: text,
                                status: 'new',
                                type: 'auto_learned',
                                timestamp: serverTimestamp(),
                                variations: [],
                                approvedVariations: [],
                                metadata: {
                                    psid: psid,
                                    source: 'dashboard_reply'
                                }
                            });
                            serverLog(`[Auto-Learning] Logged new draft to draft_replies for brand: ${brandId}`);
                        }
                    }
                }
            }
        } catch (autoLearnError) {
            serverLog(`[Auto-Learning Error] FAILURE: ${autoLearnError.message}`);
        }

        // Success log
        await addDoc(collection(db, 'logs'), { 
            psid, 
            text, 
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
        const brandSnap = await getDoc(doc(db, "brands", brandId));
        const brandData = brandSnap.exists() ? brandSnap.data() : { name: "Our Brand" };
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
        const { db, doc, getDoc } = require('../services/firestoreService');
        const { getLatestPosts: fetchPosts } = require('../services/facebookService');

        const brandDoc = await getDoc(doc(db, "brands", brandId));
        if (!brandDoc.exists()) return res.status(404).json({ error: "Brand not found" });
        
        const brandData = brandDoc.data();
        if (!brandData.fbPageToken) return res.status(400).json({ error: "FB Page Token missing" });

        const posts = await fetchPosts(brandData.fbPageToken);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    verifyWebhook,
    handleWebhookPost,
    syncConversationHistory,
    sendMessageFromDashboard,
    generateAICommentVariations,
    getLatestPosts
};
