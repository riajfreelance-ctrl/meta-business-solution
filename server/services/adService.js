const axios = require('axios');
const crypto = require('crypto');
const { serverLog } = require('../utils/logger');

const GRAPH_API_VERSION = 'v19.0';
const BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/**
 * Get available Ad Accounts for the given token.
 * @param {string} accessToken 
 */
async function getAdAccounts(accessToken) {
    try {
        const response = await axios.get(`${BASE_URL}/me/adaccounts`, {
            params: { 
                access_token: accessToken, 
                fields: 'name,account_id,id,currency,timezone_name' 
            }
        });
        return response.data.data;
    } catch (error) {
        serverLog(`[ADS ERROR] getAdAccounts: ${error.message}`);
        throw error;
    }
}

/**
 * Create or Update a Custom Audience and add users.
 * @param {string} adAccountId - Format: 'act_123456'
 * @param {string} name 
 * @param {string[]} hashedEmails - User emails hashed with SHA256
 * @param {string} accessToken 
 */
async function syncCustomAudience(adAccountId, name, hashedEmails, accessToken) {
    try {
        // 1. Create the Custom Audience
        const createRes = await axios.post(`${BASE_URL}/${adAccountId}/customaudiences`, {
            name: name,
            subtype: 'CUSTOM',
            description: 'Synced from Meta Business Solution CRM',
            customer_file_source: 'USER_PROVIDED_ONLY',
            access_token: accessToken
        });

        const audienceId = createRes.data.id;

        // 2. Add users to the audience
        if (hashedEmails.length > 0) {
            await axios.post(`${BASE_URL}/${audienceId}/users`, {
                payload: {
                    schema: ['EMAIL'],
                    data: hashedEmails
                },
                access_token: accessToken
            });
        }

        return audienceId;
    } catch (error) {
        serverLog(`[ADS ERROR] syncCustomAudience: ${error.message}`);
        throw error;
    }
}

/**
 * Send Server-Side Conversion Event (CAPI).
 * @param {string} pixelId 
 * @param {string} eventName - e.g., 'Purchase', 'Lead'
 * @param {object} userData 
 * @param {string} accessToken 
 */
async function sendConversionEvent(pixelId, eventName, userData, accessToken) {
    try {
        const event = {
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            user_data: {
                em: [crypto.createHash('sha256').update(userData.email || '').digest('hex')],
                ph: [crypto.createHash('sha256').update(userData.phone || '').digest('hex')],
                client_ip_address: userData.ip,
                client_user_agent: userData.userAgent
            },
            custom_data: userData.customData || {},
            action_source: 'chat'
        };

        await axios.post(`${BASE_URL}/${pixelId}/events`, {
            data: [event],
            access_token: accessToken
        });

        return true;
    } catch (error) {
        serverLog(`[CAPI ERROR]: ${error.message}`);
        return false;
    }
}

module.exports = {
    getAdAccounts,
    syncCustomAudience,
    sendConversionEvent
};
