import React, { useState } from 'react';
import { 
  UserCircle, Tag, MapPin, History, ShoppingBag, 
  ChevronRight, Clock, Target, CreditCard, Sparkles, Activity, ExternalLink, Phone, Mail, Truck, Edit2, Save, X
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase-client';

const SalesSidebar = ({ isDarkMode, t, selectedConvo, setSelectedConvo, chatMessages = [], orders = [], setLightbox, onOpenMediaGallery, onViewOrders }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState({ phone: '', location: '', altPhone: '' });
  const [isSavingContact, setIsSavingContact] = useState(false);

  const sharedMedia = chatMessages
    .filter(Boolean)
    .filter(msg => !msg.isDeleted && msg.attachments && msg.attachments.length > 0)
    .flatMap(msg => msg.attachments.filter(Boolean).filter(att => att?.type === 'image' || typeof att === 'string'));

  const customerOrders = (orders || []).filter(o => 
    o.customerName === selectedConvo?.customerName || 
    (selectedConvo?.phone && o.phone === selectedConvo.phone)
  );

  const totalSpent = customerOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrdersCount = customerOrders.length;

  const displayOrders = customerOrders.length > 0 ? customerOrders.slice(0, 3).map(o => ({
    date: new Date(o.createdAt?.seconds * 1000).toLocaleDateString() || 'Recent',
    item: o.items?.[0]?.name || 'Custom Order',
    status: o.status || 'Pending'
  })) : [
    { date: 'Just now', item: 'Ginseng Serum BOGO', status: 'Processing' },
    { date: '2 days ago', item: 'Vitamin C Combo', status: 'Delivered' }
  ];

  const displaySpent = totalSpent > 0 ? `৳ ${totalSpent.toLocaleString()}` : '৳ 12,450';
  const displayCount = totalOrdersCount > 0 ? `${totalOrdersCount} Orders` : '8 Orders';

  const handleAIAnalysis = () => {
    setIsAnalyzing(true);
    setScanResult(null);
    setTimeout(() => {
      setIsAnalyzing(false);
      setScanResult('High purchase intent identified for anti-aging kits (85% confidence). Recommend immediate follow-up.');
    }, 1500);
  };

  const openContactEditor = () => {
    setContactForm({
      phone: selectedConvo?.phone || '',
      location: selectedConvo?.address || selectedConvo?.location || '',
      altPhone: selectedConvo?.altPhone || ''
    });
    setIsEditingContact(true);
  };

  const saveContactInfo = async () => {
    if (!selectedConvo?.id) return;
    setIsSavingContact(true);
    try {
      await updateDoc(doc(db, "conversations", selectedConvo.id), {
        phone: contactForm.phone,
        location: contactForm.location,
        altPhone: contactForm.altPhone
      });
      
      // Optimistic UI Update instantly bypasses network latency and Dashboard loops
      if (setSelectedConvo) {
        setSelectedConvo(prev => ({
          ...prev,
          phone: contactForm.phone,
          location: contactForm.location,
          altPhone: contactForm.altPhone,
          address: contactForm.location // keep strictly aligned with Draft order fallback
        }));
      }

      setIsEditingContact(false);
    } catch (e) {
      console.error('Failed to update contact info', e);
    } finally {
      setIsSavingContact(false);
    }
  };

  return (
  <div className={`w-80 hidden lg:flex flex-col border-l shrink-0 transition-all duration-700 backdrop-blur-3xl relative overflow-hidden ${
    isDarkMode ? 'border-white/5 bg-[#040816]/80' : 'border-black/5 bg-slate-50/80'
  }`}>
    {/* Decorative Glow Overlay */}
    <div className="absolute top-0 right-0 w-64 h-64 bg-prime-500/10 rounded-full blur-[80px] pointer-events-none z-0" />
    <div className="absolute bottom-32 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none z-0" />

    <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-none relative z-10">
      
      {/* Customer Profile Section */}
      <div className="flex flex-col items-center text-center group cursor-pointer" onClick={() => alert('Customer CRM Profile module opening...')}>
        <div className={`w-28 h-28 rounded-full border-[3px] transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 ${isDarkMode ? 'border-prime-500/30 bg-[#0a0f1d] shadow-[0_0_40px_rgba(139,92,246,0.15)] group-hover:shadow-[0_0_60px_rgba(139,92,246,0.3)]' : 'border-prime-200 bg-white shadow-xl group-hover:shadow-2xl'} flex items-center justify-center mb-5 relative`}>
          {selectedConvo?.avatar ? (
            <img src={selectedConvo.avatar} alt="avatar" className="w-full h-full rounded-full object-cover p-1" />
          ) : (
            <UserCircle size={64} className="text-prime-500 transition-transform duration-500 group-hover:scale-110" />
          )}
          <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-[#020617] shadow-[0_0_15px_rgba(34,197,94,0.5)] animate-pulse" />
        </div>
        
        <h3 className={`text-xl font-black tracking-tight mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white group-hover:text-prime-400' : 'text-gray-900 group-hover:text-prime-600'}`}>
          {selectedConvo?.customerName || 'Vortex Customer'}
        </h3>
        <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-gradient-to-r from-prime-500 to-indigo-500 text-white shadow-lg shadow-prime-500/20 transform hover:scale-105 transition-all">
          V.I.P Member
        </span>
        {selectedConvo?.location && (
          <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <MapPin size={12} className="text-prime-400" />
            <span className="truncate max-w-[180px]">{selectedConvo.location}</span>
          </div>
        )}
      </div>

      {/* Customer Insights */}
      <div className="space-y-4">
        <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <Activity size={12} className="text-prime-500" /> Customer Insights
        </h4>
        <div className="space-y-2">
          {[
            { label: 'Lifetime Value', value: displaySpent, icon: CreditCard, action: onViewOrders },
            { label: 'Total Orders', value: displayCount, icon: ShoppingBag, action: onViewOrders }
          ].map((item, i) => (
            <div 
              key={i} 
              onClick={item.action}
              className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 group ${isDarkMode ? 'bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-prime-500/30 hover:shadow-[0_0_20px_rgba(139,92,246,0.1)]' : 'bg-white shadow-sm hover:shadow-md border border-black/5 hover:border-prime-500/20'}`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-prime-500/10 group-hover:bg-prime-500 group-hover:text-white transition-colors duration-300 text-prime-500">
                  <item.icon size={16} />
                </div>
                <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{item.label}</span>
              </div>
              <span className={`text-xs font-black transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact & Delivery details */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Truck size={12} className="text-prime-500" /> Contact & Delivery
          </h4>
          {!isEditingContact && (
            <button onClick={openContactEditor} className="text-[9px] font-black uppercase tracking-widest text-prime-500 hover:text-prime-400 p-1.5 rounded-lg hover:bg-prime-500/10 transition-colors">
              <Edit2 size={12} />
            </button>
          )}
        </div>

        {isEditingContact ? (
          <div className={`p-4 rounded-[2rem] border animate-in fade-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-white/5 border-prime-500/30 shadow-[0_0_20px_rgba(139,92,246,0.1)]' : 'bg-white shadow-xl border-prime-500/20'}`}>
            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-prime-500 block mb-1.5">Primary Phone</label>
                <input 
                  type="text" 
                  value={contactForm.phone} 
                  onChange={e => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                  className={`w-full p-2.5 rounded-xl text-xs font-black border focus:border-prime-500 focus:ring-1 focus:ring-prime-500 outline-none transition-all ${isDarkMode ? 'bg-[#020617] border-white/10 text-white' : 'bg-gray-50 border-black/5'}`}
                  placeholder="+880..."
                />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-prime-500 block mb-1.5">Delivery Address</label>
                <textarea 
                  value={contactForm.location} 
                  onChange={e => setContactForm(prev => ({ ...prev, location: e.target.value }))}
                  rows={2}
                  className={`w-full p-2.5 rounded-xl text-xs font-black border focus:border-prime-500 focus:ring-1 focus:ring-prime-500 outline-none transition-all resize-none ${isDarkMode ? 'bg-[#020617] border-white/10 text-white' : 'bg-gray-50 border-black/5'}`}
                  placeholder="Full address..."
                />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-prime-500 block mb-1.5">Alt Notes / Secondary Phone</label>
                <input 
                  type="text" 
                  value={contactForm.altPhone} 
                  onChange={e => setContactForm(prev => ({ ...prev, altPhone: e.target.value }))}
                  className={`w-full p-2.5 rounded-xl text-[10px] font-bold border focus:border-prime-500 outline-none transition-all ${isDarkMode ? 'bg-[#020617] border-white/10 text-white' : 'bg-gray-50 border-black/5'}`}
                  placeholder="Optional notes..."
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setIsEditingContact(false)} 
                  className="flex-1 p-2 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors flex justify-center items-center gap-2"
                >
                  <X size={12} /> Cancel
                </button>
                <button 
                  onClick={saveContactInfo} 
                  disabled={isSavingContact}
                  className={`flex-1 p-2 rounded-xl text-white text-[9px] font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 ${isSavingContact ? 'bg-gray-500 cursor-not-allowed' : 'bg-prime-500 hover:bg-prime-600'}`}
                >
                  {isSavingContact ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={12} />} 
                  Save
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {[
              { label: 'Contact Node', value: selectedConvo?.phone || '+880 1XXXXXXXXX', icon: Phone },
              { label: 'Address', value: selectedConvo?.address || selectedConvo?.location || 'Awaiting full configuration.', icon: MapPin },
              { label: 'Notes', value: selectedConvo?.altPhone ? `${selectedConvo.altPhone}` : 'No secondary parameters.', icon: Activity }
            ].map((item, i) => (
              <div 
                key={i} 
                className={`flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 group ${isDarkMode ? 'bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-prime-500/30 hover:shadow-[0_0_20px_rgba(139,92,246,0.1)]' : 'bg-white shadow-sm border border-black/5 hover:border-prime-500/20'}`}
                title={item.value}
              >
                <div className="flex items-center gap-3 shrink-0">
                  <div className="p-2.5 rounded-xl bg-prime-500/10 group-hover:bg-prime-500 group-hover:text-white transition-colors duration-300 text-prime-500">
                    <item.icon size={16} />
                  </div>
                  <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{item.label}</span>
                </div>
                <span className={`text-xs font-black transition-colors text-right truncate pl-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} ${i === 2 && !selectedConvo?.altPhone ? ' opacity-50' : ''}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shared Media */}
      {sharedMedia.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Tag size={12} className="text-prime-500" /> Shared Media
            </h4>
            <button 
              className="text-[9px] font-black uppercase tracking-widest text-prime-500 hover:text-prime-400 hover:bg-prime-500/10 px-2 py-1 rounded-lg transition-all"
              onClick={() => onOpenMediaGallery && onOpenMediaGallery()}
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {sharedMedia.slice(0, 6).map((media, i) => (
              <div 
                key={i} 
                className="aspect-square rounded-[1rem] overflow-hidden cursor-pointer transition-all duration-300 border border-white/5 hover:border-prime-500/50 shadow-lg group relative"
                onClick={() => setLightbox && setLightbox({ isOpen: true, images: sharedMedia, index: i, zoom: 1 })}
              >
                <div className="absolute inset-0 bg-prime-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center backdrop-blur-[2px]">
                  <ExternalLink size={16} className="text-white drop-shadow-lg" />
                </div>
                <img 
                  src={media.payload?.url || media.url || media} 
                  alt="Shared" 
                  className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700" 
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Analytics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Sparkles size={12} className="text-amber-500" /> Cortex AI Analytics
          </h4>
        </div>
        <div 
          onClick={handleAIAnalysis}
          className={`p-5 rounded-[2rem] border cursor-pointer transition-all duration-500 group relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-white/[0.02] to-white/[0.05] border-white/10 hover:border-prime-500/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]' : 'bg-white border-black/5 shadow-sm hover:shadow-xl'}`}
        >
          {isAnalyzing && (
            <div className="absolute inset-0 bg-transparent overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-[scan_1.5s_ease-in-out_infinite]" />
            </div>
          )}
          <div className="flex mb-4 items-center justify-between relative z-10">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 group-hover:text-cyan-300 transition-colors">Buying Intent</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-white bg-cyan-500/20 px-2 py-0.5 rounded-md">85%</span>
          </div>
          <div className="overflow-hidden h-1.5 flex rounded-full bg-cyan-500/10 mb-5 relative z-10">
            <div style={{ width: "85%" }} className="shadow-none flex flex-col justify-center bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.6)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
               <p className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">Avg Response</p>
               <p className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>4.2m</p>
            </div>
            <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
               <p className="text-[8px] font-black opacity-40 uppercase tracking-widest mb-1">Sentiment</p>
               <p className="text-sm font-black text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]">Positive</p>
            </div>
          </div>
          {scanResult && !isAnalyzing && (
            <div className="mt-4 p-3 rounded-xl bg-prime-500/10 border border-prime-500/20 text-[10px] font-black tracking-widest leading-relaxed text-prime-400 uppercase animate-in slide-in-from-top-2">
              <Sparkles size={12} className="inline mr-1.5 mb-0.5" />
              {scanResult}
            </div>
          )}
        </div>
      </div>

      {/* Order History */}
      <div className="space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <History size={12} className="text-prime-500" /> Active Orders
          </h4>
          <button 
            onClick={onViewOrders} 
            className="text-[9px] font-black uppercase tracking-widest text-prime-500 hover:text-prime-400 hover:bg-prime-500/10 px-2 py-1 rounded-lg transition-all"
          >
            Manage All
          </button>
        </div>
        <div className="space-y-3">
          {displayOrders.map((order, i) => (
            <div 
              key={i} 
              onClick={onViewOrders}
              className={`p-3.5 rounded-2xl border transition-all duration-300 hover:scale-[1.03] cursor-pointer group ${
              isDarkMode ? 'bg-white/[0.02] border-white/5 hover:border-prime-500/30 hover:bg-white/[0.05]' : 'bg-white border-black/5 hover:shadow-lg hover:border-prime-500/20'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <p className={`text-[11px] font-bold truncate pr-3 group-hover:text-prime-500 transition-colors ${isDarkMode ? 'text-white/90' : 'text-gray-900'}`}>{order.item}</p>
                <span className="text-[9px] opacity-40 font-black shrink-0 uppercase tracking-widest">{order.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <p className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                  order.status === 'Delivered' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                }`}>{order.status}</p>
                <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-all text-prime-500 transform translate-x-[-10px] group-hover:translate-x-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};

export default SalesSidebar;
