const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { initializeApp: initializeFirebase } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc, arrayUnion, limit, orderBy } = require('firebase/firestore');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express().use(cors({ origin: '*' })).use(bodyParser.json());

// --- DEBUG LOGGING ---
function serverLog(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  // Disabled fs.appendFileSync for Vercel (read-only filesystem)
}

// --- CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyBfGtLofGKrYIXO8Jw1caphsuN014HHiLA",
  authDomain: "advance-automation-8029e.firebaseapp.com",
  projectId: "advance-automation-8029e",
  storageBucket: "advance-automation-8029e.firebasestorage.app",
  messagingSenderId: "240143294821",
  appId: "1:240143294821:web:70b101bf7192f4932d018c"
};

const firebaseApp = initializeFirebase(firebaseConfig);
const db = getFirestore(firebaseApp);
serverLog('Firebase Web SDK Initialized with Full Config');

// Gemini AI Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

// FB Messenger Config
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// --- UTILITIES ---

async function logUserMessage(senderPsid, message) {
  try {
    serverLog(`Logging message to Firestore for PSID: ${senderPsid}`);
    
    // Check if conversation exists
    const convoRef = doc(db, 'conversations', senderPsid);
    const snap = await getDocs(query(collection(db, 'conversations'), where('__name__', '==', senderPsid)));
    
    if (snap.empty) {
      serverLog('Creating NEW conversation');
      // Fetch FB Profile
      let name = "Customer";
      let profilePic = "";
      try {
        const profileResp = await axios.get(`https://graph.facebook.com/${senderPsid}?fields=first_name,last_name,profile_pic&access_token=${PAGE_ACCESS_TOKEN}`);
        name = `${profileResp.data.first_name} ${profileResp.data.last_name}`;
        profilePic = profileResp.data.profile_pic;
        serverLog(`Fetched FB Profile: ${JSON.stringify({name, profilePic})}`);
      } catch (e) { serverLog('FB Profile Error: ' + e.message); }

      // Create main conversation doc
      await updateDoc(doc(db, 'conversations', senderPsid), {
         id: senderPsid,
         name,
         profilePic,
         lastMessage: message.text || "Attached File",
         timestamp: serverTimestamp(),
         unread: true
      }, { merge: true });

      // Add to sub-collection
      await addDoc(collection(db, `conversations/${senderPsid}/messages`), {
        text: message.text,
        type: 'received',
        timestamp: serverTimestamp()
      });
    } else {
      await updateDoc(doc(db, 'conversations', senderPsid), {
        lastMessage: message.text || "Attached File",
        timestamp: serverTimestamp(),
        unread: true
      });
      await addDoc(collection(db, `conversations/${senderPsid}/messages`), {
        text: message.text,
        type: 'received',
        timestamp: serverTimestamp()
      });
    }

    await addDoc(collection(db, 'message_history'), {
      sender_psid: senderPsid,
      text: message.text,
      type: 'received',
      timestamp: serverTimestamp()
    });
    serverLog('Message added to message_history');
    serverLog('Firestore Upsert SUCCESSFUL');
  } catch (error) {
    serverLog(`FIRESTORE ERROR for ${senderPsid}: ${error.message}`);
  }
}

async function saveLog(senderPsid, text, type) {
  try {
    saveLogToFirestore(senderPsid, text, type); // Non-blocking async call (custom wrapper below)
    serverLog(`SUCCESS: Log queued [${type}] for ${senderPsid}`);
  } catch (err) {
    serverLog('Log queuing failed: ' + err.message);
  }
}

async function saveLogToFirestore(senderPsid, text, type) {
  try {
    await addDoc(collection(db, 'logs'), {
      sender_psid: senderPsid,
      text: text,
      type: type,
      timestamp: Date.now()
    });
  } catch (e) { console.error('BG Log Error:', e); }
}

// 1. Webhook Setup
app.get('/webhook', (req, res) => {
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      serverLog('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

app.post('/webhook', (req, res) => {
  let body = req.body;
  if (body.object === 'page') {
    body.entry.forEach((entry) => {
      let webhook_event = entry.messaging[0];
      let sender_psid = webhook_event.sender.id;
      if (webhook_event.message) {
        if (webhook_event.message.is_echo) {
          handleEchoMessage(webhook_event);
        } else {
          logUserMessage(sender_psid, webhook_event.message);
          saveLog(sender_psid, webhook_event.message.text, 'user');
          handleMessage(sender_psid, webhook_event.message);
        }
      }
    });
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

async function handleEchoMessage(webhook_event) {
  let sender_psid = webhook_event.sender.id;
  let recipient_id = webhook_event.recipient.id;
  let admin_reply = webhook_event.message.text;
  
  try {
    const convoRef = doc(db, 'conversations', recipient_id);
    const msgData = { text: admin_reply, type: 'sent', timestamp: serverTimestamp() };
    await updateDoc(convoRef, { lastMessage: admin_reply, unread: false, timestamp: serverTimestamp() });
    await addDoc(collection(db, `conversations/${recipient_id}/messages`), msgData);
    await addDoc(collection(db, 'message_history'), { sender_psid: recipient_id, text: admin_reply, type: 'sent', timestamp: serverTimestamp() });
    saveLog(recipient_id, admin_reply, 'admin');

    // Check Knowledge Gaps for Match
    const q = query(collection(db, 'knowledge_library'), where('question', '==', admin_reply));
    const snap = await getDocs(q);
    const keyword = snap.empty ? null : snap.docs[0].data().question;

    if (keyword) {
      // Phase 22 Logic for Gaps
      const gapsRef = collection(db, 'knowledge_gaps');
      const qGap = query(gapsRef, where('question', '==', keyword), where('status', '==', 'new'));
      const gapSnap = await getDocs(qGap);
      if (!gapSnap.empty) {
        await updateDoc(doc(db, 'knowledge_gaps', gapSnap.docs[0].id), { status: 'answered', answer: admin_reply });
      }
    }
    serverLog(`Admin Reply Sent & Logged for ${recipient_id}`);
  } catch (err) { serverLog('Echo Handle Error: ' + err.message); }
}

async function handleMessage(sender_psid, message) {
  if (!message.text) return;
  const lowerText = message.text.toLowerCase();
  
  // Keyword Check
  const snapshot = await getDocs(query(collection(db, 'knowledge_library'), where('question', '==', lowerText)));
  if (!snapshot.empty) {
    const answer = snapshot.docs[0].data().answer;
    callSendAPI(sender_psid, { "text": answer });
    saveLog(sender_psid, answer, 'bot');
    return;
  }

  // Gemini AI Logic
  handleGeminiAI(sender_psid, message.text);
}

async function handleGeminiAI(sender_psid, text) {
  try {
    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage(text);
    const responseText = result.response.text();
    
    callSendAPI(sender_psid, { "text": responseText });
    saveLog(sender_psid, responseText, 'bot');
  } catch (error) {
    serverLog('GEMINI AI ERROR: ' + error.message);
    callSendAPI(sender_psid, { "text": "I'm processing your request. Please hold on!" });
  }
}

function callSendAPI(sender_psid, response) {
  let request_body = {
    "recipient": { "id": sender_psid },
    "message": response
  };
  axios.post(`https://graph.facebook.com/v12.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, request_body)
    .catch(err => serverLog(`ERROR sending message: ${err.message}`));
}

// AI Variations Engine
app.post('/api/generate_variations', async (req, res) => {
  const { draftId, keyword } = req.body;
  if (!draftId || !keyword) return res.status(400).send('Missing ID or Keyword');

  try {
    serverLog(`Generating variations for: ${keyword}`);
    const prompt = `Generate 30 short, conversational, and semantic variations or synonyms (in both English and Bengali if possible) for the following user intention/keyword: "${keyword}". These variations will be used to train an AI chatbot. Return ONLY a valid JSON array of strings. No extra text, no markdown code blocks.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up potential markdown code blocks
    text = text.replace(/```json|```/g, '').trim();
    
    const variations = JSON.parse(text);
    
    // Update Firestore
    const draftRef = doc(db, 'draft_replies', draftId);
    await updateDoc(draftRef, { variations: variations });
    
    serverLog(`SUCCESS: Generated ${variations.length} variations for ${draftId}`);
    res.json({ success: true, variations });
  } catch (error) {
    serverLog('VARIATION GENERATION ERROR: ' + error.message);
    res.status(500).json({ error: error.message });
  }
});

// AI Discovery Engine (Training Questions)
app.post('/api/discover_gaps', async (req, res) => {
  try {
    serverLog(`Generating Pro-active Discovery Questions...`);
    // Fetch existing Knowledge Base titles to avoid duplicates
    const snapshot = await getDocs(collection(db, 'knowledge_base'));
    const existingKWs = snapshot.docs.map(doc => doc.data().keywords).flat();

    const prompt = `You are a potential customer asking very basic, short questions to a brand on Messenger. 
    Focus ONLY on foundational brand info: location, owner, opening hours, delivery time, or "Who are you?".
    Based on existing data: [${existingKWs.slice(0, 40).join(', ')}],
    Generate 5 VERY SHORT and basic questions. 
    
    IMPORTANT: Provide 3 "Suggested Answers" for each question IN BENGALI (Unicode font).
    Example: "Apnader shop kothay?" -> ["Amader shop Dhanmondi-te", "Ekhono physical shop nei, online-e sell kori", "Amader office Banani-te"]
    Return ONLY a valid JSON array of objects with:
    { "question": string, "category": string, "suggestions": [string, string, string] }`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().replace(/```json|```/g, '').trim();
    
    const newGaps = JSON.parse(text);
    
    // Add to Firestore
    for (const gap of newGaps) {
       await addDoc(collection(db, "knowledge_gaps"), {
         question: gap.question,
         category: gap.category || 'Customer Query',
         suggestions: gap.suggestions || [],
         status: 'new',
         timestamp: serverTimestamp(),
         isDiscovery: true 
       });
    }

    serverLog(`SUCCESS: Generated ${newGaps.length} Discovery Questions`);
    res.json({ success: true, questions: newGaps });
  } catch (error) {
    serverLog('DISCOVERY ERROR: ' + error.message);
    res.status(500).json({ error: error.message });
  }
});


app.get('/', (req, res) => res.send('Server Alive'));

// Export for Vercel Serverless Functions
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(process.env.PORT || 3000, () => serverLog('Server Running on Port 3000'));
}
