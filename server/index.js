const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Global sanitization removed to prevent Firebase Service Account JSON corruption.

const { serverLog } = require('./utils/logger');

// Routes
const fbRoutes = require('./routes/facebook');
const waRoutes = require('./routes/whatsapp');
const aiRoutes = require('./routes/ai');
const productRoutes = require('./routes/products');
const adRoutes = require('./routes/ads');
const crmRoutes = require('./routes/crm');
const fbController = require('./controllers/fbController');
const searchController = require('./controllers/searchController');
const crmController = require('./controllers/crmController');
const retentionController = require('./controllers/retentionController');
const analyticsController = require('./controllers/analyticsController');
const settingsController = require('./controllers/settingsController');
const seedDataCenterRoutes = require('./routes/seedDataCenter');
const { checkRole } = require('./middleware/authMiddleware');

const app = express()
    .use(cors({ origin: '*' }))
    .use(bodyParser.json({
      verify: (req, res, buf) => {
        req.rawBody = buf;
      }
    }))
    .use((req, res, next) => {
      serverLog(`[INCOMING] ${req.method} ${req.url}`);
      next();
    });

// Main Endpoints (Explicit /api prefix for Vercel)
app.get('/api/status', (req, res) => res.json({ status: 'API Alive', version: '2.1.0-stable' }));
app.get('/webhook', fbController.verifyWebhook); 
app.post('/webhook', fbController.handleWebhookPost);
app.get('/api/webhook', fbController.verifyWebhook);
app.post('/api/webhook', fbController.handleWebhookPost);

app.get('/api/ping', async (req, res) => {
    return res.json({ status: 'pong', time: Date.now() });
});

// ─────────────────────────────────────────────────────────────────────
// 🩺 HEALTH CHECK ENDPOINTS — Token & Webhook Status Monitor
// ─────────────────────────────────────────────────────────────────────
app.get('/api/health/token', async (req, res) => {
    const axios = require('axios');
    const { db } = require('./services/firestoreService');
    const results = [];
    try {
        // Check all brands in Firestore
        const brandsSnap = await db.collection('brands').get();
        for (const doc of brandsSnap.docs) {
            const brand = { id: doc.id, ...doc.data() };
            if (!brand.fbPageToken) {
                results.push({ brand: brand.name || doc.id, status: 'NO_TOKEN', valid: false });
                continue;
            }
            try {
                const resp = await axios.get(
                    `https://graph.facebook.com/v21.0/me?access_token=${brand.fbPageToken}`,
                    { timeout: 5000 }
                );
                results.push({ brand: brand.name || doc.id, status: 'OK', pageId: resp.data.id, pageName: resp.data.name, valid: true });
            } catch (e) {
                const errMsg = e.response?.data?.error?.message || e.message;
                const errCode = e.response?.data?.error?.code;
                results.push({ brand: brand.name || doc.id, status: 'INVALID', error: errMsg, code: errCode, valid: false });
            }
        }
        // Also check .env token
        const envToken = process.env.PAGE_ACCESS_TOKEN;
        if (envToken) {
            try {
                const resp = await axios.get(`https://graph.facebook.com/v21.0/me?access_token=${envToken}`, { timeout: 5000 });
                results.push({ brand: 'ENV_TOKEN', status: 'OK', pageId: resp.data.id, pageName: resp.data.name, valid: true });
            } catch(e) {
                results.push({ brand: 'ENV_TOKEN', status: 'INVALID', error: e.response?.data?.error?.message || e.message, valid: false });
            }
        }
        const allValid = results.every(r => r.valid);
        res.json({ success: true, allValid, tokens: results });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/health/webhook', async (req, res) => {
    const axios = require('axios');
    const { db } = require('./services/firestoreService');
    const results = [];
    try {
        const brandsSnap = await db.collection('brands').get();
        for (const doc of brandsSnap.docs) {
            const brand = { id: doc.id, ...doc.data() };
            if (!brand.fbPageToken || !brand.facebookPageId) continue;
            try {
                const resp = await axios.get(
                    `https://graph.facebook.com/v21.0/${brand.facebookPageId}/subscribed_apps?access_token=${brand.fbPageToken}`,
                    { timeout: 5000 }
                );
                const subs = resp.data?.data || [];
                const fields = subs[0]?.subscribed_fields || [];
                results.push({
                    brand: brand.name || doc.id,
                    hasSubscription: subs.length > 0,
                    feedSubscribed: fields.includes('feed'),
                    messagesSubscribed: fields.includes('messages'),
                    fields: fields
                });
            } catch (e) {
                results.push({ brand: brand.name || doc.id, error: e.response?.data?.error?.message || e.message });
            }
        }
        res.json({ success: true, webhooks: results });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/health/automation', async (req, res) => {
    const { db } = require('./services/firestoreService');
    try {
        const { brandId } = req.query;
        const query = brandId 
            ? db.collection('brands').doc(brandId)
            : db.collection('brands').limit(1);

        const snap = brandId ? await query.get() : await query.get();
        const docs = brandId ? [snap] : snap.docs;

        const report = [];
        for (const doc of docs) {
            const data = doc.exists !== false ? (doc.data ? doc.data() : doc) : null;
            if (!data) continue;
            const commentSettings = data.commentSettings || {};
            const inboxSettings = data.inboxSettings || {};
            const aiSettings = data.aiSettings || {};

            const [draftsSnap, kbSnap, commentDraftsSnap] = await Promise.all([
                db.collection('draft_replies').where('brandId', '==', doc.id).limit(1).get(),
                db.collection('knowledge_base').where('brandId', '==', doc.id).limit(1).get(),
                db.collection('comment_drafts').where('brandId', '==', doc.id).limit(1).get()
            ]);

            report.push({
                brand: data.name || doc.id,
                brandId: doc.id,
                tokenPresent: !!data.fbPageToken,
                commentAutoReply: commentSettings.systemAutoReply !== false,
                commentAI: commentSettings.aiReply !== false,
                commentAutoLike: commentSettings.autoLike || false,
                inboxAutoReply: inboxSettings.systemAutoReply !== false,
                inboxAI: aiSettings.inboxAiEnabled !== false,
                hasDraftReplies: !draftsSnap.empty,
                hasKnowledgeBase: !kbSnap.empty,
                hasCommentDrafts: !commentDraftsSnap.empty,
                isLearningMode: data.isLearningMode || false,
                autoHyperIndex: data.autoHyperIndex !== false
            });
        }
        res.json({ success: true, report });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────
// 🔐 ADMIN RECOVERY PROXY — Bypasses Client-Side Permissions for Owner
// ─────────────────────────────────────────────────────────────────────
app.get('/api/admin/brands', async (req, res) => {
    const { email } = req.query;
    if (email !== 'riajfreelance@gmail.com') return res.status(403).json({ error: 'Access Denied' });
    try {
        const { db } = require('./services/firestoreService');
        const snap = await db.collection('brands').where('ownerEmail', '==', email).get();
        const brands = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json({ success: true, brands });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/admin/metadata', async (req, res) => {
    const { brandId } = req.query;
    if (!brandId) return res.status(400).json({ error: 'Missing brandId' });
    try {
        const { db } = require('./services/firestoreService');
        const [draftsSnap, kbSnap, strategiesSnap] = await Promise.all([
            db.collection('draft_replies').where('brandId', '==', brandId).get(),
            db.collection('knowledge_base').where('brandId', '==', brandId).get(),
            db.collection('comment_strategies').where('brandId', '==', brandId).get()
        ]);

        res.json({
            success: true,
            drafts: draftsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
            library: kbSnap.docs.map(d => ({ id: d.id, ...d.data() })),
            strategies: strategiesSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ─────────────────────────────────────────────────────────────────────

app.use('/api', fbRoutes);
app.use('/api', waRoutes);
app.use('/api', aiRoutes);
app.use('/api', productRoutes);
app.use('/api', adRoutes);
app.use('/api', crmRoutes);
app.use('/api', seedDataCenterRoutes);
app.get('/api/search', searchController.unifiedSearch);
app.get('/api/retention/stats', checkRole(['admin']), retentionController.getStats);
app.post('/api/retention/trigger', checkRole(['admin']), retentionController.triggerAutomation);
app.get('/api/analytics/bi', checkRole(['admin', 'ads']), analyticsController.getBIStats);
app.get('/api/analytics/persona-metrics', checkRole(['admin', 'ads']), async (req, res) => {
    const { brandId } = req.query;
    res.json({ success: true, metrics: [] });
});
app.get('/api/settings/automation', checkRole(['admin']), settingsController.getSettings);
app.post('/api/settings/automation', checkRole(['admin']), settingsController.updateSetting);
app.post('/api/settings/automation/disable-all', checkRole(['admin']), settingsController.disableAll);
app.get('/', (req, res) => res.send('Meta Business Solution Modular API Alive'));

// Export for Vercel
module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Modular Server Running on Port ${PORT}`));
}

module.exports = app;
