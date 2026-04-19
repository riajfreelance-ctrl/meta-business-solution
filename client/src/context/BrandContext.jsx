import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase-client';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

const BrandContext = createContext();

export const BrandProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activeBrandId, setActiveBrandId] = useState(null); 
  const [brandData, setBrandData] = useState(null);
  const [brands, setBrands] = useState([]);
  const [role, setRole] = useState('brand-owner');
  const [loading, setLoading] = useState(true);

  const fetchBrands = async () => {
    if (!user) {
      console.log('BrandContext: No user, skipping brand fetch');
      return;
    }
    try {
      console.log('BrandContext: Fetching brands for user:', user.email);
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      
      let brandList = [];
      
      if (user.email === 'riajfreelance@gmail.com') {
        setRole('super-admin');
        console.log('BrandContext: Super-admin detected, fetching brands via Admin Proxy');
        try {
          const res = await fetch(`/api/admin/brands?email=${user.email}`);
          const data = await res.json();
          if (data.success) {
            brandList = data.brands;
          } else {
            console.warn('BrandContext: Admin Proxy failed, falling back to direct Firestore fetch');
            const q = query(collection(db, "brands"), where("ownerEmail", "==", user.email));
            const snap = await getDocs(q);
            brandList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          }
        } catch (apiErr) {
          console.error('BrandContext: Admin Proxy error:', apiErr);
          const q = query(collection(db, "brands"), where("ownerEmail", "==", user.email));
          const snap = await getDocs(q);
          brandList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      } else {
        setRole('brand-owner');
        const q = query(collection(db, "brands"), where("ownerEmail", "==", user.email));
        const snap = await getDocs(q);
        brandList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }

      console.log('BrandContext: Found', brandList.length, 'brands');
      setBrands(brandList);
      window.__METABIZ_DEBUG__ = { brandsFound: brandList.length, lastFetch: new Date().toISOString() };
      
      if (brandList.length > 0) {
        // STRICT FORCE: If 'Skinzy' exists, always pick it. Otherwise use localStorage or first brand.
        const skinzyBrand = brandList.find(b => b.id === 'Skinzy');
        const savedBrandId = localStorage.getItem('metasolution_active_brand_id');
        const brandExists = savedBrandId && brandList.find(b => b.id === savedBrandId);
        
        if (skinzyBrand) {
            console.log('BrandContext: Strictly forcing Skinzy brand');
            setActiveBrandId('Skinzy');
            localStorage.setItem('metasolution_active_brand_id', 'Skinzy');
        } else if (brandExists) {
            console.log('BrandContext: Restoring activeBrandId from localStorage:', savedBrandId);
            setActiveBrandId(savedBrandId);
        } else {
            console.log('BrandContext: Setting default activeBrandId to:', brandList[0].id);
            setActiveBrandId(brandList[0].id);
            localStorage.setItem('metasolution_active_brand_id', brandList[0].id);
        }
      } else if (brandList.length === 0) {
        console.log('BrandContext: No brands found for user');
        window.__METABIZ_DEBUG__.error = "Empty snapshot from Firestore or Proxy";
      }
    } catch (e) {
      console.error("Error fetching brand list:", e);
      window.__METABIZ_DEBUG__ = { error: e.message, stack: e.stack };
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
      }
    } catch (error) {
      console.error("Error fetching brand context:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
    if (userData.email === 'riajfreelance@gmail.com') setRole('super-admin');
    else setRole('brand-owner');
    localStorage.setItem('anzaar_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setRole('brand-owner');
    setActiveBrandId(null);
    setBrandData(null);
    localStorage.removeItem('anzaar_user');
  };

  const registerBrand = async (brandName, planId = 'free_trial') => {
    try {
      const { collection, addDoc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      
      const PLAN_LIMITS = {
        free_trial: { maxOrders: 50, maxProducts: 20, aiRepliesPerMonth: 100, activeAgents: 1 },
        business_pro: { maxOrders: 500, maxProducts: 200, aiRepliesPerMonth: 1000, activeAgents: 5 },
        enterprise: { maxOrders: 99999, maxProducts: 99999, aiRepliesPerMonth: 99999, activeAgents: 20 }
      };

      const limits = PLAN_LIMITS[planId] || PLAN_LIMITS.free_trial;

      const newBrand = {
        name: brandName,
        ownerEmail: user?.email || 'guest@metasolution.io',
        ownerId: user?.uid || 'guest-session',
        createdAt: serverTimestamp(),
        plan: planId, 
        planStatus: 'active',
        planExpiry: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        usageLimits: limits,
        usageStats: {
          ordersThisMonth: 0,
          aiRepliesThisMonth: 0,
          productsCount: 0
        },
        blueprint: `AI Engine initialized for ${brandName}. Optimization active.`,
        config: { theme: 'dark', language: 'en', timezone: 'UTC+6' },
        permissions: { aiReplies: true, bulkUpload: planId !== 'free_trial', advancedAnalytics: planId === 'enterprise' },
        onboardingStep: 'completed',
        isPrototype: false
      };
      
      const docRef = await addDoc(collection(db, "brands"), newBrand);
      
      // --- ZERO-TOUCH INITIALIZATION ---
      
      // 1. Initialize Default Product
      await addDoc(collection(db, "products"), {
        brandId: docRef.id,
        name: "Welcome Demo Product",
        price: 999,
        sku: "DEMO-001",
        description: "This is a pre-configured product to help you test the Vortex Engine.",
        category: "General",
        stock: 50,
        status: 'active',
        images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"],
        createdAt: serverTimestamp()
      });

      // 2. Initialize a Welcome Blueprint (Enhanced)
      const welcomeBlueprint = `
# Vortex Engine: ${brandName} Initialized
Welcome to your elite command center. The system has automatically provisioned your resources.

### 🛡️ Resource Allocation:
- **Current Tier**: ${planId.toUpperCase()}
- **Maximum Orders**: ${limits.maxOrders} / Month
- **Maximum Products**: ${limits.maxProducts}
- **AI Intelligence**: Active (Level 1)

### 🚀 Next Steps:
1. **Connect Meta**: Go to [Settings](admin-settings) and link your Meta Cloud API.
2. **Train AI**: Add data to your [Knowledge Base](data-engine/library).
3. **Launch**: Activate your first automation agent.

*Systems are nominal. Good luck, Commander.*
      `;
      
      await updateDoc(docRef, { 
        blueprint: welcomeBlueprint,
        "usageStats.productsCount": 1 
      });
      
      setActiveBrandId(docRef.id);
      localStorage.setItem('metasolution_active_brand_id', docRef.id);
      await fetchBrands();
      return docRef.id;
    } catch (error) {
      console.error("Error registering brand:", error);
      throw error;
    }
  };

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('anzaar_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        if (parsedUser?.email === 'riajfreelance@gmail.com') setRole('super-admin');
      }
    } catch (e) {
      console.error("Critical: Metasolution Auth Recovery Initiated.", e);
      localStorage.removeItem('anzaar_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUsageStats = async (type, amount = 1) => {
    if (!activeBrandId) return;
    try {
      const { updateDoc, doc, increment } = await import('firebase/firestore');
      const docRef = doc(db, "brands", activeBrandId);
      
      let updateData = {};
      if (type === 'orders') updateData["usageStats.ordersThisMonth"] = increment(amount);
      if (type === 'products') updateData["usageStats.productsCount"] = increment(amount);
      if (type === 'ai_replies') updateData["usageStats.aiRepliesThisMonth"] = increment(amount);
      
      await updateDoc(docRef, updateData);
      await fetchBrandData(); // Refresh local state
    } catch (e) {
      console.error("Error updating usage stats:", e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBrands();
    }
  }, [user]);

  useEffect(() => {
    if (!activeBrandId) return;

    // IMMEDIATE RESOLVE FOR ADMIN: Use existing brands list to avoid permission hang
    if (user?.email === 'riajfreelance@gmail.com' && brands.length > 0) {
        const adminBrand = brands.find(b => b.id === activeBrandId);
        if (adminBrand) {
            console.log('BrandContext: Resolving brandData via Admin Proxy Cache');
            setBrandData(adminBrand);
            setLoading(false);
            // We can still try onSnapshot for real-time updates, but we've already unblocked the UI
        }
    }

    const docRef = doc(db, "brands", activeBrandId);
    
    // Only set loading to true if we don't have data yet
    if (!brandData || brandData.id !== activeBrandId) {
        setLoading(true);
    }

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBrandData({
          ...data,
          id: docSnap.id,
          name: data.name || activeBrandId
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error listening to brand data (Firestore might be blocked):", error);
      // Double check if we can fallback to the brands list one last time
      if (user?.email === 'riajfreelance@gmail.com') {
         const fallback = brands.find(b => b.id === activeBrandId);
         if (fallback) setBrandData(fallback);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeBrandId, user, brands]);

  useEffect(() => {
    if (activeBrandId) {
      localStorage.setItem('metasolution_active_brand_id', activeBrandId);
    }
  }, [activeBrandId]);

  return (
    <BrandContext.Provider value={{ 
      user,
      role,
      login, 
      logout,
      registerBrand,
      activeBrandId, 
      setActiveBrandId, 
      brandData, 
      brands,
      loading, 
      updateUsageStats,
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
