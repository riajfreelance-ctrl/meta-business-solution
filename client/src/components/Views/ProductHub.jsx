import React, { useState } from 'react';
import { Plus, Package, TrendingUp, Edit3, ShoppingBag } from 'lucide-react';
import { db } from '../../firebase-client';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import ActionMenu from '../Shared/ActionMenu';
import ConfirmModal from '../Shared/ConfirmModal';

const ProductHub = ({ isDarkMode, t, products }) => {
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', offerPrice: '', stock: '' });

  const handleEdit = (product) => {
    setEditingProduct(product);
    setEditForm({ 
      name: product.name, 
      price: product.price, 
      offerPrice: product.offerPrice, 
      stock: product.stock 
    });
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;
    try {
      const productRef = doc(db, "products", editingProduct.id);
      await updateDoc(productRef, editForm);
      setEditingProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleDelete = async () => {
    if (!deletingProductId) return;
    try {
      await deleteDoc(doc(db, "products", deletingProductId));
      setDeletingProductId(null);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };
  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex justify-between items-center">
        <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('products_offers')}</h3>
        <button className={`px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg ${
          isDarkMode ? 'bg-prime-500 text-white shadow-prime-500/30' : 'bg-prime-600 text-white shadow-prime-600/30 hover:bg-prime-700'
        }`}>
          <Plus size={20} />
          {t('add_product')}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.id} className={`rounded-3xl border transition-all overflow-hidden group ${
            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-xl'
          }`}>
            <div className={`h-48 relative flex items-center justify-center ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
              <Package size={48} className="text-gray-600 group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute top-4 right-4 flex gap-2">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.stock === 'In Stock' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                   {p.stock}
                 </span>
              </div>
              <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <ActionMenu 
                   isDarkMode={isDarkMode} 
                   t={t} 
                   onEdit={() => handleEdit(p)} 
                   onDelete={() => setDeletingProductId(p.id)} 
                 />
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-lg">{p.name}</h4>
                  <p className={isDarkMode ? 'text-gray-500 text-sm' : 'text-gray-400 text-sm'}>{t('retail')}: {p.price} BDT</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-prime-400 leading-none">{p.offerPrice} BDT</p>
                  <p className="text-[10px] text-gray-500 uppercase mt-1">{t('limited_offer')}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => handleEdit(p)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-black/5 hover:bg-black/10 text-gray-600'}`}
                >
                  {t('edit')}
                </button>
                <button className="w-12 py-2 bg-prime-500/10 rounded-lg text-prime-400 flex justify-center hover:bg-prime-500/20 transition-all">
                  <TrendingUp size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-[2.5rem] border shadow-2xl overflow-hidden ${
            isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-black/5 text-gray-900'
          } animate-in zoom-in-95 duration-200`}>
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-prime-500/10 rounded-2xl">
                  <ShoppingBag className="text-prime-400" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">{t('edit_product')}</h3>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{t('manage')} {t('inventory')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">{t('product_name')}</label>
                  <input 
                    type="text" 
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className={`w-full p-4 rounded-2xl outline-none border transition-all ${
                      isDarkMode ? 'bg-black/20 border-white/10 focus:border-prime-500/50' : 'bg-gray-50 border-black/5 focus:border-prime-500/50'
                    }`}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">{t('price')} (BDT)</label>
                    <input 
                      type="text" 
                      value={editForm.price}
                      onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                      className={`w-full p-4 rounded-2xl outline-none border transition-all ${
                        isDarkMode ? 'bg-black/20 border-white/10 focus:border-prime-500/50' : 'bg-gray-50 border-black/5 focus:border-prime-500/50'
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">{t('offer_price')} (BDT)</label>
                    <input 
                      type="text" 
                      value={editForm.offerPrice}
                      onChange={(e) => setEditForm({...editForm, offerPrice: e.target.value})}
                      className={`w-full p-4 rounded-2xl outline-none border transition-all ${
                        isDarkMode ? 'bg-black/20 border-white/10 focus:border-prime-500/50' : 'bg-gray-50 border-black/5 focus:border-prime-500/50'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">{t('stock_status')}</label>
                  <div className="flex gap-2">
                    {['In Stock', 'Out of Stock'].map(s => (
                      <button
                        key={s}
                        onClick={() => setEditForm({...editForm, stock: s})}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border ${
                          editForm.stock === s 
                            ? 'bg-prime-500 border-prime-500 text-white shadow-lg shadow-prime-500/20' 
                            : (isDarkMode ? 'bg-white/5 border-white/10 text-gray-500 hover:text-white' : 'bg-gray-100 border-black/5 text-gray-500')
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setEditingProduct(null)}
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
                    isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {t('cancel')}
                </button>
                <button 
                  onClick={handleUpdate}
                  className="flex-1 py-4 rounded-2xl font-bold bg-prime-500 text-white hover:bg-prime-600 shadow-xl shadow-prime-500/20 active:scale-95 transition-all"
                >
                  {t('save_changes')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation */}
      <ConfirmModal 
        isOpen={!!deletingProductId}
        onClose={() => setDeletingProductId(null)}
        onConfirm={handleDelete}
        title={t('confirm_delete')}
        message="Are you sure you want to remove this product from your inventory? This action is permanent."
        isDarkMode={isDarkMode}
        t={t}
      />
    </div>
  );
};

export default ProductHub;
