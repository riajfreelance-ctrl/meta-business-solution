import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  UserCircle, 
  Settings, 
  MessageSquare, 
  MessageCircle,
  Activity, 
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
  Cpu,
  RotateCcw, Bookmark, Star, ChevronDown, Plus,
  Maximize, ZoomIn, ZoomOut, ChevronLeft, ChevronRight,
  X, XCircle, Info, Download, ShoppingCart
} from 'lucide-react';
import { createPortal } from 'react-dom';

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
import CommentDraftCenter from './components/Views/CommentDraftCenter';
import OrderDrafting from './components/Views/OrderDrafting';
import OrdersView from './components/Views/OrdersView';
import CatalogShareModal from './components/Inbox/CatalogShareModal';
import MediaGalleryModal from './components/Inbox/MediaGalleryModal';
import Lightbox from './components/Inbox/Lightbox';
import BrandOnboarding from './components/Brand/BrandOnboarding';
import SuperAdminPanel from './components/Views/SuperAdminPanel';
import GlobalBanner from './components/Shared/GlobalBanner';
import BillingView from './components/Views/BillingView';
import AuthView from './components/Views/AuthView';

// Import Hooks
import { useMetaChat } from './hooks/useMetaChat';
import { useMetaData } from './hooks/useMetaData';
import { useBrand } from './context/BrandContext';

// Import Utilities
import { translations } from './utils/translations';
import { db } from './firebase-client';
import { doc, updateDoc, addDoc, collection, serverTimestamp, deleteDoc } from 'firebase/firestore';

// --- Global Error Boundary ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Metabiz Core Error Boundary Caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-20 bg-red-900/10 border border-red-500/30 rounded-[3rem] m-10 text-center space-y-6 backdrop-blur-3xl animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-red-500/20">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-5xl font-black italic tracking-tighter text-white">SYSTEM CRASH <span className="text-red-500">DETECTED</span></h2>
            <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.5em] opacity-80 leading-relaxed max-w-md mx-auto">
              {this.state.error?.message || "QUANTUM LOGIC FAILURE IN COMPONENT TREE"}
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-10 py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-200 transition-all active:scale-95 shadow-2xl"
          >
            Re-Initialize Core Engine
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const Dashboard = () => {
  const { brandData, activeBrandId, loading, role, user, login, logout } = useBrand();

  // --- Persistent State ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('metasolution_dark_mode');
    return saved ? JSON.parse(saved) : true;
  });
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('metasolution_theme');
    return saved || 'vortex';
  });
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) return hash;
    return localStorage.getItem('metasolution_active_tab') || 'home';
  });
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
  const [isOrderDraftingOpen, setIsOrderDraftingOpen] = useState(false);
  const [isCatalogShareOpen, setIsCatalogShareOpen] = useState(false);
  const [isMediaGalleryOpen, setIsMediaGalleryOpen] = useState(false);
  const [lightbox, setLightbox] = useState({ isOpen: false, images: [], index: 0, zoom: 1 });
  const [isBrandOnboardingOpen, setIsBrandOnboardingOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // --- Refs ---
  const chatEndRef = useRef(null);
  const profileRef = useRef(null);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    chatEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // --- Stable Refs for Hooks to prevent Infinite Loops ---
  const stableScrollToBottom = useCallback((behavior) => scrollToBottom(behavior), [scrollToBottom]);
  const stableSetSelectedConvoIds = useCallback((ids) => setSelectedConvoIds(ids), []);

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
    isSending,
    optimisticMessages,
    replyTo, setReplyTo,
    editingMessage, startEditMessage,
    handleDeleteMessage, cancelInteractions,
    handleSelectConvo,
    handleSendMessage,
    syncHistory,
    handleSuggestReply
  } = useMetaChat(stableScrollToBottom, isSelectMode, selectedConvoIds, stableSetSelectedConvoIds);

  const { gaps, drafts, library, products, conversations: allConversations = [], commentDrafts, pendingComments, orders } = useMetaData();

  // Compute stats for HomeView (Safe version)
  const stats = useMemo(() => ({
    totalMessages: (allConversations || []).reduce((acc, c) => acc + (c?.messageCount || 0), 0),
    newLeads: (allConversations || []).filter(c => c?.isLead || c?.isPriority || c?.isFollowUp).length,
    automationScore: 94,
    conversion: 3.2
  }), [allConversations]);

  // --- Effects ---
  useEffect(() => {
    document.title = brandData?.name ? `${brandData.name} • Metabiz` : 'Metabiz';
  }, [brandData]);

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

  useEffect(() => {
    const handlePopState = () => {
      let hash = window.location.hash.replace('#', '');
      if (!hash) hash = localStorage.getItem('metasolution_active_tab') || 'home';
      setActiveTab(hash);
      localStorage.setItem('metasolution_active_tab', hash);
      if (!['fb_inbox', 'fb_comments'].includes(hash)) setSelectedConvo(null);
    };
    window.addEventListener('popstate', handlePopState);
    if (!window.location.hash) {
      window.history.replaceState({ tab: activeTab }, '', `#${activeTab}`);
    }
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab, setSelectedConvo]);

  const t = useCallback((key) => {
    return (translations[language] && translations[language][key]) || key;
  }, [language]);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    localStorage.setItem('metasolution_active_tab', tabId);
    window.history.pushState({ tab: tabId }, '', `#${tabId}`);
    if (!['fb_inbox', 'fb_comments'].includes(tabId)) {
      setSelectedConvo(null);
    }
  }, [setSelectedConvo]);

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

  const handleBulkAction = async (action) => {
    if (action === 'all') {
      const allIds = new Set(conversations.map(c => c.id));
      stableSetSelectedConvoIds(allIds);
      return;
    }
    if (selectedConvoIds.size === 0) return;
    for (const cid of selectedConvoIds) {
      const docRef = doc(db, "conversations", cid);
      if (action === 'mark_read') await updateDoc(docRef, { unread: false });
      if (action === 'mark_priority') await updateDoc(docRef, { isPriority: true });
      if (action === 'delete') await deleteDoc(docRef);
    }
    stableSetSelectedConvoIds(new Set());
    setIsSelectMode(false);
  };

  const handleApproveDraft = useCallback(async (draft) => {
    if (!draft || !draft.id || !activeBrandId) return;
    try {
      await addDoc(collection(db, "knowledge_base"), {
        keywords: [draft.keyword, ...(draft.approvedVariations || [])].filter(Boolean),
        answer: draft.result,
        brandId: activeBrandId,
        timestamp: serverTimestamp()
      });
      await deleteDoc(doc(db, "draft_replies", draft.id));
    } catch (e) { 
      console.error("Approval failed:", e); 
    }
  }, [activeBrandId]);

  const handleForwardMessage = useCallback((msg) => {
    const textToCopy = msg.text || msg.message || (msg.attachments?.length ? '[Attachment]' : '');
    if (textToCopy) navigator.clipboard.writeText(textToCopy);
    alert(t ? t('message_copied') || 'Message copied to clipboard for forwarding!' : 'Message copied!');
  }, [t]);

  const handleConvertToDraft = useCallback(async (gap, manualReply = "") => {
    if (!activeBrandId) return;
    try {
      await addDoc(collection(db, "draft_replies"), {
        keyword: gap.question,
        result: manualReply || "AI is composing a response...",
        variations: [],
        approvedVariations: [],
        brandId: activeBrandId,
        timestamp: new Date(),
        originGapId: gap.id
      });
      await updateDoc(doc(db, "knowledge_gaps", gap.id), {
        status: 'drafted'
      });
    } catch (e) {
      console.error("Conversion failed:", e);
    }
  }, [activeBrandId]);

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
     if (!activeBrandId) return;
     try {
       const response = await fetch(`${import.meta.env.VITE_API_URL}/api/discover_gaps`, { 
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ brandId: activeBrandId })
       });
       if (!response.ok) throw new Error('Discovery failed');
     } catch (e) {
       console.error("Discovery Error:", e);
     }
  };

  const updateMissionFocus = () => {
    // Mission focus state can be updated here
  };

  // --- Main Navigation Configuration ---
  const mainNav = useMemo(() => [
    { id: 'home', icon: Activity, label: 'home', fixed: true },
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
        { id: 'orders', label: 'orders', icon: ShoppingCart },
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
    ...((role === 'super-admin') ? [{ id: 'admin', icon: ShieldCheck, label: 'admin' }] : []),
    { id: 'settings_tab', icon: Settings, label: 'setting' },
  ], [role]);

  // --- Profile Component ---
  const ProfileDropdown = () => (
    <div className={`absolute right-0 mt-4 w-64 rounded-3xl border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-300 ${
      isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-black/5'
    }`}>
      <div className="p-6 text-center border-b border-white/5">
        <div className="w-16 h-16 rounded-full bg-prime-500/20 flex items-center justify-center text-prime-500 font-bold mx-auto mb-3 text-xl">
          {brandData?.name?.[0].toUpperCase() || 'M'}
        </div>
        <p className="font-bold text-sm">Managing Director</p>
        <p className="text-[10px] opacity-40 uppercase tracking-widest font-black">{brandData?.name || 'Meta Solution'}</p>
      </div>
      <div className="p-2">
        {['profile', 'my_plan', 'billing', 'logout'].map(item => (
          <button 
            key={item} 
            onClick={() => {
              if (item === 'logout') logout();
              else if (item === 'billing' || item === 'my_plan') { handleTabChange('billing'); setIsProfileOpen(false); }
            }} 
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
            isDarkMode ? 'hover:bg-white/5 text-gray-400 hover:text-white' : 'hover:bg-gray-50 text-gray-600'
          }`}>
            {t(item)}
          </button>
        ))}
      </div>
    </div>
  );
  // --- Bottom Navigation (Mobile) ---
  const BottomNav = () => (
    <div className={`lg:hidden fixed bottom-0 left-0 right-0 border-t z-[100] px-6 py-4 flex justify-between items-center backdrop-blur-3xl animate-in slide-in-from-bottom duration-500 ${
      isDarkMode ? 'bg-[#020617]/80 border-white/10' : 'bg-white/90 border-black/10'
    }`}>
      {[
        { id: 'home', icon: Activity },
        { id: 'fb_inbox', icon: MessageSquare },
        { id: 'admin', icon: ShieldCheck, show: role === 'super-admin' },
        { id: 'settings_tab', icon: Settings },
        { id: 'menu', icon: PanelLeft, label: 'Menu', onClick: () => setIsMobileMenuOpen(!isMobileMenuOpen) }
      ].filter(item => item.show !== false).map(item => (
        <button
          key={item.id}
          onClick={item.onClick || (() => handleTabChange(item.id))}
          className={`relative p-3 rounded-2xl transition-all active:scale-90 ${
            activeTab === item.id || (item.id === 'menu' && isMobileMenuOpen)
              ? 'text-prime-400 bg-prime-500/10' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <item.icon size={22} />
          {activeTab === item.id && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-prime-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
          )}
        </button>
      ))}
    </div>
  );

  if (loading && !brandData) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#020617] gap-6">
        <Activity size={32} className="text-prime-400 animate-pulse" />
        <p className="text-[10px] font-black uppercase tracking-[.3em] text-prime-400 animate-pulse">Synchronizing Core Engine</p>
      </div>
    );
  }

  if (!loading && !user) {
    return <AuthView isDarkMode={isDarkMode} onAuthSuccess={(userData) => login(userData)} />;
  }

  return (
    <div className={`h-screen flex transition-all duration-300 relative overflow-hidden ${
      isDarkMode ? 'bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {isDarkMode && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-prime-600/10 blur-[150px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full" />
        </div>
      )}

      <ErrorBoundary>
        <Sidebar 
          brandData={brandData}
          mainNav={mainNav}
          activeTab={activeTab}
          isDarkMode={isDarkMode}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          t={t}
          handleTabChange={(tab) => {
            handleTabChange(tab);
            setIsMobileMenuOpen(false);
          }}
          expandedMenus={expandedMenus}
          setExpandedMenus={setExpandedMenus}
          onOpenBrandOnboarding={() => setIsBrandOnboardingOpen(true)}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
      </ErrorBoundary>
      
      <main className={`flex-1 flex flex-col relative z-10 transition-all duration-700 ${activeTab === 'fb_inbox' ? 'p-0 overflow-hidden' : 'p-8 overflow-y-auto'}`} onScroll={handleScroll}>
        <ErrorBoundary>
          {activeTab !== 'fb_inbox' && (
            <header className="flex justify-between items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
              <div>
                <h2 className={`text-4xl font-black mb-1 tracking-tighter ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('system_status')} <span className="text-prime-500">.</span></h2>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-40 italic">{brandData?.name} Hub • v2.4.0</p>
              </div>
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-black/10'}`}
                >
                  <UserCircle size={24} className="text-prime-500" />
                </button>
                {isProfileOpen && <ProfileDropdown />}
              </div>
            </header>
          )}
          
          <GlobalBanner isDarkMode={isDarkMode} />

          <div className={`flex-1 flex flex-col ${activeTab === 'fb_inbox' ? 'min-h-0 h-full overflow-hidden' : ''}`}>
            {activeTab === 'home' && <HomeView stats={stats} t={t} isDarkMode={isDarkMode} gaps={gaps} />}
            {activeTab === 'fb_inbox' && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="h-full flex overflow-hidden">
                   <div className="w-80 border-r border-white/5 flex flex-col shrink-0">
                      <InboxFilterBar 
                        inboxSearch={inboxSearch} 
                        setInboxSearch={setInboxSearch} 
                        inboxFilter={inboxFilter} 
                        setInboxFilter={setInboxFilter} 
                        dateFilter={dateFilter}
                        setDateFilter={setDateFilter}
                        isSelectMode={isSelectMode}
                        setIsSelectMode={setIsSelectMode}
                        selectedConvoIds={selectedConvoIds}
                        handleBulkAction={handleBulkAction}
                        t={t} 
                        isDarkMode={isDarkMode} 
                      />
                      <InboxList conversations={conversations} selectedConvo={selectedConvo} setSelectedConvo={handleSelectConvo} t={t} isDarkMode={isDarkMode} />
                   </div>
                   <ChatWindow 
                    selectedConvo={selectedConvo} 
                    chatMessages={chatMessages} 
                    messageInput={messageInput} 
                    setMessageInput={setMessageInput} 
                    handleSendMessage={handleSendMessage} 
                    attachedFiles={attachedFiles}
                    setAttachedFiles={setAttachedFiles}
                    optimisticMessages={optimisticMessages}
                    replyTo={replyTo}
                    setReplyTo={setReplyTo}
                    editingMessage={editingMessage}
                    startEditMessage={startEditMessage}
                    handleDeleteMessage={handleDeleteMessage}
                    cancelInteractions={cancelInteractions}
                    drafts={drafts}
                    t={t} 
                    isDarkMode={isDarkMode} 
                    isAiThinking={isAiThinking}
                    handleFileChange={handleFileChange}
                    isSyncingHistory={isSyncingHistory}
                    syncHistory={syncHistory}
                    toggleFollowUp={toggleFollowUp}
                    togglePriority={togglePriority}
                    chatEndRef={chatEndRef}
                    onScroll={handleScroll}
                    showScrollButton={showScrollButton}
                    scrollToBottom={stableScrollToBottom}
                    onOpenOrderDrafting={() => setIsOrderDraftingOpen(true)}
                    onOpenCatalogShare={() => setIsCatalogShareOpen(true)}
                    onOpenMediaGallery={() => setIsMediaGalleryOpen(true)}
                    onForward={handleForwardMessage}
                    setLightbox={setLightbox}
                   />
                   <SalesSidebar 
                    isDarkMode={isDarkMode} 
                    t={t} 
                    selectedConvo={selectedConvo} 
                    setSelectedConvo={setSelectedConvo}
                    chatMessages={chatMessages} 
                    orders={orders}
                    setLightbox={setLightbox}
                    onOpenMediaGallery={() => setIsMediaGalleryOpen(true)}
                    onViewOrders={() => handleTabChange('orders')}
                  />
                </div>
              </div>
            )}
            {activeTab === 'products' && <ProductHub products={products} isDarkMode={isDarkMode} t={t} />}
            {activeTab === 'orders' && <OrdersView orders={orders} isDarkMode={isDarkMode} t={t} />}
            {activeTab === 'settings_tab' && (
              <SettingsView 
                isDarkMode={isDarkMode} 
                theme={theme} 
                setTheme={setTheme} 
                language={language} 
                setLanguage={setLanguage} 
                t={t} 
              />
            )}
            {activeTab === 'gaps' && <KnowledgeGaps gaps={gaps} isDarkMode={isDarkMode} t={t} handleConvertToDraft={handleConvertToDraft} />}
            {activeTab === 'drafts' && <DraftCenter drafts={drafts} isDarkMode={isDarkMode} t={t} handleApproveDraft={handleApproveDraft} />}
            {activeTab === 'library' && <KnowledgeBase library={library} isDarkMode={isDarkMode} t={t} />}
            {activeTab === 'architect' && <BlueprintArchitect brandData={brandData} isDarkMode={isDarkMode} t={t} />}
            {activeTab === 'admin' && role === 'super-admin' && <SuperAdminPanel isDarkMode={isDarkMode} t={t} />}
          </div>
        </ErrorBoundary>
      </main>

      {/* Overlays */}
      <ErrorBoundary>
        {isOrderDraftingOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOrderDraftingOpen(false)}></div>
             <div className="relative w-full max-w-2xl bg-[#020617] h-screen shadow-2xl animate-in slide-in-from-right duration-500">
                <OrderDrafting 
                  onClose={() => setIsOrderDraftingOpen(false)} 
                  isDarkMode={isDarkMode} 
                  t={t} 
                  selectedConvo={selectedConvo}
                  products={products}
                  activeBrandId={activeBrandId}
                />
             </div>
          </div>
        )}

        {isBrandOnboardingOpen && <BrandOnboarding isOpen={isBrandOnboardingOpen} onClose={() => setIsBrandOnboardingOpen(false)} />}
        <Lightbox {...lightbox} onClose={() => setLightbox(prev => ({ ...prev, isOpen: false }))} />

        {isCatalogShareOpen && (
          <CatalogShareModal 
            isOpen={true}
            onClose={() => setIsCatalogShareOpen(false)} 
            isDarkMode={isDarkMode} 
            t={t} 
            products={products}
            onShare={(selectedBatch) => {
              const text = selectedBatch.map(p => `📦 ${p.name} - ${p.offerPrice || p.price} BDT`).join('\n');
              setMessageInput(text);
              setIsCatalogShareOpen(false);
            }}
          />
        )}
        {isMediaGalleryOpen && (
          <MediaGalleryModal 
            isOpen={true}
            onClose={() => setIsMediaGalleryOpen(false)} 
            isDarkMode={isDarkMode} 
            t={t} 
            chatMessages={chatMessages}
            setLightbox={setLightbox}
          />
        )}
        {followUpModal.isOpen && (
          <FollowUpModal 
            isOpen={followUpModal.isOpen} 
            onClose={() => setFollowUpModal({ ...followUpModal, isOpen: false })} 
            onConfirm={confirmFollowAction} 
            modalData={followUpModal}
            setModalData={setFollowUpModal}
            isDarkMode={isDarkMode} 
            t={t} 
          />
        )}
      </ErrorBoundary>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
