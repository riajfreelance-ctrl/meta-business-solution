import React, { useState } from 'react';
import { PlusCircle, XCircle, Sparkles, Loader2, Globe, Image as ImageIcon, CheckCircle, Send, Search } from 'lucide-react';
import axios from 'axios';

const CommentModal = ({ 
  isDarkMode, 
  t, 
  activeBrandId,
  isAddingDraft, 
  editingDraft, 
  form, 
  setForm, 
  setIsAddingDraft, 
  setEditingDraft, 
  handleSaveDraft, 
  handleUpdateDraft, 
  handleGenerateAI, 
  isGeneratingAI, 
  posts = [], 
  commentDrafts = [],
  isLoadingPosts = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const isEditing = !!editingDraft;
  const showModal = isAddingDraft || isEditing;
  const variations = form?.variations || [];

  // Filter regular posts by search term
  const filteredPosts = posts.filter(p => 
    !searchTerm || 
    p.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.includes(searchTerm)
  );

  const handleImportStrategy = (template) => {
    setForm(prev => ({
      ...prev,
      keywords: template.keywords || '',
      variations: (template.variations || []).map(v => ({ ...v, hitCount: 0 }))
    }));
    setShowTemplates(false);
  };

  if (!showModal) return null;

  const handleAddVariation = () => {
    setForm(prev => {
      const currentVariations = prev?.variations || [];
      return {
        ...prev,
        variations: [...currentVariations, { publicReply: '', privateReply: '', hitCount: 0 }]
      };
    });
  };

  const handleRemoveVariation = (index) => {
    setForm(prev => {
      const currentVariations = prev?.variations || [];
      return {
        ...prev,
        variations: currentVariations.filter((_, i) => i !== index)
      };
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-[3.5rem] border shadow-2xl transition-all duration-700 transform scale-100 ${
        isDarkMode 
          ? 'bg-[#021024]/90 border-white/10 text-white' 
          : 'bg-white border-black/5 text-gray-900'
      } p-10 space-y-8 scrollbar-hide`}>
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-prime-500/10 rounded-[2.2rem] shadow-lg shadow-prime-500/5">
              <PlusCircle className="text-prime-400" size={32} />
            </div>
            <div>
              <h3 className="text-4xl font-black tracking-tighter ">
                {isEditing ? 'Refine Strategy' : 'New autonomous Strategy'}
              </h3>
              <p className="text-[11px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1">
                Scale your engagement with AI precision
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              setIsAddingDraft(false);
              setEditingDraft(null);
              setSearchTerm('');
              setLocalPosts([]);
            }} 
            className="p-3 rounded-2xl hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-all duration-500"
          >
            <XCircle size={28} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left Column: Configuration */}
          <div className="space-y-8">
            {/* Post Selector */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <label className="text-[11px] font-black uppercase text-prime-400 tracking-[0.25em]">Target environment</label>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${(form?.selectedPostId) ? 'bg-purple-500' : 'bg-prime-500'} animate-pulse`} />
                  <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest leading-none">
                    {(form?.selectedPostId) ? 'Post Specific' : 'Global (All Posts)'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className={`p-6 rounded-[2rem] border transition-all duration-500 ${
                  isDarkMode ? 'bg-black/40 border-white/5' : 'bg-gray-50 border-black/5'
                }`}>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-xl bg-purple-500/10">
                        <ImageIcon size={16} className="text-purple-400" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select Post Visualization</span>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      {/* Search / Filter Input */}
                      <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/10 px-3 py-1.5 focus-within:border-prime-500/50 transition-all duration-300 flex-1 md:flex-none">
                        <Search size={14} className="text-gray-500" />
                        <input 
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search Recent Posts..."
                          className="bg-transparent border-none outline-none text-[10px] font-bold text-white w-full md:w-40 placeholder:text-gray-600"
                        />
                      </div>

                      {/* Templates Dropdown */}
                      <div className="relative">
                        <button 
                          onClick={() => setShowTemplates(!showTemplates)}
                          className={`px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                            showTemplates 
                              ? 'bg-prime-500 border-prime-500 text-white' 
                              : 'bg-white/5 border-white/10 text-prime-400 hover:bg-white/10'
                          }`}
                        >
                          Templates
                        </button>
                        
                        {showTemplates && (
                          <div className={`absolute right-0 mt-2 w-64 rounded-2xl border shadow-2xl z-50 p-2 overflow-hidden animate-in zoom-in-95 duration-200 ${
                             isDarkMode ? 'bg-[#0a192f] border-white/10' : 'bg-white border-black/10'
                          }`}>
                            <div className="max-h-60 overflow-y-auto scrollbar-hide space-y-1">
                              {commentDrafts.length > 0 ? (
                                commentDrafts.map((d, i) => (
                                  <button 
                                    key={i}
                                    onClick={() => handleImportStrategy(d)}
                                    className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-colors group"
                                  >
                                    <div className="text-[10px] font-black text-prime-400 truncate mb-1">
                                      {d.keywords?.slice(0, 30)}...
                                    </div>
                                    <div className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter">
                                      {d.variations?.length || 0} Variations • {d.selectedPostId ? 'Post Specific' : 'Global'}
                                    </div>
                                  </button>
                                ))
                              ) : (
                                <div className="p-4 text-center text-[10px] text-gray-500 font-black uppercase">
                                  No strategies found
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    <button 
                      onClick={() => setForm(prev => ({...prev, selectedPostId: ''}))}
                      className={`flex-shrink-0 w-24 aspect-square rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                        !(form?.selectedPostId) 
                          ? 'bg-prime-500/10 border-prime-500 text-prime-400' 
                          : 'bg-white/5 border-white/5 text-gray-500 opacity-40 hover:opacity-100'
                      }`}
                    >
                      <Globe size={24} />
                      <span className="text-[8px] font-black uppercase">Global</span>
                    </button>
                    
                    {isLoadingPosts ? (
                      <div className="flex gap-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-24 aspect-square rounded-2xl bg-white/5 animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      filteredPosts.map(p => (
                        <button 
                          key={p.id}
                          onClick={() => setForm(prev => ({...prev, selectedPostId: p.id}))}
                          className={`flex-shrink-0 w-24 aspect-square rounded-2xl border-2 transition-all relative overflow-hidden group/thumb ${
                            form?.selectedPostId === p.id 
                              ? 'border-purple-500 ring-4 ring-purple-500/20' 
                              : 'border-white/5 opacity-40 hover:opacity-100'
                          }`}
                        >
                          {p.full_picture ? (
                            <img src={p.full_picture} alt="Post" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-white/10 flex items-center justify-center">
                              <ImageIcon size={20} />
                            </div>
                          )}
                          {form?.selectedPostId === p.id && (
                            <div className="absolute inset-0 bg-purple-500/40 backdrop-blur-[2px] flex items-center justify-center">
                              <CheckCircle size={24} className="text-white" />
                            </div>
                          )}
                        </button>
                      ))
                    )}
                    
                    {!isLoadingPosts && filteredPosts.length === 0 && (
                      <div className="flex items-center justify-center w-full min-w-[200px] h-24 border-2 border-dashed border-white/5 rounded-2xl">
                         <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest">No matching posts</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase text-prime-400 tracking-[0.25em] px-1">Trigger Keywords</label>
              <div className={`p-4 rounded-[2rem] border transition-all duration-500 ${
                isDarkMode ? 'bg-black/40 border-white/5 focus-within:border-prime-500/50 focus-within:ring-4 focus-within:ring-prime-500/10' : 'bg-gray-50 border-black/5 focus-within:bg-white'
              }`}>
                <input 
                  type="text" 
                  value={form?.keywords || ""}
                  onChange={(e) => setForm({...form, keywords: e.target.value})}
                  className="w-full bg-transparent border-none font-black text-2xl outline-none placeholder:text-gray-600 tracking-tight"
                  placeholder="PRICE, DAM KOTO, DETAILS..."
                />
              </div>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest pl-2">Separate multiple keywords with commas</p>
            </div>
          </div>

          {/* Right Column: Variations */}
          <div className="space-y-8">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-black uppercase text-prime-400 tracking-[0.25em]">Shuffle variations</label>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleGenerateAI} 
                  disabled={isGeneratingAI || !(form?.keywords)}
                  className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-500 px-4 py-2 rounded-xl border ${
                    isGeneratingAI 
                      ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 animate-pulse cursor-not-allowed' 
                      : 'bg-white/5 border-white/10 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/50'
                  }`}
                >
                  {isGeneratingAI ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {isGeneratingAI ? 'Thinking...' : 'AI Generate'}
                </button>
                <button 
                  onClick={handleAddVariation} 
                  className="text-[10px] font-black uppercase text-prime-500 hover:text-prime-400 transition-colors tracking-widest"
                >
                  [ Add Manual ]
                </button>
              </div>
            </div>

            <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2 scrollbar-hide">
              {(form?.variations || []).map((v, i) => (
                <div key={i} className={`p-8 rounded-[2.5rem] border relative group/v transition-all duration-500 ${
                  isDarkMode ? 'bg-black/20 border-white/5 focus-within:border-white/20' : 'bg-gray-50 border-black/5 focus-within:bg-white focus-within:shadow-2xl'
                }`}>
                  {variations.length > 1 && (
                    <button 
                      onClick={() => handleRemoveVariation(i)} 
                      className="absolute top-6 right-6 text-red-500/30 hover:text-red-500 hover:scale-110 transition-all duration-300"
                    >
                      <XCircle size={18} />
                    </button>
                  )}
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <div className="flex items-center gap-2 mb-2 opacity-50">
                        <Globe size={11} className="text-prime-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest ">Variation {i+1} : Public Reply</span>
                      </div>
                      <textarea 
                        value={v.publicReply}
                        onChange={(e) => {
                          setForm(prev => {
                            const currentVariations = [...(prev?.variations || [])];
                            if (currentVariations[i]) {
                              currentVariations[i] = { ...currentVariations[i], publicReply: e.target.value };
                            }
                            return { ...prev, variations: currentVariations };
                          });
                        }}
                        className={`w-full p-4 rounded-2xl border text-[13px] font-medium outline-none transition-all duration-500 ${
                          isDarkMode ? 'bg-black/40 border-white/5 focus:border-prime-500/50' : 'bg-white border-black/10 focus:border-prime-500/50'
                        }`}
                        placeholder="Hello! Check your inbox for the price..."
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2 opacity-50">
                        <Send size={11} className="text-purple-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest ">Private Inbox message</span>
                      </div>
                      <textarea 
                        value={v.privateReply}
                        onChange={(e) => {
                          setForm(prev => {
                            const currentVariations = [...(prev?.variations || [])];
                            if (currentVariations[i]) {
                              currentVariations[i] = { ...currentVariations[i], privateReply: e.target.value };
                            }
                            return { ...prev, variations: currentVariations };
                          });
                        }}
                        className={`w-full p-4 rounded-2xl border text-[13px] font-medium outline-none transition-all duration-500 ${
                          isDarkMode ? 'bg-black/40 border-white/5 focus:border-purple-500/50' : 'bg-white border-black/10 focus:border-purple-500/50'
                        }`}
                        placeholder="Price is 1200 BDT. Would you like to order?"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-8 flex gap-4 border-t border-white/5 justify-end">
          <button 
            onClick={() => {
              setIsAddingDraft(false);
              setEditingDraft(null);
              setSearchTerm('');
              setLocalPosts([]);
            }} 
            className="px-8 py-4 rounded-2.5xl text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all duration-500"
          >
            Cancel
          </button>
          <button 
            onClick={isEditing ? handleUpdateDraft : handleSaveDraft}
            disabled={!(form?.keywords) || (form?.variations || []).some(v => !v.publicReply)}
            className={`px-12 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all duration-500 ${
              !(form?.keywords) || (form?.variations || []).some(v => !v.publicReply)
                ? 'bg-gray-500/10 text-gray-500 cursor-not-allowed'
                : 'bg-prime-500 text-white hover:scale-105 active:scale-95 shadow-prime-500/20'
            }`}
          >
            {isEditing ? 'Pulse-Update Strategy' : 'Deploy new Strategy'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
