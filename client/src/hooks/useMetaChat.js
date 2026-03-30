import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { db } from '../firebase-client';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  addDoc, 
  where
} from 'firebase/firestore';
import { useBrand } from '../context/BrandContext';

export const useMetaChat = (scrollToBottom, isSelectMode, selectedConvoIds, setSelectedConvoIds) => {
  const { activeBrandId } = useBrand();
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isSyncingHistory, setIsSyncingHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const lastConvoIdRef = useRef(null);

  // Conversations Listener — ordered by lastMessageTimestamp (numeric ms) for instant top-of-inbox on new messages
  useEffect(() => {
    if (!activeBrandId) return;
    
    // Query WITHOUT orderBy to avoid composite index requirements
    const q = query(
      collection(db, "conversations"), 
      where("brandId", "==", activeBrandId)
    );

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Client-side sort is totally reliable
      data.sort((a, b) => {
        const getTs = (obj) => {
          const t1 = obj.lastMessageTimestamp ? Number(obj.lastMessageTimestamp) : 0;
          const t2 = obj.timestamp?.seconds ? obj.timestamp.seconds * 1000 : (typeof obj.timestamp === 'number' ? obj.timestamp : 0);
          return Math.max(t1, t2);
        };
        
        return getTs(b) - getTs(a);
      });
      
      setConversations(data);
    }, (err) => {
      console.error('[InboxSort] Error completely fetching conversations:', err.message);
    });
  }, [activeBrandId]);

  // Messages Listener — instant jump on first load, smooth scroll after
  useEffect(() => {
    if (!selectedConvo) {
      setChatMessages([]);
      lastConvoIdRef.current = null;
      return;
    }
    const q = query(
      collection(db, `conversations/${selectedConvo.id}/messages`), 
      orderBy("timestamp", "asc")
    );
    const isNewConvo = lastConvoIdRef.current !== selectedConvo.id;
    lastConvoIdRef.current = selectedConvo.id;
    let isFirstBatch = isNewConvo;

    return onSnapshot(q, (snapshot) => {
      setChatMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      if (scrollToBottom) {
        const behavior = isFirstBatch ? 'auto' : 'smooth';
        setTimeout(() => scrollToBottom(behavior), 50);
        isFirstBatch = false;
      }
    }, (err) => {
      // FIX: Added error callback — previously silent failures caused empty conversations
      console.error('[Messages Listener ERROR]', err.code, err.message);
      // If timestamp index is missing, try without orderBy as fallback
      if (err.code === 'failed-precondition' || err.code === 'unimplemented') {
        console.warn('[Messages Listener] Falling back to unordered query...');
        const fallbackQ = query(collection(db, `conversations/${selectedConvo.id}/messages`));
        onSnapshot(fallbackQ, (snapshot) => {
          const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          // Sort client-side — handles mixed Timestamp / number types
          msgs.sort((a, b) => {
            const getTs = (m) => m.timestamp?.seconds ? m.timestamp.seconds * 1000 : (typeof m.timestamp === 'number' ? m.timestamp : 0);
            return getTs(a) - getTs(b);
          });
          setChatMessages(msgs);
          if (scrollToBottom) setTimeout(() => scrollToBottom('auto'), 50);
        });
      }
    });
  }, [selectedConvo, scrollToBottom]);

  const handleSelectConvo = async (convo) => {
    if (isSelectMode) {
      const newSelected = new Set(selectedConvoIds);
      if (newSelected.has(convo.id)) newSelected.delete(convo.id);
      else newSelected.add(convo.id);
      setSelectedConvoIds(newSelected);
      return;
    }
    setSelectedConvo(convo);
    if (convo.unread) {
      await updateDoc(doc(db, "conversations", convo.id), { unread: false });
    }
  };

  const handleSendMessage = async (attachedFiles = [], setAttachedFiles = () => {}, productCard = null) => {
    if ((!messageInput.trim() && attachedFiles.length === 0 && !productCard) || !selectedConvo || !activeBrandId) return;
    
    setIsSending(true);
    const text = messageInput;
    const filesToSend = [...attachedFiles];
    const tempId = Date.now().toString();

    // Optimistic update
    const localOptimisticMsg = {
      id: tempId,
      text,
      attachments: filesToSend.map(file => ({
        type: 'image',
        payload: { url: URL.createObjectURL(file), isLocal: true }
      })),
      productCard,
      type: 'sent',
      brandId: activeBrandId,
      timestamp: { seconds: Date.now() / 1000 },
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOptimistic: true
    };
    setOptimisticMessages(prev => [...prev, localOptimisticMsg]);
    setMessageInput('');
    setAttachedFiles([]);
    setIsSending(false);

    try {
      let attachments = [];
      for (const file of filesToSend) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('brandId', activeBrandId);
        const uploadResp = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload`, formData);
        if (uploadResp.data.success) {
          attachments.push({ type: 'image', payload: { url: uploadResp.data.url } });
        }
      }

      // FIX: Use numeric timestamp (ms) for ALL message writes to Firestore.
      // Mixing serverTimestamp() objects with Date.now() numbers in the same
      // collection causes Firestore orderBy('timestamp','asc') to silently exclude messages.
      const nowMs = Date.now();
      const timeStr = new Date(nowMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (editingMessage) {
        await updateDoc(doc(db, `conversations/${selectedConvo.id}/messages`, editingMessage.id), {
          text, attachments, isEdited: true, updatedAt: nowMs
        });
      } else {
        const msgData = {
          text, attachments, productCard, type: 'sent', brandId: activeBrandId,
          timestamp: nowMs,
          time: timeStr
        };
        if (replyTo) {
          msgData.replyTo = { id: replyTo.id, text: replyTo.text, type: replyTo.type };
        }
        await addDoc(collection(db, `conversations/${selectedConvo.id}/messages`), msgData);
        await updateDoc(doc(db, "conversations", selectedConvo.id), {
          lastMessage: attachments.length > 0 ? (text ? `${text} (Image)` : 'Sent an image') : (productCard ? `📦 ${productCard.name}` : text),
          brandId: activeBrandId, 
          timestamp: nowMs,
          lastMessageTimestamp: nowMs
        });
      }

      if (!editingMessage) {
        const isWhatsApp = selectedConvo.platform === 'whatsapp';
        const endpoint = isWhatsApp ? `${import.meta.env.VITE_API_URL}/api/whatsapp/send` : `${import.meta.env.VITE_API_URL}/api/messages/send`;
        await axios.post(endpoint, { recipientId: selectedConvo.id, text, attachments, brandId: activeBrandId, replyToId: replyTo?.id });
      }

      setTimeout(() => {
        setOptimisticMessages(prev => prev.filter(m => m.id !== tempId));
      }, 2000);
    } catch (e) { 
      console.error("Send Error:", e); 
      setOptimisticMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setReplyTo(null);
      setEditingMessage(null);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm("এই মেসেজটি মুছতে চান?")) return;
    try {
      await updateDoc(doc(db, `conversations/${selectedConvo.id}/messages`, msgId), {
        isDeleted: true, text: "This message was unsent.", attachments: []
      });
    } catch (e) { console.error("Delete Error:", e); }
  };

  const startEditMessage = (msg) => {
    setEditingMessage(msg);
    setMessageInput(msg.text || '');
  };

  const cancelInteractions = () => {
    setReplyTo(null);
    setEditingMessage(null);
    if (editingMessage) setMessageInput('');
  };

  const syncHistory = async (convoId) => {
    setIsSyncingHistory(true);
    setTimeout(() => setIsSyncingHistory(false), 2000);
  };

  const handleSuggestReply = async () => {
    if (!selectedConvo) return;
    setIsAiThinking(true);
    setTimeout(() => {
      setMessageInput("Assalamu Alaikum! How can I help you today with our skincare products?");
      setIsAiThinking(false);
    }, 1500);
  };

  return {
    conversations, selectedConvo, setSelectedConvo, chatMessages,
    messageInput, setMessageInput, isAiThinking, isSyncingHistory, isSending,
    optimisticMessages, replyTo, setReplyTo, editingMessage,
    startEditMessage, handleDeleteMessage, cancelInteractions,
    handleSelectConvo, handleSendMessage, syncHistory, handleSuggestReply
  };
};
