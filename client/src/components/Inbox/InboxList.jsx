import React from 'react';
import { Star, Check, Instagram, MessageCircle, Facebook } from 'lucide-react';
import { safeToDate } from '../../utils/helpers';

const InboxList = ({ 
  isDarkMode, t, conversations, selectedConvo, setSelectedConvo, 
  inboxFilter, inboxSearch, dateFilter, 
  isSelectMode, selectedConvoIds, isCollapsed = false 
}) => {
  const filtered = conversations.filter(c => {
    if (c.isHidden) return false;

    const searchLow = (inboxSearch || '').toLowerCase();
    const customerName = (c.customerName || '').toLowerCase();
    const lastMessage = (c.lastMessage || '').toLowerCase();
    
    const matchesSearch = customerName.includes(searchLow) || 
                          lastMessage.includes(searchLow);
    
    let matchesTab = true;
    if (inboxFilter === 'unread') matchesTab = c.unread;
    else if (inboxFilter === 'read') matchesTab = !c.unread;
    else if (inboxFilter === 'priority') matchesTab = c.isPriority;
    else if (inboxFilter === 'ad_replies') matchesTab = c.isAdReply;
    else if (inboxFilter === 'follow_up') matchesTab = c.isFollowUp;

    let matchesDate = true;
    const now = new Date();
    const convoDate = safeToDate(c.timestamp) || new Date(0);
    
    if (dateFilter === 'today') {
      matchesDate = convoDate.toDateString() === now.toDateString();
    } else if (dateFilter === 'this_week') {
      const weekAgo = new Date(new Date().setDate(now.getDate() - 7));
      matchesDate = convoDate >= weekAgo;
    } else if (dateFilter === 'this_month') {
      matchesDate = convoDate.getMonth() === now.getMonth() && convoDate.getFullYear() === now.getFullYear();
    }
    
    return matchesSearch && matchesTab && matchesDate;
  });

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none space-y-1 p-2">
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
          <MessageCircle size={48} className="mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest">{t('coming_soon_desc')}</p>
        </div>
      ) : (
        filtered.map(convo => {
          const isActive = selectedConvo?.id === convo.id;
          return (
            <div key={convo.id} className="relative group px-2">
              <button
                onClick={() => setSelectedConvo(convo)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-500 flex items-center gap-4 group/item relative overflow-hidden ${
                  isActive
                    ? (isDarkMode ? 'bg-prime-500/10 border-prime-500/20 shadow-[0_0_30px_rgba(14,165,233,0.1)]' : 'bg-prime-50 border-prime-200 shadow-xl')
                    : (isDarkMode ? 'bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/5' : 'bg-transparent border-transparent hover:bg-gray-50 hover:border-black/5')
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                {/* Magic Active Indicator */}
                {isActive && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-prime-500 rounded-r-full shadow-[0_0_15px_rgba(14,165,233,1)] animate-in slide-in-from-left-2 duration-500" />
                )}

                <div className="relative shrink-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black overflow-hidden border transition-all duration-500 group-hover/item:rotate-3 shadow-lg ${
                    isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-100 border-black/5'
                  }`}>
                    {convo.avatar ? (
                      <img src={convo.avatar} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <span className="text-prime-400 text-lg">{convo.name?.[0] || convo.customerName?.[0] || 'U'}</span>
                    )}
                  </div>
                  
                  {/* Platform Branding */}
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white border-2 shadow-[0_4px_10px_rgba(0,0,0,0.3)] ${
                    isDarkMode ? 'border-[#0f172a]' : 'border-white'
                  } ${
                    convo.platform === 'instagram' ? 'bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888]' : 
                    convo.platform === 'whatsapp' ? 'bg-[#25D366]' : 
                    'bg-[#1877F2]'
                  }`}>
                    {convo.platform === 'instagram' ? <Instagram size={10} strokeWidth={3} /> : 
                     convo.platform === 'whatsapp' ? <MessageCircle size={10} strokeWidth={3} /> : 
                     <Facebook size={10} fill="currentColor" strokeWidth={0} />}
                  </div>

                  {convo.unread && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-[#0f172a]"></span>
                    </span>
                  )}
                </div>

                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`font-black text-[13px] truncate tracking-tight transition-colors ${
                          isActive ? 'text-prime-400' : (isDarkMode ? 'text-white' : 'text-gray-900')
                        }`}>
                          {convo.name || convo.customerName || 'FB User'}
                        </span>
                        {convo.isPriority && <Star size={10} className="text-amber-500 fill-amber-500 shrink-0 animate-pulse" />}
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest opacity-30 whitespace-nowrap`}>
                        {safeToDate(convo.timestamp)?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className={`text-[11px] font-medium truncate leading-none mt-1 ${
                      convo.unread 
                        ? (isDarkMode ? 'text-white font-bold opacity-100' : 'text-gray-900 font-bold opacity-100') 
                        : 'opacity-40'
                    }`}>
                      {convo.lastMessage || 'Sent an attachment'}
                    </p>
                    
                    {/* Status Tags */}
                    {(convo.isLead || convo.isAdReply) && (
                      <div className="flex gap-1.5 mt-2">
                        {convo.isLead && (
                          <span className="px-1.5 py-0.5 rounded-lg bg-green-500/10 text-green-500 text-[7px] font-black uppercase tracking-widest border border-green-500/20">
                            Lead
                          </span>
                        )}
                        {convo.isAdReply && (
                          <span className="px-1.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-500 text-[7px] font-black uppercase tracking-widest border border-blue-500/20">
                            Ad Target
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </button>
            </div>
            )
          })
        )}
      </div>
  );
};

export default InboxList;
