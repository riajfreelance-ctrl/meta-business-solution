const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Routes
const fbRoutes = require('./routes/facebook');
const waRoutes = require('./routes/whatsapp');
const aiRoutes = require('./routes/ai');
const fbController = require('./controllers/fbController');

const app = express()
    .use(cors({ origin: '*' }))
    .use(bodyParser.json())
    .use((req, res, next) => {
      console.log(`[INCOMING] ${req.method} ${req.url}`);
      next();
    });

// Main Endpoints
app.get('/webhook', fbController.verifyWebhook); 
app.post('/webhook', fbController.handleWebhookPost);
app.use('/', fbRoutes);
app.use('/', waRoutes);
app.use('/api', aiRoutes);

// Health Checks
app.get('/api/config-status', (req, res) => {
  res.json({
    gemini: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY),
    facebook: !!(process.env.FACEBOOK_PAGE_ID && (process.env.PAGE_ACCESS_TOKEN || process.env.FB_PAGE_TOKEN)),
    whatsapp: !!(process.env.WHATSAPP_PHONE_ID && (process.env.WA_ACCESS_TOKEN || process.env.WA_PAGE_TOKEN))
  });
});

app.get('/api/status', (req, res) => res.json({ status: 'API Alive', version: '2.0.0-modular' }));
app.get('/', (req, res) => res.send('Meta Business Solution Modular Server Alive'));

// Export for Vercel
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Modular Server Running on Port ${PORT}`));
}
