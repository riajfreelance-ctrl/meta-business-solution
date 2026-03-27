const { db } = require('./firestoreService');

/**
 * Write a structured audit log entry.
 * @param {string} action - e.g. 'MESSAGE_SENT', 'DRAFT_APPROVED', 'BRAND_UPDATED'
 * @param {object} details - Any relevant details
 * @param {string} [userId] - ID of the admin or system actor
 */
async function logAudit(action, details = {}, userId = 'system') {
  try {
    await db.collection('audit_logs').add({
      action,
      details,
      userId,
      timestamp: new Date().toISOString(),
      ts: Date.now()
    });
  } catch (e) {
    // Never throw — audit logs must not break flows
    console.error('[AUDIT LOG ERROR]', e.message);
  }
}

module.exports = { logAudit };
