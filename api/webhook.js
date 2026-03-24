const fbController = require('../server/controllers/fbController');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Direct handlers for Vercel
app.get('/api/webhook', fbController.verifyWebhook);
app.post('/api/webhook', fbController.handleWebhookPost);

// Catch-all for /webhook (if rewrote to this file)
app.all('*', (req, res) => {
  if (req.method === 'GET') return fbController.verifyWebhook(req, res);
  if (req.method === 'POST') return fbController.handleWebhookPost(req, res);
  res.status(405).send('Method Not Allowed');
});

module.exports = app;
