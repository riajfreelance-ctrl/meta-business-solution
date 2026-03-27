import React, { useState, useEffect } from 'react';
import { RefreshCw, PlusCircle, Settings } from 'lucide-react';
import { db } from '../../firebase-client';
import { doc, updateDoc, deleteDoc, addDoc, collection } from 'firebase/firestore';
import { useBrand } from '../../context/BrandContext';
import axios from 'axios';
import ConfirmModal from '../Shared/ConfirmModal';

// New Sub-components
import CommentSettings from './Comment/CommentSettings';
import StrategyTable from './Comment/StrategyTable';
import PendingReview from './Comment/PendingReview';
import CommentModal from './Comment/CommentModal';

const CommentDraftCenter = ({ isDarkMode, t, commentDrafts = [], pendingComments = [], isSyncing, handleSyncHistory }) => {
  const { activeBrandId, brandData, refreshBrandData } = useBrand();
  const [activeTab, setActiveTab] = useState('strategies'); // 'strategies', 'post_id', or 'pending'
  const [isAddingDraft, setIsAddingDraft] = useState(false);
  const [editingDraft, setEditingDraft] = useState(null);
  const [deletingDraftId, setDeletingDraftId] = useState(null);
  
  // Unified Form State
  const [form, setForm] = useState({ 
    keywords: '', 
    variations: [{ publicReply: '', privateReply: '', buttonText: '', buttonUrl: '' }], 
    selectedPostId: '',
    originPendingId: null
  });
  
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [rowLoading, setRowLoading] = useState({});
  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  
  const [settings, setSettings] = useState({
    spamFilter: false,
    leadCapture: false,
    humanDelay: true,
    aiReply: true,
    systemAutoReply: true,
    humanHandoff: true
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

  const handleGenerateAI = async () => {
    if (!form.keywords || !activeBrandId) return;

    setIsGeneratingAI(true);
    try {
      const resp = await axios.post('/api/ai/generate-comment-variations', {
        keywords: form.keywords.split(',').map(k => k.trim()),
        brandId: activeBrandId,
        count: 5 
      });

      if (resp.data.success) {
        setForm(prev => ({
          ...prev,
          variations: [...prev.variations, ...resp.data.variations].filter(v => v.publicReply !== '')
        }));
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
        count: 10 
      });

      if (resp.data.success) {
        await updateDoc(doc(db, "comment_drafts", draft.id), {
          variations: [...draft.variations, ...resp.data.variations]
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
      await updateDoc(doc(db, "brands", activeBrandId), { commentSettings: newSettings });
      await refreshBrandData();
    } catch (error) {
      console.error("Error updating settings:", error);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleMoveToStrategy = async (pc, strategyId) => {
    try {
      const strategy = commentDrafts.find(d => d.id === strategyId);
      if (!strategy) return;
      const newKeywords = Array.from(new Set([...strategy.keywords, pc.commentText]));
      await updateDoc(doc(db, "comment_drafts", strategyId), { keywords: newKeywords });
      await deleteDoc(doc(db, "pending_comments", pc.id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleNewFromPending = (pc) => {
    setForm({
      keywords: pc.commentText,
      variations: [{ publicReply: '', privateReply: '', buttonText: '', buttonUrl: '' }],
      selectedPostId: pc.postId || '',
      originPendingId: pc.id
    });
    setIsAddingDraft(true);
  };

  const handleSpamPending = async (pc) => {
    try {
      await axios.post('/api/ai/hide-comment', { commentId: pc.commentId, brandId: activeBrandId });
      await deleteDoc(doc(db, "pending_comments", pc.id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveDraft = async () => {
    if (!form.keywords || form.variations.some(v => !v.publicReply) || !activeBrandId) return;
    try {
      const keywordsArray = form.keywords.split(',').map(k => k.trim()).filter(Boolean);
      await addDoc(collection(db, "comment_drafts"), {
        keywords: keywordsArray,
        variations: form.variations,
        brandId: activeBrandId,
        postId: form.selectedPostId || null,
        timestamp: new Date()
      });
      if (form.originPendingId) await deleteDoc(doc(db, "pending_comments", form.originPendingId));
      setIsAddingDraft(false);
      setForm({ keywords: '', variations: [{ publicReply: '', privateReply: '', buttonText: '', buttonUrl: '' }], selectedPostId: '', originPendingId: null });
    } catch (error) {
      console.error("Error adding comment draft:", error);
    }
  };

  const handleEdit = (draft) => {
    setEditingDraft(draft);
    setForm({
      keywords: (draft.keywords || []).join(', '),
      variations: draft.variations || [],
      selectedPostId: draft.postId || '',
      originPendingId: null
    });
  };

  const handleUpdateDraft = async () => {
    if (!editingDraft || !activeBrandId) return;
    try {
      const keywordsArray = form.keywords.split(',').map(k => k.trim()).filter(Boolean);
      await updateDoc(doc(db, "comment_drafts", editingDraft.id), {
        keywords: keywordsArray,
        variations: form.variations,
        postId: form.selectedPostId || null 
      });
      setEditingDraft(null);
      setForm({ keywords: '', variations: [{ publicReply: '', privateReply: '', buttonText: '', buttonUrl: '' }], selectedPostId: '', originPendingId: null });
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

  return (
    <div className="animate-fade-in space-y-10 pb-20">
      <div className="flex justify-between items-end mb-4 px-2">
        <div>
          <h3 className="text-5xl font-black tracking-tighter mb-2 italic">Engagement Center</h3>
          <p className={`text-[11px] uppercase font-black tracking-[0.4em] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Powering {(commentDrafts || []).length} Autonomous Growth Strategies
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSyncHistory}
            disabled={isSyncing}
            className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.2em] border transition-all duration-500 ${
              isSyncing 
                ? 'bg-gray-500/10 text-gray-500 cursor-not-allowed opacity-50' 
                : isDarkMode ? 'bg-white/5 border-white/5 text-prime-400 hover:bg-white/10 hover:scale-105' : 'bg-prime-50 border-prime-100 text-prime-600 hover:bg-prime-100 hover:scale-105'
            }`}
          >
            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing...' : 'Sync History'}
          </button>
          <button 
            onClick={() => {
              setForm({ keywords: '', variations: [{ publicReply: '', privateReply: '', buttonText: '', buttonUrl: '' }], selectedPostId: '', originPendingId: null });
              setIsAddingDraft(true);
            }}
            className={`flex items-center gap-3 px-10 py-3.5 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.2em] border transition-all duration-500 ${
              isDarkMode ? 'bg-prime-500 text-white border-transparent hover:bg-prime-400 hover:scale-110 shadow-xl shadow-prime-500/20' : 'bg-prime-500 text-white border-transparent hover:bg-prime-600 hover:scale-110 shadow-xl shadow-prime-500/10'
            }`}
          >
            <PlusCircle size={18} />
            Deploy Strategy
          </button>
        </div>
      </div>

      <CommentSettings 
        isDarkMode={isDarkMode} 
        t={t} 
        settings={settings} 
        handleToggleSetting={handleToggleSetting} 
        isSavingSettings={isSavingSettings} 
      />

      <div className="flex gap-6 px-4">
        {[
          { id: 'strategies', label: 'Global Flows', count: (commentDrafts || []).filter(d => !d.postId).length, color: 'prime' },
          { id: 'post_id', label: 'Post Specific', count: (commentDrafts || []).filter(d => d.postId).length, color: 'purple' },
          { id: 'pending', label: 'Human Review', count: (pendingComments || []).length, color: 'orange' }
        ].map(tab => (
           <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 border ${
              activeTab === tab.id 
                ? `bg-${tab.color}-500 text-white border-transparent shadow-2xl shadow-${tab.color}-500/30 scale-105` 
                : `${isDarkMode ? 'text-gray-500 border-white/5 hover:text-white hover:bg-white/5' : 'text-gray-400 border-black/5 hover:text-gray-900 hover:bg-gray-50'}`
            }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 rounded-lg text-[9px] ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-500/10 text-gray-500'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {activeTab === 'pending' ? (
        <PendingReview 
          isDarkMode={isDarkMode}
          pendingComments={pendingComments}
          commentDrafts={commentDrafts}
          handleNewFromPending={handleNewFromPending}
          handleMoveToStrategy={handleMoveToStrategy}
          handleSpamPending={handleSpamPending}
          deleteDoc={deleteDoc}
          doc={doc}
          db={db}
        />
      ) : (
        <StrategyTable 
          isDarkMode={isDarkMode}
          activeTab={activeTab}
          commentDrafts={commentDrafts}
          posts={posts}
          handleEdit={handleEdit}
          setDeletingDraftId={setDeletingDraftId}
          handleQuickGenerateAI={handleQuickGenerateAI}
          rowLoading={rowLoading}
        />
      )}

      <CommentModal 
        isDarkMode={isDarkMode}
        t={t}
        activeBrandId={activeBrandId}
        isAddingDraft={isAddingDraft}
        editingDraft={editingDraft}
        form={form}
        setForm={setForm}
        setIsAddingDraft={setIsAddingDraft}
        setEditingDraft={setEditingDraft}
        handleSaveDraft={handleSaveDraft}
        handleUpdateDraft={handleUpdateDraft}
        handleGenerateAI={handleGenerateAI}
        isGeneratingAI={isGeneratingAI}
        posts={posts}
        commentDrafts={commentDrafts}
        isLoadingPosts={isLoadingPosts}
      />

      <ConfirmModal 
        isOpen={!!deletingDraftId}
        onClose={() => setDeletingDraftId(null)}
        onConfirm={handleDelete}
        title="Destroy Strategy?"
        message="This action is permanent. This autonomous engagement flow will be deactivated and removed forever."
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default CommentDraftCenter;
