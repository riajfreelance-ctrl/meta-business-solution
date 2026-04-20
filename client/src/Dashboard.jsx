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
  RotateCcw, Bookmark, Star, ChevronDown, Plus, Globe,
  Maximize, ZoomIn, ZoomOut, ChevronLeft, ChevronRight,
  X, XCircle, Info, Download, ShoppingCart,
  Image
} from 'lucide-react';
import { createPortal } from 'react-dom';

// Import Modular Components
import { 
  MetaIcon, 
  MessengerIcon, 
  FacebookIcon, 
  InstagramIcon, 
  WhatsAppIcon, 
  SocialSuiteIcon,
  FBCommentIcon,
  IGDirectIcon,
  IGCommentIcon,
  SocialHubIcon
} from './components/Icons';
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
import CommentDataCenter from './components/Views/CommentDataCenter';
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
import CategoryHub from './components/Views/CategoryHub';
import MediaBrowser from './components/Views/MediaBrowser';

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
            <h2 className="text-5xl font-black  tracking-tighter text-white">SYSTEM CRASH <span className="text-red-500">DETECTED</span></h2>
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
  const [navPicker, setNavPicker] = useState({ isOpen: false, slotIndex: null });
  const [navSlots, setNavSlots] = useState(() => {
    const saved = localStorage.getItem('metasolution_nav_slots');
    return saved ? JSON.parse(saved) : [
      { id: 'menu', type: 'special' },
      { id: 'home' },
      { id: 'fb_inbox' },
      { id: 'settings_tab' },
      { id: 'admin', show: role === 'super-admin' }
    ];
  });

  // Long press timer ref
  const longPressTimer = useRef(null);
  
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

  useEffect(() => {
    localStorage.setItem('metasolution_nav_slots', JSON.stringify(navSlots));
  }, [navSlots]);

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

   const handleLinguisticExpand = async (id, kw, options = []) => {
      setExpandingId(id);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/generate_linguistic_variations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ draftId: id, keyword: kw, options })
        });
        if (!response.ok) throw new Error('Generation failed');
      } catch (e) {
        console.error("Linguistic Generation Error:", e);
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
      id: 'social_suite', 
      icon: SocialSuiteIcon, 
      label: 'social_suite',
      sub: [
        { id: 'all_social', label: 'all_conversations', icon: SocialHubIcon },
        { 
          id: 'facebook_group', 
          label: 'Facebook', 
          icon: FacebookIcon, 
          isGroup: true,
          items: [
            { id: 'fb_inbox', label: 'inbox', icon: MessengerIcon },
            { id: 'fb_comments', label: 'comments', icon: FBCommentIcon },
            { id: 'comment_data', label: 'data center', icon: Database }
          ]
        },
        { 
          id: 'instagram_group', 
          label: 'Instagram', 
          icon: InstagramIcon, 
          isGroup: true,
          items: [
            { id: 'ig_inbox', label: 'inbox', icon: IGDirectIcon },
            { id: 'ig_comments', label: 'comments', icon: IGCommentIcon }
          ]
        },
        { 
          id: 'whatsapp_group', 
          label: 'WhatsApp', 
          icon: WhatsAppIcon, 
          isGroup: true,
          items: [
            { id: 'wa_inbox', label: 'inbox', icon: WhatsAppIcon }
          ]
        }
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
        { id: 'architect', label: 'blueprint_architect', icon: Cpu },
        { id: 'media_browser', label: 'media_browser', icon: Image }
      ]
    },
    ...((role === 'super-admin') ? [{ id: 'admin', icon: ShieldCheck, label: 'admin' }] : []),
    { id: 'settings_tab', icon: Settings, label: 'setting' },
  ], [role]);

  const activeMainCategory = useMemo(() => {
    return mainNav.find(item => item.id === activeTab && item.sub);
  }, [activeTab, mainNav]);

  const hubMetrics = useMemo(() => {
    if (!activeMainCategory) return [];
    
    if (activeMainCategory.id === 'social_suite') {
      const unread = (allConversations || []).filter(c => c.unread).length;
      const connected = (brandData?.platforms?.length || 0);
      const priority = (allConversations || []).filter(c => c.isPriority || c.isFollowUp).length;
      return [
        { label: 'Nodes', value: connected, icon: Globe },
        { label: 'Unread', value: unread, icon: MessageSquare },
        { label: 'Leads', value: priority, icon: Star },
        { label: 'AI Auth.', value: '94%', icon: Cpu },
        { label: 'Response', value: '12ms', icon: Activity },
        { label: 'Active', value: (allConversations || []).length, icon: TrendingUp }
      ];
    }
    
    if (activeMainCategory.id === 'products_hub') {
      const total = (products || []).length;
      const pending = (orders || []).filter(o => o.status === 'pending').length;
      const lowStock = (products || []).filter(p => (p.stock || 0) < 5).length;
      return [
        { label: 'Live', value: total, icon: Package },
        { label: 'Pending', value: pending, icon: ShoppingBag },
        { label: 'Stock Low', value: lowStock, icon: AlertCircle },
        { label: 'Velocity', value: '3.2/d', icon: TrendingUp },
        { label: 'Health', value: '98%', icon: ShieldCheck },
        { label: 'Growth', value: '+12%', icon: Star }
      ];
    }
    
    if (activeMainCategory.id === 'data_engine') {
      const nodes = (library || []).length;
      const pendingGaps = (gaps || []).filter(g => g.status === 'pending').length;
      const syncLevel = '94%';
      return [
        { label: 'AI Nodes', value: nodes, icon: Cpu },
        { label: 'Gaps', value: pendingGaps, icon: BookOpen },
        { label: 'Sync', value: syncLevel, icon: RotateCcw },
        { label: 'Accuracy', value: '99.2%', icon: ShieldCheck },
        { label: 'Load', value: '12%', icon: Activity },
        { label: 'Last Sync', value: '12m', icon: Activity }
      ];
    }
    
    return [];
  }, [activeMainCategory, allConversations, brandData, products, orders, library, gaps]);

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
  // --- Bottom Navigation (Ultra-Premium Dock) ---
  const BottomNav = () => {
    const activeIndex = navSlots.findIndex(item => activeTab === item.id || (item.id === 'menu' && isMobileMenuOpen));
    
    // Icon mapping helper
    const getIcon = (id) => {
      if (id === 'menu') return PanelLeft;
      const found = mainNav.reduce((acc, item) => {
        if (item.id === id) return item.icon;
        if (item.sub) {
          const sub = item.sub.find(s => s.id === id);
          if (sub) return sub.icon;
        }
        return acc;
      }, Activity);
      return found;
    };

    const handleTriggerPicker = (e, index) => {
      e.preventDefault();
      if (index === 0) return; // Menu slot is fixed
      setNavPicker({ isOpen: true, slotIndex: index });
    };

    const startLongPress = (index) => {
      if (index === 0) return;
      longPressTimer.current = setTimeout(() => {
        setNavPicker({ isOpen: true, slotIndex: index });
      }, 600);
    };

    const stopLongPress = () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };

    return (
      <div className="lg:hidden fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-[420px] animate-in fade-in slide-in-from-bottom-12 duration-1000">
        <div className={`relative flex items-center p-1.5 rounded-[3.5rem] border shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-3xl ${
          isDarkMode ? 'bg-[#0a0f1d]/80 border-white/10' : 'bg-white/90 border-black/5'
        }`}>
          {activeIndex !== -1 && (
            <div 
              className="absolute inset-y-1.5 bg-gradient-to-r from-prime-500 via-indigo-500 to-prime-600 rounded-[2.5rem] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              style={{ 
                left: `${(activeIndex * 100) / navSlots.length}%`,
                width: `${100 / navSlots.length}%`,
                scale: 0.94
              }}
            >
              <div className="absolute inset-0 bg-white/10 rounded-[2.5rem] border-t border-white/20" />
            </div>
          )}

          {navSlots.map((item, index) => {
            const isActive = activeIndex === index;
            const Icon = getIcon(item.id);
            return (
              <button
                key={`${item.id}-${index}`}
                onClick={() => {
                  if (item.id === 'menu') setIsMobileMenuOpen(!isMobileMenuOpen);
                  else handleTabChange(item.id);
                }}
                onContextMenu={(e) => handleTriggerPicker(e, index)}
                onTouchStart={() => startLongPress(index)}
                onTouchEnd={stopLongPress}
                className={`relative flex-1 flex flex-col items-center justify-center py-4 rounded-[2rem] transition-all duration-500 active:scale-90 group z-10`}
              >
                <div className={`relative p-2.5 rounded-[1rem] transition-all duration-500 shadow-lg border-t border-white/20 overflow-hidden ${
                  isActive 
                    ? 'bg-gradient-to-br from-white/20 to-white/5 opacity-100' 
                    : 'bg-white/5 opacity-50 group-hover:opacity-100'
                }`}>
                   <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                   <Icon
                    size={22} 
                    strokeWidth={2} 
                    className={`transition-all duration-500 text-white relative z-10 ${
                      isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : ''
                    }`} 
                   />
                </div>
                {isActive && (
                  <div className="absolute -top-1 w-6 h-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,1)] rounded-full animate-pulse z-20" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // --- Navigation Picker Popup ---
  const NavigationPicker = () => {
    if (!navPicker.isOpen) return null;
    
    // Pool of all available items
    const availablePool = mainNav.reduce((acc, item) => {
      acc.push({ id: item.id, label: item.label, icon: item.icon, group: 'Main Hubs' });
      if (item.sub) {
        item.sub.forEach(sub => {
          acc.push({ id: sub.id, label: sub.label, icon: sub.icon, group: t(item.label) });
        });
      }
      return acc;
    }, []);

    const handleSelect = (itemId) => {
      const newSlots = [...navSlots];
      newSlots[navPicker.slotIndex] = { id: itemId };
      setNavSlots(newSlots);
      setNavPicker({ isOpen: false, slotIndex: null });
    };

    return createPortal(
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xl animate-in fade-in duration-700" onClick={() => setNavPicker({ isOpen: false, slotIndex: null })} />
        
        <div className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col items-center gap-6 animate-in zoom-in-95 slide-in-from-bottom-10 duration-700">
           {/* Floating Header */}
           <div className={`p-6 px-10 rounded-[2.5rem] border backdrop-blur-3xl shadow-2xl transition-all duration-700 flex flex-col items-center ${
            isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-black/5 text-gray-900'
           }`}>
              <h3 className="text-2xl font-black tracking-tighter uppercase mb-1">Select Core Module</h3>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Personalize Slot {navPicker.slotIndex}</p>
           </div>
          
          <div className="w-full flex-1 overflow-y-auto px-4 pb-12 space-y-10 custom-scrollbar">
            {/* Grouping Items into Floating Clusters */}
            {['Main Hubs', t('social_suite'), t('products_offers'), t('data_engine')].map(group => (
              <div key={group} className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-10 bg-white/10" />
                  <p className="text-[9px] font-black uppercase tracking-[0.5em] opacity-30 whitespace-nowrap text-prime-400">{group}</p>
                  <div className="h-px w-10 bg-white/10" />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
                  {availablePool.filter(p => (group === 'Main Hubs' ? p.group === 'Main Hubs' : p.group === group)).map(p => {
                    const isAssigned = navSlots.some(s => s.id === p.id);
                    return (
                    <button
                      key={p.id}
                      onClick={() => handleSelect(p.id)}
                      disabled={isAssigned}
                      className={`group/opt relative flex items-center gap-4 p-4 rounded-[2rem] border transition-all duration-700 hover:scale-[1.05] hover:-translate-y-1 ${
                        isDarkMode 
                          ? `bg-white/[0.03] border-white/5 ${isAssigned ? 'opacity-20 grayscale cursor-not-allowed' : 'hover:border-prime-500/30'}` 
                          : 'bg-white border-black/5 shadow-lg'
                      }`}
                    >
                       <div className={`p-4 rounded-2xl transition-all duration-500 shadow-xl border-t border-white/10 ${
                         isDarkMode ? 'bg-gradient-to-br from-prime-500/80 to-indigo-600/80 text-white' : 'bg-prime-50 text-prime-600'
                       }`}>
                         <p.icon size={22} strokeWidth={2.5} />
                       </div>
                       <div className="text-left">
                         <span className={`block text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                           {t(p.label)}
                         </span>
                         <span className="text-[7px] font-bold text-prime-400 opacity-60 uppercase tracking-[0.2em]">{p.group}</span>
                       </div>
                    </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Floating Close Button */}
          <button 
            onClick={() => setNavPicker({ isOpen: false, slotIndex: null })}
            className="absolute bottom-4 p-5 bg-white text-black rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] active:scale-90 transition-all hover:scale-110 z-50 animate-bounce duration-[3000ms]"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>
      </div>,
      document.body
    );
  };

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
    <div className={`edge-to-edge-wrapper flex transition-all duration-700 ${
      isDarkMode ? 'bg-transparent text-slate-200' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {isDarkMode && <div className="mesh-bg" />}



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
      
      <main className={`flex-1 flex flex-col relative z-10 transition-all duration-700 ${['fb_inbox', 'ig_inbox', 'wa_inbox', 'all_social', 'fb_comments', 'ig_comments'].includes(activeTab) ? 'p-0 overflow-hidden' : 'p-8 overflow-y-auto'}`} onScroll={handleScroll}>
        <ErrorBoundary>
          {!['fb_inbox', 'ig_inbox', 'wa_inbox', 'all_social', 'fb_comments', 'ig_comments'].includes(activeTab) && (
            <header className="flex justify-between items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
              <div>
                <h2 className={`text-4xl font-black mb-1 tracking-tighter ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('system_status')} <span className="text-prime-500">.</span></h2>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-40 ">{brandData?.name} Hub • v2.4.0</p>
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

          <div className={`flex-1 flex flex-col ${['fb_inbox', 'ig_inbox', 'wa_inbox', 'all_social', 'fb_comments', 'ig_comments'].includes(activeTab) ? 'min-h-0 h-full overflow-hidden' : ''}`}>
            {activeTab === 'home' && <HomeView stats={stats} t={t} isDarkMode={isDarkMode} gaps={gaps} drafts={drafts} />}
            {['fb_inbox', 'ig_inbox', 'wa_inbox', 'all_social'].includes(activeTab) && (
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
                    brandId={activeBrandId}
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

            {/* Comment Management Systems */}
            {(activeTab === 'fb_comments' || activeTab === 'ig_comments') && (
              <div className="flex-1 overflow-y-auto p-8 bg-slate-950/20">
                <CommentDraftCenter 
                  isDarkMode={isDarkMode} 
                  t={t} 
                  commentDrafts={commentDrafts}
                  pendingComments={pendingComments}
                  isSyncing={isSyncingHistory}
                  handleSyncHistory={syncHistory}
                />
              </div>
            )}
            {activeTab === 'comment_data' && (
              <div className="flex-1 overflow-y-auto p-8 bg-slate-950/20">
                <CommentDataCenter 
                  isDarkMode={isDarkMode}
                />
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
            {activeTab === 'drafts' && <DraftCenter 
              drafts={drafts} 
              isDarkMode={isDarkMode} 
              t={t} 
              handleApproveDraft={handleApproveDraft} 
              handleExpandKeywords={handleExpandKeywords}
              handleLinguisticExpand={handleLinguisticExpand}
              expandingId={expandingId}
              toggleVariation={toggleVariation}
            />}
            {activeTab === 'library' && <KnowledgeBase library={library} isDarkMode={isDarkMode} t={t} />}
            {activeTab === 'architect' && <BlueprintArchitect brandData={brandData} isDarkMode={isDarkMode} t={t} />}
            {activeTab === 'media_browser' && <MediaBrowser brandId={brandData?.id} />}
            {activeTab === 'admin' && role === 'super-admin' && <SuperAdminPanel isDarkMode={isDarkMode} t={t} />}
            
            {/* Main Category Hubs */}
            {activeMainCategory && (
              <CategoryHub 
                isDarkMode={isDarkMode} 
                t={t} 
                category={activeMainCategory} 
                onSubSelect={handleTabChange} 
                metrics={hubMetrics}
              />
            )}
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
          />
        )}
        <BottomNav />
        <NavigationPicker />
      </ErrorBoundary>
    </div>
  );
};

export default Dashboard;
