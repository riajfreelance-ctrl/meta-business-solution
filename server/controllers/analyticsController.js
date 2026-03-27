const { getBIMetrics } = require('../services/analyticsService');

async function getBIStats(req, res) {
    const { brandId } = req.query;
    
    if (!brandId) {
        return res.status(400).json({ error: 'Brand ID is required' });
    }

    try {
        const metrics = await getBIMetrics(brandId);
        res.json(metrics);
    } catch (error) {
        console.error('Error in getBIStats:', error.message);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getBIStats
};
