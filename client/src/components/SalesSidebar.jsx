import React from 'react';
import { 
  UserCircle, 
  Tag, 
  MapPin, 
  History, 
  ShoppingBag, 
  ChevronRight, 
  Clock, 
  Target 
} from 'lucide-react';

const SalesSidebar = ({ isDarkMode, t, selectedConvo }) => (
  <div className={`w-96 hidden xl:flex flex-col gap-6 animate-in slide-in-from-right-8 duration-700`}>
    {/* Customer Profile Card */}
    <div className={`p-8 rounded-[2rem] border transition-all duration-500 overflow-hidden relative group ${
      isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-xl'
    }`}>
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-prime-500/10 blur-[60px] rounded-full -mr-16 -mt-16 transition-all group-hover:bg-prime-500/20" />
      
      <div className="flex flex-col items-center text-center relative z-10">
        <div className={`w-28 h-28 rounded-full border-4 ${isDarkMode ? 'border-prime-500/20 bg-slate-900' : 'border-prime-100 bg-slate-50'} flex items-center justify-center mb-6 shadow-2xl relative`}>
          <UserCircle size={64} className="text-prime-500" />
          <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-slate-950" />
        </div>
        
        <h3 className={`text-2xl font-black tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {selectedConvo?.customerName || 'Select Customer'}
        </h3>
        <div className="flex items-center gap-2 mb-6">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
            isDarkMode ? 'bg-prime-500/10 text-prime-400' : 'bg-prime-50 text-prime-600'
          }`}>
            V.I.P Customer
          </span>
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-white/5 relative z-10">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-3">
            <Tag size={18} className="text-prime-400" />
            <span className="text-xs font-bold text-gray-400">Total Spent</span>
          </div>
          <span className="text-sm font-black text-white">৳ 12,450</span>
        </div>
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} className="text-prime-400" />
            <span className="text-xs font-bold text-gray-400">Total Orders</span>
          </div>
          <span className="text-sm font-black text-white">8 Orders</span>
        </div>
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-3">
            <MapPin size={18} className="text-prime-400" />
            <span className="text-xs font-bold text-gray-400">Location</span>
          </div>
          <span className="text-sm font-black text-white">Dhaka, BD</span>
        </div>
      </div>
    </div>

    {/* Lead Scoring (Phase 24.1) */}
    <div className={`p-8 rounded-[2rem] border overflow-hidden relative ${
      isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-xl'
    }`}>
       <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-prime-500/20 rounded-xl">
             <Target size={20} className="text-prime-400" />
          </div>
          <h4 className="text-sm font-black uppercase tracking-widest">Lead Maturity</h4>
       </div>
       
       <div className="space-y-6">
          <div className="relative pt-1">
             <div className="flex mb-2 items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-prime-400 italic">Buying Intent</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white">85%</span>
             </div>
             <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-white/10">
                <div style={{ width: "85%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-prime-500 shadow-[0_0_15px_rgba(139,92,246,0.6)] animate-pulse"></div>
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Response Time</p>
                <p className="text-sm font-black text-white">4.2m</p>
             </div>
             <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Sentiment</p>
                <p className="text-sm font-black text-green-400">Positive</p>
             </div>
          </div>
       </div>
    </div>

    {/* Purchase History Timeline (Simplified) */}
    <div className={`flex-1 p-8 rounded-[2rem] border ${
      isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-xl'
    }`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-prime-500/20 rounded-xl">
            <History size={20} className="text-prime-400" />
          </div>
          <h4 className="text-sm font-black uppercase tracking-widest">Order History</h4>
        </div>
        <button className="text-[10px] font-black uppercase text-prime-500 hover:text-prime-400 transition-colors">View All</button>
      </div>
      
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.15rem] before:w-0.5 before:bg-white/5">
        {[
          { date: '12 March', item: 'Ginseng Serum BOGO', status: 'Delivered' },
          { date: '02 March', item: 'Vitamin C Combo', status: 'Delivered' },
          { date: '15 Feb', item: 'Pro Retinol Night', status: 'Canceled', color: 'text-red-400' }
        ].map((order, i) => (
          <div key={i} className="flex gap-4 relative group cursor-pointer">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10 transition-transform group-hover:scale-110 ${
              isDarkMode ? 'bg-slate-900 border border-white/10' : 'bg-slate-50 border border-black/5'
            }`}>
              <ShoppingBag size={16} className="text-prime-400" />
            </div>
            <div className="flex-1 pb-4 border-b border-white/5">
              <div className="flex justify-between items-start mb-1">
                <p className="text-xs font-black text-white group-hover:text-prime-400 transition-colors">{order.item}</p>
                <span className="text-[9px] font-bold text-gray-500">{order.date}</span>
              </div>
              <p className={`text-[9px] font-black uppercase tracking-widest ${order.color || 'text-green-500'}`}>{order.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default SalesSidebar;
