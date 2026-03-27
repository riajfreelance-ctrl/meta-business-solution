import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, AlertCircle, Bookmark, Star, ChevronDown, Zap, Plus, ChevronRight, Package, XCircle, MessageSquare, ShoppingBag, CornerUpLeft, Edit2, Trash2, Forward, Layers } from 'lucide-react';

const ChatWindow = ({ 
  isDarkMode, t, selectedConvo, chatMessages, handleSuggestReply, handleSendMessage, 
  isAiThinking, isSending, messageInput, setMessageInput, attachedFiles, 
  optimisticMessages = [], replyTo, setReplyTo, editingMessage, startEditMessage,
  handleDeleteMessage, cancelInteractions, onForward, drafts = [], setLightbox,
  setAttachedFiles, handleFileChange, togglePriority, toggleFollowUp,
  isSyncingHistory, syncHistory, chatEndRef, onScroll, showScrollButton, scrollToBottom,
  onOpenOrderDrafting, onOpenCatalogShare, onBack
}) => {
  const [contextMenu, setContextMenu] = useState(null);
  const [showMacros, setShowMacros] = useState(false);
  const [macroSearch, setMacroSearch] = useState('');
  const [selectedMacroIdx, setSelectedMacroIdx] = useState(0);
  const longPressTimer = useRef(null);
  const touchStartX = useRef(null);
  const macroMenuRef = useRef(null);

  const phoneticize = (str) => {
    if (!str) return '';
    const map = {
      'ক': 'k', 'খ': 'k', 'গ': 'g', 'ঘ': 'g', 'চ': 'c', 'ছ': 'c', 'জ': 'j', 'ঝ': 'j',
      'ট': 't', 'ঠ': 't', 'ড': 'd', 'ঢ': 'd', 'ত': 't', 'থ': 't', 'দ': 'd', 'ধ': 'd',
      'ন': 'n', 'ণ': 'n', 'প': 'p', 'ফ': 'p', 'ব': 'b', 'ভ': 'b', 'ম': 'm',
      'য': 'j', 'র': 'r', 'ল': 'l', 'শ': 's', 'ষ': 's', 'স': 's', 'হ': 'h',
      'ড়': 'r', 'ঢ়': 'r', 'য়': 'y'
    };
    return str.toLowerCase().split('').map(c => map[c] || c).join('')
      .replace(/[aeiouািীুূৃেৈোৌ্]/g, '')
      .replace(/ss/g, 's').replace(/kk/g, 'k');
  };

  const filteredMacros = drafts
    .filter(d => d.status === 'approved' || !d.status)
    .filter(d => {
      const s = macroSearch.toLowerCase();
      const searchSig = phoneticize(s);
      
      const keyword = d.keyword?.toLowerCase() || '';
      const result = d.result?.toLowerCase() || '';
      
      // Direct Match
      if (keyword.includes(s) || result.includes(s)) return true;
      
      // Phonetic Match (Sound-based)
      if (searchSig.length > 1) {
        if (phoneticize(keyword).includes(searchSig)) return true;
        if (phoneticize(result).includes(searchSig)) return true;
      }
      
      return false;
    })
    .slice(0, 8);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setMessageInput(val);
    const lastWord = val.split(' ').pop();
    if (lastWord.startsWith('/')) {
      setShowMacros(true);
      setMacroSearch(lastWord.substring(1));
      setSelectedMacroIdx(0);
    } else {
      setShowMacros(false);
    }
  };

  const selectMacro = (macro) => {
    const words = messageInput.split(' ');
    words[words.length - 1] = '';
    setMessageInput((words.join(' ') + ' ' + macro.result).trim());
    setShowMacros(false);
  };

  const handleKeyDown = (e) => {
    if (showMacros && filteredMacros.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedMacroIdx(p => (p + 1) % filteredMacros.length); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedMacroIdx(p => (p - 1 + filteredMacros.length) % filteredMacros.length); }
      else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); selectMacro(filteredMacros[selectedMacroIdx]); }
      else if (e.key === 'Escape') setShowMacros(false);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(attachedFiles, setAttachedFiles);
    }
  };

  useEffect(() => {
    const close = (event) => {
      if (macroMenuRef.current && !macroMenuRef.current.contains(event.target)) setShowMacros(false);
      setContextMenu(null);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY, msg });
  };

  const handleTouchStart = (e, msg) => {
    touchStartX.current = e.touches[0].pageX;
    longPressTimer.current = setTimeout(() => {
      setContextMenu({ x: e.touches[0].pageX, y: e.touches[0].pageY, msg });
    }, 600);
  };

  const handleTouchEnd = (e, msg) => {
    clearTimeout(longPressTimer.current);
    if (touchStartX.current !== null) {
      const deltaX = e.changedTouches[0].pageX - touchStartX.current;
      if (deltaX > 60) {
        setReplyTo && setReplyTo(msg);
        if (window.navigator.vibrate) window.navigator.vibrate(10);
      }
    }
    touchStartX.current = null;
  };

  // Rich Product Card
  const ProductCard = ({ product }) => (
    <div className={`w-[280px] rounded-2xl overflow-hidden border shadow-xl ${isDarkMode ? 'bg-[#0f172a] border-white/10' : 'bg-white border-black/5'}`}>
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800'}
          className="w-full h-full object-cover"
          alt={product.name}
        />
        <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/40 backdrop-blur text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
          <Layers size={10} /> 2 Photos
        </div>
        <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-amber-500/80 text-white text-[9px] font-black uppercase tracking-wider">
          Low Stock
        </div>
      </div>
      <div className="p-4 space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-prime-500 opacity-70">{product.category || 'Skincare'}</p>
        <h4 className={`font-black text-base leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{product.name}</h4>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-prime-500">{product.offerPrice || product.price} BDT</span>
          {product.offerPrice && <span className={`text-sm line-through opacity-40 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{product.price} BDT</span>}
        </div>
        <div className={`h-1 w-full rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
          <div className="h-1 w-1/4 rounded-full bg-amber-500"></div>
        </div>
        <div className={`flex items-center gap-2 p-2 rounded-xl text-[9px] font-black uppercase tracking-wider opacity-60 ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          AI Marketing Context Active
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex-1 flex flex-col overflow-hidden relative glass transition-all duration-700 ${isDarkMode ? 'bg-[#020617]/20' : 'bg-gray-50/50'}`}>
      {selectedConvo ? (
        <>
          <div className={`p-4 border-b flex items-center justify-between backdrop-blur-3xl sticky top-0 z-20 ${isDarkMode ? 'bg-[#020617]/40 border-white/10' : 'bg-white/60 border-black/5'}`}>
            <div className="flex items-center gap-3">
              {onBack && (
                <button onClick={onBack} className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-500/10">
                  <ChevronRight size={24} className="rotate-180" />
                </button>
              )}
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
              <button onClick={() => syncHistory(selectedConvo.id)} disabled={isSyncingHistory} className={`p-2 rounded-xl transition-all flex items-center gap-2 ${isSyncingHistory ? 'opacity-50 cursor-not-allowed' : 'text-prime-500 hover:bg-prime-500/10'}`} title="Sync History">
                <RotateCcw size={18} className={isSyncingHistory ? 'animate-spin' : ''} />
                <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Sync</span>
              </button>
              {selectedConvo.isAdReply && (
                <div className={`px-2 py-1 rounded-lg flex items-center gap-1.5 border ${isDarkMode ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-blue-50 border-blue-500/20 text-blue-600'}`}>
                  <AlertCircle size={12} />
                  <span className="text-[10px] font-black uppercase">{t('ad_source')}</span>
                </div>
              )}
              <button onClick={onOpenOrderDrafting} className={`p-2 rounded-xl transition-all flex items-center gap-2 ${isDarkMode ? 'bg-prime-500/10 text-prime-400 hover:bg-prime-500/20' : 'bg-prime-50 text-prime-600 hover:bg-prime-100'}`}>
                <ShoppingBag size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Draft Order</span>
              </button>
              <button onClick={onOpenCatalogShare} className={`p-2 rounded-xl transition-all flex items-center gap-2 ${isDarkMode ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>
                <Package size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Catalog</span>
              </button>
              <button onClick={() => toggleFollowUp(selectedConvo.id)} className={`p-2 rounded-xl transition-all ${selectedConvo.isFollowUp ? 'bg-prime-500/10 text-prime-500' : 'text-gray-400 hover:bg-white/5'}`}>
                <Bookmark size={20} className={selectedConvo.isFollowUp ? 'fill-prime-500' : ''} />
              </button>
              <button onClick={() => togglePriority(selectedConvo.id)} className={`p-2 rounded-xl transition-all ${selectedConvo.isPriority ? 'bg-amber-500/10 text-amber-500' : 'text-gray-400 hover:bg-white/5'}`}>
                <Star size={20} className={selectedConvo.isPriority ? 'fill-amber-500' : ''} />
              </button>
            </div>
          </div>

          <div className={`flex-1 p-6 overflow-y-auto space-y-4 relative scrollbar-thin scrollbar-track-transparent ${isDarkMode ? 'scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20' : 'scrollbar-thumb-black/10 hover:scrollbar-thumb-black/20'}`} onScroll={onScroll}>
            {isSyncingHistory && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-prime-500/90 text-white text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                {t('syncing_history')}
              </div>
            )}

            {[...(chatMessages || []), ...optimisticMessages].filter(Boolean).map((msg, i) => (
              <div
                key={msg.id || i}
                className={`group flex flex-col gap-1 ${msg.type === 'sent' ? 'items-end' : 'items-start max-w-[80%]'}`}
                onDoubleClick={() => !msg.isOptimistic && !msg.isDeleted && setReplyTo && setReplyTo(msg)}
                onContextMenu={(e) => !msg.isOptimistic && !msg.isDeleted && handleContextMenu(e, msg)}
                onTouchStart={(e) => !msg.isOptimistic && !msg.isDeleted && handleTouchStart(e, msg)}
                onTouchEnd={(e) => !msg.isOptimistic && !msg.isDeleted && handleTouchEnd(e, msg)}
              >
                {!msg.isDeleted && !msg.isOptimistic && (
                  <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mb-0.5 ${msg.type === 'sent' ? 'flex-row-reverse' : ''}`}>
                    {handleDeleteMessage && msg.type === 'sent' && (
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.id); }} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-red-400">
                        <Trash2 size={14} />
                      </button>
                    )}
                    {msg.type === 'sent' && startEditMessage && (
                      <button onClick={(e) => { e.stopPropagation(); startEditMessage(msg); }} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-amber-400">
                        <Edit2 size={14} />
                      </button>
                    )}
                    {onForward && (
                      <button onClick={(e) => { e.stopPropagation(); onForward(msg); }} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-blue-400">
                        <Forward size={14} />
                      </button>
                    )}
                    {setReplyTo && (
                      <button onClick={(e) => { e.stopPropagation(); setReplyTo(msg); }} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-prime-400">
                        <CornerUpLeft size={14} />
                      </button>
                    )}
                  </div>
                )}
                <div className={`p-4 rounded-[1.8rem] text-sm transition-all duration-300 hover:shadow-2xl relative group/bubble ${
                  msg.isDeleted ? 'italic opacity-40 border border-dashed border-gray-500' :
                  msg.type === 'sent'
                    ? (isDarkMode 
                        ? 'bg-gradient-to-br from-prime-500 via-prime-600 to-indigo-600 text-white shadow-lg shadow-prime-500/20' 
                        : 'bg-gradient-to-br from-prime-600 to-prime-700 text-white shadow-lg')
                    : (isDarkMode 
                        ? 'bg-white/[0.03] text-white border border-white/10 backdrop-blur-xl hover:bg-white/[0.06]' 
                        : 'bg-white text-gray-900 border border-black/5 shadow-sm hover:shadow-md')
                } ${msg.isOptimistic ? 'opacity-60 scale-[0.98]' : ''}`}>
                  {msg.replyTo && (
                    <div className="mb-3 p-3 rounded-2xl bg-black/20 border-l-4 border-prime-400 text-[10px] opacity-80 backdrop-blur-md italic flex flex-col gap-1">
                      <span className="font-black uppercase tracking-widest opacity-40 text-[8px]">Replying to</span>
                      <span className="truncate">{msg.replyTo.text || 'Image Attachment'}</span>
                    </div>
                  )}
                  {msg.isDeleted ? (
                    <div className="flex items-center gap-2"><XCircle size={14} /> Unsent message</div>
                  ) : msg.productCard ? (
                    <ProductCard product={msg.productCard} />
                  ) : (
                    <>
                      {msg.text || msg.message}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className={`mt-3 rounded-2xl overflow-hidden border border-white/10 bg-black/5 ${
                          msg.attachments.filter(Boolean).filter(a => a?.type === 'image' || typeof a === 'string').length === 1 ? 'max-w-[260px]' : 'grid grid-cols-2 gap-0.5 w-[260px]'
                        }`}>
                          {msg.attachments.filter(Boolean).filter(a => a?.type === 'image' || typeof a === 'string').slice(0, 4).map((att, attIdx, arr) => {
                            const imgUrl = typeof att === 'string' ? att : (att.payload?.url || att.url);
                            return (
                              <div key={attIdx} className="relative overflow-hidden aspect-square">
                                <img
                                  src={imgUrl}
                                  alt="Attachment"
                                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-all"
                                  onClick={() => setLightbox && setLightbox({ isOpen: true, images: arr, index: attIdx, zoom: 1 })}
                                />
                                {attIdx === 3 && arr.length > 4 && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-black text-lg cursor-pointer">
                                    +{arr.length - 3}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <span className="text-[10px] opacity-30 ml-2">{msg.time || '...'}</span>
              </div>
            ))}

            <div ref={chatEndRef} />
            {showScrollButton && (
              <button onClick={scrollToBottom} className="fixed bottom-32 right-8 p-3 rounded-full bg-prime-500 text-white shadow-2xl hover:scale-110 transition-all z-20">
                <ChevronDown size={24} />
              </button>
            )}
          </div>

          {/* Context Menu */}
          {contextMenu && (
            <div
              className={`fixed z-50 rounded-2xl border shadow-2xl py-2 min-w-[160px] ${isDarkMode ? 'bg-zinc-900 border-white/10' : 'bg-white border-black/5'}`}
              style={{ top: contextMenu.y, left: contextMenu.x }}
            >
              {[
                { label: 'Reply', icon: <CornerUpLeft size={14}/>, action: () => setReplyTo && setReplyTo(contextMenu.msg) },
                { label: 'Forward', icon: <Forward size={14}/>, action: () => onForward && onForward(contextMenu.msg) },
                ...(contextMenu.msg.type === 'sent' ? [{ label: 'Edit', icon: <Edit2 size={14}/>, action: () => startEditMessage && startEditMessage(contextMenu.msg) }] : []),
                ...(contextMenu.msg.type === 'sent' ? [{ label: 'Unsend', icon: <Trash2 size={14}/>, action: () => {
                  if(handleDeleteMessage) handleDeleteMessage(contextMenu.msg.id);
                  setContextMenu(null);
                }, className: 'text-red-500' }] : []),
              ].map(item => (
                <button key={item.label} onClick={() => { item.action(); setContextMenu(null); }} className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-prime-500/10 transition-all text-sm font-bold ${item.className || ''}`}>
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          )}

          <div className={`p-4 border-t relative ${isDarkMode ? 'bg-[#020617]/60 border-white/10' : 'bg-white border-black/5'}`}>
            {(replyTo || editingMessage) && (
              <div className={`absolute bottom-full left-0 right-0 p-3 flex items-center justify-between border-t z-10 ${isDarkMode ? 'bg-zinc-900/95 border-white/10 text-white' : 'bg-gray-50/95 border-black/5 text-gray-900'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-8 rounded-full ${editingMessage ? 'bg-amber-500' : 'bg-prime-500'}`}></div>
                  <div>
                    <p className="text-[10px] font-black uppercase opacity-50">{editingMessage ? 'Editing' : `Replying to ${replyTo?.type === 'sent' ? 'You' : selectedConvo?.customerName}`}</p>
                    <p className="text-xs truncate max-w-[300px] opacity-70 italic">{editingMessage?.text || replyTo?.text || 'Image'}</p>
                  </div>
                </div>
                <button onClick={cancelInteractions} className="relative z-10 p-2 hover:bg-white/10 rounded-full transition-all shrink-0"><XCircle size={18} /></button>
              </div>
            )}

            {showMacros && filteredMacros.length > 0 && (
              <div ref={macroMenuRef} className={`absolute bottom-full left-4 right-4 mb-2 max-h-[240px] overflow-y-auto rounded-2xl border backdrop-blur-3xl shadow-2xl z-50 ${isDarkMode ? 'bg-[#1e1b4b]/90 border-white/10' : 'bg-white/95 border-black/5'}`}>
                {filteredMacros.map((macro, idx) => (
                  <button key={macro.id || idx} onClick={() => selectMacro(macro)} onMouseEnter={() => setSelectedMacroIdx(idx)} className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all text-sm ${selectedMacroIdx === idx ? 'bg-prime-500/20' : 'opacity-70'}`}>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider">{macro.keyword}</p>
                      <p className="text-xs truncate opacity-60">{macro.result}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="relative group/input">
              <div className={`absolute -top-14 left-0 w-full flex justify-center transition-all pb-14 ${isAiThinking ? 'opacity-100' : 'opacity-0 group-hover/input:opacity-100'}`}>
                <button onClick={handleSuggestReply} disabled={isAiThinking} className="bg-prime-500 text-white text-xs px-6 py-2 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 transition-all">
                  <Zap size={14} className={isAiThinking ? 'animate-pulse' : ''} />
                  {isAiThinking ? 'Thinking...' : t('suggest_reply')}
                </button>
              </div>

              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 px-4 py-2 border-b border-white/5 bg-prime-500/5">
                  {attachedFiles.map((file, i) => (
                    <div key={i} className="relative group/thumb">
                      <img src={URL.createObjectURL(file)} className="w-14 h-14 rounded-xl object-cover border-2 border-prime-500/20" alt="preview" />
                      <button onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                        <XCircle size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className={`flex items-end gap-3 p-2 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 focus-within:border-prime-500/50' : 'bg-gray-100 border-black/5 focus-within:border-prime-500/50'}`}>
                <label className="p-2 cursor-pointer hover:bg-prime-500/10 rounded-xl transition-all">
                  <Plus size={20} />
                  <input type="file" multiple className="hidden" onChange={handleFileChange} />
                </label>
                <textarea
                  value={messageInput}
                  onChange={handleInputChange}
                  placeholder="Type '/' for macros..."
                  rows={Math.max(1, Math.min(messageInput.split('\n').length, 8))}
                  className="flex-1 bg-transparent border-none outline-none px-2 py-3 text-sm resize-none"
                  onKeyDown={handleKeyDown}
                />
                <button
                  onClick={() => handleSendMessage(attachedFiles, setAttachedFiles)}
                  disabled={isSending}
                  className={`p-2 mb-0.5 rounded-xl text-white ${isSending ? 'bg-gray-500 opacity-50 cursor-not-allowed' : 'bg-prime-500 hover:bg-prime-600'}`}
                >
                  {isSending ? <RotateCcw size={18} className="animate-spin" /> : <ChevronRight size={18} />}
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
};

export default ChatWindow;
