import React, { useState } from 'react';
import { db, storage } from '../../firebase-client';
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Plus, Package, TrendingUp, Edit2, Trash2, ShoppingBag, X, Sparkles, UploadCloud } from 'lucide-react';
import ActionMenu from '../Shared/ActionMenu';
import ConfirmModal from '../Shared/ConfirmModal';
import { useBrand } from '../../context/BrandContext';

const ProductHub = ({ isDarkMode, t, products }) => {
  const { brandData, updateUsageStats, activeBrandId } = useBrand();
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editForm, setEditForm] = useState({ name: '', price: '', offerPrice: '', stock: '', category: 'Serum', images: [''], description: '', variantOf: '' });
  const [addForm, setAddForm] = useState({ name: '', price: '', offerPrice: '', stock: 'In Stock', category: 'Serum', images: [''], description: '', variantOf: '' });

  const categories = ['Serum', 'Cream', 'Cleanser', 'Sunscreen', 'Mask', 'Other'];

  const handleEditClick = (product) => {
    setEditingProduct(product);
    // Backward compatibility: Convert legacy single 'image' to array if 'images' doesn't exist
    const initialImages = product.images && product.images.length > 0 
      ? product.images 
      : product.image ? [product.image] : [''];

    setEditForm({ 
      name: product.name, 
      price: product.price, 
      offerPrice: product.offerPrice, 
      stock: product.stock,
      category: product.category || 'Serum',
      images: initialImages,
      description: product.description || '',
      variantOf: product.variantOf || ''
    });
  };
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.price || !activeBrandId) return;

    // Limit Check
    if (brandData?.usageStats?.productsCount >= brandData?.usageLimits?.maxProducts) {
      alert(`Limit Reached: You can only have ${brandData.usageLimits.maxProducts} products on this plan.`);
      return;
    }

    setIsSaving(true);
    try {
      // Filter out empty URLs
      const cleanedImages = addForm.images.filter(url => url.trim() !== '');
      if (cleanedImages.length === 0) {
        alert("Please provide at least one image URL.");
        setIsSaving(false);
        return;
      }
      await addDoc(collection(db, "products"), {
        ...addForm,
        images: cleanedImages,
        brandId: activeBrandId,
        createdAt: serverTimestamp()
      });
      
      // Update Stats
      await updateUsageStats('products', 1);

      setIsAddModalOpen(false);
      setAddForm({ name: '', price: '', offerPrice: '', stock: 'In Stock', category: 'Serum', images: [''], description: '', variantOf: '' });
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to save product. Check console.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSaving(true);
    try {
      // Filter out empty URLs
      const cleanedImages = editForm.images.filter(url => url.trim() !== '');
      if (cleanedImages.length === 0) {
        alert("Please provide at least one image URL.");
        setIsSaving(false);
        return;
      }
      const productRef = doc(db, "products", editingProduct.id);
      await updateDoc(productRef, {
        ...editForm,
        images: cleanedImages,
        updatedAt: serverTimestamp()
      });
      setEditingProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update. Check console.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProductId) return;
    try {
      await deleteDoc(doc(db, "products", deletingProductId));
      await updateUsageStats('products', -1);
      setDeletingProductId(null);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };
  
  const generateAIImage = (formType, index) => {
    const name = formType === 'add' ? addForm.name : editForm.name;
    const placeholder = `https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400&h=400&q=product-${encodeURIComponent(name || 'product')}&random=${Math.random()}`;
    
    if (formType === 'add') {
      const newImages = [...addForm.images];
      newImages[index] = placeholder;
      setAddForm({ ...addForm, images: newImages });
    } else {
      const newImages = [...editForm.images];
      newImages[index] = placeholder;
      setEditForm({ ...editForm, images: newImages });
    }
  };

  const handleAddImageField = (formType) => {
    if (formType === 'add') {
      setAddForm({ ...addForm, images: [...addForm.images, ''] });
    } else {
      setEditForm({ ...editForm, images: [...editForm.images, ''] });
    }
  };

  const handleRemoveImageField = (formType, index) => {
    if (formType === 'add') {
      const newImages = addForm.images.filter((_, i) => i !== index);
      setAddForm({ ...addForm, images: newImages.length ? newImages : [''] });
    } else {
      const newImages = editForm.images.filter((_, i) => i !== index);
      setEditForm({ ...editForm, images: newImages.length ? newImages : [''] });
    }
  };

  const handleImageChange = (formType, index, value) => {
    if (formType === 'add') {
      const newImages = [...addForm.images];
      newImages[index] = value;
      setAddForm({ ...addForm, images: newImages });
    } else {
      const newImages = [...editForm.images];
      newImages[index] = value;
      setEditForm({ ...editForm, images: newImages });
    }
  };

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'offers'
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [uploadingProgress, setUploadingProgress] = useState({}); // Tracking { 'add-0': 45, 'edit-1': 80 }


  const handleUploadImage = (formType, index, file) => {
    if (!file || !activeBrandId) return;
    if (!storage) {
       alert("আপনার Firebase Dashboard-এ Storage ফোল্ডারটি এখনও সচল (Enabled) করা হয়নি। দয়া করে Firebase Console থেকে Storage এনাবল করুন। অথবা সরাসরি ছবির লিঙ্ক ব্যবহার করুন।");
       return;
    }
    
    const uploadId = `${formType}-${index}`;
    const storageRef = ref(storage, `products/${activeBrandId}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setUploadingProgress(prev => ({ ...prev, [uploadId]: progress }));
      }, 
      (error) => {
        console.error("Upload failed", error);
        setUploadingProgress(prev => {
          const newState = { ...prev };
          delete newState[uploadId];
          return newState;
        });
      }, 
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          handleImageChange(formType, index, downloadURL);
          setUploadingProgress(prev => {
            const newState = { ...prev };
            delete newState[uploadId];
            return newState;
          });
        });
      }
    );
  };

  const handleGenerateDescription = async (formType) => {
    const name = formType === 'add' ? addForm.name : editForm.name;
    if (!name) return;
    
    setIsGeneratingDescription(true);
    // Simulate AI generation for now as we don't have the specific AI endpoint for description yet
    setTimeout(() => {
      const desc = `Premium quality ${name} designed for maximum effectiveness and professional results. Suitable for all skin types.`;
      if (formType === 'add') setAddForm({ ...addForm, description: desc });
      else setEditForm({ ...editForm, description: desc });
      setIsGeneratingDescription(false);
    }, 1500);
  };

  // Filter products based on active tab
  const filteredProducts = products.filter(p => {
    if (activeTab === 'offers') return parseFloat(p.offerPrice || 0) > 0;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h3 className={`text-3xl md:text-4xl font-black tracking-tighter uppercase  ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Product <span className="text-prime-500">{activeTab === 'offers' ? 'Offers' : 'Hub'}</span>
          </h3>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mt-2">
            {activeTab === 'offers' ? 'Active promotions & flash sales' : 'Manage your inventory & AI context'}
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {/* Tabs UI */}
          <div className={`flex p-1 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-black/5'}`}>
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'inventory' 
                  ? 'bg-prime-500 text-white shadow-lg' 
                  : 'text-gray-500 hover:text-prime-400'
              }`}
            >
              Inventory
            </button>
            <button 
              onClick={() => setActiveTab('offers')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'offers' 
                  ? 'bg-prime-500 text-white shadow-lg' 
                  : 'text-gray-500 hover:text-prime-400'
              }`}
            >
              Offers
            </button>
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="hidden lg:flex flex-col items-end gap-1 px-4">
              <div className="flex justify-between w-32 items-center text-[8px] font-black uppercase tracking-widest text-gray-500">
                <span>Usage</span>
                <span>{brandData?.usageStats?.productsCount || 0}/{brandData?.usageLimits?.maxProducts || 0}</span>
              </div>
              <div className={`w-32 h-1 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/5' : 'bg-gray-200'}`}>
                <div 
                  className={`h-full transition-all duration-1000 ${
                    ((brandData?.usageStats?.productsCount || 0) / (brandData?.usageLimits?.maxProducts || 20)) > 0.9 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-prime-500'
                  }`}
                  style={{ width: `${Math.min(100, ((brandData?.usageStats?.productsCount || 0) / (brandData?.usageLimits?.maxProducts || 20)) * 100)}%` }}
                />
              </div>
            </div>
            
            <button 
              onClick={() => setIsAddModalOpen(true)}
              disabled={(brandData?.usageStats?.productsCount || 0) >= (brandData?.usageLimits?.maxProducts || 20)}
              className={`w-full md:w-auto px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 ${
                (brandData?.usageStats?.productsCount || 0) >= (brandData?.usageLimits?.maxProducts || 20)
                  ? 'bg-gray-500/10 text-gray-400 cursor-not-allowed border border-white/5 opacity-50'
                  : 'bg-prime-500 text-white hover:bg-prime-600 shadow-prime-500/20 active:scale-95'
              }`}
            >
              <Plus size={16} />
              {(brandData?.usageStats?.productsCount || 0) >= (brandData?.usageLimits?.maxProducts || 20) ? 'Limit Reached' : t('add_product')}
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => {
          const discount = product.offerPrice && product.price 
            ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
            : 0;

          return (
            <div 
              key={product.id} 
              className={`group relative rounded-[2.5rem] border overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
                isDarkMode ? 'bg-[#0a0f1d] border-white/10' : 'bg-white border-black/5'
              }`}
            >
              {/* Discount Badge */}
              {discount > 0 && (
                <div className="absolute top-6 left-6 z-20">
                  <div className="bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse">
                    -{discount}% LIMITED
                  </div>
                </div>
              )}

              {/* Action Buttons Overlay */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                <button 
                  onClick={() => handleEditClick(product)}
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-prime-500 transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => setDeletingProductId(product.id)}
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Product Image */}
              <div className="aspect-square relative bg-prime-500/10 overflow-hidden">
                {(product.images && product.images.length > 0) ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-prime-500/30">
                    <Package size={64} strokeWidth={1} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                
                {product.images && product.images.length > 1 && (
                  <div className="absolute top-4 left-4 z-20">
                    <div className="bg-black/50 backdrop-blur-md border border-white/10 text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                      <Package size={12} /> {product.images.length} Photos
                    </div>
                  </div>
                )}
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
                    <span className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-md ${
                      product.stock === 'Out of Stock' ? 'bg-red-500/40 text-white' : 'bg-green-500/40 text-white'
                    }`}>
                      {product.stock}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-prime-500/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-prime-400">
                      <Sparkles size={12} />
                    </div>
                </div>
              </div>

              <div className="p-8">
                <div className="mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-prime-500 mb-1">{product.category}</p>
                  <h4 className={`text-xl font-black tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{product.name}</h4>
                </div>
                
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-2xl font-black text-prime-500">
                    {product.offerPrice ? product.offerPrice : product.price} BDT
                  </span>
                  {product.offerPrice && (
                    <span className="text-sm font-bold text-gray-400 line-through">
                      {product.price} BDT
                    </span>
                  )}
                </div>

                {/* Stock Meter */}
                <div className="mb-6 space-y-2">
                  <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-gray-500">
                    <span>Stock Level</span>
                    <span>{product.stock === 'Out of Stock' ? '0%' : product.stock === 'Low Stock' ? '25%' : '85%'}</span>
                  </div>
                  <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        product.stock === 'Out of Stock' ? 'w-0 bg-red-500' : 
                        product.stock === 'Low Stock' ? 'w-1/4 bg-amber-500' : 'w-[85%] bg-green-500'
                      }`}
                    />
                  </div>
                </div>

                <div className={`flex items-center gap-2 p-3 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-prime-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">AI Marketing Context Active</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/40 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className={`w-full max-w-xl glass-card p-6 md:p-10 relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto ${isDarkMode ? 'dark' : ''}`}>
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-red-500/20 transition-all">
              <X size={20} />
            </button>
            <h3 className="text-3xl font-black mb-8 uppercase tracking-tighter text-white">Register <span className="text-prime-500 text-stroke-thin">Product</span></h3>
            
            <form onSubmit={handleAddProduct} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Product Name</label>
                  <input 
                    type="text" 
                    required 
                    value={addForm.name}
                    onChange={e => setAddForm({...addForm, name: e.target.value})}
                    placeholder="e.g. Vitamin C Serum"
                    className={`w-full p-4 rounded-2xl outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 focus:border-prime-500/50' : 'bg-gray-50 border-black/5'}`} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Category</label>
                  <select 
                    value={addForm.category}
                    onChange={e => setAddForm({...addForm, category: e.target.value})}
                    className={`w-full p-4 rounded-2xl outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 focus:border-prime-500/50' : 'bg-gray-50 border-black/5'}`}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Regular Price (BDT)</label>
                  <input 
                    type="number" 
                    required 
                    value={addForm.price}
                    onChange={e => setAddForm({...addForm, price: e.target.value})}
                    placeholder="1200"
                    className={`w-full p-4 rounded-2xl outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 focus:border-prime-500/50' : 'bg-gray-50 border-black/5'}`} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Offer Price (BDT)</label>
                  <input 
                    type="number" 
                    value={addForm.offerPrice}
                    onChange={e => setAddForm({...addForm, offerPrice: e.target.value})}
                    placeholder="999"
                    className={`w-full p-4 rounded-2xl outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 focus:border-prime-500/50' : 'bg-gray-50 border-black/5'}`} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Group With Existing Product (Variant Of)</label>
                <select 
                  value={addForm.variantOf}
                  onChange={e => setAddForm({...addForm, variantOf: e.target.value})}
                  className={`w-full p-4 rounded-2xl outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 focus:border-prime-500/50' : 'bg-gray-50 border-black/5'}`}
                >
                  <option value="">None (This is a standalone product)</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 flex justify-between">
                  Product Description
                  <button 
                    type="button" 
                    disabled={isGeneratingDescription}
                    onClick={() => handleGenerateDescription('add')} 
                    className="text-prime-500 hover:underline disabled:opacity-50"
                  >
                    {isGeneratingDescription ? 'Generating...' : 'Generate AI Description'}
                  </button>
                </label>
                <textarea 
                  rows="3"
                  value={addForm.description}
                  onChange={e => setAddForm({...addForm, description: e.target.value})}
                  placeholder="Tell your customers more about this product..."
                  className={`w-full p-4 rounded-2xl outline-none border transition-all resize-none ${isDarkMode ? 'bg-white/5 border-white/10 focus:border-prime-500/50' : 'bg-gray-50 border-black/5'}`} 
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Product Images (First is Primary)</label>
                {addForm.images.map((imgUrl, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    {/* Thumbnail Preview */}
                    <div className={`w-14 h-14 rounded-xl border overflow-hidden flex-shrink-0 flex items-center justify-center relative ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-black/5'}`}>
                      {uploadingProgress[`add-${idx}`] !== undefined ? (
                         <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] font-black text-white px-2 text-center">
                            {uploadingProgress[`add-${idx}`]}%
                         </div>
                      ) : null}
                      {imgUrl ? (
                        <img src={imgUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.src = ''; e.target.parentElement.innerHTML = '<div class="text-[8px] text-gray-500">Error</div>'; }} />
                      ) : (
                        <ShoppingBag size={16} className="text-gray-500/30" />
                      )}
                    </div>
                    
                    <input 
                      type="text" 
                      value={imgUrl}
                      onChange={e => handleImageChange('add', idx, e.target.value)}
                      placeholder="https://..."
                      className="glass-input flex-1 p-4 rounded-2xl outline-none"
                    />

                    {/* Hidden File Input */}
                    <input 
                      type="file" 
                      id={`file-add-${idx}`}
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => handleUploadImage('add', idx, e.target.files[0])}
                    />

                    <label htmlFor={`file-add-${idx}`} className={`px-4 h-14 rounded-2xl border cursor-pointer flex items-center justify-center transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-prime-500/20 hover:text-prime-500' : 'bg-gray-50 border-black/5 hover:bg-prime-100'}`} title="Upload from Device">
                      <UploadCloud size={16} />
                    </label>

                    <button type="button" onClick={() => generateAIImage('add', idx)} className={`px-4 h-14 rounded-2xl border flex items-center justify-center transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-prime-500/20 hover:text-prime-500' : 'bg-gray-50 border-black/5 hover:bg-prime-100'}`} title="Generate AI Image">
                      <Sparkles size={16} />
                    </button>
                    <button type="button" onClick={() => handleRemoveImageField('add', idx)} className={`px-4 h-14 rounded-2xl border flex items-center justify-center transition-colors ${isDarkMode ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-red-50 border-red-100 text-red-500 hover:bg-red-500 hover:text-white'}`}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => handleAddImageField('add')} className="w-full p-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-prime-500 hover:border-prime-500 transition-colors">
                  <Plus size={16} /> Add Another Photo
                </button>
              </div>

              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full py-5 bg-prime-500 hover:bg-prime-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-prime-500/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/40 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className={`w-full max-w-xl glass-card p-6 md:p-10 relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto ${isDarkMode ? 'dark' : ''}`}>
            <button onClick={() => setEditingProduct(null)} className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-red-500/20 transition-all">
              <X size={20} />
            </button>
            <h3 className="text-3xl font-black mb-8 uppercase tracking-tighter text-white">Edit <span className="text-prime-500 text-stroke-thin">Product</span></h3>
            
            <form onSubmit={handleUpdateProduct} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Product Name</label>
                  <input 
                    type="text" 
                    required 
                    value={editForm.name}
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                    className={`w-full p-4 rounded-2xl outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 focus:border-prime-500/50' : 'bg-gray-50 border-black/5'}`} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Category</label>
                  <select 
                    value={editForm.category}
                    onChange={e => setEditForm({...editForm, category: e.target.value})}
                    className={`w-full p-4 rounded-2xl outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 focus:border-prime-500/50' : 'bg-gray-50 border-black/5'}`}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Stock Status</label>
                  <select 
                    value={editForm.stock}
                    onChange={e => setEditForm({...editForm, stock: e.target.value})}
                    className={`w-full p-4 rounded-2xl outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 focus:border-prime-500/50' : 'bg-gray-50 border-black/5'}`}
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Price (BDT)</label>
                  <input 
                    type="number" 
                    required 
                    value={editForm.price}
                    onChange={e => setEditForm({...editForm, price: e.target.value})}
                    className={`w-full p-4 rounded-2xl outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 focus:border-prime-500/50' : 'bg-gray-50 border-black/5'}`} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Group With Existing Product (Variant Of)</label>
                <select 
                  value={editForm.variantOf}
                  onChange={e => setEditForm({...editForm, variantOf: e.target.value})}
                  className={`w-full p-4 rounded-2xl outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 focus:border-prime-500/50' : 'bg-gray-50 border-black/5'}`}
                >
                  <option value="">None (This is a standalone product)</option>
                  {products.filter(p => p.id !== editingProduct.id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 flex justify-between">
                  Product Description
                  <button 
                    type="button" 
                    disabled={isGeneratingDescription}
                    onClick={() => handleGenerateDescription('edit')} 
                    className="text-prime-500 hover:underline disabled:opacity-50"
                  >
                    {isGeneratingDescription ? 'Generating...' : 'Generate AI Description'}
                  </button>
                </label>
                <textarea 
                  rows="3"
                  value={editForm.description}
                  onChange={e => setEditForm({...editForm, description: e.target.value})}
                  placeholder="Tell your customers more about this product..."
                  className={`w-full p-4 rounded-2xl outline-none border transition-all resize-none ${isDarkMode ? 'bg-white/5 border-white/10 focus:border-prime-500/50' : 'bg-gray-50 border-black/5'}`} 
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Product Images (First is Primary)</label>
                {editForm.images.map((imgUrl, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    {/* Thumbnail Preview */}
                    <div className={`w-14 h-14 rounded-xl border overflow-hidden flex-shrink-0 flex items-center justify-center relative ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-black/5'}`}>
                      {uploadingProgress[`edit-${idx}`] !== undefined ? (
                         <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] font-black text-white px-2 text-center">
                            {uploadingProgress[`edit-${idx}`]}%
                         </div>
                      ) : null}
                      {imgUrl ? (
                        <img src={imgUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.src = ''; e.target.parentElement.innerHTML = '<div class="text-[8px] text-gray-500">Error</div>'; }} />
                      ) : (
                        <ShoppingBag size={16} className="text-gray-500/30" />
                      )}
                    </div>

                    <input 
                      type="text" 
                      value={imgUrl}
                      onChange={e => handleImageChange('edit', idx, e.target.value)}
                      className="glass-input flex-1 p-4 rounded-2xl outline-none"
                    />

                    {/* Hidden File Input */}
                    <input 
                      type="file" 
                      id={`file-edit-${idx}`}
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => handleUploadImage('edit', idx, e.target.files[0])}
                    />

                    <label htmlFor={`file-edit-${idx}`} className={`px-4 h-14 rounded-2xl border cursor-pointer flex items-center justify-center transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-prime-500/20 hover:text-prime-500' : 'bg-gray-50 border-black/5 hover:bg-prime-100'}`} title="Upload from Device">
                      <UploadCloud size={16} />
                    </label>

                    <button type="button" onClick={() => generateAIImage('edit', idx)} className={`px-4 h-14 rounded-2xl border flex items-center justify-center transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-prime-500/20 hover:text-prime-500' : 'bg-gray-50 border-black/5 hover:bg-prime-100'}`} title="Generate AI Image">
                      <Sparkles size={16} />
                    </button>
                    <button type="button" onClick={() => handleRemoveImageField('edit', idx)} className={`px-4 h-14 rounded-2xl border flex items-center justify-center transition-colors ${isDarkMode ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-red-50 border-red-100 text-red-500 hover:bg-red-500 hover:text-white'}`}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => handleAddImageField('edit')} className="w-full p-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-prime-500 hover:border-prime-500 transition-colors">
                  <Plus size={16} /> Add Another Photo
                </button>
              </div>

              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full py-5 bg-prime-500 hover:bg-prime-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-prime-500/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSaving ? 'Updating...' : 'Update Product'}
              </button>
            </form>
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
