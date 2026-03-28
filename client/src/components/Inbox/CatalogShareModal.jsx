import React, { useState } from 'react';
import { X, Package, Check, Send, Search } from 'lucide-react';

const CatalogShareModal = ({ isOpen, onClose, isDarkMode, t, products, onShare }) => {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleShare = () => {
    const selectedBatch = products.filter(p => selectedIds.has(p.id));
    onShare(selectedBatch);
    setSelectedIds(new Set());
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`w-full max-w-lg rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 ${
        isDarkMode ? 'bg-[#0a0f1d] border-white/10 text-white' : 'bg-white border-black/5 text-gray-900'
      }`}>
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
              <Package size={20} />
            </div>
            <div>
              <h3 className="font-black uppercase tracking-tighter text-lg">Share Catalog</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Select products to send</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-all outline-none">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-2xl border text-sm font-bold transition-all ${
                isDarkMode ? 'bg-white/5 border-white/10 focus:border-amber-500/50' : 'bg-gray-50 border-black/5 focus:border-amber-500/50'
              }`}
            />
          </div>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[400px] scrollbar-none">
          {filteredProducts.map(product => (
            <div 
              key={product.id}
              onClick={() => toggleSelect(product.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${
                selectedIds.has(product.id)
                  ? 'border-amber-500 bg-amber-500/10'
                  : (isDarkMode ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-white border-black/5 hover:border-black/20')
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                   <Package size={20} className={selectedIds.has(product.id) ? 'text-amber-500' : 'text-gray-500'} />
                </div>
                <div>
                   <h4 className="text-sm font-black uppercase tracking-tight">{product.name}</h4>
                   <p className="text-[10px] font-bold text-amber-500">{product.offerPrice || product.price} BDT</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedIds.has(product.id) ? 'bg-amber-500 border-amber-500 text-white' : 'border-gray-500/30 text-transparent'
              }`}>
                <Check size={14} />
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="text-center py-10 opacity-30  text-sm">No products found</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <button 
            disabled={selectedIds.size === 0}
            onClick={handleShare}
            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all ${
              selectedIds.size === 0
                ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                : 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 hover:scale-[1.02]'
            }`}
          >
            <Send size={18} />
            Send {selectedIds.size} Products
          </button>
        </div>
      </div>
    </div>
  );
};

export default CatalogShareModal;
