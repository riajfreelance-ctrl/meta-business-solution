import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, AlertCircle, Bookmark, Star, ChevronDown, Zap, Plus, ChevronRight, Package, XCircle, MessageSquare, ShoppingBag, CornerUpLeft, Edit2, Trash2, Forward, Layers } from 'lucide-react';
import CannedResponsePanel from './CannedResponsePanel';

const ChatWindow = ({ 
  isDarkMode, t, selectedConvo, chatMessages, handleSuggestReply, handleSendMessage, 
  isAiThinking, isSending, messageInput, setMessageInput, attachedFiles, 
  optimisticMessages = [], replyTo, setReplyTo, editingMessage, startEditMessage,
  handleDeleteMessage, cancelInteractions, onForward, drafts = [], setLightbox,
  setAttachedFiles, handleFileChange, togglePriority, toggleFollowUp,
  isSyncingHistory, syncHistory, chatEndRef, onScroll, showScrollButton, scrollToBottom,
  onOpenOrderDrafting, onOpenCatalogShare, onBack,
  brandId
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
          <div className={`p-4 md:p-6 border-b flex items-center justify-between sticky top-0 z-30 transition-all duration-500 ${
            isDarkMode ? 'bg-[#020617]/40 border-white/5 backdrop-blur-3xl shadow-2xl' : 'bg-white/60 border-black/5 backdrop-blur-3xl shadow-lg'
          }`}>
            <div className="flex items-center gap-4">
              {onBack && (
                <button onClick={onBack} className="lg:hidden p-2.5 rounded-2xl text-gray-400 hover:bg-white/5 transition-all">
                  <ChevronLeft size={24} />
                </button>
              )}
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-prime-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-prime-500/20">
                  {selectedConvo.customerName?.[0]}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#020617] animate-pulse"></div>
              </div>
              <div>
                <h4 className={`font-black text-lg tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedConvo.customerName}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${
                    selectedConvo.platform === 'instagram' ? 'bg-pink-500/10 text-pink-500 border-pink-500/10' :
                    selectedConvo.platform === 'whatsapp' ? 'bg-green-500/10 text-green-500 border-green-500/10' :
                    'bg-blue-500/10 text-blue-500 border-blue-500/10'
                  }`}>
                    {selectedConvo.platform === 'instagram' ? <Instagram size={10} strokeWidth={3} /> :
                     selectedConvo.platform === 'whatsapp' ? <MessageCircle size={10} strokeWidth={3} /> :
                     <Facebook size={10} fill="currentColor" strokeWidth={0} />}
                    {selectedConvo.platform === 'instagram' ? 'Instagram' : selectedConvo.platform === 'whatsapp' ? 'WhatsApp' : 'Messenger'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => syncHistory(selectedConvo.id)} 
                disabled={isSyncingHistory} 
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${
                  isSyncingHistory ? 'opacity-50 cursor-not-allowed' : 'text-prime-400 hover:bg-prime-500/10 border border-prime-500/5 hover:border-prime-500/20'
                }`}
              >
                <RotateCcw size={14} className={isSyncingHistory ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh Logic</span>
              </button>

              <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/5">
                <button onClick={onOpenOrderDrafting} className="p-2.5 rounded-xl transition-all text-prime-400 hover:bg-prime-500/10" title="Draft Order">
                  <ShoppingBag size={20} />
                </button>
                <button onClick={onOpenCatalogShare} className="p-2.5 rounded-xl transition-all text-amber-500 hover:bg-amber-500/10" title="Catalog Manager">
                  <Package size={20} />
                </button>
              </div>

              <div className="flex items-center gap-1 ml-2">
                <button onClick={() => toggleFollowUp(selectedConvo.id)} className={`p-2.5 rounded-xl transition-all ${selectedConvo.isFollowUp ? 'bg-prime-500/10 text-prime-400 shadow-[0_0_15px_rgba(14,165,233,0.1)]' : 'text-gray-500 hover:text-white'}`}>
                  <Bookmark size={20} className={selectedConvo.isFollowUp ? 'fill-prime-500' : ''} />
                </button>
                <button onClick={() => togglePriority(selectedConvo.id)} className={`p-2.5 rounded-xl transition-all ${selectedConvo.isPriority ? 'bg-amber-500/10 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'text-gray-500 hover:text-white'}`}>
                  <Star size={20} className={selectedConvo.isPriority ? 'fill-amber-500' : ''} />
                </button>
              </div>
            </div>
          </div>

          <div className={`flex-1 p-6 overflow-y-auto space-y-4 relative scrollbar-thin scrollbar-track-transparent ${isDarkMode ? 'scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20' : 'scrollbar-thumb-black/10 hover:scrollbar-thumb-black/20'}`} onScroll={onScroll}>
            {isSyncingHistory && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-prime-500/90 text-white text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                {t('syncing_history')}
              </div>
            )}

            {[...(chatMessages || []), ...optimisticMessages].filter(Boolean).map((msg, i) => {
              const isSent = msg.type === 'sent';
              return (
                <div
                  key={msg.id || i}
                  className={`group flex flex-col gap-1.5 ${isSent ? 'items-end' : 'items-start max-w-[85%] sm:max-w-[70%]'}`}
                >
                  {!msg.isDeleted && !msg.isOptimistic && (
                    <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 mb-0.5 ${isSent ? 'flex-row-reverse' : ''}`}>
                      <button onClick={() => setReplyTo && setReplyTo(msg)} className="p-1.5 rounded-xl hover:bg-white/5 text-gray-500 hover:text-prime-400">
                        <CornerUpLeft size={14} />
                      </button>
                      {isSent && (
                        <>
                          <button onClick={() => startEditMessage && startEditMessage(msg)} className="p-1.5 rounded-xl hover:bg-white/5 text-gray-500 hover:text-amber-400">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDeleteMessage && handleDeleteMessage(msg.id)} className="p-1.5 rounded-xl hover:bg-white/5 text-gray-500 hover:text-red-400">
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  <div className={`relative px-5 py-4 rounded-[2rem] text-sm leading-relaxed transition-all duration-500 group-hover:shadow-2xl ${
                    msg.isDeleted ? 'opacity-30 border border-dashed border-gray-600' :
                    isSent
                      ? 'bg-gradient-to-br from-prime-500 via-prime-600 to-indigo-600 text-white shadow-xl shadow-prime-500/10 border border-white/10'
                      : (isDarkMode 
                          ? 'bg-white/5 text-gray-100 border border-white/5 backdrop-blur-xl hover:bg-white/10' 
                          : 'bg-white text-gray-800 border border-black/5 shadow-sm hover:shadow-md')
                  } ${msg.isOptimistic ? 'opacity-50 animate-pulse' : ''} ${
                    isSent ? 'rounded-tr-lg' : 'rounded-tl-lg'
                  }`}>
                    {msg.replyTo && (
                      <div className="mb-3 p-3 rounded-2xl bg-black/20 border-l-4 border-prime-500 flex flex-col gap-0.5 opacity-80 backdrop-blur-md">
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Reference Logic</span>
                        <span className="text-[10px] font-bold truncate italic leading-tight">{msg.replyTo.text || 'Embedded Content'}</span>
                      </div>
                    )}

                    {msg.isDeleted ? (
                      <div className="flex items-center gap-2 italic text-xs"><XCircle size={14} className="opacity-50" /> Message Transmission Cancelled</div>
                    ) : msg.productCard ? (
                      <ProductCard product={msg.productCard} />
                    ) : (
                      <div className="font-medium whitespace-pre-wrap">{msg.text || msg.message}</div>
                    )}

                    {msg.attachments?.filter(Boolean).length > 0 && (
                      <div className={`mt-3 rounded-2xl overflow-hidden border border-white/5 bg-black/20 ${
                        msg.attachments.length === 1 ? 'max-w-[300px]' : 'grid grid-cols-2 gap-1 w-[260px]'
                      }`}>
                        {msg.attachments.slice(0, 4).map((att, attIdx, arr) => {
                          const imgUrl = typeof att === 'string' ? att : (att.payload?.url || att.url);
                          return (
                            <img
                              key={attIdx}
                              src={imgUrl}
                              alt="Inbound Asset"
                              className="w-full h-full object-cover cursor-zoom-in hover:brightness-110 transition-all origin-center"
                              onClick={() => setLightbox && setLightbox({ isOpen: true, images: arr, index: attIdx, zoom: 1 })}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-20 px-2">{msg.time || 'Sending...'}</span>
                </div>
              );
            })}

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
                    <p className="text-xs truncate max-w-[300px] opacity-70 ">{editingMessage?.text || replyTo?.text || 'Image'}</p>
                  </div>
                </div>
                <button onClick={cancelInteractions} className="relative z-10 p-2 hover:bg-white/10 rounded-full transition-all shrink-0"><XCircle size={18} /></button>
              </div>
            )}

            {showMacros && filteredMacros.length > 0 && (
              <div ref={macroMenuRef} className={`absolute bottom-[calc(100%+12px)] left-4 right-4 rounded-[2.5rem] border backdrop-blur-3xl shadow-[0_32px_80px_rgba(0,0,0,0.8)] z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out border-white/10 ${
                isDarkMode ? 'bg-[#0f172a]/95' : 'bg-white/95 border-black/5'
              }`}>
                <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-prime-500 animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-prime-400">Speed Type Execution</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest border border-white/10 rounded-lg bg-black/20 opacity-40">Nav ↑↓</span>
                    <span className="px-2 py-1 text-[8px] font-black uppercase tracking-widest border border-white/10 rounded-lg bg-black/20 opacity-40">Execute ↵</span>
                  </div>
                </div>
                <div className="max-h-[280px] overflow-y-auto scrollbar-thin">
                  {filteredMacros.map((macro, idx) => {
                    const isSelected = selectedMacroIdx === idx;
                    return (
                      <button 
                        key={macro.id || idx} 
                        onClick={() => selectMacro(macro)} 
                        onMouseEnter={() => setSelectedMacroIdx(idx)} 
                        className={`w-full text-left px-6 py-4 flex items-center gap-5 transition-all duration-300 relative group/macro ${
                          isSelected ? 'bg-prime-500/10' : 'hover:bg-white/5 opacity-60'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute left-0 top-3 bottom-3 w-1 bg-prime-500 rounded-r-full shadow-[0_0_15px_rgba(14,165,233,1)]" />
                        )}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm border transition-all ${
                          isSelected ? 'bg-prime-500 border-prime-400 shadow-[0_0_20px_rgba(14,165,233,0.3)] text-white' : 'bg-white/5 border-white/5 text-gray-500'
                        }`}>
                          /{macro.keyword?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[11px] font-black uppercase tracking-widest mb-1 ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                            {macro.keyword}
                          </p>
                          <p className={`text-xs truncate font-medium ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                            {macro.result}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="px-3 py-1 rounded-lg border border-prime-500/30 text-[8px] font-black text-prime-400 uppercase tracking-widest animate-pulse">
                            Ready
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
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

              <div className={`flex items-end gap-3 p-3 rounded-[2rem] border transition-all duration-500 shadow-inner ${
                isDarkMode ? 'bg-black/40 border-white/10 focus-within:border-prime-500/50 focus-within:shadow-[0_0_20px_rgba(14,165,233,0.05)]' : 'bg-gray-100 border-black/5 focus-within:border-prime-500/50'
              }`}>
                <label className="p-2.5 cursor-pointer hover:bg-prime-500/10 rounded-xl transition-all text-gray-500 hover:text-prime-400">
                  <Plus size={20} strokeWidth={3} />
                  <input type="file" multiple className="hidden" onChange={handleFileChange} />
                </label>
                <div className="mb-0.5">
                  <CannedResponsePanel
                    drafts={drafts}
                    isDarkMode={isDarkMode}
                    brandId={brandId}
                    onSelect={(draft) => {
                      setMessageInput((prev) => (prev ? prev + ' ' + draft.result : draft.result));
                    }}
                  />
                </div>
                <textarea
                  value={messageInput}
                  onChange={handleInputChange}
                  placeholder="Type '/' for macros or message..."
                  rows={Math.max(1, Math.min(messageInput.split('\n').length, 8))}
                  className="flex-1 bg-transparent border-none outline-none px-2 py-3 text-[13px] font-medium resize-none placeholder:text-gray-600 dark:text-gray-100"
                  onKeyDown={handleKeyDown}
                />
                <button
                  onClick={() => handleSendMessage(attachedFiles, setAttachedFiles)}
                  disabled={isSending || (!messageInput.trim() && attachedFiles.length === 0)}
                  className={`p-3 mb-0.5 rounded-2xl transition-all duration-500 shadow-xl ${
                    isSending || (!messageInput.trim() && attachedFiles.length === 0)
                      ? 'bg-gray-800 text-gray-600 opacity-50 cursor-not-allowed' 
                      : 'bg-gradient-to-br from-prime-500 to-indigo-600 text-white hover:scale-105 active:scale-95 shadow-prime-500/20'
                  }`}
                >
                  {isSending ? <RotateCcw size={20} className="animate-spin" /> : <ChevronRight size={20} strokeWidth={3} />}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center p-10">
          <MessageSquare size={48} className="mb-4" />
          <p className="text-sm  tracking-wide">{t('welcome')}</p>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
