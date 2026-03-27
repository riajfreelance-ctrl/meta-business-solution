const { db } = require('./firestoreService');
const axios = require('axios');

/**
 * Get Ad Spend from Meta Ads API
 */
async function getAdSpend(brandId, timeRange = 'last_30d') {
    const AD_ACCOUNT_ID = process.env.AD_ACCOUNT_ID;
    const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
    
    if (!AD_ACCOUNT_ID || !PAGE_ACCESS_TOKEN) return 0;

    try {
        const response = await axios.get(`https://graph.facebook.com/v21.0/act_${AD_ACCOUNT_ID}/insights`, {
            params: {
                access_token: PAGE_ACCESS_TOKEN,
                date_preset: timeRange,
                fields: 'spend'
            }
        });
        
        const insights = response.data.data;
        return insights.reduce((sum, item) => sum + parseFloat(item.spend), 0);
    } catch (error) {
        console.error('Error fetching ad spend:', error.response?.data || error.message);
        return 0;
    }
}

/**
 * Get Sales Revenue from Firestore
 */
async function getSalesRevenue(brandId) {
    try {
        const querySnapshot = await db.collection('orders')
            .where('brandId', '==', brandId)
            .get();

        let totalRevenue = 0;
        querySnapshot.forEach(doc => {
            totalRevenue += (doc.data().totalAmount || 0);
        });

        return totalRevenue;
    } catch (error) {
        console.error('Error fetching revenue:', error.message);
        return 0;
    }
}

/**
 * Calculate Advanced BI Metrics
 */
async function getBIMetrics(brandId) {
    const spend = await getAdSpend(brandId);
    const revenue = await getSalesRevenue(brandId);
    
    const querySnapshot = await db.collection('conversations')
        .where('isCustomer', '==', true)
        .get();
    
    const customerCount = querySnapshot.size;
    
    const ROAS = spend > 0 ? (revenue / spend).toFixed(2) : 0;
    const CAC = customerCount > 0 ? (spend / customerCount).toFixed(2) : 0;
    const LTV = customerCount > 0 ? (revenue / customerCount).toFixed(2) : 0;

    return {
        revenue,
        spend,
        roas: ROAS,
        cac: CAC,
        ltv: LTV,
        customerCount
    };
}

module.exports = {
    getBIMetrics
};
