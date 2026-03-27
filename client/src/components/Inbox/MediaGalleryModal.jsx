import React, { useState, useMemo } from 'react';
import { X, Image, Film, FileText, Download, ExternalLink, Search, Calendar } from 'lucide-react';

const MediaGalleryModal = ({ isOpen, onClose, isDarkMode, chatMessages = [], setLightbox }) => {
  const [activeTab, setActiveTab] = useState('all');
  
  const allMedia = useMemo(() => {
    return chatMessages
      .filter(Boolean)
      .filter(msg => !msg.isDeleted && msg.attachments && msg.attachments.length > 0)
      .flatMap(msg => msg.attachments.filter(Boolean).map(att => {
        const isString = typeof att === 'string';
        return {
          ...(isString ? {} : att),
          type: isString ? 'image' : (att?.type || 'image'),
          payload: isString ? { url: att } : att?.payload,
          msgId: msg.id,
          time: msg.time,
          sender: msg.type === 'sent' ? 'You' : 'Customer'
        };
      }));
  }, [chatMessages]);

  const filteredMedia = useMemo(() => {
    if (activeTab === 'all') return allMedia;
    return allMedia.filter(m => m.type === activeTab);
  }, [allMedia, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 bg-[#020617]/90 backdrop-blur-2xl"
        onClick={onClose}
      />
      
      <div className={`relative w-full max-w-6xl h-full max-h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col border shadow-2xl transition-all duration-500 scale-in-95 ${
        isDarkMode ? 'bg-[#0f172a]/80 border-white/10' : 'bg-white border-black/5'
      }`}>
        {/* Header */}
        <div className="p-8 pb-4 flex items-center justify-between border-b border-white/5">
          <div>
            <h2 className={`text-3xl font-black tracking-tighter mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Shared Media</h2>
            <p className="text-xs font-bold opacity-40 uppercase tracking-widest flex items-center gap-2">
              <Calendar size={12} /> {allMedia.length} files shared in this conversation
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`hidden md:flex items-center px-4 py-2 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-black/5'}`}>
              <Search size={16} className="opacity-40 mr-2" />
              <input 
                type="text" 
                placeholder="Search files..." 
                className="bg-transparent border-none outline-none text-sm font-bold w-40"
              />
            </div>
            <button 
              onClick={onClose}
              className={`p-4 rounded-full transition-all hover:scale-110 active:scale-95 ${
                isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/5 text-gray-900 hover:bg-black/10'
              }`}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 py-4 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'All Media', icon: <FileText size={16} /> },
            { id: 'image', label: 'Images', icon: <Image size={16} /> },
            { id: 'video', label: 'Videos', icon: <Film size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? 'bg-prime-500 text-white shadow-lg shadow-prime-500/30'
                  : isDarkMode ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-black/5'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 pt-4 scrollbar-none">
          {filteredMedia.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30">
              <div className="w-20 h-20 rounded-full border-4 border-dashed border-current flex items-center justify-center mb-4">
                <FileText size={40} />
              </div>
              <p className="font-black uppercase tracking-widest">No files found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredMedia.map((item, i) => (
                <div 
                  key={i}
                  className="group relative aspect-square rounded-[1.5rem] overflow-hidden cursor-pointer border border-white/5 bg-black/20"
                  onClick={() => {
                    if (item.type === 'image') {
                      const imageOnly = filteredMedia.filter(m => m.type === 'image');
                      const idx = imageOnly.findIndex(m => m.payload?.url === item.payload?.url);
                      setLightbox({ isOpen: true, images: imageOnly, index: idx === -1 ? 0 : idx, zoom: 1 });
                    }
                  }}
                >
                  {item.type === 'image' ? (
                    <img 
                      src={item.payload?.url} 
                      alt="Media" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-prime-500/10 text-prime-500">
                      <Film size={40} className="mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Video Content</span>
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                    <p className="text-white text-[10px] font-black uppercase tracking-wider mb-1 line-clamp-1">{item.sender} • {item.time}</p>
                    <div className="flex items-center gap-2">
                       <button className="p-2 rounded-lg bg-white/20 hover:bg-white/40 text-white transition-all">
                         <Download size={14} />
                       </button>
                       <button className="p-2 rounded-lg bg-white/20 hover:bg-white/40 text-white transition-all">
                         <ExternalLink size={14} />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaGalleryModal;
