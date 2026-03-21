import { useState, useEffect } from 'react';
import { db } from '../firebase-client';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';

export const useMetaChat = (scrollToBottom, isSelectMode, selectedConvoIds, setSelectedConvoIds) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isSyncingHistory, setIsSyncingHistory] = useState(false);

  // Conversations Listener
  useEffect(() => {
    const q = query(collection(db, "conversations"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConversations(data);
    });
  }, []);

  // Messages Listener
  useEffect(() => {
    if (!selectedConvo) {
      setChatMessages([]);
      return;
    }
    const q = query(
      collection(db, `conversations/${selectedConvo.id}/messages`), 
      orderBy("timestamp", "asc")
    );
    return onSnapshot(q, (snapshot) => {
      setChatMessages(snapshot.docs.map(doc => doc.data()));
      if (scrollToBottom) setTimeout(scrollToBottom, 50);
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

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConvo) return;
    const text = messageInput;
    setMessageInput('');
    
    try {
      await addDoc(collection(db, `conversations/${selectedConvo.id}/messages`), {
        text,
        type: 'sent',
        timestamp: serverTimestamp(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      await updateDoc(doc(db, "conversations", selectedConvo.id), {
        lastMessage: text,
        timestamp: serverTimestamp()
      });
    } catch (e) { 
      console.error("Error sending message:", e); 
    }
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
    conversations,
    selectedConvo,
    setSelectedConvo,
    chatMessages,
    messageInput,
    setMessageInput,
    isAiThinking,
    isSyncingHistory,
    handleSelectConvo,
    handleSendMessage,
    syncHistory,
    handleSuggestReply
  };
};
