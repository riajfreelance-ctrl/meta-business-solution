import { useState, useEffect } from 'react';
import { db } from '../firebase-client';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useBrand } from '../context/BrandContext';

export const useMetaData = () => {
  const { activeBrandId, user } = useBrand();
  const [gaps, setGaps] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [library, setLibrary] = useState([]);
  const [products, setProducts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [commentDrafts, setCommentDrafts] = useState([]);
  const [pendingComments, setPendingComments] = useState([]);
  const [orders, setOrders] = useState([]);

  // --- ADMIN PROXY FETCH ---
  useEffect(() => {
    if (!activeBrandId || user?.email !== 'riajfreelance@gmail.com') return;
    
    const fetchAdminData = async () => {
        console.log('useMetaData: Fetching brand metadata via Admin Proxy for:', activeBrandId);
        try {
            const res = await fetch(`/api/admin/metadata?brandId=${activeBrandId}`);
            const data = await res.json();
            if (data.success) {
                console.log('useMetaData: Proxy data received successfully');
                if (data.drafts) setDrafts(data.drafts);
                if (data.library) setLibrary(data.library);
                // strategies etc can also be mapped here
            }
        } catch (e) {
            console.error('useMetaData: Admin Proxy metadata fetch failure', e);
        }
    };
    fetchAdminData();
  }, [activeBrandId, user]);

  useEffect(() => {
    if (!activeBrandId || user?.email === 'riajfreelance@gmail.com') {
      console.log('useMetaData: Skipping direct Firestore gaps fetch for admin or missing ID');
      return;
    }
    console.log('useMetaData: Fetching knowledge_gaps for brandId:', activeBrandId);
    const q = query(collection(db, "knowledge_gaps"), where("brandId", "==", activeBrandId));
    return onSnapshot(q, (snapshot) => {
      console.log('useMetaData: Found', snapshot.docs.length, 'knowledge_gaps');
      setGaps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error('useMetaData: Error fetching knowledge_gaps:', error);
    });
  }, [activeBrandId, user]);

  useEffect(() => {
    if (!activeBrandId || user?.email === 'riajfreelance@gmail.com') {
      console.log('useMetaData: Skipping direct Firestore draft_replies fetch for admin or missing ID');
      return;
    }
    console.log('useMetaData: Fetching draft_replies for brandId:', activeBrandId);
    const q = query(collection(db, "draft_replies"), where("brandId", "==", activeBrandId));
    return onSnapshot(q, (snapshot) => {
      console.log('useMetaData: Found', snapshot.docs.length, 'draft_replies');
      setDrafts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error('useMetaData: Error fetching draft_replies:', error);
    });
  }, [activeBrandId, user]);

  useEffect(() => {
    if (!activeBrandId || user?.email === 'riajfreelance@gmail.com') {
      console.log('useMetaData: Skipping direct Firestore knowledge_base fetch for admin or missing ID');
      return;
    }
    console.log('useMetaData: Fetching knowledge_base for brandId:', activeBrandId);
    const q = query(collection(db, "knowledge_base"), where("brandId", "==", activeBrandId));
    return onSnapshot(q, (snapshot) => {
      console.log('useMetaData: Found', snapshot.docs.length, 'knowledge_base entries');
      setLibrary(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error('useMetaData: Error fetching knowledge_base:', error);
    });
  }, [activeBrandId, user]);

  useEffect(() => {
    if (!activeBrandId) {
      console.log('useMetaData: No activeBrandId, skipping products fetch');
      return;
    }
    console.log('useMetaData: Fetching products for brandId:', activeBrandId);
    const q = query(collection(db, "products"), where("brandId", "==", activeBrandId));
    return onSnapshot(q, (snapshot) => {
      console.log('useMetaData: Found', snapshot.docs.length, 'products');
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error('useMetaData: Error fetching products:', error);
    });
  }, [activeBrandId]);

  useEffect(() => {
    if (!activeBrandId) {
      console.log('useMetaData: No activeBrandId, skipping conversations fetch');
      return;
    }
    console.log('useMetaData: Fetching conversations for brandId:', activeBrandId);
    const q = query(collection(db, "conversations"), where("brandId", "==", activeBrandId));
    return onSnapshot(q, (snapshot) => {
      console.log('useMetaData: Found', snapshot.docs.length, 'conversations');
      setConversations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error('useMetaData: Error fetching conversations:', error);
    });
  }, [activeBrandId]);

  useEffect(() => {
    if (!activeBrandId) {
      console.log('useMetaData: No activeBrandId, skipping orders fetch');
      return;
    }
    console.log('useMetaData: Fetching orders for brandId:', activeBrandId);
    const q = query(collection(db, "orders"), where("brandId", "==", activeBrandId));
    return onSnapshot(q, (snapshot) => {
      console.log('useMetaData: Found', snapshot.docs.length, 'orders');
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error('useMetaData: Error fetching orders:', error);
    });
  }, [activeBrandId]);
  
  useEffect(() => {
    if (!activeBrandId) {
      console.log('useMetaData: No activeBrandId, skipping comment_drafts fetch');
      return;
    }
    console.log('useMetaData: Fetching comment_drafts for brandId:', activeBrandId);
    const q = query(collection(db, "comment_drafts"), where("brandId", "==", activeBrandId));
    return onSnapshot(q, (snapshot) => {
      console.log('useMetaData: Found', snapshot.docs.length, 'comment_drafts');
      setCommentDrafts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error('useMetaData: Error fetching comment_drafts:', error);
    });
  }, [activeBrandId]);

  useEffect(() => {
    if (!activeBrandId) {
      console.log('useMetaData: No activeBrandId, skipping pending_comments fetch');
      return;
    }
    console.log('useMetaData: Fetching pending_comments for brandId:', activeBrandId);
    const q = query(collection(db, "pending_comments"), where("brandId", "==", activeBrandId));
    return onSnapshot(q, (snapshot) => {
      console.log('useMetaData: Found', snapshot.docs.length, 'pending_comments');
      setPendingComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error('useMetaData: Error fetching pending_comments:', error);
    });
  }, [activeBrandId]);

  return { gaps, drafts, library, products, conversations, commentDrafts, pendingComments, orders };
};
