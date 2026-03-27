const { getAutomationSettings, updateAutomationSetting, disableAllAutomations } = require('../services/settingsService');

async function getSettings(req, res) {
    try {
        const settings = await getAutomationSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updateSetting(req, res) {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: 'Missing key' });

    try {
        await updateAutomationSetting(key, value);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function disableAll(req, res) {
    try {
        await disableAllAutomations();
        res.json({ success: true, message: 'All automations disabled.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getSettings,
    updateSetting,
    disableAll
};
