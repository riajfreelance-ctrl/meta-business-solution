import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase-client';
import { doc, getDoc } from 'firebase/firestore';

const BrandContext = createContext();

export const BrandProvider = ({ children }) => {
  const [activeBrandId, setActiveBrandId] = useState('Azlaan'); 
  const [brandData, setBrandData] = useState(null);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBrands = async () => {
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      const snap = await getDocs(collection(db, "brands"));
      const brandList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBrands(brandList);
      
      // If activeBrandId not in list, pick first one
      if (brandList.length > 0 && !brandList.find(b => b.id === activeBrandId)) {
        setActiveBrandId(brandList[0].id);
      }
    } catch (e) {
      console.error("Error fetching brand list:", e);
    }
  };

  const fetchBrandData = async () => {
    if (!activeBrandId) return;
    try {
      const docRef = doc(db, "brands", activeBrandId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBrandData({
          ...data,
          id: docSnap.id,
          name: data.name || activeBrandId
        });
      } else {
        // Fallback for demo
        setBrandData({
          id: activeBrandId,
          name: activeBrandId,
          blueprint: {},
          config: {}
        });
      }
    } catch (error) {
      console.error("Error fetching brand context:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchBrandData();
  }, [activeBrandId]);

  return (
    <BrandContext.Provider value={{ 
      activeBrandId, 
      setActiveBrandId, 
      brandData, 
      brands,
      loading, 
      refreshBrandData: fetchBrandData 
    }}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) throw new Error("useBrand must be used within a BrandProvider");
  return context;
};
