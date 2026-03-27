import React from 'react';
import { ShoppingCart, User, MapPin, Phone, Calendar, CheckCircle, Clock, Trash2, Ruler, CreditCard, Tag } from 'lucide-react';
import { safeToDate } from '../../utils/helpers';

const OrdersView = ({ isDarkMode, t, orders = [] }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-3xl md:text-5xl font-black mb-2 tracking-tighter uppercase italic ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Order <span className="text-prime-500 text-stroke-thin">Vault</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-prime-500 mb-1 flex items-center gap-2">
             <Tag size={12} /> Commercial Command Center
          </p>
          <div className="h-1 w-20 bg-prime-500 rounded-full" />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto scrollbar-none pb-2">
          <div className={`px-5 py-3 rounded-[2rem] border flex items-center gap-3 shrink-0 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-lg'}`}>
            <ShoppingCart size={16} className="text-prime-500" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest leading-none text-prime-500">Pipeline</span>
              <span className="text-sm font-black">{orders.length} ACTIVE</span>
            </div>
          </div>
          <div className={`px-5 py-3 rounded-[2rem] border flex items-center gap-3 shrink-0 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-lg'}`}>
            <CheckCircle size={16} className="text-green-500" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest leading-none text-green-500">Revenue</span>
              <span className="text-sm font-black">
                ৳{orders.reduce((acc, o) => acc + (o.totals?.total || 0), 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className={`py-40 text-center rounded-[4rem] border border-dashed flex flex-col items-center justify-center space-y-6 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/10 shadow-xl'}`}>
          <div className="w-24 h-24 rounded-full bg-prime-500/10 flex items-center justify-center text-prime-500/20 border border-prime-500/20">
            <ShoppingCart size={48} />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase italic italic tracking-tighter">No Active Orders found</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mt-2">Generate high-converting drafts from the sales hub</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {orders.map(order => {
            const customer = order.customer || { name: 'Unknown', phone: 'N/A', address: 'N/A' };
            const totals = order.totals || { total: 0, finalDue: 0, advancePaid: 0 };
            
            return (
              <div 
                key={order.id}
                className={`p-8 rounded-[3rem] border group transition-all duration-700 relative overflow-hidden ${
                  isDarkMode ? 'bg-[#0a0f1d] border-white/10 hover:border-prime-500/50' : 'bg-white border-black/5 shadow-2xl'
                }`}
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-prime-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-prime-500/10 transition-all duration-1000" />
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-prime-500 to-prime-600 flex items-center justify-center text-white shadow-2xl shadow-prime-500/30 ring-4 ring-white/5">
                      <User size={28} />
                    </div>
                    <div>
                      <h4 className="font-black text-2xl tracking-tighter uppercase italic">{customer.name}</h4>
                      <div className="flex items-center gap-3 mt-1.5 opacity-40 text-[9px] font-black uppercase tracking-[0.2em]">
                         <Clock size={12} className="text-prime-500" />
                         {order.id} • {(() => {
                            const date = safeToDate(order.createdAt);
                            return date ? date.toLocaleDateString() : 'Pending Date';
                          })()}
                      </div>
                    </div>
                  </div>
                  <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    ['Draft', 'Pending'].includes(order.status) ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500 animate-pulse'
                  }`}>
                    {order.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-10 relative z-10">
                   <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-xl bg-prime-500/10 flex items-center justify-center text-prime-500"><Phone size={14} /></div>
                        <span className="text-sm font-black tracking-tight">{customer.phone}</span>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-xl bg-prime-500/10 flex items-center justify-center text-prime-500 mt-1"><MapPin size={14} /></div>
                        <span className="text-[11px] font-bold opacity-60 leading-relaxed uppercase tracking-widest">{customer.address}</span>
                      </div>
                   </div>

                   {/* Micro Measurement Card */}
                   {order.items?.some(i => i.customMeasurements) && (
                     <div className={`p-5 rounded-[2rem] border animate-in zoom-in-95 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-2 mb-3">
                           <Ruler size={14} className="text-prime-500" />
                           <span className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">Measurements</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                          {Object.entries(order.items.find(i => i.customMeasurements)?.customMeasurements || {}).map(([key, val]) => (
                            <div key={key} className="flex justify-between border-b border-white/5 pb-1">
                               <span className="text-[8px] font-black uppercase opacity-30">{key}</span>
                               <span className="text-[10px] font-black">{val || '--'}</span>
                            </div>
                          ))}
                        </div>
                     </div>
                   )}
                </div>

                {/* Items & Financial Ticket */}
                <div className={`p-8 rounded-[2.5rem] mb-8 relative border ${isDarkMode ? 'bg-black/30 border-white/5' : 'bg-slate-50'}`}>
                  <div className="space-y-3 mb-6">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex justify-between items-center group/item">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black uppercase tracking-widest">{item.quantity}x {item.name}</span>
                          <span className="text-[8px] font-black opacity-30 uppercase tracking-[0.2em]">{item.size || 'M'} • {item.color || 'STND'}</span>
                        </div>
                        <div className="h-0.5 flex-1 mx-4 border-b border-dotted border-white/10" />
                        <span className="text-xs font-black italic">৳{ (item.price || 0) * item.quantity }</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-6 border-t border-white/5">
                     <div className="flex justify-between items-center text-[11px] font-black opacity-40 uppercase tracking-widest">
                        <span>Consolidated Total</span>
                        <span>৳{totals.subtotal}</span>
                     </div>
                     <div className="flex justify-between items-center text-[10px] font-black opacity-30 uppercase tracking-widest">
                        <span>Logistics & Tax</span>
                        <span>+৳{totals.deliveryCharge || 0}</span>
                     </div>
                     {totals.discount > 0 && (
                       <div className="flex justify-between items-center text-[10px] font-black text-red-500/70 uppercase tracking-widest">
                          <span>Promo/Disc. ({totals.discountType})</span>
                          <span>-৳{totals.discount}</span>
                       </div>
                     )}
                     {totals.advancePaid > 0 && (
                       <div className="flex justify-between items-center text-[10px] font-black text-sky-500/70 uppercase tracking-widest p-2 bg-sky-500/5 rounded-xl border border-sky-500/10 mt-2">
                          <div className="flex items-center gap-2">
                             <CreditCard size={12} />
                             <span>ADVANCE ({order.payment?.method || 'CASH'})</span>
                          </div>
                          <span>-৳{totals.advancePaid}</span>
                       </div>
                     )}
                     
                     <div className="flex justify-between items-center pt-6 mt-4 border-t border-white/10">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-prime-500 leading-none">Net Receivable</span>
                           <span className="text-[8px] font-black opacity-30 uppercase mt-1 italic">Authorized Balance Due</span>
                        </div>
                        <span className="text-4xl font-black tracking-tighter italic text-prime-500">৳{totals.finalDue}</span>
                     </div>
                  </div>
                </div>

                {/* Final Actions */}
                <div className="flex gap-4 relative z-10">
                  <button className="flex-1 py-4.5 rounded-[2rem] bg-prime-500 text-white text-[11px] font-black uppercase tracking-widest hover:bg-prime-400 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-prime-500/20">
                    <CheckCircle size={18} /> Push to Fulfillment
                  </button>
                  <button className={`p-4.5 rounded-[2rem] border transition-all active:scale-90 ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-red-500/20 text-gray-500 hover:text-red-500' : 'bg-slate-50 hover:bg-red-50 text-gray-400 hover:text-red-500'}`}>
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersView;
