const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express().use(cors()).use(bodyParser.json());

// Firebase Admin Setup
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Gemini AI Setup
console.log('Using API Key (partial):', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'MISSING');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

// FB Messenger Config
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// 1. Webhook Setup
app.get('/webhook', (req, res) => {
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  console.log('GET /webhook', { mode, token, challenge });

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      console.error('VERIFY_TOKEN_MISMATCH', { expected: VERIFY_TOKEN, received: token });
      res.sendStatus(403);
    }
  }
});

app.post('/webhook', async (req, res) => {
  let body = req.body;
  console.log('POST /webhook received:', JSON.stringify(body, null, 2));

  if (body.object === 'page') {
    body.entry.forEach(async (entry) => {
      // Messenger can send multiple events in one entry
      if (!entry.messaging) return;
      
      let webhook_event = entry.messaging[0];
      let sender_psid = webhook_event.sender.id;

      if (webhook_event.message) {
        const message = webhook_event.message;
        
        // Check if it's an ECHO (message sent by page)
        if (message.is_echo) {
          console.log('Detected ECHO from Page');
          await handleEchoMessage(webhook_event);
        } else {
          // Regular user message
          await logUserMessage(sender_psid, message);
          handleMessage(sender_psid, message);
        }
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Helper: Log user message for context
async function logUserMessage(sender_psid, message) {
  if (!message.text) return;
  await db.collection('message_history').add({
    sender_psid,
    text: message.text,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
}

// Helper: Handle Admin Replied (Echo) to create a draft
async function handleEchoMessage(webhook_event) {
  const echo_message = webhook_event.message;
  if (!echo_message.text) return;

  // Find the last message from this user (the recipient of the echo)
  const recipient_id = webhook_event.recipient.id;
  try {
    const historyRef = db.collection('message_history');
    const snapshot = await historyRef
      .where('sender_psid', '==', recipient_id)
      .limit(10) // Get more and sort in memory if needed
      .get();

    if (!snapshot.empty) {
      // Get the most recent one manually to avoid index requirement
      const lastMsgDoc = snapshot.docs.sort((a,b) => b.data().timestamp - a.data().timestamp)[0];
      const user_last_msg = lastMsgDoc.data().text;
      const admin_reply = echo_message.text;

      // Check if this pair already exists
      const draftRef = db.collection('draft_replies');
      const existing = await draftRef
        .where('keyword', '==', user_last_msg)
        .where('result', '==', admin_reply)
        .get();

      if (existing.empty) {
        await draftRef.add({
          keyword: user_last_msg,
          result: admin_reply,
          variations: [user_last_msg],
          status: 'draft',
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log('Draft created successfully!');
      }
    }
  } catch (error) {
    console.error('Firestore Error in handleEchoMessage:', error);
  }
}

// 2. Handle Message & Logic
async function handleMessage(sender_psid, received_message) {
  if (!received_message.text) return;

  const userMessage = received_message.text;

  // Typing Simulation (On)
  await sendTypingState(sender_psid, 'typing_on');

  // Load Settings
  const settingsDoc = await db.collection('settings').doc('config').get();
  const settings = settingsDoc.data() || { typingDelay: 2000, masterPower: true, aiMode: true };

  if (!settings.masterPower) return;

  // Add delay based on settings
  await new Promise(resolve => setTimeout(resolve, settings.typingDelay));

  // 3. Fallback & Keyword Matching (Library Check)
  const knowledgeRef = db.collection('knowledge_library');
  const snapshot = await knowledgeRef.where('keywords', 'array-contains', userMessage.toLowerCase()).get();

  if (!snapshot.empty) {
    const answer = snapshot.docs[0].data().answer;
    callSendAPI(sender_psid, { "text": answer });
    return;
  }

  // 4. Gemini AI Integration (Shadow Matching)
  if (settings.aiMode) {
    await handleGeminiAI(sender_psid, userMessage);
  }

  // Typing Simulation (Off)
  await sendTypingState(sender_psid, 'typing_off');
}

async function handleGeminiAI(sender_psid, userMessage) {
  // Get Persona & Mission Focus
  const personaDoc = await db.collection('ai_persona').doc('blueprint').get();
  const persona = personaDoc.data() || { tone: "Professional", mission: "Help customers" };

  const prompt = `
    SYSTEM PROMPT:
    TONE: ${persona.tone}
    MISSION FOCUS: ${persona.mission}
    
    If you know the answer from the library, prepend [LINK:ID].
    If you don't know the answer, prepend [GAP: message].
    
    User says: ${userMessage}
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  let text = response.text();

  if (text.startsWith('[LINK:')) {
    // Intercept and send verified text (simplified logic)
    const match = text.match(/\[LINK:(.*?)\]/);
    if (match) {
        // Logic to fetch from library based on ID
        callSendAPI(sender_psid, { "text": text.replace(/\[LINK:.*?\]/, '').trim() });
    }
  } else if (text.startsWith('[GAP:')) {
    // 4. Save to knowledge_gaps
    await db.collection('knowledge_gaps').add({
      question: userMessage,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'new'
    });
    callSendAPI(sender_psid, { "text": "I'm not sure about that, but let me check and get back to you!" });
  } else {
    callSendAPI(sender_psid, { "text": text });
  }
}

// FB Graph API Helpers
async function sendTypingState(sender_psid, state) {
  await axios.post(`https://graph.facebook.com/v12.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
    recipient: { id: sender_psid },
    sender_action: state
  });
}

function callSendAPI(sender_psid, response) {
  axios.post(`https://graph.facebook.com/v12.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
    recipient: { id: sender_psid },
    message: response
  }).catch(err => console.error("Error sending message:", err.response?.data || err.message));
}

// API Endpoint: Expand Keywords using Gemini
app.post('/api/expand-keywords', express.json(), async (req, res) => {
  const { keyword } = req.body;
  if (!keyword) return res.status(400).send({ error: 'Keyword required' });

  try {
    const prompt = `
      Generates exactly 32 variation keywords for a chatbot based on the input: "${keyword}".
      Include:
      1. Bengali (Formal & Informal - at least 8 variations)
      2. Banglish (Bengali written in English letters - at least 8 variations)
      3. Common English variations (at least 6 variations)
      4. Common typos (missed letters, bad spelling - at least 6 variations)
      5. Advance variations (how a person naturally asks in Bangladesh, e.g., "daam", "priice", "koto porbe").
      
      Return ONLY a JSON array of strings, nothing else.
      The output must be a valid JSON array like: ["var1", "var2", ...]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Extract JSON array
    const jsonMatch = text.match(/\[.*\]/s);
    if (jsonMatch) {
      const variations = JSON.parse(jsonMatch[0]);
      res.status(200).json({ variations });
    } else {
      res.status(500).json({ error: 'Failed to generate variations' });
    }
  } catch (error) {
    console.error('Gemini Error:', error);
    res.status(500).json({ error: 'Internal AI Error' });
  }
});

// API Endpoint: Approve Draft & Move to Final List
app.post('/api/approve-draft', async (req, res) => {
  console.log('POST /api/approve-draft', req.body);
  const { draft_id, variations, result } = req.body;
  
  if (!draft_id) return res.status(400).send({ error: 'Draft ID missing' });

  try {
    // 1. Add to main knowledge_library
    console.log('Adding to knowledge_library...');
    await db.collection('knowledge_library').add({
      keywords: (variations || []).map(v => v.toString().toLowerCase()),
      answer: result || 'No answer provided',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // 2. Delete from drafts
    console.log('Deleting from draft_replies...');
    await db.collection('draft_replies').doc(draft_id).delete();

    console.log('Approve Successful!');
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Approve Error:', error);
    res.status(500).json({ error: 'Failed to approve' });
  }
});

// API Endpoint: Get Drafts
app.get('/api/drafts', async (req, res) => {
  const snapshot = await db.collection('draft_replies').orderBy('timestamp', 'desc').get();
  const drafts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.status(200).json(drafts);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
