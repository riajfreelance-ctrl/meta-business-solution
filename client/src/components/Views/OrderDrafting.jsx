import React, { useState, useMemo, useEffect } from 'react';
import { X, ShoppingCart, User, Phone, MapPin, Package, Plus, Minus, Search, Trash2, CheckCircle, ArrowRight, Ruler, CreditCard, Ticket } from 'lucide-react';
import { db } from '../../firebase-client';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useBrand } from '../../context/BrandContext';

const OrderDrafting = ({ isDarkMode, t, selectedConvo, products, onClose, activeBrandId }) => {
  const { brandData, updateUsageStats } = useBrand();
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: selectedConvo?.customerName || selectedConvo?.name || '',
    phone: selectedConvo?.phone || '',
    address: selectedConvo?.address || selectedConvo?.location || '',
    area: 'inside',
    deliveryCharge: 60,
    discountType: 'None',
    discountAmount: 0,
    advanceAmount: 0,
    paymentMethod: 'Cash',
    txnId: '',
    isCustomized: false,
    measurements: { length: '', body: '', shoulder: '', sleeves: '' },
    internalNotes: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const discountOptions = ['None', 'Membership Card', 'Manual Discount', 'Coupon Code', 'Delivery Charge Free'];
  const paymentMethods = ['Cash', 'Bkash', 'Nagad', 'Bank Transfer'];
  const deliveryOptions = [
    { id: 'inside', label: 'Inside Dhaka', charge: 60 },
    { id: 'outside', label: 'Outside Dhaka', charge: 120 },
    { id: 'express', label: 'Express (24h)', charge: 200 }
  ];

  // Sync customer info when selectedConvo changes
  useEffect(() => {
    if (selectedConvo) {
      setCustomerInfo(prev => ({
        ...prev,
        name: selectedConvo.customerName || selectedConvo.name || prev.name,
        phone: selectedConvo.phone || prev.phone,
        address: selectedConvo.address || selectedConvo.location || prev.address || ''
      }));
    }
  }, [selectedConvo]);

  const handleAreaChange = (charge, id) => {
    setCustomerInfo(prev => ({ ...prev, area: id, deliveryCharge: charge }));
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products.slice(0, 10);
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [products, searchQuery]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { 
        ...product, 
        quantity: 1, 
        selectedSize: product.sizes?.[0] || 'M',
        selectedColor: product.color || 'Standard'
      }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const subtotal = cart.reduce((acc, item) => acc + (parseFloat(item.offerPrice || item.price) * item.quantity), 0);
  const totalBeforeAdvance = subtotal + parseFloat(customerInfo.deliveryCharge || 0) - parseFloat(customerInfo.discountAmount || 0);
  const finalDue = totalBeforeAdvance - parseFloat(customerInfo.advanceAmount || 0);

  const handleCreateOrder = async () => {
    if (cart.length === 0 || !customerInfo.name || !activeBrandId) return;
    setIsSaving(true);
    try {
      const orderId = `ORD-${Math.floor(Date.now() / 1000).toString().slice(-6)}`;
      
      const orderData = {
        id: orderId,
        brandId: activeBrandId,
        customer: {
          name: customerInfo.name,
          phone: customerInfo.phone,
          address: customerInfo.address,
        },
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.offerPrice || item.price,
          quantity: item.quantity,
          size: item.selectedSize,
          color: item.selectedColor,
          customMeasurements: customerInfo.isCustomized ? customerInfo.measurements : null
        })),
        totals: {
          subtotal,
          deliveryCharge: parseFloat(customerInfo.deliveryCharge),
          discount: parseFloat(customerInfo.discountAmount),
          discountType: customerInfo.discountType,
          total: totalBeforeAdvance,
          advancePaid: parseFloat(customerInfo.advanceAmount),
          finalDue: finalDue
        },
        payment: {
          method: customerInfo.paymentMethod,
          txnId: customerInfo.txnId
        },
        status: customerInfo.isCustomized ? 'Processing' : 'In Store',
        convoId: selectedConvo?.id || null,
        internalNotes: customerInfo.internalNotes,
        history: [{
          status: 'Order Created',
          timestamp: Date.now(),
          event: 'Draft created via Meta Solution'
        }],
        createdAt: serverTimestamp()
      };

      // 1. Save main order
      await addDoc(collection(db, "orders"), orderData);

      // 1.1 Update Usage Stats
      await updateUsageStats('orders', 1);

      // 2. Sync with Customers Collection (Minimal CRM)
      if (customerInfo.phone) {
        const custQuery = query(collection(db, "customers"), where("phone", "==", customerInfo.phone));
        const custSnap = await getDocs(custQuery);
        
        if (custSnap.empty) {
          await addDoc(collection(db, "customers"), {
            brandId: activeBrandId,
            name: customerInfo.name,
            phone: customerInfo.phone,
            address: customerInfo.address,
            totalOrders: 1,
            totalSpent: finalDue + parseFloat(customerInfo.advanceAmount),
            createdAt: serverTimestamp()
          });
        }
      }

      // 3. Sync CRM fields back to active Conversation for Two-Way Sync
      if (selectedConvo?.id) {
        await updateDoc(doc(db, "conversations", selectedConvo.id), {
          customerName: customerInfo.name || selectedConvo.customerName || '',
          phone: customerInfo.phone || selectedConvo.phone || '',
          location: customerInfo.address || selectedConvo.location || selectedConvo.address || ''
        });
      }

      setIsSuccess(true);
      setTimeout(() => { onClose(); setIsSuccess(false); }, 2000);
    } catch (error) { 
      console.error(error); 
      alert("Failed to create order. Check console.");
    } finally { 
      setIsSaving(false); 
    }
  };

  return (
    <div className={`flex flex-col h-full animate-in slide-in-from-right duration-500 font-sans border-l ${isDarkMode ? 'text-white border-white/5 bg-[#0a0f1d]' : 'text-gray-900 border-black/5 bg-white'}`}>
      {/* Header - Fixed & Minimal */}
      <div className={`p-4 border-b flex items-center justify-between sticky top-0 z-10 backdrop-blur-md ${isDarkMode ? 'bg-[#0a0f1d]/90 border-white/10' : 'bg-white/90 border-black/5'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-prime-500/10 flex items-center justify-center text-prime-500 border border-prime-500/20">
            <ShoppingCart size={18} />
          </div>
          <div>
            <h3 className="font-black uppercase tracking-tighter text-sm italic">Drafting Center</h3>
            <p className="text-[9px] font-black uppercase opacity-40">Anzaar Engine 2.0 Logic</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 border border-white/5 rounded-xl hover:bg-white/5 transition-all">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none p-5 space-y-6 pb-40">
        {/* Customer Information Section */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 opacity-50">
             <User size={12} className="text-prime-500" />
             <span className="text-[10px] font-black uppercase tracking-widest leading-none">Identity & Location</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input 
              type="text" placeholder="Full Name" value={customerInfo.name}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full p-3.5 rounded-2xl border text-[11px] font-bold transition-all focus:border-prime-500/50 ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:opacity-20' : 'bg-gray-50 border-black/5'}`}
            />
            <input 
              type="text" placeholder="Phone" value={customerInfo.phone}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
              className={`w-full p-3.5 rounded-2xl border text-[11px] font-bold transition-all focus:border-prime-500/50 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-black/5'}`}
            />
            <textarea 
              placeholder="Full Shipping Address" rows={2} value={customerInfo.address}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
              className={`w-full col-span-2 p-3.5 rounded-2xl border text-[11px] font-bold transition-all resize-none focus:border-prime-500/50 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-black/5'}`}
            />
          </div>
        </section>

        {/* Product Catalog - Ultra Compact */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2 opacity-50">
               <Package size={12} className="text-prime-500" />
               <span className="text-[10px] font-black uppercase tracking-widest">Global Catalog</span>
             </div>
             <div className="relative">
               <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-20" />
               <input 
                 type="text" placeholder="Search SKU or Name..." value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className={`pl-9 pr-4 py-2 rounded-full border text-[10px] font-bold w-40 focus:w-48 transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-black/5'}`}
               />
             </div>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto scrollbar-none pr-1">
            {filteredProducts.map(product => (
              <button 
                key={product.id} 
                onClick={() => addToCart(product)}
                className={`p-2 rounded-2xl border flex flex-col gap-2 group transition-all text-left hover:border-prime-500/40 active:scale-95 ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-black/5'}`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                    {product.images?.[0] ? <img src={product.images[0]} className="w-full h-full object-cover rounded-lg" /> : <Package size={14} className="opacity-20" />}
                  </div>
                  <Plus size={12} className="text-prime-500" />
                </div>
                <div>
                  <h4 className="text-[9px] font-black uppercase tracking-tight leading-tight truncate w-full">{product.name}</h4>
                  <p className="text-[8px] font-black text-prime-500 mt-0.5">৳{product.offerPrice || product.price}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Selected Cart Items */}
        {cart.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center gap-2 opacity-30 px-1">
               <ShoppingCart size={10} />
               <span className="text-[9px] font-black uppercase tracking-[0.2em]">Active Draft</span>
            </div>
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.id} className={`p-3 rounded-2xl border transition-all ${isDarkMode ? 'bg-prime-500/5 border-white/5' : 'bg-gray-50 border-black/5'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[11px] font-black truncate max-w-[70%]">{item.name}</h4>
                    <span className="text-[10px] font-black text-prime-500">৳{ (item.offerPrice || item.price) * item.quantity }</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 p-1 rounded-xl bg-black/20 border border-white/5">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1 px-2 hover:text-prime-500"><Minus size={12} /></button>
                      <span className="font-black text-xs min-w-[20px] text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1 px-2 hover:text-prime-500"><Plus size={12} /></button>
                    </div>
                    <button onClick={() => updateQuantity(item.id, -item.quantity)} className="text-[9px] font-black text-red-500/40 hover:text-red-500 px-2 uppercase tracking-widest">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Custom Measurements Section */}
        <section className={`p-4 rounded-[2rem] border transition-all ${customerInfo.isCustomized ? 'border-prime-500/30 bg-prime-500/5 shadow-xl shadow-prime-500/5' : 'border-white/5 bg-white/5 opacity-60'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Ruler size={14} className={customerInfo.isCustomized ? 'text-prime-500' : 'opacity-40'} />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">Tailoring Detail</span>
            </div>
            <button 
              onClick={() => setCustomerInfo(prev => ({ ...prev, isCustomized: !prev.isCustomized }))}
              className={`text-[8px] font-black uppercase px-3 py-1 rounded-full transition-all ${customerInfo.isCustomized ? 'bg-prime-500 text-white' : 'bg-white/10 text-white/40'}`}
            >
              {customerInfo.isCustomized ? 'Enabled' : 'Enable'}
            </button>
          </div>
          {customerInfo.isCustomized && (
            <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-300">
              {Object.keys(customerInfo.measurements).map(m => (
                <div key={m} className="space-y-1">
                  <label className="text-[8px] font-black uppercase opacity-40 capitalize px-2">{m}</label>
                  <input 
                    type="text" placeholder="--" value={customerInfo.measurements[m]}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, measurements: { ...prev.measurements, [m]: e.target.value } }))}
                    className={`w-full p-2.5 rounded-xl border text-[10px] font-black text-center ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-white border-black/5'}`}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Global Logistics & Financials */}
        <section className="space-y-4 pt-2">
          {/* Logistics Selection */}
          <div className="space-y-2">
             <label className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30 px-1">Shipping Logistics</label>
             <div className="flex gap-2">
               {deliveryOptions.map(opt => (
                 <button 
                  key={opt.id}
                  type="button"
                  onClick={() => handleAreaChange(opt.charge, opt.id)}
                  className={`flex-1 p-3 rounded-2xl border text-[9px] font-black uppercase transition-all ${customerInfo.area === opt.id ? 'bg-prime-500 border-prime-500 text-white' : 'bg-white/5 border-white/5 opacity-50'}`}
                 >
                   {opt.label}
                 </button>
               ))}
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30 px-1">Promotion / Discount</label>
              <div className="relative">
                <Ticket size={12} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-20" />
                <select 
                  value={customerInfo.discountType}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, discountType: e.target.value }))}
                  className={`w-full pl-9 p-3 rounded-2xl border text-[10px] font-bold appearance-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50'}`}
                >
                  {discountOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <input 
                type="number" placeholder="Amt" value={customerInfo.discountAmount || ''}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, discountAmount: e.target.value }))}
                className={`w-full p-3 rounded-2xl border text-[10px] font-black ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50'}`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30 px-1 text-sky-400">Advance Security</label>
              <div className="relative">
                <CreditCard size={12} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-20" />
                <select 
                  value={customerInfo.paymentMethod}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className={`w-full pl-9 p-3 rounded-2xl border text-[10px] font-bold appearance-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50'}`}
                >
                  {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <input 
                  type="number" placeholder="Amt" value={customerInfo.advanceAmount || ''}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, advanceAmount: e.target.value }))}
                  className={`flex-1 p-3 rounded-2xl border text-[10px] font-black ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-sky-500/50' : 'bg-gray-50'}`}
                />
                <input 
                  type="text" placeholder="Txn" value={customerInfo.txnId}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, txnId: e.target.value }))}
                  className={`flex-1 p-3 rounded-2xl border text-[10px] font-black ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-sky-500/50' : 'bg-gray-50'}`}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-1 pt-2">
             <label className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30 px-1">Internal Direction</label>
             <textarea 
               placeholder="Special instructions for operations team..." rows={2}
               value={customerInfo.internalNotes} onChange={(e) => setCustomerInfo(prev => ({ ...prev, internalNotes: e.target.value }))}
               className={`w-full p-3.5 rounded-2xl border text-[10px] font-bold transition-all resize-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50'}`}
             />
          </div>
        </section>
      </div>

      {/* Footer Area - High Performance Receipt */}
      <div className={`p-6 border-t font-sans sticky bottom-0 z-10 ${isDarkMode ? 'border-white/10 bg-[#0a0f1d] shadow-[0_-20px_50px_rgba(0,0,0,0.6)]' : 'border-black/5 bg-gray-50'}`}>
        <div className="space-y-2 mb-6">
           <div className="flex justify-between items-center text-[10px] font-black opacity-40 uppercase tracking-widest">
             <span>Subtotal</span>
             <span>৳{subtotal}</span>
           </div>
           <div className="flex justify-between items-center text-[10px] font-black opacity-40 uppercase tracking-widest">
             <span>Service Charge ({customerInfo.area})</span>
             <span>+৳{customerInfo.deliveryCharge}</span>
           </div>
           {customerInfo.discountAmount > 0 && (
             <div className="flex justify-between items-center text-[10px] font-black text-red-500 uppercase tracking-widest">
               <span>Promo Applied ({customerInfo.discountType})</span>
               <span>-৳{customerInfo.discountAmount}</span>
             </div>
           )}
           {customerInfo.advanceAmount > 0 && (
             <div className="flex justify-between items-center text-[10px] font-black text-sky-400 uppercase tracking-widest">
               <span>Security Deposit ({customerInfo.paymentMethod})</span>
               <span>-৳{customerInfo.advanceAmount}</span>
             </div>
           )}
           <div className="pt-2 flex justify-between items-center border-t border-white/5">
              <span className="text-sm font-black uppercase tracking-tighter italic">Final Receivable</span>
              <span className="text-3xl font-black tracking-tighter">৳{finalDue}</span>
           </div>
        </div>
        
        {isSuccess ? (
          <div className="w-full py-5 rounded-[2rem] bg-green-500 text-white flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs animate-in zoom-in-95 shadow-xl shadow-green-500/30">
             <CheckCircle size={18} /> Dispatched to Orders
          </div>
        ) : (
          <div className="space-y-3">
            {brandData?.usageStats?.ordersThisMonth >= brandData?.usageLimits?.maxOrders && (
              <div className="p-4 rounded-[1.5rem] bg-rose-500/10 border border-rose-500/20 text-rose-500 space-y-2 animate-pulse mb-4">
                 <div className="flex items-center gap-2">
                    <AlertTriangle size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Quota Exceeded</span>
                 </div>
                 <p className="text-[9px] font-bold opacity-80 leading-relaxed uppercase">
                    You have reached your monthly order limit of {brandData?.usageLimits?.maxOrders}. Please upgrade to Business Pro for unlimited scaling.
                 </p>
              </div>
            )}
            <button 
              disabled={cart.length === 0 || !customerInfo.name || isSaving || (brandData?.usageStats?.ordersThisMonth >= brandData?.usageLimits?.maxOrders)}
              onClick={handleCreateOrder}
              className={`w-full py-5 rounded-[2rem] flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs transition-all active:scale-95 ${
                cart.length === 0 || !customerInfo.name || isSaving || (brandData?.usageStats?.ordersThisMonth >= brandData?.usageLimits?.maxOrders)
                  ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                  : 'bg-prime-500 text-white shadow-2xl shadow-prime-500/50 hover:bg-prime-600'
              }`}
            >
              {isSaving ? 'Synchronizing Intelligence...' : <>Dispatch Order <ArrowRight size={16} /></>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDrafting;
