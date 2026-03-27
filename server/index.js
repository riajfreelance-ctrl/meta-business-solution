const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

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
app.get('/api/status', (req, res) => res.json({ status: 'API Alive', version: '2.0.0-final' }));
app.get('/webhook', fbController.verifyWebhook); 
app.post('/webhook', fbController.handleWebhookPost);
app.get('/api/webhook', fbController.verifyWebhook); // Safety for both paths
app.post('/api/webhook', fbController.handleWebhookPost); // Safety for both paths

app.use('/api', fbRoutes);
app.use('/api', waRoutes);
app.use('/api', aiRoutes);
app.use('/api', productRoutes);
app.use('/api', adRoutes);
app.use('/api', crmRoutes);
app.get('/api/search', searchController.unifiedSearch);
app.get('/api/retention/stats', checkRole(['admin']), retentionController.getStats);
app.post('/api/retention/trigger', checkRole(['admin']), retentionController.triggerAutomation);
app.get('/api/analytics/bi', checkRole(['admin', 'ads']), analyticsController.getBIStats);
app.get('/api/analytics/persona-metrics', checkRole(['admin', 'ads']), async (req, res) => {
    const { brandId } = req.query;
    // For now, return mock data or aggregate from persona_metrics collection
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
