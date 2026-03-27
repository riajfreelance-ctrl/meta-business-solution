const axios = require('axios');
const { serverLog } = require('../utils/logger');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

async function getProfile(psid, accessToken) {
    try {
        const token = accessToken || PAGE_ACCESS_TOKEN;
        const resp = await axios.get(`https://graph.facebook.com/${psid}?fields=first_name,last_name,profile_pic&access_token=${token}`);
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
        serverLog(`Message sent to ${psid}${replyToId ? ' (Replied to ' + replyToId + ')' : ''}`);
    } catch (e) {
        serverLog(`Send error: ${e.response?.data?.error?.message || e.message}`);
    }
}

async function replyToComment(commentId, message, accessToken) {
    const token = accessToken || PAGE_ACCESS_TOKEN;
    try {
        await axios.post(`https://graph.facebook.com/v12.0/${commentId}/comments?access_token=${token}`, {
            message: message
        });
        serverLog(`Replied to comment ${commentId}`);
    } catch (e) {
        serverLog(`Comment reply error: ${e.response?.data?.error?.message || e.message}`);
    }
}

async function sendPrivateReply(commentId, message, accessToken) {
    const token = accessToken || PAGE_ACCESS_TOKEN;
    try {
        await axios.post(`https://graph.facebook.com/v12.0/${commentId}/private_replies?access_token=${token}`, {
            message: message
        });
        serverLog(`Sent private reply to comment ${commentId}`);
    } catch (e) {
        serverLog(`Private reply error: ${e.response?.data?.error?.message || e.message}`);
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
        await axios.post(`https://graph.facebook.com/v12.0/${commentId}/likes?access_token=${token}`);
        serverLog(`Liked comment ${commentId}`);
    } catch (e) {
        serverLog(`Like error: ${e.response?.data?.error?.message || e.message}`);
    }
}

async function hideComment(commentId, accessToken) {
    const token = accessToken || PAGE_ACCESS_TOKEN;
    try {
        await axios.post(`https://graph.facebook.com/v12.0/${commentId}?access_token=${token}`, {
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
        await axios.post(`https://graph.facebook.com/v12.0/me/messages?access_token=${token}`, {
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
        sender_action: "mark_read"
    };
    try {
        await axios.post(`https://graph.facebook.com/v12.0/me/messages?access_token=${token}`, body);
    } catch (e) {
        serverLog(`Mark read error: ${e.response?.data?.error?.message || e.message}`);
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
        await axios.post(`https://graph.facebook.com/v12.0/me/messages?access_token=${token}`, body);
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
        await axios.post(`https://graph.facebook.com/v12.0/me/messages?access_token=${token}`, body);
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
    sendSequencedMedia
};
