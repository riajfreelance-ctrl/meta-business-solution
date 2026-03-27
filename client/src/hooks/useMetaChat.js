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
  serverTimestamp,
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

  // Conversations Listener
  useEffect(() => {
    if (!activeBrandId) return;
    const q = query(
      collection(db, "conversations"), 
      where("brandId", "==", activeBrandId),
      orderBy("timestamp", "desc")
    );
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConversations(data);
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

      if (editingMessage) {
        await updateDoc(doc(db, `conversations/${selectedConvo.id}/messages`, editingMessage.id), {
          text, attachments, isEdited: true, updatedAt: serverTimestamp()
        });
      } else {
        const msgData = {
          text, attachments, productCard, type: 'sent', brandId: activeBrandId,
          timestamp: serverTimestamp(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        if (replyTo) {
          msgData.replyTo = { id: replyTo.id, text: replyTo.text, type: replyTo.type };
        }
        await addDoc(collection(db, `conversations/${selectedConvo.id}/messages`), msgData);
        await updateDoc(doc(db, "conversations", selectedConvo.id), {
          lastMessage: attachments.length > 0 ? (text ? `${text} (Image)` : 'Sent an image') : (productCard ? `📦 ${productCard.name}` : text),
          brandId: activeBrandId, timestamp: serverTimestamp()
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
