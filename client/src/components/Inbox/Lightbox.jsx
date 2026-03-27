import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Maximize, ChevronLeft, ChevronRight, Download, Info } from 'lucide-react';

const Lightbox = ({ isOpen, images = [], index = 0, zoom = 1, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(index);
  const [currentZoom, setCurrentZoom] = useState(zoom);

  useEffect(() => {
    setCurrentIdx(index);
    setCurrentZoom(zoom);
  }, [index, zoom, isOpen]);

  if (!isOpen || images.length === 0) return null;

  const handleNext = () => setCurrentIdx(p => (p + 1) % images.length);
  const handlePrev = () => setCurrentIdx(p => (p - 1 + images.length) % images.length);

  const currentImage = images[currentIdx];
  const url = typeof currentImage === 'string' ? currentImage : (currentImage?.payload?.url || currentImage?.url);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white"><X size={24} /></button>
          <div>
            <p className="text-white font-black text-sm uppercase tracking-widest">{currentIdx + 1} / {images.length}</p>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Full Screen Viewer</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <button onClick={() => setCurrentZoom(z => z + 0.25)} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white"><ZoomIn size={20} /></button>
           <button onClick={() => setCurrentZoom(z => Math.max(0.25, z - 0.25))} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white"><ZoomOut size={20} /></button>
           <button onClick={() => setCurrentZoom(1)} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white"><Maximize size={20} /></button>
           <div className="w-px h-8 bg-white/10 mx-2" />
           <a href={url} download target="_blank" rel="noreferrer" className="p-3 bg-prime-500 hover:bg-prime-400 rounded-xl transition-all text-white flex items-center gap-2 font-black text-xs uppercase tracking-widest px-6 shadow-lg shadow-prime-500/20">
             <Download size={16} /> Download
           </a>
        </div>
      </div>

      {/* Main Image Container */}
      <div className="relative w-full h-full flex items-center justify-center p-20">
        <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
           {images.length > 1 && (
             <button onClick={handlePrev} className="p-4 bg-white/5 hover:bg-white/15 border border-white/5 rounded-full transition-all text-white/40 hover:text-white backdrop-blur-md"><ChevronLeft size={32} /></button>
           )}
        </div>

        <img 
          src={url} 
          alt="Original" 
          className="max-w-full max-h-full object-contain shadow-2xl rounded-lg animate-in zoom-in duration-500 transition-transform" 
          style={{ transform: `scale(${currentZoom})` }}
        />

        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
           {images.length > 1 && (
             <button onClick={handleNext} className="p-4 bg-white/5 hover:bg-white/15 border border-white/5 rounded-full transition-all text-white/40 hover:text-white backdrop-blur-md"><ChevronRight size={32} /></button>
           )}
        </div>
      </div>

      {/* Bottom Bar / Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center gap-4 bg-gradient-to-t from-black/60 to-transparent overflow-x-auto">
          {images.map((img, i) => (
            <div 
              key={i} 
              onClick={() => { setCurrentIdx(i); setCurrentZoom(1); }}
              className={`w-16 h-16 shrink-0 rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${i === currentIdx ? 'border-prime-500 scale-110 shadow-lg' : 'border-white/10 opacity-40 hover:opacity-100'}`}
            >
              <img 
                src={typeof img === 'string' ? img : (img?.payload?.url || img?.url)} 
                className="w-full h-full object-cover" 
                alt="thumb" 
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Lightbox;
