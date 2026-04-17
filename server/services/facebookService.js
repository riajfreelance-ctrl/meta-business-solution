const axios = require('axios');
const { serverLog } = require('../utils/logger');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

async function getProfile(psid, accessToken) {
    try {
        const token = accessToken || PAGE_ACCESS_TOKEN;
        const resp = await axios.get(`https://graph.facebook.com/v21.0/${psid}?fields=first_name,last_name,profile_pic&access_token=${token}`);
        return resp.data;
    } catch (e) {
        console.error('FB Profile Error:', e.message);
        return { first_name: 'Customer', last_name: '', profile_pic: '' };
    }
}

async function sendMessage(psid, response, accessToken, replyToId = null) {
    const token = accessToken || PAGE_ACCESS_TOKEN;
    const body = {
        recipient: { id: psid },
        message: response
    };
    if (replyToId) {
        body.message.reply_to = { mid: replyToId };
    }
    try {
        await axios.post(`https://graph.facebook.com/v21.0/me/messages?access_token=${token}`, body);
        serverLog(`[API_SUCCESS] Message sent to ${psid}${replyToId ? ' (Replied to ' + replyToId + ')' : ''}`);
    } catch (e) {
        const errMsg = e.response?.data?.error?.message || e.message;
        const errCode = e.response?.data?.error?.code || 'UNKNOWN';
        
        let classification = 'OTHER_ERROR';
        if (errCode === 10 || errCode === 2022 || errCode === 190) classification = 'PERMISSION_ERROR';
        else if (errCode === 613 || errCode === 32 || errCode === 17) classification = 'RATE_LIMIT_ERROR';
        else if (errCode === 'UNKNOWN') classification = 'NETWORK_TIMEOUT';
        
        serverLog(`[API_FAILED] [${classification}] Code ${errCode}: ${errMsg}`);
        
        // Log error to Firestore for dashboard visibility
        const { db } = require('./firestoreService');
        await db.collection('logs').add({
            type: 'send_error',
            classification,
            psid: psid,
            error: errMsg,
            timestamp: Date.now()
        }).catch(() => {});
        
        throw new Error(JSON.stringify({ classification, code: errCode, message: errMsg }));
    }
}

async function replyToComment(commentId, message, accessToken) {
    const token = accessToken || PAGE_ACCESS_TOKEN;
    try {
        serverLog(`[API_ATTEMPT] Replying to comment ${commentId}`);
        await axios.post(`https://graph.facebook.com/v21.0/${commentId}/comments?access_token=${token}`, {
            message: message
        });
        serverLog(`[API_SUCCESS] Replied to comment ${commentId}`);
    } catch (e) {
        const errMsg = e.response?.data?.error?.message || e.message;
        const errCode = e.response?.data?.error?.code || 'UNKNOWN';
        
        let classification = 'OTHER_ERROR';
        if (errCode === 10 || errCode === 2022 || errCode === 200) classification = 'PERMISSION_ERROR';
        else if (errCode === 613 || errCode === 32 || errCode === 17) classification = 'RATE_LIMIT_ERROR';
        else if (errCode === 'UNKNOWN') classification = 'NETWORK_TIMEOUT';
        
        serverLog(`[API_FAILED] [${classification}] Code ${errCode}: ${errMsg}`);
        
        const { db } = require('./firestoreService');
        await db.collection('logs').add({
            type: 'comment_error',
            commentId,
            classification,
            error: errMsg,
            timestamp: Date.now()
        }).catch(() => {});
        
        throw new Error(JSON.stringify({ classification, code: errCode, message: errMsg }));
    }
}

async function sendPrivateReply(commentId, message, accessToken) {
    const token = accessToken || PAGE_ACCESS_TOKEN;
    try {
        serverLog(`[API_ATTEMPT] Sending Private Reply for comment ${commentId}`);
        await axios.post(`https://graph.facebook.com/v21.0/${commentId}/private_replies?access_token=${token}`, {
            message: message
        });
        serverLog(`[API_SUCCESS] Sent private reply to comment ${commentId}`);
    } catch (e) {
        const errMsg = e.response?.data?.error?.message || e.message;
        const errCode = e.response?.data?.error?.code || 'UNKNOWN';
        
        let classification = 'OTHER_ERROR';
        if (errCode === 10 || errCode === 2022 || errCode === 200) classification = 'PERMISSION_ERROR';
        else if (errCode === 613 || errCode === 32 || errCode === 17) classification = 'RATE_LIMIT_ERROR';
        else if (errCode === 'UNKNOWN') classification = 'NETWORK_TIMEOUT';
        
        serverLog(`[API_FAILED] [${classification}] Code ${errCode}: ${errMsg}`);
        throw new Error(JSON.stringify({ classification, code: errCode, message: errMsg }));
    }
}

async function getPostContent(postId, accessToken) {
    const token = accessToken || PAGE_ACCESS_TOKEN;
    try {
        const resp = await axios.get(`https://graph.facebook.com/v21.0/${postId}?fields=id,message,created_time,full_picture,permalink_url&access_token=${token}`);
        return resp.data;
    } catch (e) {
        serverLog(`Get post error: ${e.response?.data?.error?.message || e.message}`);
        return null;
    }
}

async function likeComment(commentId, accessToken) {
    const token = accessToken || PAGE_ACCESS_TOKEN;
    try {
        await axios.post(`https://graph.facebook.com/v21.0/${commentId}/likes?access_token=${token}`);
        serverLog(`Liked comment ${commentId}`);
    } catch (e) {
        serverLog(`Like error: ${e.response?.data?.error?.message || e.message}`);
    }
}

async function hideComment(commentId, accessToken) {
    const token = accessToken || PAGE_ACCESS_TOKEN;
    try {
        await axios.post(`https://graph.facebook.com/v21.0/${commentId}?access_token=${token}`, {
            is_hidden: true
        });
        serverLog(`Hid comment ${commentId}`);
    } catch (e) {
        serverLog(`Hide error: ${e.response?.data?.error?.message || e.message}`);
    }
}

async function getLatestPosts(pageToken, limit = 100) {
    try {
        const response = await axios.get(`https://graph.facebook.com/v21.0/me/posts`, {
            params: {
                access_token: pageToken,
                fields: 'id,message,created_time,full_picture,permalink_url',
                limit
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching latest posts:', error.response?.data || error.message);
        throw error;
    }
}

async function sendButtonTemplate(psid, text, button, accessToken) {
    const token = accessToken || PAGE_ACCESS_TOKEN;
    try {
        await axios.post(`https://graph.facebook.com/v21.0/me/messages?access_token=${token}`, {
            recipient: { id: psid },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: text,
                        buttons: [
                            {
                                type: "web_url",
                                url: button.url,
                                title: button.text
                            }
                        ]
                    }
                }
            }
        });
        serverLog(`Sent button template to ${psid}`);
    } catch (e) {
        serverLog(`Button template error: ${e.response?.data?.error?.message || e.message}`);
    }
}

async function markRead(psid, accessToken) {
    const token = accessToken || PAGE_ACCESS_TOKEN;
    const body = {
        recipient: { id: psid },
        sender_action: "MARK_SEEN"
    };
    try {
        await axios.post(`https://graph.facebook.com/v21.0/me/messages?access_token=${token}`, body);
    } catch (e) {
        const errMsg = e.response?.data?.error?.message || e.message;
        serverLog(`[MARK_READ_FAILED] ${errMsg}`);
        throw new Error(errMsg);
    }
}

async function validatePageToken(token) {
    try {
        const resp = await axios.get(`https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${token}`);
        return { valid: true, ...resp.data };
    } catch (e) {
        const errMsg = e.response?.data?.error?.message || e.message;
        const errCode = e.response?.data?.error?.code;
        return { valid: false, error: errMsg, code: errCode };
    }
}

// --- PHASE 3: THE VOICE (Advanced FB Delivery) ---

async function sendCarouselMessage(psid, elements, accessToken) {
    const token = accessToken || PAGE_ACCESS_TOKEN;
    const body = {
        recipient: { id: psid },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: elements
                }
            }
        }
    };
    try {
        await axios.post(`https://graph.facebook.com/v21.0/me/messages?access_token=${token}`, body);
        serverLog(`[Phase 3] Sent carousel to ${psid}`);
    } catch (e) {
        serverLog(`[Phase 3] Carousel error: ${e.response?.data?.error?.message || e.message}`);
    }
}

async function sendMediaMessage(psid, mediaUrl, mediaType = 'image', accessToken) {
    const token = accessToken || PAGE_ACCESS_TOKEN;
    const body = {
        recipient: { id: psid },
        message: {
            attachment: {
                type: mediaType,
                payload: {
                    url: mediaUrl,
                    is_reusable: true
                }
            }
        }
    };
    try {
        await axios.post(`https://graph.facebook.com/v21.0/me/messages?access_token=${token}`, body);
        serverLog(`[Phase 3] Sent ${mediaType} to ${psid}`);
    } catch (e) {
        serverLog(`[Phase 3] Media send error: ${e.response?.data?.error?.message || e.message}`);
    }
}

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function sendSequencedMedia(psid, mediaUrls, accessToken) {
    if (!mediaUrls || !mediaUrls.length) return;
    
    serverLog(`[Phase 3] Sending ${mediaUrls.length} media items in sequence to ${psid}`);
    for (const url of mediaUrls) {
        await sendMediaMessage(psid, url, 'image', accessToken);
        // Wait 1.5s between sends to respect FB rate limits and order
        await sleep(1500);
    }
}
// -------------------------------------------------

module.exports = {
    getProfile,
    sendMessage,
    replyToComment,
    sendPrivateReply,
    getPostContent,
    likeComment,
    hideComment,
    getLatestPosts,
    sendButtonTemplate,
    markRead,
    sendCarouselMessage,
    sendMediaMessage,
    sendSequencedMedia,
    validatePageToken
};
