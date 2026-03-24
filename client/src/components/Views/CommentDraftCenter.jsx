import React, { useState, useEffect } from 'react';
import { MessageCircle, CheckCircle, Trash2, Edit3, PlusCircle, XCircle, Shuffle, Send, Globe, Settings, ThumbsUp, ShieldAlert, UserPlus, BrainCircuit, Timer, Sparkles, Loader2, TrendingUp } from 'lucide-react';
import { db } from '../../firebase-client';
import { doc, updateDoc, deleteDoc, addDoc, collection, getDoc } from 'firebase/firestore';
import { useBrand } from '../../context/BrandContext';
import axios from 'axios';
import ConfirmModal from '../Shared/ConfirmModal';

const CommentDraftCenter = ({ isDarkMode, t, commentDrafts, pendingComments = [] }) => {
  const { activeBrandId, brandData, refreshBrandData } = useBrand();
  const [activeTab, setActiveTab] = useState('strategies'); // 'strategies' or 'pending'
  const [isAddingDraft, setIsAddingDraft] = useState(false);
  const [editingDraft, setEditingDraft] = useState(null);
  const [deletingDraftId, setDeletingDraftId] = useState(null);
  const [addForm, setAddForm] = useState({ keywords: '', variations: [{ publicReply: '', privateReply: '' }], showManualPostId: false, selectedPostId: '' });
  const [editForm, setEditForm] = useState({ keywords: '', variations: [], selectedPostId: '', showManualPostId: false });
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [rowLoading, setRowLoading] = useState({}); // Tracking row-level loading
  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  
  // Settings State
  const [settings, setSettings] = useState({
    spamFilter: false,
    leadCapture: false,
    humanDelay: true, // Default to true as requested
    aiReply: true,
    systemAutoReply: true,
    humanHandoff: true // New
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (brandData?.commentSettings) {
      setSettings(prev => ({
        ...prev,
        ...brandData.commentSettings
      }));
    }
    
    // Fetch latest posts for the selector
    const fetchPosts = async () => {
      if (!activeBrandId) return;
      setIsLoadingPosts(true);
      try {
        const res = await axios.get(`/api/brands/${activeBrandId}/posts`);
        setPosts(res.data.posts || []);
      } catch (e) {
        console.error("Error fetching posts:", e);
      } finally {
        setIsLoadingPosts(false);
      }
    };
    fetchPosts();
  }, [brandData, activeBrandId]);

  const handleGenerateAI = async (formType) => {
    const keywords = formType === 'add' ? addForm.keywords : editForm.keywords;
    if (!keywords || !activeBrandId) return;

    setIsGeneratingAI(true);
    try {
      const resp = await axios.post('/api/ai/generate-comment-variations', {
        keywords: keywords.split(',').map(k => k.trim()),
        brandId: activeBrandId,
        count: 5 // Generate 5 at a time
      });

      if (resp.data.success) {
        const newVariations = resp.data.variations;
        if (formType === 'add') {
          setAddForm(prev => ({
            ...prev,
            variations: [...prev.variations, ...newVariations].filter(v => v.publicReply !== '')
          }));
        } else {
          setEditForm(prev => ({
            ...prev,
            variations: [...prev.variations, ...newVariations]
          }));
        }
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleQuickGenerateAI = async (draft) => {
    if (!activeBrandId || !draft.id) return;
    
    setRowLoading(prev => ({ ...prev, [draft.id]: true }));
    try {
      const resp = await axios.post('/api/ai/generate-comment-variations', {
        keywords: draft.keywords,
        brandId: activeBrandId,
        count: 10 // Generate 10 variations at once as requested
      });

      if (resp.data.success) {
        const newVariations = resp.data.variations;
        await updateDoc(doc(db, "comment_drafts", draft.id), {
          variations: [...draft.variations, ...newVariations]
        });
      }
    } catch (error) {
      console.error("Quick AI Generation Error:", error);
    } finally {
      setRowLoading(prev => ({ ...prev, [draft.id]: false }));
    }
  };

  const handleToggleSetting = async (key) => {
    if (!activeBrandId) return;
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    setIsSavingSettings(true);
    try {
      await updateDoc(doc(db, "brands", activeBrandId), {
        commentSettings: newSettings
      });
      await refreshBrandData();
    } catch (error) {
      console.error("Error updating settings:", error);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAddVariation = () => {
    setAddForm(prev => ({
      ...prev,
      variations: [...prev.variations, { publicReply: '', privateReply: '' }]
    }));
  };

  const handleMoveToStrategy = async (pc, strategyId) => {
    try {
      const strategy = commentDrafts.find(d => d.id === strategyId);
      if (!strategy) return;
      
      const newKeywords = Array.from(new Set([...strategy.keywords, pc.commentText]));
      await updateDoc(doc(db, "comment_drafts", strategyId), {
        keywords: newKeywords
      });
      await deleteDoc(doc(db, "pending_comments", pc.id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleNewFromPending = (pc) => {
    setAddForm({
      keywords: pc.commentText,
      variations: [{ publicReply: '', privateReply: '' }],
      originPendingId: pc.id
    });
    setIsAddingDraft(true);
  };

  const handleSpamPending = async (pc) => {
    try {
      await axios.post('/api/ai/hide-comment', { // We need this endpoint or reuse facebookService
        commentId: pc.commentId,
        brandId: activeBrandId
      });
      await deleteDoc(doc(db, "pending_comments", pc.id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveAddVariation = (index) => {
    setAddForm(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index)
    }));
  };

  // NEW: Updated handleSaveDraft to save postId
  const handleSaveDraft = async () => {
    if (!addForm.keywords || addForm.variations.some(v => !v.publicReply) || !activeBrandId) return;
    try {
      const keywordsArray = addForm.keywords.split(',').map(k => k.trim()).filter(Boolean);
      await addDoc(collection(db, "comment_drafts"), {
        keywords: keywordsArray,
        variations: addForm.variations,
        brandId: activeBrandId,
        postId: addForm.selectedPostId || null, // SAVE POST ID
        timestamp: new Date()
      });

      if (addForm.originPendingId) {
        await deleteDoc(doc(db, "pending_comments", addForm.originPendingId));
      }

      setIsAddingDraft(false);
      setAddForm({ keywords: '', variations: [{ publicReply: '', privateReply: '' }], originPendingId: null, selectedPostId: '' });
    } catch (error) {
      console.error("Error adding comment draft:", error);
    }
  };

  const handleEdit = (draft) => {
    setEditingDraft(draft);
    setEditForm({
      keywords: (draft.keywords || []).join(', '),
      variations: draft.variations || [],
      selectedPostId: draft.postId || '' // LOAD POST ID
    });
  };

  const handleUpdateDraft = async () => {
    if (!editingDraft || !activeBrandId) return;
    try {
      const keywordsArray = editForm.keywords.split(',').map(k => k.trim()).filter(Boolean);
      await updateDoc(doc(db, "comment_drafts", editingDraft.id), {
        keywords: keywordsArray,
        variations: editForm.variations,
        postId: editForm.selectedPostId || null // UPDATE POST ID
      });
      setEditingDraft(null);
    } catch (error) {
      console.error("Error updating comment draft:", error);
    }
  };

  const handleDelete = async () => {
    if (!deletingDraftId) return;
    try {
      await deleteDoc(doc(db, "comment_drafts", deletingDraftId));
      setDeletingDraftId(null);
    } catch (error) {
      console.error("Error deleting comment draft:", error);
    }
  };

  const SettingToggle = ({ icon: Icon, label, description, active, onToggle, color = "prime" }) => (
    <div className={`p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/[0.08]' : 'bg-gray-50 border-black/5 hover:bg-gray-100/50'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl ${active ? `bg-${color}-500/20 text-${color}-400` : 'bg-gray-500/10 text-gray-500'}`}>
            <Icon size={18} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest">{label}</p>
            <p className="text-[9px] text-gray-500 font-medium">{description}</p>
          </div>
        </div>
        <button 
          onClick={onToggle}
          className={`relative w-10 h-5 rounded-full transition-all duration-300 ${active ? `bg-${color}-500 shadow-lg shadow-${color}-500/20` : 'bg-gray-600'}`}
        >
          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${active ? 'left-6' : 'left-1'}`} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h3 className="text-3xl font-black tracking-tighter mb-1">Comment Draft Center</h3>
          <p className={`text-[10px] uppercase font-black tracking-[0.2em] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Manage {commentDrafts.length} Automated Comment Strategies
          </p>
        </div>
        <button 
          onClick={() => setIsAddingDraft(true)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
            isDarkMode ? 'bg-white/5 border-white/5 text-prime-400 hover:bg-white/10' : 'bg-prime-50 border-prime-100 text-prime-600 hover:bg-prime-100'
          }`}
        >
          <PlusCircle size={14} />
          New Strategy
        </button>
      </div>

      {/* Advanced Settings Panel */}
      <div className={`p-6 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#020617]/40 border-white/5' : 'bg-white border-black/5 shadow-xl shadow-black/5'}`}>
        <div className="flex items-center gap-2 mb-6 px-2">
          <Settings size={16} className="text-prime-400" />
          <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">{t('advanced_settings')}</h4>
          {isSavingSettings && <span className="ml-2 text-[9px] text-prime-400 animate-pulse font-black uppercase tracking-widest italic">Saving...</span>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <SettingToggle 
            icon={BrainCircuit} 
            label="AI Auto-Reply" 
            description="AI takes over if no keyword match"
            active={settings.aiReply}
            onToggle={() => handleToggleSetting('aiReply')}
            color="prime"
          />
          <SettingToggle 
            icon={Shuffle} 
            label="System Match" 
            description="Prioritize your keyword strategies"
            active={settings.systemAutoReply}
            onToggle={() => handleToggleSetting('systemAutoReply')}
            color="indigo"
          />
          <SettingToggle 
            icon={ShieldAlert} 
            label={t('spam_filter')} 
            description="Hide links and blacklisted keywords"
            active={settings.spamFilter}
            onToggle={() => handleToggleSetting('spamFilter')}
            color="red"
          />
          <SettingToggle 
            icon={UserPlus} 
            label={t('lead_capture')} 
            description="Save commenters to leads database"
            active={settings.leadCapture}
            onToggle={() => handleToggleSetting('leadCapture')}
            color="green"
          />
          <SettingToggle 
            icon={MessageCircle} 
            label="Human Handoff" 
            description="Send to Pending if admin is requested"
            active={settings.humanHandoff}
            onToggle={() => handleToggleSetting('humanHandoff')}
            color="purple"
          />
          <SettingToggle 
            icon={Timer} 
            label={t('human_delay')} 
            description="Replies sent with 5-15s delay"
            active={settings.humanDelay}
            onToggle={() => handleToggleSetting('humanDelay')}
            color="orange"
          />
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex gap-4 px-2">
        <button 
          onClick={() => setActiveTab('post_id')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'post_id' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-gray-500 hover:text-white'}`}
        >
          Post ID Custom Reply ({commentDrafts.filter(d => d.postId).length})
        </button>
        <button 
          onClick={() => setActiveTab('strategies')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'strategies' ? 'bg-prime-500 text-white shadow-lg shadow-prime-500/20' : 'text-gray-500 hover:text-white'}`}
        >
          Active Strategies ({commentDrafts.filter(d => !d.postId).length})
        </button>
        <button 
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-white'}`}
        >
          Pending Review ({pendingComments.length})
        </button>
      </div>

      {activeTab === 'post_id' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <div>
              <h3 className="text-xl font-black tracking-tight italic">Post-Specific Targeting</h3>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Unique keyword triggers for individual Facebook posts</p>
            </div>
            <button 
              onClick={() => {
                setAddForm({ keywords: '', variations: [{ publicReply: '', privateReply: '' }], selectedPostId: '' });
                setIsAddingDraft(true);
              }}
              className="px-6 py-3 rounded-2xl bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-purple-500/20"
            >
              <PlusCircle size={14} /> Add Post Strategy
            </button>
          </div>
          <div className={`rounded-[2rem] border overflow-hidden ${isDarkMode ? 'bg-[#020617]/40 border-white/5 backdrop-blur-3xl shadow-2xl shadow-black/20' : 'bg-white border-black/5 shadow-xl shadow-black/5'}`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-black/5 bg-gray-50/50'}`}>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-1/5">Target Post</th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-1/5">Keywords</th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-2/5">Variations (Shuffle Pool)</th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {commentDrafts.filter(d => d.postId).length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-gray-500">
                    <MessageCircle size={32} className="mx-auto mb-3 opacity-20" />
                    No Post-Specific strategies created yet.
                  </td>
                </tr>
              ) : (
                commentDrafts.filter(d => d.postId).map((draft) => (
                  <tr key={draft.id} className={`group transition-all ${isDarkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'}`}>
                    <td className="p-5">
                       <span className="px-2 py-0.5 rounded-full bg-prime-500/10 text-prime-400 text-[9px] font-black uppercase tracking-wider border border-prime-500/20">
                        Post ID: {draft.postId.slice(-8)}
                      </span>
                      <p className="text-[10px] text-gray-500 mt-2 line-clamp-2 max-w-[150px]">
                        {posts.find(p => p.id === draft.postId)?.message || "Original post content..."}
                      </p>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-wrap gap-2">
                        {draft.keywords.map((kw, i) => (
                          <span key={i} className={`px-4 py-1.5 rounded-xl text-[10px] font-bold tracking-tight transition-all border ${
                            isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-black/5 text-gray-900'
                          }`}>
                            {kw.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Shuffle size={12} className="text-prime-500" />
                          <span className="text-[10px] font-black uppercase text-gray-500">{draft.variations.length} Shuffle Variations</span>
                        </div>
                        <div className="flex flex-col gap-2">
                          {draft.variations.slice(0, 1).map((v, i) => (
                            <div key={i} className={`p-3 rounded-xl border text-[11px] ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-black/5'}`}>
                              <p className="font-medium italic mb-1 opacity-60">"Public: {v.publicReply}"</p>
                              {v.privateReply && <p className="font-medium text-prime-400">"Private: {v.privateReply}"</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-end items-center gap-2">
                        <button onClick={() => handleEdit(draft)} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-white/5 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-gray-900'}`}><Edit3 size={16} /></button>
                        <button onClick={() => setDeletingDraftId(draft.id)} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500'}`}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      ) : activeTab === 'strategies' ? (
        <div className={`rounded-[2rem] border overflow-hidden ${isDarkMode ? 'bg-[#020617]/40 border-white/5 backdrop-blur-3xl shadow-2xl shadow-black/20' : 'bg-white border-black/5 shadow-xl shadow-black/5'}`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`border-b ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-black/5 bg-gray-50/50'}`}>
              <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-1/5">Keywords</th>
              <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-2/5">Variations (Shuffle Pool)</th>
              <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-1/5">Performance</th>
              <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {commentDrafts.filter(d => !d.postId).length === 0 ? (
              <tr>
                <td colSpan="4" className="p-12 text-center text-gray-500">
                  <MessageCircle size={32} className="mx-auto mb-3 opacity-20" />
                  No global comment strategies created yet.
                </td>
              </tr>
            ) : (
              commentDrafts.filter(d => !d.postId).map((draft) => (
                <tr key={draft.id} className={`group transition-all ${isDarkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'}`}>
                  <td className="py-6 pl-6">
                    <div className="flex flex-wrap gap-2">
                      {draft.keywords.map((kw, i) => (
                        <span key={i} className={`px-4 py-1.5 rounded-xl text-[10px] font-bold tracking-tight transition-all border ${
                          isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-black/5 text-gray-900'
                        }`}>
                          {kw.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Shuffle size={12} className="text-prime-500" />
                        <span className="text-[10px] font-black uppercase text-gray-500">{draft.variations.length} Shuffle Variations</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {draft.variations.slice(0, 2).map((v, i) => (
                          <div key={i} className={`p-3 rounded-xl border text-[11px] ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-black/5'}`}>
                            <div className="flex items-center gap-2 mb-1 opacity-60">
                              <Globe size={10} /> <span className="uppercase font-black tracking-widest text-[8px]">Public:</span>
                            </div>
                            <p className="font-medium italic mb-2">"{v.publicReply}"</p>
                            {v.privateReply && (
                              <div className="mt-2 pt-2 border-t border-white/5">
                                <div className="flex items-center justify-between gap-2 mb-1 opacity-60">
                                  <div className="flex items-center gap-2">
                                    <Send size={10} /> <span className="uppercase font-black tracking-widest text-[8px]">Private</span>
                                  </div>
                                  {v.buttonText && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-prime-500/20 text-prime-400 text-[7px] font-black uppercase tracking-widest border border-prime-500/30 flex items-center gap-1">
                                      <PlusCircle size={8} /> Button: {v.buttonText}
                                    </span>
                                  )}
                                </div>
                                <p className="font-medium text-prime-400">"{v.privateReply}"</p>
                              </div>
                            )}
                          </div>
                        ))}
                        {draft.variations.length > 2 && (
                          <p className="text-[10px] font-black text-gray-500 italic pl-1">+{draft.variations.length - 2} more variations...</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={12} className="text-green-500" />
                        <span className="text-[10px] font-black uppercase text-gray-500">Hit Rate</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {draft.variations.slice(0, 2).map((v, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500/50 transition-all duration-1000" 
                                style={{ width: `${Math.min((v.hitCount || 0) * 10, 100)}%` }} 
                              />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 min-w-[3rem] text-right">
                              {v.hitCount || 0} hits
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                   <td className="p-5">
                    <div className="flex justify-end items-center gap-2">
                      <button 
                        onClick={() => handleQuickGenerateAI(draft)}
                        disabled={rowLoading[draft.id]}
                        title="Quick AI Generation (10 Variations)"
                        className={`p-2 rounded-xl transition-all ${rowLoading[draft.id] ? 'bg-purple-500/10 text-purple-400 animate-pulse' : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 active:scale-95'}`}
                      >
                         {rowLoading[draft.id] ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      </button>
                      <button 
                        onClick={() => handleEdit(draft)}
                        className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => setDeletingDraftId(draft.id)}
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
      ) : (
        /* Pending Comments View */
        <div className={`rounded-[2rem] border overflow-hidden ${isDarkMode ? 'bg-[#020617]/40 border-white/5 backdrop-blur-3xl shadow-2xl shadow-black/20' : 'bg-white border-black/5 shadow-xl shadow-black/5'}`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-black/5 bg-gray-50/50'}`}>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-1/4">Commenter</th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Message</th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pendingComments.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-12 text-center text-gray-500">
                    <MessageCircle size={32} className="mx-auto mb-3 opacity-20" />
                    No pending comments to review.
                  </td>
                </tr>
              ) : (
                pendingComments.map((pc) => (
                  <tr key={pc.id} className={`group transition-all ${isDarkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'}`}>
                    <td className="p-5">
                       <div className="flex items-center gap-2 mb-1">
                         <p className="text-[11px] font-black uppercase tracking-widest text-prime-400">{pc.fromName}</p>
                         {pc.type === 'human_requested' && (
                           <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[8px] font-black uppercase tracking-wider border border-red-500/20 animate-pulse">
                             Human Requested
                           </span>
                         )}
                       </div>
                       <p className="text-[9px] text-gray-500 opacity-60">ID: {pc.fromId}</p>
                    </td>
                    <td className="p-5">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{pc.commentText}</p>
                      <p className="text-[9px] text-gray-500 mt-1 italic">Post ID: {pc.postId}</p>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-end items-center gap-2">
                        <button 
                          onClick={() => handleNewFromPending(pc)}
                          title="Create New Strategy"
                          className="p-2 rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all"
                        >
                          <PlusCircle size={16} />
                        </button>
                        <select 
                          onChange={(e) => handleMoveToStrategy(pc, e.target.value)}
                          className={`p-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest outline-none border ${isDarkMode ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-gray-50 border-black/10 text-gray-600'}`}
                          defaultValue=""
                        >
                          <option value="" disabled>Move to Strategy...</option>
                          <optgroup label="Global Strategies">
                            {commentDrafts.filter(d => !d.postId).map(d => (
                              <option key={d.id} value={d.id}>{d.keywords[0]} ({d.variations.length})</option>
                            ))}
                          </optgroup>
                          <optgroup label="Post-Specific Strategies">
                            {commentDrafts.filter(d => d.postId).map(d => (
                              <option key={d.id} value={d.id}>Post: {d.postId.slice(-6)} - {d.keywords[0]}</option>
                            ))}
                          </optgroup>
                        </select>
                        <button 
                          onClick={() => handleSpamPending(pc)}
                          title="Mark as Spam (Hide)"
                          className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                        >
                          <ShieldAlert size={16} />
                        </button>
                        <button 
                          onClick={() => deleteDoc(doc(db, "pending_comments", pc.id))}
                          className="p-2 rounded-xl hover:bg-white/5 transition-all text-gray-500"
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
      )}

      {/* Add Strategy Modal */}
      {isAddingDraft && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] border shadow-2xl ${isDarkMode ? 'bg-[#021024] border-white/10 text-white' : 'bg-white border-black/5 text-gray-900'} p-10 space-y-8 scrollbar-hide`}>
            <div className="flex items-center gap-5">
              <div className="p-4 bg-prime-500/20 rounded-[2rem]">
                <PlusCircle className="text-prime-400" size={28} />
              </div>
              <div>
                <h3 className="text-3xl font-black tracking-tighter italic">New Comment Strategy</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Scale your social engagement safely</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Post Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-black uppercase text-prime-400 tracking-[0.25em] pl-1">Target Post (Optional)</label>
                  <button 
                    onClick={() => setAddForm({...addForm, showManualPostId: !addForm.showManualPostId})}
                    className="text-[9px] font-black uppercase text-gray-500 hover:text-prime-400 transition-all italic"
                  >
                    {addForm.showManualPostId ? "[ Switch to List ]" : "[ Manual Post ID ]"}
                  </button>
                </div>
                {addForm.showManualPostId ? (
                  <input 
                    type="text"
                    value={addForm.selectedPostId}
                    onChange={(e) => setAddForm({...addForm, selectedPostId: e.target.value})}
                    placeholder="Enter Facebook Post ID..."
                    className={`w-full p-4 rounded-[1.5rem] border text-xs font-bold outline-none transition-all ${isDarkMode ? 'bg-black/40 border-white/5 focus:border-prime-500/50' : 'bg-gray-50 border-black/5 focus:border-prime-500/50'}`}
                  />
                ) : (
                  <select 
                    value={addForm.selectedPostId}
                    onChange={(e) => setAddForm({...addForm, selectedPostId: e.target.value})}
                    className={`w-full p-4 rounded-[1.5rem] border text-xs font-bold outline-none transition-all ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-gray-50 border-black/5'}`}
                  >
                    <option value="">Global (All Posts)</option>
                    {isLoadingPosts ? <option disabled>Loading posts...</option> : 
                      posts.map(p => (
                        <option key={p.id} value={p.id}>{p.message?.slice(0, 60)}...</option>
                      ))
                    }
                  </select>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-prime-400 tracking-[0.25em] pl-1">Keywords (Comma separated)</label>
                <input 
                  type="text" 
                  value={addForm.keywords}
                  onChange={(e) => setAddForm({...addForm, keywords: e.target.value})}
                  className={`w-full p-5 rounded-[1.5rem] border font-black text-xl outline-none transition-all ${isDarkMode ? 'bg-black/40 border-white/5 focus:border-prime-500/50' : 'bg-gray-50 border-black/5 focus:border-prime-500/50'}`}
                  placeholder="Price, details, dam koto..."
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center pl-1">
                  <label className="text-[10px] font-black uppercase text-prime-400 tracking-[0.25em]">Shuffle Variations</label>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleGenerateAI('add')} 
                      disabled={isGeneratingAI || !addForm.keywords}
                      className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${isGeneratingAI ? 'text-gray-500 italic' : 'text-purple-400 hover:text-purple-500'}`}
                    >
                      {isGeneratingAI ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      {t('aiGenerate')}
                    </button>
                    <button onClick={handleAddVariation} className="text-[10px] font-black uppercase text-prime-500 hover:underline">Add Variation</button>
                  </div>
                </div>
                {addForm.variations.map((v, i) => (
                  <div key={i} className={`p-6 rounded-[2rem] border relative ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-black/5'}`}>
                    {addForm.variations.length > 1 && (
                      <button onClick={() => handleRemoveAddVariation(i)} className="absolute top-4 right-4 text-red-500/50 hover:text-red-500">
                        <XCircle size={16} />
                      </button>
                    )}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <span className="text-[9px] font-black uppercase text-gray-500 px-1 italic">Public Comment Reply #{i+1}</span>
                        <textarea 
                          value={v.publicReply}
                          onChange={(e) => {
                            const newV = [...addForm.variations];
                            newV[i].publicReply = e.target.value;
                            setAddForm({...addForm, variations: newV});
                          }}
                          className={`w-full p-4 rounded-2xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-black/40 border-white/5 focus:border-prime-500/50' : 'bg-white border-black/5 focus:border-prime-500/50'}`}
                          placeholder="Check your inbox please..."
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[9px] font-black uppercase text-gray-500 px-1 italic">Private Message (Inbox)</span>
                        <textarea 
                          value={v.privateReply}
                          onChange={(e) => {
                            const newV = [...addForm.variations];
                            newV[i].privateReply = e.target.value;
                            setAddForm({...addForm, variations: newV});
                          }}
                          className={`w-full p-4 rounded-2xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-black/40 border-white/5 focus:border-prime-500/50' : 'bg-white border-black/5 focus:border-prime-500/50'}`}
                          placeholder="Hello! The price is 500 BDT..."
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-[9px] font-black uppercase text-gray-500 px-1 italic">Button Text (Optional)</span>
                          <input 
                            type="text"
                            value={v.buttonText || ''}
                            onChange={(e) => {
                              const newV = [...addForm.variations];
                              newV[i].buttonText = e.target.value;
                              setAddForm({...addForm, variations: newV});
                            }}
                            className={`w-full p-4 rounded-[1rem] border text-xs outline-none transition-all ${isDarkMode ? 'bg-black/40 border-white/5 focus:border-prime-500/50' : 'bg-white border-black/5 focus:border-prime-500/50'}`}
                            placeholder="Order Now"
                          />
                        </div>
                        <div className="space-y-2">
                          <span className="text-[9px] font-black uppercase text-gray-500 px-1 italic">Button Link (URL)</span>
                          <input 
                            type="text"
                            value={v.buttonUrl || ''}
                            onChange={(e) => {
                              const newV = [...addForm.variations];
                              newV[i].buttonUrl = e.target.value;
                              setAddForm({...addForm, variations: newV});
                            }}
                            className={`w-full p-4 rounded-[1rem] border text-xs outline-none transition-all ${isDarkMode ? 'bg-black/40 border-white/5 focus:border-prime-500/50' : 'bg-white border-black/5 focus:border-prime-500/50'}`}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setIsAddingDraft(false)}
                className={`flex-1 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all ${isDarkMode ? 'bg-white/5 text-gray-500 hover:text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveDraft}
                className="flex-1 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest bg-prime-500 text-white shadow-2xl shadow-prime-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                Deploy Strategy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Strategy Modal */}
      {editingDraft && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] border shadow-2xl ${isDarkMode ? 'bg-[#021024] border-white/10 text-white' : 'bg-white border-black/5 text-gray-900'} p-10 space-y-8 scrollbar-hide`}>
            <div className="flex items-center gap-5">
              <div className="p-4 bg-prime-500/20 rounded-[2rem]">
                <Edit3 className="text-prime-400" size={28} />
              </div>
              <div>
                <h3 className="text-3xl font-black tracking-tighter italic">Edit Strategy</h3>
              </div>
            </div>

            <div className="space-y-6">
              {/* Post Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-black uppercase text-prime-400 tracking-[0.25em] pl-1">Target Post (Optional)</label>
                  <button 
                    onClick={() => setEditForm({...editForm, showManualPostId: !editForm.showManualPostId})}
                    className="text-[9px] font-black uppercase text-gray-500 hover:text-prime-400 transition-all italic"
                  >
                    {editForm.showManualPostId ? "[ Switch to List ]" : "[ Manual Post ID ]"}
                  </button>
                </div>
                {editForm.showManualPostId ? (
                  <input 
                    type="text"
                    value={editForm.selectedPostId}
                    onChange={(e) => setEditForm({...editForm, selectedPostId: e.target.value})}
                    placeholder="Enter Facebook Post ID..."
                    className={`w-full p-4 rounded-[1.5rem] border text-xs font-bold outline-none transition-all ${isDarkMode ? 'bg-black/40 border-white/5 focus:border-prime-500/50' : 'bg-gray-50 border-black/5 focus:border-prime-500/50'}`}
                  />
                ) : (
                  <select 
                    value={editForm.selectedPostId}
                    onChange={(e) => setEditForm({...editForm, selectedPostId: e.target.value})}
                    className={`w-full p-4 rounded-[1.5rem] border text-xs font-bold outline-none transition-all ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-gray-50 border-black/5'}`}
                  >
                    <option value="">Global (All Posts)</option>
                    {isLoadingPosts ? <option disabled>Loading posts...</option> : 
                      posts.map(p => (
                        <option key={p.id} value={p.id}>{p.message?.slice(0, 60)}...</option>
                      ))
                    }
                  </select>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-prime-400 tracking-[0.25em] pl-1">Keywords</label>
                <input 
                  type="text" 
                  value={editForm.keywords}
                  onChange={(e) => setEditForm({...editForm, keywords: e.target.value})}
                  className={`w-full p-5 rounded-[1.5rem] border font-black text-xl outline-none transition-all ${isDarkMode ? 'bg-black/40 border-white/5 focus:border-prime-500/50' : 'bg-gray-50 border-black/5 focus:border-prime-500/50'}`}
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center pl-1">
                  <label className="text-[10px] font-black uppercase text-prime-400 tracking-[0.25em]">Shuffle Variations</label>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleGenerateAI('edit')} 
                      disabled={isGeneratingAI || !editForm.keywords}
                      className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${isGeneratingAI ? 'text-gray-500 italic' : 'text-purple-400 hover:text-purple-500'}`}
                    >
                      {isGeneratingAI ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      {t('aiGenerate')}
                    </button>
                    <button onClick={() => setEditForm(prev => ({...prev, variations: [...prev.variations, { publicReply: '', privateReply: '' }]}))} className="text-[10px] font-black uppercase text-prime-500 hover:underline">Add Variation</button>
                  </div>
                </div>
                {editForm.variations.map((v, i) => (
                  <div key={i} className={`p-6 rounded-[2rem] border relative ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-black/5'}`}>
                    <button onClick={() => setEditForm(prev => ({...prev, variations: prev.variations.filter((_, idx) => idx !== i)}))} className="absolute top-4 right-4 text-red-500/50 hover:text-red-500">
                      <XCircle size={16} />
                    </button>
                    <div className="space-y-4">
                      <textarea 
                        value={v.publicReply}
                        onChange={(e) => {
                          const newV = [...editForm.variations];
                          newV[i].publicReply = e.target.value;
                          setEditForm({...editForm, variations: newV});
                        }}
                        className={`w-full p-4 rounded-2xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-black/40 border-white/5 focus:border-prime-500/50' : 'bg-white border-black/5 focus:border-prime-500/50'}`}
                        rows={2}
                      />
                        <textarea 
                          value={v.privateReply}
                          onChange={(e) => {
                            const newV = [...editForm.variations];
                            newV[i].privateReply = e.target.value;
                            setEditForm({...editForm, variations: newV});
                          }}
                          className={`w-full p-4 rounded-2xl border text-sm outline-none transition-all ${isDarkMode ? 'bg-black/40 border-white/5 focus:border-prime-500/50' : 'bg-white border-black/5 focus:border-prime-500/50'}`}
                          rows={2}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase text-gray-500 px-1 italic">Button Text</span>
                            <input 
                              type="text"
                              value={v.buttonText || ''}
                              onChange={(e) => {
                                const newV = [...editForm.variations];
                                newV[i].buttonText = e.target.value;
                                setEditForm({...editForm, variations: newV});
                              }}
                              className={`w-full p-4 rounded-[1rem] border text-xs outline-none transition-all ${isDarkMode ? 'bg-black/40 border-white/5 focus:border-prime-500/50' : 'bg-white border-black/5 focus:border-prime-500/50'}`}
                              placeholder="Order Now"
                            />
                          </div>
                          <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase text-gray-500 px-1 italic">Button Link</span>
                            <input 
                              type="text"
                              value={v.buttonUrl || ''}
                              onChange={(e) => {
                                const newV = [...editForm.variations];
                                newV[i].buttonUrl = e.target.value;
                                setEditForm({...editForm, variations: newV});
                              }}
                              className={`w-full p-4 rounded-[1rem] border text-xs outline-none transition-all ${isDarkMode ? 'bg-black/40 border-white/5 focus:border-prime-500/50' : 'bg-white border-black/5 focus:border-prime-500/50'}`}
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setEditingDraft(null)}
                className={`flex-1 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all ${isDarkMode ? 'bg-white/5 text-gray-500 hover:text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateDraft}
                className="flex-1 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest bg-prime-500 text-white shadow-2xl shadow-prime-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                Update Strategy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal 
        isOpen={!!deletingDraftId}
        onClose={() => setDeletingDraftId(null)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this comment strategy? All variations will be lost."
        isDarkMode={isDarkMode}
        t={t}
      />
    </div>
  );
};

export default CommentDraftCenter;

