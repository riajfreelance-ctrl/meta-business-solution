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
  <div className={`w-80 hidden lg:flex flex-col border-l shrink-0 transition-all duration-700 backdrop-blur-3xl ${
    isDarkMode ? 'border-white/5 bg-[#020617]/40' : 'border-black/5 bg-slate-50/50'
  }`}>
    <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-none">
      {/* Customer Profile Section */}
      <div className="flex flex-col items-center text-center">
        <div className={`w-28 h-28 rounded-full border-4 transition-all duration-700 hover:scale-105 ${isDarkMode ? 'border-prime-500/20 bg-slate-900 shadow-[0_0_50px_rgba(139,92,246,0.2)]' : 'border-prime-100 bg-white shadow-xl'} flex items-center justify-center mb-4 relative`}>
          <UserCircle size={64} className="text-prime-500" />
          <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-[#020617]" />
        </div>
        
        <h3 className={`text-xl font-black tracking-tight mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {selectedConvo?.customerName || 'Customer Details'}
        </h3>
        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
          isDarkMode ? 'bg-prime-500/10 text-prime-400' : 'bg-prime-50 text-prime-600'
        }`}>
          V.I.P Member
        </span>
      </div>

      <div className="space-y-4">
        <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-30 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Customer Insights
        </h4>
        <div className="space-y-2">
          {[
            { label: 'Total Spent', value: '৳ 12,450', icon: Tag },
            { label: 'Total Orders', value: '8 Orders', icon: ShoppingBag },
            { label: 'Location', value: 'Dhaka, BD', icon: MapPin }
          ].map((item, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-2xl transition-all duration-500 hover:bg-white/10 ${isDarkMode ? 'bg-white/[0.03] border border-white/5 backdrop-blur-md' : 'bg-white shadow-sm border border-black/5'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-prime-500/10">
                  <item.icon size={16} className="text-prime-500" />
                </div>
                <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">{item.label}</span>
              </div>
              <span className="text-xs font-black">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lead Scoring */}
      <div className="space-y-4">
        <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-30 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          AI Analytics
        </h4>
        <div className={`p-4 rounded-[2rem] border transition-all duration-500 ${isDarkMode ? 'bg-white/[0.03] border-white/5 backdrop-blur-xl hover:bg-white/[0.06]' : 'bg-white border-black/5 shadow-sm'}`}>
          <div className="flex mb-3 items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-prime-500 italic">Buying Intent</span>
            <span className="text-[9px] font-black uppercase tracking-widest">85%</span>
          </div>
          <div className="overflow-hidden h-1.5 flex rounded-full bg-prime-500/10">
            <div style={{ width: "85%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-prime-500 shadow-[0_0_15px_rgba(139,92,246,0.3)]"></div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="text-center">
               <p className="text-[8px] font-black opacity-30 uppercase mb-0.5">Response Time</p>
               <p className="text-xs font-black">4.2m</p>
            </div>
            <div className="text-center">
               <p className="text-[8px] font-black opacity-30 uppercase mb-0.5">Sentiment</p>
               <p className="text-xs font-black text-green-500">Positive</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-30 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Recent Orders
          </h4>
          <button className="text-[9px] font-black uppercase text-prime-500">View All</button>
        </div>
        <div className="space-y-3">
          {[
            { date: '12 March', item: 'Ginseng Serum BOGO', status: 'Delivered' },
            { date: '02 March', item: 'Vitamin C Combo', status: 'Delivered' }
          ].map((order, i) => (
            <div key={i} className={`p-3 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer ${
              isDarkMode ? 'bg-white/5 border-white/5 hover:border-white/10' : 'bg-white border-black/5 hover:shadow-md'
            }`}>
              <div className="flex justify-between items-start mb-1">
                <p className="text-[10px] font-bold truncate pr-4">{order.item}</p>
                <span className="text-[8px] opacity-40 font-bold shrink-0">{order.date}</span>
              </div>
              <p className="text-[8px] font-black uppercase text-green-500 tracking-widest">{order.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default SalesSidebar;
