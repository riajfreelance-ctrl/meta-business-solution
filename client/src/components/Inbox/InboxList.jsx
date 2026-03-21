import React from 'react';
import { Star, Check } from 'lucide-react';
import { safeToDate } from '../../utils/helpers';

const InboxList = ({ 
  isDarkMode, t, conversations, selectedConvo, setSelectedConvo, 
  inboxFilter, inboxSearch, dateFilter, 
  isSelectMode, selectedConvoIds 
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
    <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 scrollbar-thin">
      {filtered.length === 0 ? (
        <div className="text-center py-20 opacity-20 italic text-sm">{t('coming_soon_desc')}</div>
      ) : (
        filtered.map(convo => (
          <div key={convo.id} className="relative group">
            <button
              onClick={() => setSelectedConvo(convo)}
              className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                selectedConvo?.id === convo.id
                  ? (isDarkMode ? 'bg-prime-500/10 border-prime-500/30' : 'bg-prime-50 border-prime-500/30 shadow-sm')
                  : (isDarkMode ? 'bg-transparent border-white/5 hover:bg-white/5' : 'bg-white border-black/5 hover:bg-gray-50 shadow-sm')
              } ${isSelectMode && selectedConvoIds.has(convo.id) ? 'border-prime-500' : ''}`}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-prime-500/20 flex items-center justify-center text-prime-500 font-bold overflow-hidden border-2 border-transparent group-hover:border-prime-500/30 transition-all">
                  {convo.customerName?.[0] || 'U'}
                </div>
                {convo.unread && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white"></span>}
                {isSelectMode && (
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedConvoIds.has(convo.id) ? 'bg-prime-500 border-prime-500 text-white' : 'bg-white border-gray-300'
                  }`}>
                    {selectedConvoIds.has(convo.id) && <Check size={12} strokeWidth={4} />}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-sm truncate">{convo.customerName || 'FB User'}</span>
                    {convo.isPriority && <Star size={12} className="text-amber-500 fill-amber-500 shrink-0" />}
                  </div>
                  {safeToDate(convo.timestamp) && (
                    <span className="text-[10px] opacity-40 whitespace-nowrap">
                      {safeToDate(convo.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  )}
                </div>
                <p className="text-xs opacity-60 truncate font-medium">{convo.lastMessage}</p>
              </div>
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default InboxList;
