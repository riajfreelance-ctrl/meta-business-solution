import React, { useState, useMemo } from 'react';
import { X, ShoppingCart, User, Phone, MapPin, Package, Plus, Minus, Search, Trash2, CheckCircle, ArrowRight } from 'lucide-react';
import { db } from '../../firebase-client';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useBrand } from '../../context/BrandContext';

const OrderDrafting = ({ isDarkMode, t, selectedConvo, products, onClose, activeBrandId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: selectedConvo?.customerName || '',
    phone: '',
    address: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Filter products by search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // Add product to cart
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Update quantity
  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const nextQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: nextQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  // Remove from cart
  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Calculate totals
  const subtotal = cart.reduce((acc, item) => acc + (parseFloat(item.offerPrice || item.price) * item.quantity), 0);

  // Handle Order Save
  const handleCreateOrder = async () => {
    if (cart.length === 0 || !customerInfo.name || !activeBrandId) return;
    setIsSaving(true);
    try {
      const orderData = {
        brandId: activeBrandId,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerAddress: customerInfo.address,
        items: cart,
        subtotal,
        status: 'Draft',
        convoId: selectedConvo.id,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, "draft_orders"), orderData);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error creating draft order:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`absolute inset-y-0 right-0 w-full sm:w-[450px] z-[200] border-l shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 ${
      isDarkMode ? 'bg-[#0a0f1d] border-white/10' : 'bg-white border-black/5'
    }`}>
      {/* Header */}
      <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-prime-500/20 flex items-center justify-center text-prime-500">
            <ShoppingCart size={20} />
          </div>
          <div>
            <h3 className={`font-black uppercase tracking-tighter text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Draft New Order
            </h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Social Commerce Engine</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-all">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-none">
        {/* Customer Info */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
             <User size={14} className="text-prime-500" />
             <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Customer Details</span>
          </div>
          <div className="space-y-3">
             <input 
               type="text" 
               placeholder="Full Name"
               value={customerInfo.name}
               onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
               className={`w-full p-3 rounded-2xl border text-sm font-bold transition-all ${
                 isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-prime-500/50' : 'bg-gray-50 border-black/5 focus:border-prime-500/50'
               }`}
             />
             <div className="flex gap-3">
               <div className="flex-1 relative">
                 <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                 <input 
                   type="text" 
                   placeholder="Phone Number"
                   value={customerInfo.phone}
                   onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                   className={`w-full pl-10 p-3 rounded-2xl border text-sm font-bold transition-all ${
                     isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-prime-500/50' : 'bg-gray-50 border-black/5 focus:border-prime-500/50'
                   }`}
                 />
               </div>
             </div>
             <div className="relative">
               <MapPin size={14} className="absolute left-4 top-4 text-gray-500" />
               <textarea 
                 placeholder="Delivery Address"
                 rows={3}
                 value={customerInfo.address}
                 onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                 className={`w-full pl-10 p-3 rounded-2xl border text-sm font-bold transition-all resize-none ${
                   isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-prime-500/50' : 'bg-gray-50 border-black/5 focus:border-prime-500/50'
                 }`}
               />
             </div>
          </div>
        </section>

        {/* Product Selection */}
        <section className="space-y-4">
          <div className="flex items-center justify-between mb-2">
             <div className="flex items-center gap-2">
               <Package size={14} className="text-prime-500" />
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Add Products</span>
             </div>
             <div className="relative">
               <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
               <input 
                 type="text" 
                 placeholder="Search catalog..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className={`pl-8 pr-4 py-1.5 rounded-full border text-[10px] font-bold transition-all ${
                   isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-prime-500/50' : 'bg-gray-50 border-black/5'
                 }`}
               />
             </div>
          </div>
          
          <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 scrollbar-none">
            {filteredProducts.map(product => (
              <div 
                key={product.id}
                className={`p-3 rounded-2xl border flex items-center justify-between group hover:border-prime-500/50 transition-all ${
                  isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                    <Package size={16} className="text-gray-500" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{product.name}</h4>
                    <p className="text-[10px] font-bold text-prime-500">{product.offerPrice || product.price} BDT</p>
                  </div>
                </div>
                <button 
                  onClick={() => addToCart(product)}
                  className="p-2 rounded-lg bg-prime-500/20 text-prime-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-prime-500 hover:text-white"
                >
                  <Plus size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Cart Listing */}
        {cart.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-dashed border-white/10">
            <div className="flex items-center gap-2 mb-2">
               <ShoppingCart size={14} className="text-prime-500" />
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Order Summary</span>
            </div>
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className={`text-xs font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.name}</h4>
                    <p className="text-[10px] opacity-50">{item.offerPrice || item.price} x {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-white/5 rounded-lg border border-white/10">
                       <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-prime-500"><Minus size={12} /></button>
                       <span className="text-xs font-black px-2">{item.quantity}</span>
                       <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-prime-500"><Plus size={12} /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500/50 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer / Total */}
      <div className={`p-6 border-t ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-black/5 bg-gray-50'}`}>
        <div className="flex justify-between items-center mb-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Estimated Total</span>
          <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{subtotal} BDT</span>
        </div>
        
        {isSuccess ? (
          <button className="w-full py-4 rounded-2xl bg-green-500 text-white flex items-center justify-center gap-2 font-black uppercase tracking-widest animate-in zoom-in-95">
             <CheckCircle size={20} />
             Draft Created!
          </button>
        ) : (
          <button 
            disabled={cart.length === 0 || !customerInfo.name || isSaving}
            onClick={handleCreateOrder}
            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all ${
              cart.length === 0 || !customerInfo.name || isSaving
                ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                : (isDarkMode ? 'bg-prime-500 text-white shadow-lg shadow-prime-500/30 hover:scale-[1.02]' : 'bg-prime-600 text-white shadow-lg shadow-prime-600/30 hover:bg-prime-700 hover:scale-[1.02]')
            }`}
          >
            {isSaving ? 'Creating...' : (
              <>
                Confirm Draft
                <ArrowRight size={18} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderDrafting;
