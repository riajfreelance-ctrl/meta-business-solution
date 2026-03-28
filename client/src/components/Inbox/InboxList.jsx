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
    <div className="flex-1 overflow-y-auto scrollbar-none">
      {filtered.length === 0 ? (
        <div className="text-center py-20 opacity-20  text-sm">{t('coming_soon_desc')}</div>
      ) : (
        filtered.map(convo => (
          <div key={convo.id} className="relative group">
            <button
              onClick={() => setSelectedConvo(convo)}
              className={`w-full text-left p-5 border-b transition-all duration-700 flex items-center gap-4 group/item relative overflow-hidden ${
                selectedConvo?.id === convo.id
                  ? (isDarkMode ? 'bg-prime-500/10' : 'bg-prime-50')
                  : (isDarkMode ? 'bg-transparent hover:bg-white/[0.03]' : 'bg-white hover:bg-gray-50')
              } ${isDarkMode ? 'border-white/[0.03]' : 'border-black/5'} ${isCollapsed ? 'justify-center' : 'hover:pl-7'}`}
            >
              {/* Active Indicator Bar */}
              {selectedConvo?.id === convo.id && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-prime-500 rounded-r-full shadow-[0_0_15px_rgba(14,165,233,1)]" />
              )}

              <div className="relative shrink-0 transition-transform duration-500 group-hover/item:scale-110">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-prime-500/20 to-purple-500/20 flex items-center justify-center text-prime-400 font-black overflow-hidden border border-white/5 transition-all group-hover/item:rotate-6">
                  {convo.name?.[0] || convo.customerName?.[0] || 'U'}
                </div>
                <div className={`absolute -bottom-1 -left-1 w-4 h-4 rounded-full flex items-center justify-center text-white border-2 ${
                  convo.platform === 'instagram' ? 'bg-gradient-to-tr from-amber-500 via-red-500 to-purple-500 border-white' : 
                  convo.platform === 'whatsapp' ? 'bg-green-500 border-white' : 
                  'bg-blue-600 border-white'
                }`}>
                  {convo.platform === 'instagram' ? <Instagram size={8} strokeWidth={3} /> : 
                   convo.platform === 'whatsapp' ? <MessageCircle size={8} strokeWidth={3} /> : 
                   <Facebook size={8} fill="currentColor" strokeWidth={0} />}
                </div>
                {convo.unread && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-sm truncate">{convo.name || convo.customerName || 'FB User'}</span>
                      {convo.isPriority && <Star size={12} className="text-amber-500 fill-amber-500 shrink-0" />}
                      {convo.isLead && (
                        <span className="px-1.5 py-0.5 rounded-md bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-widest border border-green-500/20">
                          Lead
                        </span>
                      )}
                    </div>
                   {safeToDate(convo.timestamp) && (
                      <span className="text-[10px] opacity-40 whitespace-nowrap">
                        {safeToDate(convo.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    )}
                  </div>
                  <p className="text-xs opacity-60 truncate font-medium">{convo.lastMessage}</p>
                </div>
              )}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default InboxList;
