const { db } = require('./firestoreService');

/**
 * Get global automation settings
 */
async function getAutomationSettings() {
    try {
        const doc = await db.collection('settings').doc('automation').get();
        if (!doc.exists) {
            // Default settings
            return {
                enableRetargeting: true,
                enableChurnPrevention: true,
                enableInventorySync: true,
                enableSplitTesting: true,
                enableAutopilot: true
            };
        }
        return doc.data();
    } catch (error) {
        console.error('Error fetching settings:', error);
        return {};
    }
}

/**
 * Update a specific automation toggle
 */
async function updateAutomationSetting(key, value) {
    try {
        await db.collection('settings').doc('automation').set({ [key]: value }, { merge: true });
        return { success: true };
    } catch (error) {
        console.error('Error updating setting:', error);
        throw error;
    }
}

/**
 * Helper to check if a feature is enabled
 */
async function isFeatureEnabled(featureKey) {
    const settings = await getAutomationSettings();
    return settings[featureKey] === true;
}

/**
 * Emergency Kill Switch: Disable all automations at once
 */
async function disableAllAutomations() {
    try {
        const allOff = {
            enableRetargeting: false,
            enableChurnPrevention: false,
            enableInventorySync: false,
            enableSplitTesting: false,
            enableAutopilot: false
        };
        await db.collection('settings').doc('automation').set(allOff, { merge: true });
        console.log('🛑 EMERGENCY KILL SWITCH: All automations disabled.');
        return { success: true };
    } catch (error) {
        console.error('Error in kill switch:', error);
        throw error;
    }
}

module.exports = {
    getAutomationSettings,
    updateAutomationSetting,
    isFeatureEnabled,
    disableAllAutomations
};
