import React, { useState, useEffect, useRef } from 'react';
import { Search, Layers, Calendar, PlusSquare, CheckSquare, Star, Trash2, X } from 'lucide-react';

const InboxFilterBar = ({ 
  isDarkMode, t, inboxSearch, setInboxSearch, inboxFilter, setInboxFilter,
  isSelectMode, setIsSelectMode, selectedConvoIds, handleBulkAction,
  dateFilter, setDateFilter 
}) => {
  const [isDateOpen, setIsDateOpen] = useState(false);
  const dateRef = useRef(null);
  const bulkRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dateRef.current && !dateRef.current.contains(event.target)) setIsDateOpen(false);
      if (isSelectMode && bulkRef.current && !bulkRef.current.contains(event.target)) {
        if (!event.target.closest('.select-toggle-btn')) {
          setIsSelectMode(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSelectMode]);

  return (
    <div className="flex flex-col gap-4 mb-6 animate-fade-in relative">
      <div className="flex items-center gap-3">
        <div className={`flex-1 flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-black/5'
        }`}>
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder={t('search_placeholder')}
            className="bg-transparent border-none outline-none w-full text-sm font-medium"
            value={inboxSearch}
            onChange={(e) => setInboxSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setIsSelectMode(!isSelectMode)}
             className={`p-2.5 rounded-xl border transition-all select-toggle-btn ${
               isSelectMode ? 'bg-prime-500 text-white border-prime-500 shadow-lg' : (isDarkMode ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-white border-black/10 text-gray-600')
             }`}
             title={t('select_threads')}
           >
             <Layers size={20} />
           </button>

           <div className="relative" ref={dateRef}>
             <button 
               onClick={() => setIsDateOpen(!isDateOpen)}
               className={`p-2.5 rounded-xl border transition-all ${
                 dateFilter !== 'all' ? 'bg-prime-500/10 text-prime-400 border-prime-500/30' : (isDarkMode ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-white border-black/10 text-gray-600')
               }`}
               title={t('date_filter')}
             >
               <Calendar size={20} />
             </button>
             {isDateOpen && (
               <div className={`absolute right-0 mt-2 w-48 rounded-2xl border shadow-2xl z-50 py-2 animate-in fade-in zoom-in duration-200 ${
                 isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-black/5'
               }`}>
                  {['all', 'today', 'this_week', 'this_month', 'custom_range'].map((d) => (
                    <button 
                      key={d}
                      onClick={() => { setDateFilter(d); setIsDateOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${
                        dateFilter === d ? 'text-prime-400 bg-prime-500/10' : (isDarkMode ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-50 text-gray-600')
                      }`}
                    >
                      {t(d)}
                    </button>
                  ))}
               </div>
             )}
           </div>
        </div>
      </div>

      {isSelectMode && (
        <div ref={bulkRef} className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-prime-500 text-white shadow-2xl shadow-prime-500/30 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase tracking-widest">{selectedConvoIds.size}</span>
          </div>
          <div className="flex gap-1">
            <button 
              onClick={() => handleBulkAction('all')} 
              className="p-2 hover:bg-white/20 rounded-lg transition-all" 
              title={t('select_all')}
            >
              <PlusSquare size={18} />
            </button>
            <div className="w-px h-4 bg-white/20 mx-1 self-center" />
            <button 
              onClick={() => handleBulkAction('mark_read')} 
              className="p-2 hover:bg-white/20 rounded-lg transition-all" 
              title={t('mark_all_read')}
            >
              <CheckSquare size={18} />
            </button>
            <button 
              onClick={() => handleBulkAction('mark_priority')} 
              className="p-2 hover:bg-white/20 rounded-lg transition-all" 
              title={t('mark_priority')}
            >
              <Star size={18} />
            </button>
            <button 
              onClick={() => handleBulkAction('delete')} 
              className="p-2 hover:bg-white/20 rounded-lg transition-all" 
              title={t('reject')}
            >
              <Trash2 size={18} />
            </button>
            <div className="w-px h-4 bg-white/20 mx-1 self-center" />
            <button 
              onClick={() => setIsSelectMode(false)} 
              className="p-2 hover:bg-white/20 rounded-lg transition-all" 
              title={t('cancel')}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {['all', 'unread', 'read', 'priority', 'ad_replies', 'follow_up'].map(filter => (
          <button
            key={filter}
            onClick={() => setInboxFilter(filter)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              inboxFilter === filter 
                ? 'bg-prime-500 text-white shadow-lg shadow-prime-500/20' 
                : (isDarkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
            }`}
          >
            {t(filter)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default InboxFilterBar;
