import { useState, useEffect } from 'react';
import { db } from '../firebase-client';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useBrand } from '../context/BrandContext';

export const useMetaData = () => {
  const { activeBrandId } = useBrand();
  const [gaps, setGaps] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [library, setLibrary] = useState([]);
  const [products, setProducts] = useState([]);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!activeBrandId) return;
    const q = query(collection(db, "knowledge_gaps"), where("brandId", "==", activeBrandId));
    return onSnapshot(q, (snapshot) => {
      setGaps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [activeBrandId]);

  useEffect(() => {
    if (!activeBrandId) return;
    const q = query(collection(db, "draft_replies"), where("brandId", "==", activeBrandId));
    return onSnapshot(q, (snapshot) => {
      setDrafts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [activeBrandId]);

  useEffect(() => {
    if (!activeBrandId) return;
    const q = query(collection(db, "knowledge_base"), where("brandId", "==", activeBrandId));
    return onSnapshot(q, (snapshot) => {
      setLibrary(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [activeBrandId]);

  useEffect(() => {
    if (!activeBrandId) return;
    const q = query(collection(db, "products"), where("brandId", "==", activeBrandId));
    return onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [activeBrandId]);

  useEffect(() => {
    if (!activeBrandId) return;
    const q = query(collection(db, "conversations"), where("brandId", "==", activeBrandId));
    return onSnapshot(q, (snapshot) => {
      setConversations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [activeBrandId]);

  const [commentDrafts, setCommentDrafts] = useState([]);
  const [pendingComments, setPendingComments] = useState([]);

  useEffect(() => {
    if (!activeBrandId) return;
    const q = query(collection(db, "comment_drafts"), where("brandId", "==", activeBrandId));
    return onSnapshot(q, (snapshot) => {
      setCommentDrafts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [activeBrandId]);

  useEffect(() => {
    if (!activeBrandId) return;
    const q = query(collection(db, "pending_comments"), where("brandId", "==", activeBrandId));
    return onSnapshot(q, (snapshot) => {
      setPendingComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [activeBrandId]);

  return { gaps, drafts, library, products, conversations, commentDrafts, pendingComments };
};
