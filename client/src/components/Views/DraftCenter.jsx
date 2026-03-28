import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Trash2, Zap, XCircle, Edit3, Layers, Cpu, PlusCircle, Settings, Globe, ShieldCheck, Clock, ArchiveRestore, BookOpen } from 'lucide-react';
import { db } from '../../firebase-client';
import { doc, updateDoc, deleteDoc, addDoc, collection } from 'firebase/firestore';
import ActionMenu from '../Shared/ActionMenu';
import ConfirmModal from '../Shared/ConfirmModal';
import { useBrand } from '../../context/BrandContext';

const DraftCenter = ({ 
  isDarkMode, t, drafts, language, handleApproveDraft, 
  handleExpandKeywords, handleLinguisticExpand, expandingId, toggleVariation 
}) => {
  const { activeBrandId, brandData, refreshBrandData } = useBrand(); 
  const [editingDraft, setEditingDraft] = useState(null);
  const [deletingDraftId, setDeletingDraftId] = useState(null);
  const [selectedDetailDraft, setSelectedDetailDraft] = useState(null);
  const [isAddingDraft, setIsAddingDraft] = useState(false);
  const [addForm, setAddForm] = useState({ keyword: '', result: '' });
  const [editForm, setEditForm] = useState({ keyword: '', result: '' });
  const [selectedDrafts, setSelectedDrafts] = useState(new Set());
  const [activeTab, setActiveTab] = useState('approved'); // 'approved' or 'pending'
  const [editingVar, setEditingVar] = useState({ draftId: null, index: null, value: '' });

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedDrafts);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedDrafts(newSelected);
  };

  // Sync Analysis Window if draft is deleted/approved elsewhere
  useEffect(() => {
    if (selectedDetailDraft) {
      const draftExists = drafts.find(d => d.id === selectedDetailDraft.id);
      if (!draftExists) setSelectedDetailDraft(null);
      else setSelectedDetailDraft(draftExists); // Stay synced with Firestore realtime updates
    }
  }, [drafts]);

  const handleBulkApprove = async () => {
    // Logic for bulk approval
    for (const id of selectedDrafts) {
      const draft = drafts.find(d => d.id === id);
      if (draft) await handleApproveDraft(draft);
    }
    setSelectedDrafts(new Set());
  };

  const handleBulkDelete = async () => {
     // Logic for bulk delete
     for (const id of selectedDrafts) {
       if (activeTab === 'history') {
         await deleteDoc(doc(db, "draft_replies", id));
       } else {
         await updateDoc(doc(db, "draft_replies", id), { status: 'history' });
       }
     }
     setSelectedDrafts(new Set());
  };

  const handleRestoreDraft = async (draftId) => {
    try {
      await updateDoc(doc(db, "draft_replies", draftId), { status: 'approved' });
    } catch (error) {
      console.error("Error restoring draft:", error);
    }
  };

  const handleAddDraft = async () => {
    if (!addForm.keyword || !addForm.result || !activeBrandId) return;
    try {
      await addDoc(collection(db, "draft_replies"), {
        keyword: addForm.keyword,
        result: addForm.result,
        variations: [],
        approvedVariations: [],
        brandId: activeBrandId,
        timestamp: new Date()
      });
      setIsAddingDraft(false);
      setAddForm({ keyword: '', result: '' });
    } catch (error) {
      console.error("Error adding draft:", error);
    }
  };

  const handleEdit = (draft) => {
    setEditingDraft(draft);
    setEditForm({ 
      keyword: draft.keyword, 
      result: draft.result 
    });
  };

  const handleUpdate = async () => {
    if (!editingDraft) return;
    try {
      const draftRef = doc(db, "draft_replies", editingDraft.id);
      await updateDoc(draftRef, editForm);
      setEditingDraft(null);
    } catch (error) {
      console.error("Error updating draft:", error);
    }
  };

  const toggleLinguisticAutomation = async () => {
    if (!activeBrandId) return;
    try {
      if (!activeBrandId || !db) return; // DB Sanity Check
      const brandRef = doc(db, "brands", activeBrandId);
      await updateDoc(brandRef, {
        autoHyperIndex: brandData?.autoHyperIndex === false ? true : false
      });
      if (refreshBrandData) refreshBrandData();
    } catch (error) {
      console.error("Error toggling automation:", error);
    }
  };

  const toggleLearningMode = async () => {
    if (!activeBrandId) return;
    try {
      if (!activeBrandId || !db) return; // DB Sanity Check
      const brandRef = doc(db, "brands", activeBrandId);
      await updateDoc(brandRef, {
        isLearningMode: !brandData?.isLearningMode
      });
      if (refreshBrandData) refreshBrandData();
    } catch (error) {
      console.error("Error toggling learning mode:", error);
    }
  };

  const removeVariation = async (draftId, variationToRemove) => {
    try {
      const draftRef = doc(db, "draft_replies", draftId);
      const draft = drafts.find(d => d.id === draftId);
      if (draft) {
        const newVariations = draft.variations.filter(v => v !== variationToRemove);
        await updateDoc(draftRef, { variations: newVariations });
        if (selectedDetailDraft && selectedDetailDraft.id === draftId) {
          setSelectedDetailDraft({ ...selectedDetailDraft, variations: newVariations });
        }
      }
    } catch (error) {
      console.error("Error removing variation:", error);
    }
  };

  const handleEditVar = (draftId, index, value) => {
    setEditingVar({ draftId, index, value });
  };

  const handleSaveVar = async (draftId, index) => {
    try {
      const draftRef = doc(db, "draft_replies", draftId);
      const draft = drafts.find(d => d.id === draftId);
      if (draft) {
        const newVariations = [...(draft.variations || [])];
        newVariations[index] = editingVar.value;
        await updateDoc(draftRef, { variations: newVariations });
        setEditingVar({ draftId: null, index: null, value: '' });
        if (selectedDetailDraft && selectedDetailDraft.id === draftId) {
          setSelectedDetailDraft({ ...selectedDetailDraft, variations: newVariations });
        }
      }
    } catch (error) {
      console.error("Error saving variation:", error);
    }
  };

  const handleDelete = async () => {
    if (!deletingDraftId) return;
    try {
      if (activeTab === 'history') {
        await deleteDoc(doc(db, "draft_replies", deletingDraftId));
      } else {
        await updateDoc(doc(db, "draft_replies", deletingDraftId), { status: 'history' });
      }
      setDeletingDraftId(null);
    } catch (error) {
      console.error("Error deleting draft:", error);
    }
  };
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className={`text-2xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Layers className="w-8 h-8 text-indigo-500" />
            Meta Growth: Draft Center
            <span className="text-xs font-normal px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              Peak Intelligence
            </span>
          </h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
            Manage autonomous rules and AI-generated suggestions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Linguistic Intelligence Toggle */}
          <button 
            onClick={toggleLinguisticAutomation}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${
              brandData?.autoHyperIndex !== false
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-lg shadow-emerald-500/10'
                : 'bg-gray-500/10 border-gray-500/30 text-gray-500'
            }`}
          >
            <Cpu className={`w-4 h-4 ${brandData?.autoHyperIndex !== false ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-medium">
              {brandData?.autoHyperIndex !== false ? 'Auto-Expansion: ON' : 'Auto-Expansion: OFF'}
            </span>
          </button>

          {/* Learning Mode Toggle */}
          <button 
            onClick={toggleLearningMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${
              brandData?.isLearningMode
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-lg shadow-amber-500/10'
                : 'bg-gray-500/10 border-gray-500/30 text-gray-500'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${brandData?.isLearningMode ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-medium">
              {brandData?.isLearningMode ? 'Learning Mode: ON' : 'Learning Mode: OFF'}
            </span>
          </button>

          <button 
            onClick={async () => {
              if (!activeBrandId) return;
              try {
                const res = await fetch(`/api/brands/${activeBrandId}/index-products`, { method: 'POST' });
                const data = await res.json();
                alert(`Successfully indexed ${data.indexed} product images!`);
              } catch (e) { alert("Error indexing products"); }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 border border-emerald-500/20 rounded-xl transition-all text-sm font-medium"
          >
            <Globe className="w-4 h-4" />
            Sync Product Images
          </button>

          <button 
            onClick={() => setIsAddingDraft(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20 text-sm font-medium"
          >
            <PlusCircle className="w-4 h-4" />
            Add New Rule
          </button>
        </div>
      </div>

      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center gap-6">
          <div>
            <h3 className="text-3xl font-black tracking-tighter mb-1">{t('draft_center')}</h3>
            <p className={`text-[10px] uppercase font-black tracking-[0.2em] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Manage {drafts.length} Captured Intentions
            </p>
          </div>
          
          <button 
             onClick={() => setIsAddingDraft(true)}
             className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
               isDarkMode ? 'bg-white/5 border-white/5 text-prime-400 hover:bg-white/10' : 'bg-prime-50 border-prime-100 text-prime-600 hover:bg-prime-100'
             }`}
          >
             <PlusCircle size={14} />
             Manual Entry
          </button>
        </div>

        <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/5 rounded-2xl">
           <button 
             onClick={() => setActiveTab('approved')}
             className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
               activeTab === 'approved' ? 'bg-prime-500 text-white shadow-lg shadow-prime-500/20' : 'text-gray-500 hover:text-gray-300'
             }`}
           >
             Active Rules
           </button>
           <button 
             onClick={() => setActiveTab('pending')}
             className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
               activeTab === 'pending' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-gray-500 hover:text-gray-300'
             }`}
           >
             Suggestions
             {drafts.filter(d => d.status === 'pending').length > 0 && (
               <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
             )}
           </button>
           <button 
             onClick={() => setActiveTab('history')}
             className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
               activeTab === 'history' ? 'bg-slate-500 text-white shadow-lg shadow-slate-500/20' : 'text-gray-500 hover:text-gray-300'
             }`}
           >
             <Clock size={12} />
             History
           </button>
        </div>

        {selectedDrafts.size > 0 && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
             <button 
              onClick={() => {
                if (selectedDrafts.size === drafts.length) setSelectedDrafts(new Set());
                else setSelectedDrafts(new Set(drafts.map(d => d.id)));
              }}
              className={`text-[10px] uppercase font-black tracking-widest px-4 py-2 rounded-xl border transition-all ${
                isDarkMode ? 'text-gray-500 hover:text-white bg-white/5 border-white/5 hover:border-white/10' : 'text-gray-400 hover:text-gray-900 bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              {selectedDrafts.size === drafts.length ? 'Deselect All' : 'Select All'}
            </button>
            <div className={`h-6 w-px ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'} mx-1`} />
            <button 
              onClick={handleBulkApprove}
              className="px-5 py-2.5 bg-prime-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-prime-500/10 active:scale-95 transition-all"
            >
              Approve {selectedDrafts.size}
            </button>
            <button 
              onClick={handleBulkDelete}
              className="px-5 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all hover:bg-red-500/20"
            >
              Delete {selectedDrafts.size}
            </button>
          </div>
        )}
      </div>

      <div className={`rounded-[2rem] border overflow-hidden ${isDarkMode ? 'bg-[#020617]/40 border-white/5 backdrop-blur-3xl shadow-2xl shadow-black/20' : 'bg-white border-black/5 shadow-xl shadow-black/5'}`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`border-b ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-black/5 bg-gray-50/50'}`}>
              <th className="p-5 w-12">
                <button 
                  onClick={() => {
                    if (selectedDrafts.size === drafts.length) setSelectedDrafts(new Set());
                    else setSelectedDrafts(new Set(drafts.map(d => d.id)));
                  }}
                  className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${
                    selectedDrafts.size === drafts.length && drafts.length > 0
                      ? 'bg-prime-500 border-prime-500'
                      : (isDarkMode ? 'border-white/10 bg-white/5' : 'border-gray-300 bg-white')
                  }`}
                >
                  {selectedDrafts.size === drafts.length && drafts.length > 0 && <CheckCircle size={12} className="text-white" />}
                </button>
              </th>
              <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('keyword')}</th>
              <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('answer')}</th>
              <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Success</th>
              <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">Variations</th>
              <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {drafts.filter(d => d.status === activeTab).length === 0 ? (
              <tr>
                <td colSpan="6" className="p-12 text-center text-gray-500">
                  <MessageSquare size={32} className="mx-auto mb-3 opacity-20" />
                  No {activeTab} drafts found.
                </td>
              </tr>
            ) : (
              drafts.filter(d => d.status === activeTab).map((draft) => (
                <tr 
                  key={draft.id} 
                  onClick={() => setSelectedDetailDraft(draft)}
                  className={`group cursor-pointer transition-all hover:scale-[0.99] origin-center ${
                    selectedDrafts.has(draft.id) 
                      ? (isDarkMode ? 'bg-prime-500/5' : 'bg-prime-500/[0.02]')
                      : (isDarkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50')
                  }`}
                >
                  <td className="p-5" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => toggleSelect(draft.id)}
                      className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${
                        selectedDrafts.has(draft.id)
                          ? 'bg-prime-500 border-prime-500'
                          : (isDarkMode ? 'border-white/10 bg-white/5 opacity-0 group-hover:opacity-100' : 'border-gray-300 bg-white opacity-0 group-hover:opacity-100')
                      }`}
                    >
                      {selectedDrafts.has(draft.id) && <CheckCircle size={12} className="text-white" />}
                    </button>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                         <span className={`text-sm font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{draft.keyword}</span>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {draft.type === 'knowledge_base' && (
                          <span className="bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20 text-[7px] font-black uppercase tracking-widest flex items-center gap-1">
                            <BookOpen size={8} /> Knowledge
                          </span>
                        )}
                        {draft.type === 'auto_learned' && (
                          <span className="bg-prime-500/10 text-prime-400 px-1.5 py-0.5 rounded border border-prime-500/20 text-[7px] font-black uppercase tracking-widest">
                            Auto-Learned
                          </span>
                        )}
                        {draft.imageHashes && draft.imageHashes.length > 0 && (
                          <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 text-[7px] font-black uppercase tracking-widest flex items-center gap-1">
                            🖼️ {draft.imageHashes.length} Images
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-5 max-w-xs lg:max-w-md">
                    <p className={`text-xs font-medium line-clamp-1  ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>"{draft.result}"</p>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col">
                      <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{draft.successCount || 0}</span>
                      <span className="text-[8px] font-black uppercase text-gray-500">Orders</span>
                    </div>
                  </td>
                  <td className="p-5 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                       <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                         {draft.variations?.length || 0} items
                       </span>
                       <button 
                         onClick={() => handleExpandKeywords(draft.id, draft.keyword)}
                         disabled={expandingId === draft.id}
                         className={`p-1.5 rounded-lg transition-all ${
                           expandingId === draft.id ? 'bg-prime-500/20 text-prime-400 animate-pulse' : 'hover:bg-white/5 text-gray-400'
                         }`}
                       >
                         <Zap size={12} />
                       </button>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex justify-end items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {activeTab === 'history' ? (
                        <button 
                          onClick={() => handleRestoreDraft(draft.id)}
                          title="Restore"
                          className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 shadow-lg shadow-emerald-500/10' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500/10'}`}
                        >
                           <ArchiveRestore size={16} />
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleApproveDraft(draft)}
                            title="Approve"
                            className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-prime-500/10 text-prime-400 hover:bg-prime-500/20 shadow-lg shadow-prime-500/10' : 'bg-prime-50 text-prime-600 hover:bg-prime-500/10'}`}
                          >
                             <CheckCircle size={16} />
                          </button>
                          <button 
                            onClick={() => handleEdit(draft)}
                            title="Edit"
                            className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}
                          >
                             <Edit3 size={16} />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => setDeletingDraftId(draft.id)}
                        title={activeTab === 'history' ? "Delete Permanently" : "Move to History"}
                        className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                      >
                         <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Draft Detail Modal (Popup Window) */}
      {selectedDetailDraft && (
        <div 
          onClick={() => setSelectedDetailDraft(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300"
        >
           <div 
             onClick={(e) => e.stopPropagation()}
             className={`w-full max-w-5xl h-[85vh] overflow-hidden rounded-[3rem] border transition-all animate-in zoom-in-95 duration-300 ${
               isDarkMode ? 'bg-[#020617] border-white/10 text-white shadow-2xl shadow-black' : 'bg-white border-black/5 text-gray-900 shadow-2xl shadow-black/5'
             }`}
           >
             <div className="flex flex-col h-full uppercase tracking-widest">
                {/* Header with Top-Aligned Actions */}
                <div className={`p-8 border-b transition-colors flex justify-between items-center ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-black/5 bg-gray-50/50'}`}>
                   <div className="flex items-center gap-5">
                      <div className="p-3 bg-prime-500/20 rounded-2xl">
                         <MessageSquare className="text-prime-400" size={24} />
                      </div>
                      <div>
                        <h4 className="text-2xl font-black tracking-tighter normal-case">Analysis Window</h4>
                        <p className="text-[9px] font-black text-gray-500">Draft Processing Engine • Live Intelligence</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-3">
                      <button 
                        onClick={() => {
                            handleApproveDraft(selectedDetailDraft);
                            setSelectedDetailDraft(null);
                        }}
                        className="px-6 py-3 bg-prime-500 text-white rounded-xl text-[10px] font-black shadow-xl shadow-prime-500/20 active:scale-95 transition-all"
                      >
                        Approve & Sync
                      </button>
                      {selectedDetailDraft.status === 'history' ? (
                        <button 
                          onClick={() => {
                              handleRestoreDraft(selectedDetailDraft.id);
                              setSelectedDetailDraft(null);
                          }}
                          className="px-6 py-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 rounded-xl text-[10px] font-black active:scale-95 transition-all"
                        >
                          Restore Rule
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={() => {
                              handleEdit(selectedDetailDraft);
                              setSelectedDetailDraft(null);
                            }}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-gray-400 hover:text-white' : 'bg-gray-100 border-gray-200 text-gray-600'}`}
                          >
                            {t('edit')}
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => {
                            setDeletingDraftId(selectedDetailDraft.id);
                            setSelectedDetailDraft(null);
                        }}
                        className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/10 rounded-xl text-[10px] font-black active:scale-95 transition-all"
                      >
                        {selectedDetailDraft.status === 'history' ? 'Delete Permanently' : t('delete')}
                      </button>
                      <div className="h-8 w-px bg-white/10 mx-2" />
                      <button 
                        onClick={() => setSelectedDetailDraft(null)}
                        className={`p-3 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5 text-gray-500 hover:text-white' : 'hover:bg-black/5 text-gray-400 hover:text-gray-900'}`}
                      >
                        <XCircle size={22} />
                      </button>
                   </div>
                </div>

                {/* Main Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-thin">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-4">
                         <div className="flex items-center gap-2 mb-2">
                           <Layers size={14} className="text-prime-400" />
                           <label className="text-[10px] font-black uppercase text-prime-400">Statement Logic</label>
                         </div>
                         <div className={`p-8 rounded-[2rem] border font-black text-3xl tracking-tighter leading-snug  normal-case ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-gray-50 border-black/5'}`}>
                           "{selectedDetailDraft.keyword}"
                         </div>
                      </div>
                      <div className="space-y-4">
                         <div className="flex items-center gap-2 mb-2">
                           <Cpu size={14} className="text-prime-400" />
                           <label className="text-[10px] font-black uppercase text-prime-400">AI Response Construction</label>
                         </div>
                         <div className={`p-8 rounded-[2rem] border font-medium text-xl leading-relaxed normal-case ${isDarkMode ? 'bg-black/20 border-white/5 text-gray-300' : 'bg-black/5 border-black/5 text-gray-700'}`}>
                           {selectedDetailDraft.result}
                         </div>
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                           <Zap size={18} className="text-prime-400" />
                           <label className="text-[10px] font-black uppercase text-prime-400">Generative Semantic Expansion</label>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                              onClick={() => handleLinguisticExpand(selectedDetailDraft.id, selectedDetailDraft.keyword)}
                              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${
                                expandingId === selectedDetailDraft.id ? 'bg-indigo-500/20 text-indigo-400 animate-pulse' : 'bg-white/5 text-gray-400 hover:text-white border-white/5'
                              }`}
                            >
                              <Globe size={14} />
                              <span>{expandingId === selectedDetailDraft.id ? 'Processing...' : 'Linguistic Expansion'}</span>
                            </button>
                            <button 
                              onClick={() => handleExpandKeywords(selectedDetailDraft.id, selectedDetailDraft.keyword)}
                              className={`relative flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all overflow-hidden ${
                                expandingId === selectedDetailDraft.id ? 'bg-prime-500/20 text-prime-400 animate-pulse' : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
                              }`}
                            >
                              {expandingId === selectedDetailDraft.id && <div className="absolute inset-0 animate-shimmer" />}
                              <span className="relative z-10">{expandingId === selectedDetailDraft.id ? 'Gemini Generating...' : 'AI Semantic Expansion'}</span>
                            </button>
                         </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                         {selectedDetailDraft.variations?.map((v, idx) => {
                           const isEditing = editingVar.draftId === selectedDetailDraft.id && editingVar.index === idx;
                           return (
                             <div 
                               key={idx} 
                               className={`group/v relative p-4 rounded-xl border transition-all text-xs font-bold leading-relaxed ${isDarkMode ? 'bg-white/5 border-white/5 text-gray-300 hover:border-prime-500/30' : 'bg-gray-50 border-gray-100 text-gray-700 hover:border-prime-500/30'}`}
                             >
                               {isEditing ? (
                                 <div className="flex items-center gap-2">
                                   <input 
                                     type="text"
                                     value={editingVar.value}
                                     onChange={(e) => setEditingVar({ ...editingVar, value: e.target.value })}
                                     className={`flex-1 bg-transparent border-none outline-none text-white font-bold p-0`}
                                     autoFocus
                                     onKeyDown={(e) => e.key === 'Enter' && handleSaveVar(selectedDetailDraft.id, idx)}
                                   />
                                   <button 
                                     onClick={() => handleSaveVar(selectedDetailDraft.id, idx)}
                                     className="text-emerald-500 hover:text-emerald-400 transition-colors"
                                   >
                                     <CheckCircle size={14} />
                                   </button>
                                 </div>
                               ) : (
                                 <div className="flex justify-between items-center gap-2">
                                   <span className="truncate">{v}</span>
                                   <button 
                                     onClick={() => handleEditVar(selectedDetailDraft.id, idx, v)}
                                     className="opacity-0 group-hover/v:opacity-60 hover:opacity-100 transition-all text-gray-400"
                                   >
                                     <Edit3 size={12} />
                                   </button>
                                 </div>
                               )}
                               
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   removeVariation(selectedDetailDraft.id, v);
                                 }}
                                 className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover/v:opacity-100 transition-all hover:scale-110 shadow-lg"
                               >
                                 <XCircle size={12} />
                               </button>
                             </div>
                           );
                         })}
                      </div>
                   </div>
                   
                   {/* Scroll Indicator for long content */}
                   <div className="pt-10 text-center">
                      <p className="text-[9px] font-black text-gray-600 uppercase">End of Semantic Analysis</p>
                   </div>
                </div>
             </div>
           </div>
        </div>
      )}

      {/* Edit Draft Modal */}
      {editingDraft && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-[3rem] border shadow-2xl overflow-hidden ${
            isDarkMode ? 'bg-[#020617] border-white/10 text-white shadow-black/50' : 'bg-white border-black/5 text-gray-900 shadow-black/10'
          } animate-in zoom-in-95 duration-200`}>
            <div className="p-10 space-y-8">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-prime-500/10 rounded-2xl shadow-inner shadow-prime-500/5">
                  <Edit3 className="text-prime-400" size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tighter">{t('edit_draft')}</h3>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{t('manage')} • AI Content Engine</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 pl-1">{t('keyword')}</label>
                  <input 
                    type="text" 
                    value={editForm.keyword}
                    onChange={(e) => setEditForm({...editForm, keyword: e.target.value})}
                    className={`w-full p-5 rounded-2xl outline-none border font-bold transition-all ${
                      isDarkMode ? 'bg-black/40 border-white/5 focus:border-prime-500/50' : 'bg-gray-50 border-black/5 focus:border-prime-500/50'
                    }`}
                    placeholder="Enter keyword..."
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 pl-1">{t('answer')}</label>
                  <textarea 
                    value={editForm.result}
                    onChange={(e) => setEditForm({...editForm, result: e.target.value})}
                    className={`w-full h-56 p-5 rounded-3xl outline-none border font-medium leading-relaxed transition-all resize-none ${
                      isDarkMode ? 'bg-black/40 border-white/5 focus:border-prime-500/50' : 'bg-gray-50 border-black/5 focus:border-prime-500/50'
                    }`}
                    placeholder="Refine the AI answer..."
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setEditingDraft(null)}
                  className={`flex-1 py-5 rounded-2xl text-[11px] uppercase font-black tracking-widest transition-all ${
                    isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {t('cancel')}
                </button>
                <button 
                  onClick={handleUpdate}
                  className="flex-1 py-5 rounded-2xl text-[11px] uppercase font-black tracking-widest bg-prime-500 text-white hover:bg-prime-600 shadow-2xl shadow-prime-500/20 active:scale-95 transition-all"
                >
                  {t('save_changes')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Draft Confirmation */}
      <ConfirmModal 
        isOpen={!!deletingDraftId}
        onClose={() => setDeletingDraftId(null)}
        onConfirm={handleDelete}
        title={activeTab === 'history' ? "Delete Permanently" : t('confirm_delete')}
        message={activeTab === 'history' ? "Are you sure you want to permanently delete this draft from history? This cannot be undone." : "Are you sure you want to move this draft to history? It will no longer be active."}
        isDarkMode={isDarkMode}
        t={t}
      />

      {/* Manual Add Draft Modal */}
      {isAddingDraft && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-[3.5rem] border shadow-2xl overflow-hidden ${
            isDarkMode ? 'bg-[#021024] border-white/10 text-white shadow-black/50' : 'bg-white border-black/5 text-gray-900 shadow-black/10'
          } animate-in zoom-in-95 duration-200`}>
             <div className="p-10 space-y-8">
                <div className="flex items-center gap-5">
                   <div className="p-4 bg-prime-500/20 rounded-[2rem] shadow-inner">
                      <PlusCircle className="text-prime-400" size={28} />
                   </div>
                   <div>
                     <h3 className="text-3xl font-black tracking-tighter ">Manual Entry</h3>
                     <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Add Custom Intent Strategy</p>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-prime-400 tracking-[0.25em] pl-1">Target Keyword</label>
                      <input 
                        type="text" 
                        value={addForm.keyword}
                        onChange={(e) => setAddForm({...addForm, keyword: e.target.value})}
                        className={`w-full p-5 rounded-[1.5rem] border font-black text-xl outline-none transition-all ${
                          isDarkMode ? 'bg-black/40 border-white/5 focus:border-prime-500/50' : 'bg-gray-50 border-black/5 focus:border-prime-500/50'
                        }`}
                        placeholder="Keyword..."
                      />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-prime-400 tracking-[0.25em] pl-1">Primary Response</label>
                      <textarea 
                        value={addForm.result}
                        onChange={(e) => setAddForm({...addForm, result: e.target.value})}
                        className={`w-full h-44 p-5 rounded-[2rem] border font-medium text-lg leading-relaxed outline-none transition-all resize-none ${
                          isDarkMode ? 'bg-black/40 border-white/5 focus:border-prime-500/50' : 'bg-gray-50 border-black/5 focus:border-prime-500/50'
                        }`}
                        placeholder="Response content..."
                      />
                   </div>
                </div>

                <div className="flex gap-4 pt-4">
                   <button 
                     onClick={() => setIsAddingDraft(false)}
                     className={`flex-1 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all ${
                       isDarkMode ? 'bg-white/5 text-gray-500 hover:text-white' : 'bg-gray-100 text-gray-600'
                     }`}
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={handleAddDraft}
                     className="flex-1 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest bg-prime-500 text-white shadow-2xl shadow-prime-500/20 hover:scale-105 active:scale-95 transition-all"
                   >
                     Create Draft
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftCenter;
