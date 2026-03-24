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

// Main Endpoints (Explicit /api prefix for Vercel)
app.get('/api/status', (req, res) => res.json({ status: 'API Alive', version: '2.0.0-final' }));
app.get('/webhook', fbController.verifyWebhook); 
app.post('/webhook', fbController.handleWebhookPost);
app.get('/api/webhook', fbController.verifyWebhook); // Safety for both paths
app.post('/api/webhook', fbController.handleWebhookPost); // Safety for both paths

app.use('/api', fbRoutes);
app.use('/api', waRoutes);
app.use('/api', aiRoutes);
app.get('/', (req, res) => res.send('Meta Business Solution Modular API Alive'));

// Export for Vercel
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Modular Server Running on Port ${PORT}`));
}
