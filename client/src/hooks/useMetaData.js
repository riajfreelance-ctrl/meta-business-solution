import { useState, useEffect } from 'react';
import { db } from '../firebase-client';
import { collection, onSnapshot } from 'firebase/firestore';

export const useMetaData = () => {
  const [gaps, setGaps] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [library, setLibrary] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    return onSnapshot(collection(db, "knowledge_gaps"), (snapshot) => {
      setGaps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  useEffect(() => {
    return onSnapshot(collection(db, "draft_replies"), (snapshot) => {
      setDrafts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  useEffect(() => {
    return onSnapshot(collection(db, "knowledge_base"), (snapshot) => {
      setLibrary(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  useEffect(() => {
    return onSnapshot(collection(db, "products"), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  return { gaps, drafts, library, products };
};
