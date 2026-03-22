import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  UserCircle, 
  Settings, 
  MessageSquare, 
  MessageCircle,
  Zap, 
  TrendingUp, 
  Database, 
  User, 
  Package, 
  Smartphone,
  ShieldCheck,
  PanelLeftClose,
  PanelLeft,
  ShoppingBag,
  Layers,
  Tag,
  FileText,
  AlertCircle,
  BookOpen,
  Cpu
} from 'lucide-react';

// Import Modular Components
import { MetaIcon, MessengerIcon, FacebookIcon, InstagramIcon, WhatsAppIcon } from './components/Icons';
import InboxFilterBar from './components/Inbox/InboxFilterBar';
import InboxList from './components/Inbox/InboxList';
import ChatWindow from './components/Inbox/ChatWindow';
import FollowUpModal from './components/Inbox/FollowUpModal';
import Sidebar from './components/Sidebar'; 
import SalesSidebar from './components/SalesSidebar';
import HomeView from './components/Views/HomeView';
import ProductHub from './components/Views/ProductHub';
import SettingsView from './components/Views/SettingsView';
import BlueprintArchitect from './components/Views/BlueprintArchitect';
import KnowledgeBase from './components/Views/KnowledgeBase';
import KnowledgeGaps from './components/Views/KnowledgeGaps';
import DraftCenter from './components/Views/DraftCenter';

// Import Hooks
import { useMetaChat } from './hooks/useMetaChat';
import { useMetaData } from './hooks/useMetaData';

// Import Utilities
import { translations } from './utils/translations';
import { safeToDate } from './utils/helpers';
import { db } from './firebase-client';
import { doc, updateDoc, addDoc, collection, serverTimestamp, deleteDoc } from 'firebase/firestore';

const Dashboard = () => {
  // --- Persistent State ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('metasolution_dark_mode');
    return saved ? JSON.parse(saved) : true;
  });
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('metasolution_theme');
    return saved || 'vortex';
  });
  const [activeTab, setActiveTab] = useState('home');
  const [language, setLanguage] = useState('en');

  // --- UI State ---
  const [inboxSearch, setInboxSearch] = useState('');
  const [inboxFilter, setInboxFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedConvoIds, setSelectedConvoIds] = useState(new Set());
  const [missionFocus, setMissionFocus] = useState("Sales Growth & Customer Love");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('metasolution_sidebar_collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [expandedMenus, setExpandedMenus] = useState([]);
  const [expandingId, setExpandingId] = useState(null);
  const [draggedMainIdx, setDraggedMainIdx] = useState(null);
  const [draggedSubIdx, setDraggedSubIdx] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [followUpModal, setFollowUpModal] = useState({ isOpen: false, type: 'followup', convoId: null, reason: '', note: '' });
  const [attachedFiles, setAttachedFiles] = useState([]);

  // --- Refs ---
  const chatEndRef = useRef(null);
  const profileRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e, type, mainIdx, subIdx = null) => {
    setDraggedMainIdx(mainIdx);
    setDraggedSubIdx(subIdx);
    e.dataTransfer.setData('type', type);
  };

  const handleDragOver = (e, type, mainIdx, subIdx = null) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    setDraggedMainIdx(null);
    setDraggedSubIdx(null);
  };

  const handleDrop = (e) => {
    console.log("Dropped!");
  };

  // --- Logic Hooks ---
  const {
    conversations,
    selectedConvo,
    setSelectedConvo,
    chatMessages,
    messageInput,
    setMessageInput,
    isAiThinking,
    isSyncingHistory,
    handleSelectConvo,
    handleSendMessage,
    syncHistory,
    handleSuggestReply
  } = useMetaChat(scrollToBottom, isSelectMode, selectedConvoIds, setSelectedConvoIds);

  const { gaps, drafts, library, products, conversations } = useMetaData();

  // Compute stats for HomeView
  const stats = {
    totalMessages: conversations.reduce((acc, c) => acc + (c.messageCount || 0), 0),
    newLeads: conversations.filter(c => c.isLead || c.isPriority || c.isFollowUp).length,
    automationScore: 94,
    conversion: 3.2
  };

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('metasolution_dark_mode', JSON.stringify(isDarkMode));
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('metasolution_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('metasolution_sidebar_collapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Click Outside Profile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Helpers & Handlers ---
  const t = (key) => translations[language][key] || key;

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (!['fb_inbox', 'fb_comments'].includes(tabId)) {
        setSelectedConvo(null);
    }
  };

  const handleBulkAction = (action) => {
    console.log("Bulk action:", action, Array.from(selectedConvoIds));
    if (action === 'all') {
      setSelectedConvoIds(new Set(conversations.map(c => c.id)));
    } else {
      setIsSelectMode(false);
      setSelectedConvoIds(new Set());
    }
  };

  const togglePriority = (convoId) => {
    setFollowUpModal({ isOpen: true, type: 'priority', convoId, reason: '', note: '' });
  };

  const toggleFollowUp = (convoId) => {
    setFollowUpModal({ isOpen: true, type: 'followup', convoId, reason: '', note: '' });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 300);
  };

  const confirmFollowAction = async () => {
    try {
      const field = followUpModal.type === 'priority' ? 'isPriority' : 'isFollowUp';
      await updateDoc(doc(db, "conversations", followUpModal.convoId), {
        [field]: true,
        followUpNote: followUpModal.note,
        followUpReason: followUpModal.reason
      });
      setFollowUpModal({ ...followUpModal, isOpen: false });
    } catch (e) { console.error(e); }
  };

  const handleApproveDraft = useCallback(async (draft) => {
    if (!draft || !draft.id) return;
    try {
      await addDoc(collection(db, "knowledge_base"), {
        keywords: [draft.keyword, ...(draft.approvedVariations || [])].filter(Boolean),
        answer: draft.result,
        timestamp: serverTimestamp()
      });
      await deleteDoc(doc(db, "draft_replies", draft.id));
    } catch (e) { 
      console.error("Approval failed:", e); 
    }
  }, []);

  const handleConvertToDraft = useCallback(async (gap, manualReply = "") => {
    try {
      await addDoc(collection(db, "draft_replies"), {
        keyword: gap.question,
        result: manualReply || "AI is composing a response...",
        variations: [],
        approvedVariations: [],
        timestamp: new Date(),
        originGapId: gap.id
      });
      await updateDoc(doc(db, "knowledge_gaps", gap.id), {
        status: 'drafted'
      });
    } catch (e) {
      console.error("Conversion failed:", e);
    }
  }, []);

  const handleExpandKeywords = async (id, kw) => {
     setExpandingId(id);
     try {
       const response = await fetch(`${import.meta.env.VITE_API_URL}/api/generate_variations`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ draftId: id, keyword: kw })
       });
       if (!response.ok) throw new Error('Generation failed');
     } catch (e) {
       console.error("AI Generation Error:", e);
     } finally {
       setExpandingId(null);
     }
  };

  const toggleVariation = async (draftId, variation, currentApproved = []) => {
    try {
      const draftRef = doc(db, "draft_replies", draftId);
      const isApproved = currentApproved.includes(variation);
      const newApproved = isApproved 
        ? currentApproved.filter(v => v !== variation)
        : [...currentApproved, variation];
      
      await updateDoc(draftRef, {
        approvedVariations: newApproved
      });
    } catch (e) {
      console.error("Variation toggle failed:", e);
    }
  };

  const handleDiscoverGaps = async () => {
     try {
       const response = await fetch(`${import.meta.env.VITE_API_URL}/api/discover_gaps`, { method: 'POST' });
       if (!response.ok) throw new Error('Discovery failed');
     } catch (e) {
       console.error("Discovery Error:", e);
     }
  };

  const updateMissionFocus = () => {
    // Save to Firestore
  };

  // --- Main Navigation Configuration ---
  const mainNav = [
    { id: 'home', icon: TrendingUp, label: 'home', fixed: true },
    { 
      id: 'facebook', 
      icon: FacebookIcon, 
      label: 'facebook',
      sub: [
        { id: 'fb_inbox', label: 'inbox', icon: MessageSquare },
        { id: 'fb_comments', label: 'comments', icon: MessageCircle }
      ]
    },
    { 
      id: 'instagram', 
      icon: InstagramIcon, 
      label: 'instagram',
      sub: [
        { id: 'ig_inbox', label: 'inbox', icon: MessageSquare },
        { id: 'ig_comments', label: 'comments', icon: MessageCircle }
      ]
    },
    { 
      id: 'whatsapp', 
      icon: WhatsAppIcon, 
      label: 'whatsapp',
      sub: [
        { id: 'wa_inbox', label: 'inbox', icon: MessageSquare }
      ]
    },
    { 
      id: 'products_hub', 
      icon: Package, 
      label: 'products_offers',
      sub: [
        { id: 'products', label: 'product', icon: ShoppingBag },
        { id: 'inventory', label: 'inventory', icon: Layers },
        { id: 'offers', label: 'offers', icon: Tag }
      ]
    },
    { 
      id: 'data', 
      icon: Database, 
      label: 'data_engine',
      sub: [
        { id: 'drafts', label: 'draft_center', icon: FileText },
        { id: 'gaps', label: 'knowledge_gaps', icon: AlertCircle },
        { id: 'library', label: 'knowledge_base', icon: BookOpen },
        { id: 'architect', label: 'blueprint_architect', icon: Cpu }
      ]
    },
    { id: 'admin', icon: ShieldCheck, label: 'admin' },
    { id: 'settings_tab', icon: Settings, label: 'setting' },
  ];

  // --- Profile Component ---
  const ProfileDropdown = () => (
    <div className={`absolute right-0 mt-4 w-64 rounded-3xl border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-300 ${
      isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-black/5'
    }`}>
      <div className="p-6 text-center border-b border-white/5">
        <div className="w-16 h-16 rounded-full bg-prime-500/20 flex items-center justify-center text-prime-500 font-bold mx-auto mb-3 text-xl">
          M
        </div>
        <p className="font-bold text-sm">Managing Director</p>
        <p className="text-[10px] opacity-40 uppercase tracking-widest font-black">Meta Solution</p>
      </div>
      <div className="p-2">
        {['profile', 'my_plan', 'billing', 'logout'].map(item => (
          <button key={item} className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
            isDarkMode ? 'hover:bg-white/5 text-gray-400 hover:text-white' : 'hover:bg-gray-50 text-gray-600'
          }`}>
            {t(item)}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`flex min-h-screen transition-all duration-300 relative overflow-hidden ${
      isDarkMode 
        ? 'bg-[#020617] text-slate-200 selection:bg-prime-500/30' 
        : 'bg-slate-50 text-slate-900 selection:bg-prime-500/20'
    }`}>
      
      {/* Animated Ambient Glows */}
      {isDarkMode && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-prime-600/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse delay-1000" />
        </>
      )}

      <Sidebar 
        mainNav={mainNav}
        activeTab={activeTab}
        theme={theme}
        isDarkMode={isDarkMode}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        language={language}
        t={t}
        handleTabChange={handleTabChange}
        expandedMenus={expandedMenus}
        setExpandedMenus={setExpandedMenus}
        draggedMainIdx={draggedMainIdx}
        draggedSubIdx={draggedSubIdx}
        handleDragStart={handleDragStart}
        handleDragOver={handleDragOver}
        handleDragEnd={handleDragEnd}
        handleDrop={handleDrop}
      />
      
      <main className="flex-1 p-8 overflow-y-auto" onScroll={handleScroll}>
        {/* Header */}
        <header className="flex justify-between items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <h2 className={`text-4xl font-black mb-1 tracking-tighter ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('system_status')}
              <span className="text-prime-500 ml-1">.</span>
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </div>
              <p className={`text-[10px] uppercase font-black tracking-[0.2em] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('online')} • {t('version')} 2.4.0
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                  isDarkMode ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-black/10 text-gray-900 shadow-sm hover:bg-gray-50'
                }`}
              >
                <UserCircle size={28} className="text-prime-500" />
              </button>
              {isProfileOpen && <ProfileDropdown />}
            </div>
          </div>
        </header>

        {/* Tab Content */}
        {activeTab === 'home' && <HomeView isDarkMode={isDarkMode} t={t} language={language} theme={theme} stats={stats} />}

        {activeTab === 'fb_inbox' && (
          <div className="animate-fade-in h-[calc(100vh-180px)] flex gap-8">
            <div className="w-96 flex flex-col">
               <h2 className="text-2xl font-black mb-6 uppercase tracking-tight italic flex items-center gap-3">
                 <MessengerIcon size={24} />
                 FB {t('inbox')}
               </h2>
               <InboxFilterBar 
                 isDarkMode={isDarkMode} 
                 t={t} 
                 inboxSearch={inboxSearch} 
                 setInboxSearch={setInboxSearch} 
                 inboxFilter={inboxFilter} 
                 setInboxFilter={setInboxFilter}
                 isSelectMode={isSelectMode}
                 setIsSelectMode={setIsSelectMode}
                 selectedConvoIds={selectedConvoIds}
                 setSelectedConvoIds={setSelectedConvoIds}
                 handleBulkAction={handleBulkAction}
                 dateFilter={dateFilter}
                 setDateFilter={setDateFilter}
               />
               <InboxList 
                 isDarkMode={isDarkMode} 
                 t={t} 
                 conversations={conversations} 
                 selectedConvo={selectedConvo} 
                 setSelectedConvo={handleSelectConvo} 
                 inboxFilter={inboxFilter} 
                 inboxSearch={inboxSearch}
                 dateFilter={dateFilter}
                 isSelectMode={isSelectMode}
                 selectedConvoIds={selectedConvoIds}
               />
            </div>
            <ChatWindow 
              isDarkMode={isDarkMode} 
              t={t} 
              selectedConvo={selectedConvo} 
              chatMessages={chatMessages}
              handleSuggestReply={handleSuggestReply} 
              handleSendMessage={handleSendMessage}
              isAiThinking={isAiThinking} 
              messageInput={messageInput} 
              setMessageInput={setMessageInput} 
              attachedFiles={attachedFiles}
              setAttachedFiles={setAttachedFiles}
              handleFileChange={handleFileChange}
              togglePriority={togglePriority}
              toggleFollowUp={toggleFollowUp}
              isSyncingHistory={isSyncingHistory}
              syncHistory={syncHistory}
              chatEndRef={chatEndRef}
              onScroll={handleScroll}
              showScrollButton={showScrollButton}
              scrollToBottom={scrollToBottom}
            />
            <SalesSidebar isDarkMode={isDarkMode} t={t} selectedConvo={selectedConvo} />
          </div>
        )}

        {activeTab === 'gaps' && (
          <KnowledgeGaps 
            isDarkMode={isDarkMode} 
            t={t} 
            gaps={gaps} 
            handleConvertToDraft={handleConvertToDraft}
            handleDiscoverGaps={handleDiscoverGaps}
          />
        )}
         {activeTab === 'drafts' && (
           <DraftCenter 
             isDarkMode={isDarkMode} 
             t={t} 
             drafts={drafts} 
             language={language} 
             handleApproveDraft={handleApproveDraft}
             handleExpandKeywords={handleExpandKeywords}
             expandingId={expandingId}
             toggleVariation={toggleVariation}
           />
         )}
        {activeTab === 'library' && <KnowledgeBase isDarkMode={isDarkMode} t={t} library={library} />}
        {activeTab === 'products' && <ProductHub isDarkMode={isDarkMode} t={t} products={products} />}
        {activeTab === 'architect' && <BlueprintArchitect isDarkMode={isDarkMode} t={t} />}
        {activeTab === 'settings_tab' && (
          <SettingsView 
            isDarkMode={isDarkMode} 
            theme={theme}
            setTheme={setTheme}
            t={t} 
          />
        )}

        {['fb_comments', 'ig_inbox', 'ig_comments', 'wa_inbox', 'inventory', 'admin'].includes(activeTab) && (
          <div className={`animate-fade-in py-20 text-center rounded-3xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white shadow-xl border-black/5'}`}>
            <Smartphone size={64} className="mx-auto text-prime-500/30 mb-6" />
            <h3 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('coming_soon')}</h3>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{t('coming_soon_desc')}</p>
          </div>
        )}

        {activeTab === 'offers' && (
          <div className="animate-fade-in space-y-8">
            <div className={`p-8 rounded-3xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white shadow-xl border-black/5'}`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-prime-500/10 rounded-2xl">
                  <Zap className="text-prime-400" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{t('mission_focus')}</h3>
                  <p className="text-gray-500 text-sm">Set your current business objective to align the AI response strategy.</p>
                </div>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  value={missionFocus}
                  onChange={(e) => setMissionFocus(e.target.value)}
                  onBlur={updateMissionFocus}
                  placeholder={t('mission_focus') + '...'}
                  className={`pl-12 pr-4 py-4 rounded-2xl w-full text-lg transition-all ${
                    isDarkMode ? 'bg-black/20 border border-white/10 text-white focus:ring-prime-500' : 'bg-slate-50 border border-black/10 text-gray-900 focus:ring-prime-600'
                  }`}
                />
                <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-prime-400" size={20} />
              </div>
            </div>
            {/* Same coming soon for bottom part of offers */}
            <div className={`py-20 text-center rounded-3xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white shadow-xl border-black/5'}`}>
               <Package size={64} className="mx-auto text-prime-500/30 mb-6" />
               <h3 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('coming_soon')}</h3>
               <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{t('coming_soon_desc')}</p>
            </div>
          </div>
        )}
      </main>

      <FollowUpModal 
        isOpen={followUpModal.isOpen}
        onClose={() => setFollowUpModal({ ...followUpModal, isOpen: false })}
        onConfirm={confirmFollowAction}
        modalData={followUpModal}
        setModalData={setFollowUpModal}
        isDarkMode={isDarkMode}
        t={t}
      />
    </div>
  );
};

export default Dashboard;
