import React from 'react';
import { RotateCcw, AlertCircle, Bookmark, Star, ChevronDown, Zap, Plus, ChevronRight, Package, XCircle, MessageSquare, ShoppingBag } from 'lucide-react';

const ChatWindow = ({ 
  isDarkMode, t, selectedConvo, chatMessages, handleSuggestReply, handleSendMessage, 
  isAiThinking, messageInput, setMessageInput, attachedFiles, 
  setAttachedFiles, handleFileChange, togglePriority, toggleFollowUp,
  isSyncingHistory, syncHistory, chatEndRef, onScroll, showScrollButton, scrollToBottom,
  onOpenOrderDrafting, onOpenCatalogShare
}) => (
  <div className={`flex-1 flex flex-col overflow-hidden relative glass transition-all duration-700 ${
    isDarkMode ? 'bg-[#020617]/20' : 'bg-gray-50/50'
  }`}>
    {selectedConvo ? (
      <>
         <div className={`p-4 border-b flex items-center justify-between backdrop-blur-3xl sticky top-0 z-20 ${
           isDarkMode ? 'bg-[#020617]/40 border-white/10' : 'bg-white/60 border-black/5'
         }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-prime-500/20 flex items-center justify-center text-prime-500 font-bold">
              {selectedConvo.customerName?.[0]}
            </div>
            <div>
              <p className="font-bold text-sm">{selectedConvo.customerName}</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                <span className="text-[10px] opacity-50 uppercase tracking-widest font-bold">Messenger</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => syncHistory(selectedConvo.id)}
              disabled={isSyncingHistory}
              className={`p-2 rounded-xl transition-all flex items-center gap-2 ${
                isSyncingHistory ? 'opacity-50 cursor-not-allowed' : 'text-prime-500 hover:bg-prime-500/10'
              }`}
              title="Sync All History from FB"
            >
              <RotateCcw size={18} className={isSyncingHistory ? 'animate-spin' : ''} />
              <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Sync History</span>
            </button>
            {selectedConvo.isAdReply && (
              <div className={`px-2 py-1 rounded-lg flex items-center gap-1.5 border transition-all mr-2 ${
                isDarkMode ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-blue-50 border-blue-500/20 text-blue-600'
              }`}>
                <AlertCircle size={12} />
                <span className="text-[10px] font-black uppercase tracking-tight">{t('ad_source')}</span>
              </div>
            )}
            <button 
              onClick={onOpenOrderDrafting}
              className={`p-2 rounded-xl transition-all flex items-center gap-2 ${
                isDarkMode ? 'bg-prime-500/10 text-prime-400 hover:bg-prime-500/20' : 'bg-prime-50 text-prime-600 hover:bg-prime-100'
              }`}
              title="Draft Order"
            >
              <ShoppingBag size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Draft Order</span>
            </button>
            <button 
              onClick={onOpenCatalogShare}
              className={`p-2 rounded-xl transition-all flex items-center gap-2 ${
                isDarkMode ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
              }`}
              title="Share Catalog"
            >
              <Package size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Catalog</span>
            </button>
            <button 
              onClick={() => toggleFollowUp(selectedConvo.id)}
              className={`p-2 rounded-xl transition-all ${
                selectedConvo.isFollowUp ? 'bg-prime-500/10 text-prime-500' : 'text-gray-400 hover:bg-white/5'
              }`}
              title={selectedConvo.isFollowUp ? t('unfollowup') : t('mark_followup')}
            >
              <Bookmark size={20} className={selectedConvo.isFollowUp ? 'fill-prime-500' : ''} />
            </button>
            <button 
              onClick={() => togglePriority(selectedConvo.id)}
              className={`p-2 rounded-xl transition-all ${
                selectedConvo.isPriority ? 'bg-amber-500/10 text-amber-500' : 'text-gray-400 hover:bg-white/5'
              }`}
              title={selectedConvo.isPriority ? t('unstar') : t('mark_priority')}
            >
              <Star size={20} className={selectedConvo.isPriority ? 'fill-amber-500' : ''} />
            </button>
          </div>
        </div>
        <div 
          className="flex-1 p-6 overflow-y-auto space-y-4 relative scroll-smooth"
          onScroll={onScroll}
        >
           {isSyncingHistory && (
             <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-prime-500/90 text-white text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 animate-in slide-in-from-top-2">
               <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
               {t('syncing_history')}
             </div>
           )}
           {chatMessages?.map((msg, i) => (
             <div key={i} className={`flex flex-col gap-1 ${msg.type === 'sent' ? 'items-end' : 'max-w-[80%]'}`}>
                 <div className={`p-4 rounded-3xl text-sm transition-all duration-500 hover:shadow-xl ${
                   msg.type === 'sent' 
                     ? (isDarkMode ? 'bg-gradient-to-br from-prime-600 to-purple-700 text-white shadow-lg shadow-prime-500/10' : 'bg-prime-600 text-white shadow-lg shadow-prime-500/20')
                     : (isDarkMode ? 'bg-white/10 text-white border border-white/5 backdrop-blur-md' : 'bg-white text-gray-900 border border-black/5 shadow-sm')
                 }`}>
                  {msg.text}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.attachments.map((att, attIdx) => (
                            att.type === 'image' ? (
                              <img 
                                key={attIdx} 
                                src={att.payload?.url} 
                                alt="Attachment" 
                                className="rounded-xl max-w-full h-auto cursor-pointer border border-white/10"
                                onClick={() => window.open(att.payload?.url, '_blank')}
                              />
                            ) : (
                              <div key={attIdx} className="flex items-center gap-2 p-2 rounded-lg bg-black/20 text-[10px] uppercase font-black">
                                <Package size={12} />
                                {att.type}
                              </div>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] opacity-30 ml-2">{msg.time || '...'}</span>
                 </div>
               ))}
               <div ref={chatEndRef} />
               {showScrollButton && (
                 <button 
                   onClick={scrollToBottom}
                   className="fixed bottom-32 right-8 p-3 rounded-full bg-prime-500 text-white shadow-2xl hover:scale-110 transition-all z-20 animate-in fade-in zoom-in"
                 >
                   <ChevronDown size={24} />
                 </button>
               )}
               <div className="text-center py-10 opacity-10 italic text-[10px] uppercase tracking-widest">{t('welcome')}</div>
            </div>
        <div className={`p-4 border-t ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
          <div className="relative group/input">
            <div className={`absolute -top-14 left-0 w-full flex justify-center transition-all pb-14 ${isAiThinking ? 'opacity-100 pointer-events-auto' : 'opacity-0 group-hover/input:opacity-100 pointer-events-none group-hover/input:pointer-events-auto'}`}>
              <button 
                onClick={handleSuggestReply}
                disabled={isAiThinking}
                className="bg-prime-500 text-white text-xs px-6 py-2 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 border border-white/20 select-none"
              >
                <Zap size={14} className={isAiThinking ? 'animate-pulse' : ''} />
                {isAiThinking ? 'Thinking...' : t('suggest_reply')}
              </button>
            </div>
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 px-4 py-2 border-b border-white/5 bg-prime-500/5 animate-in slide-in-from-bottom-2">
                {attachedFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 bg-prime-500/10 px-3 py-1 rounded-full text-[10px] font-bold text-prime-400 border border-prime-500/20">
                    <Package size={12} />
                    <span className="truncate max-w-[100px]">{file.name}</span>
                    <button onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-red-400 transition-colors">
                      <XCircle size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className={`flex items-end gap-3 p-2 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 focus-within:border-prime-500/50' : 'bg-gray-100 border-black/5 focus-within:border-prime-500/50'}`}>
              <div className="flex items-center">
                <label className={`p-2 rounded-xl cursor-pointer hover:bg-prime-500/10 transition-all ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Plus size={20} />
                  <input 
                    type="file" 
                    multiple 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <textarea 
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                rows={Math.max(1, Math.min(messageInput.split('\n').length, 8))}
                className="flex-1 bg-transparent border-none outline-none px-2 py-3 text-sm resize-none overflow-y-auto min-h-[50px] leading-relaxed"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button 
                onClick={handleSendMessage}
                className="p-2 mb-0.5 rounded-xl bg-prime-500 text-white hover:bg-prime-600 transition-all font-bold"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </>
    ) : (
      <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center p-10">
        <MessageSquare size={48} className="mb-4" />
        <p className="text-sm italic tracking-wide">{t('welcome')}</p>
      </div>
    )}
  </div>
);

export default ChatWindow;
