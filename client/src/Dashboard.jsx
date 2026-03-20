import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Home,
  Facebook,
  Instagram,
  Smartphone,
  Database,
  ChevronDown,
  ChevronRight,
  User,
  BookOpen,
  HelpCircle,
  Package,
  Settings,
  ShieldCheck,
  Edit2,
  Trash2,
  CheckCircle,
  Zap,
  XCircle,
  TrendingUp,
  MessageSquare,
  Smile,
  Plus,
  Search,
  UserCircle,
  GripVertical
} from 'lucide-react';
import { db } from './firebase-client';
import { collection, onSnapshot, doc, updateDoc, addDoc, query, orderBy } from 'firebase/firestore';
import { Moon, Sun, Languages } from 'lucide-react';

const MetaIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
     <path fill="#0668E1" d="M17.42 6.72c-1.37 0-2.45.64-3.5 1.76l-.42.47c-.55.62-1.12 1.25-1.5 1.62-.38-.37-.95-1-1.5-1.62l-.42-.47c-1.05-1.12-2.13-1.76-3.5-1.76C4.1 6.72 2 8.87 2 11.5s2.1 4.78 4.58 4.78c1.37 0 2.45-.64 3.5-1.76l.42-.47c.55-.62 1.12-1.25 1.5-1.62.38.37.95 1 1.5 1.62l.42.47c1.05 1.12 2.13 1.76 3.5 1.76 2.48 0 4.58-2.15 4.58-4.78s-2.1-4.78-4.58-4.78zm0 7.42c-.85 0-1.55-.42-2.2-1.1l-.42-.47c-.45-.52-.95-1.05-1.3-1.4.35-.35.85-.88 1.3-1.4l.42-.47c.65-.68 1.35-1.1 2.2-1.1 1.34 0 2.42 1.17 2.42 2.62s-1.08 2.62-2.42 2.62zM6.58 14.14c-.85 0-1.55-.42-2.2-1.1l-.42-.47c-.45-.52-.95-1.05-1.3-1.4.35-.35.85-.88 1.3-1.4l.42-.47c.65-.68 1.35-1.1 2.2-1.1 1.34 0 2.42 1.17 2.42 2.62s-1.08 2.62-2.42 2.62z"/>
  </svg>
);

const FacebookIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-[#1877F2]">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="instaGradient" x1="12" y1="0" x2="12" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#833AB4"/>
        <stop offset="0.5" stopColor="#FD1D1D"/>
        <stop offset="1" stopColor="#FCB045"/>
      </linearGradient>
    </defs>
    <path fill="url(#instaGradient)" d="M12 0C8.74 0 8.33.015 7.05.073 5.77.132 4.9.336 4.14.63c-.78.3-1.45.71-2.12 1.38-.67.67-1.08 1.34-1.38 2.12-.3.76-.5 1.63-.56 2.91C.015 8.33 0 8.74 0 12c0 3.26.015 3.67.073 4.95.059 1.28.261 2.15.56 2.91.3.78.71 1.45 1.38 2.12.67.67 1.34 1.08 2.12 1.38.76.3 1.63.5 2.91.56 1.28.058 1.69.073 4.95.073 3.26 0 3.67-.015 4.95-.073 1.28-.059 2.15-.261 2.91-.56.78-.3 1.45-.71 2.12-1.38.67-.67 1.08-1.34 1.38-2.12.3-.76.5-1.63.56-2.91.058-1.28.073-1.69.073-4.95 0-3.26-.015-3.67-.073-4.95-.059-1.28-.261-2.15-.56-2.91-.3-.78-.71-1.45-1.38-2.12-.67-.67-1.34-1.08-2.12-1.38-.76-.3-1.63-.5-2.91-.56C15.67.015 15.26 0 12 0zm0 2.16c3.2 0 3.58.012 4.85.07 1.17.054 1.8.249 2.22.412.56.216.96.474 1.38.894.42.42.678.82.894 1.38.163.42.358 1.05.412 2.22.058 1.27.07 1.65.07 4.85s-.012 3.58-.07 4.85c-.054 1.17-.249 1.8-.412 2.22-.216.56-.474.96-.894 1.38-.42.42-.82.678-1.38.894-.42.163-1.05.358-2.22.412-1.27.058-1.65.07-4.85.07s-3.58-.012-4.85-.07c-1.17-.054-1.8-.249-2.22-.412-.56-.216-.96-.474-1.38-.894-.42-.42-.678-.82-.894-1.38-.163-.42-.358-1.05-.412-2.22C2.172 15.58 2.16 15.2 2.16 12s.012-3.58.07-4.85c.054-1.17.249-1.8.412-2.22.216-.56.474-.96.894-1.38.42-.42.82-.678 1.38-.894.42-.163 1.05-.358 2.22-.412 1.27-.058 1.65-.07 4.85-.07zM12 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zm0 10.16a4 4 0 110-8 4 4 0 010 8zm6.4-10.42a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/>
  </svg>
);

const WhatsAppIcon = ({ size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className="text-[#25D366]"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const MessengerIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="msgGradient" x1="12" y1="0" x2="12" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#00B2FF"/>
        <stop offset="0.5" stopColor="#006AFF"/>
        <stop offset="1" stopColor="#A033FF"/>
      </linearGradient>
    </defs>
    <path fill="url(#msgGradient)" d="M12 0C5.373 0 0 4.974 0 11.111c0 3.491 1.745 6.608 4.473 8.564V24l4.091-2.245c1.103.306 2.27.467 3.436.467 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.255 14.821l-3.085-3.292-6.023 3.292 6.623-7.031 3.161 3.292 5.947-3.292-6.623 7.031z"/>
  </svg>
);

const IGDirectIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const FBCommentIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-[#898F9C]">
    <path d="M18 10h-8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2zm-2 4h-6a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2zm4-10H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h2l4 4 4-4h4c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14h-4.8L12 19.2 10.8 18H4V6h16v12z"/>
  </svg>
);

const IGCommentIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

const HomeIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#3B82F6]">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const ProductHubIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#F59E0B]">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

const DataEngineIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10B981]">
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
);

const AdminIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#6366F1]">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

const SettingIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9CA3AF]">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const DraftIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"></path>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
  </svg>
);

const GapIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const KnowledgeIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);

const ArchitectIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
    <polyline points="21 8 21 21 3 21 3 8"></polyline>
    <rect x="1" y="3" width="22" height="5"></rect>
    <line x1="10" y1="12" x2="14" y2="12"></line>
  </svg>
);

const translations = {
  en: {
    home: 'Home',
    facebook: 'Facebook',
    instagram: 'Instagram',
    whatsapp: 'WhatsApp',
    products_offers: 'Products & Offers',
    data_engine: 'Data Engine',
    admin: 'Admin',
    setting: 'Setting',
    inbox: 'Inbox',
    comments: 'Comments',
    product: 'Product',
    inventory: 'Inventory',
    offers: 'Offers',
    draft_center: 'Draft Center',
    knowledge_gaps: 'Knowledge Gaps',
    knowledge_base: 'Knowledge Base',
    blueprint_architect: 'Blueprint Architect',
    theme: 'Theme',
    language: 'Language',
    dark: 'Dark',
    light: 'Light',
    english: 'English',
    bangla: 'Bangla',
    welcome: 'Welcome to META BUSINESS SOLUTION',
    mission_focus: 'Mission Focus',
    active_gaps: 'Active Knowledge Gaps',
    quick_stats: 'Quick Stats',
    capture_drafts: 'Capture Drafts',
    approve: 'Approve',
    reject: 'Reject',
    advanced: 'Advanced',
    coming_soon: 'Coming Soon',
    coming_soon_desc: 'This feature is being prepared for your business growth.',
    display_settings: 'Display Settings',
    system_status: 'System Status',
    online: 'Online',
    version: 'Version',
    trending_topics: 'Trending Topics',
    team_bulletin: 'Team Bulletin',
    bulletin_placeholder: 'Stick important notes here...',
    queries: 'queries',
    gemini_magic: 'Gemini Magic Polish',
    add_product: 'Add Product',
    retail: 'Retail',
    limited_offer: 'Limited Offer',
    edit: 'Edit',
    skip: 'Skip for now',
    next_step: 'Next Step',
    profile: 'Profile',
    my_plan: 'My Plan',
    billing: 'Billing',
    logout: 'Logout',
    account_settings: 'Account Settings',
  },
  bn: {
    home: 'হোম',
    facebook: 'ফেসবুক',
    instagram: 'ইনস্টাগ্রাম',
    whatsapp: 'হোয়াটসঅ্যাপ',
    products_offers: 'পণ্য ও অফার',
    data_engine: 'ডেটা ইঞ্জিন',
    admin: 'অ্যাডমিন',
    setting: 'সেটিং',
    inbox: 'ইনবক্স',
    comments: 'কমেন্টস',
    product: 'পণ্য',
    inventory: 'ইনভেন্টরি',
    offers: 'অফার',
    draft_center: 'ড্রাফট সেন্টার',
    knowledge_gaps: 'নলেজ গ্যাপস',
    knowledge_base: 'নলেজ বেস',
    blueprint_architect: 'ব্লুপ্রিন্ট আর্কিটেক্ট',
    theme: 'থিম',
    language: 'ভাষা',
    dark: 'ডার্ক',
    light: 'লাইট',
    english: 'English',
    bangla: 'বাংলা',
    welcome: 'মেটা বিজনেস সলিউশন-এ স্বাগতম',
    mission_focus: 'মিশন ফোকাস',
    active_gaps: 'সক্রিয় নলেজ গ্যাপস',
    quick_stats: 'দ্রুত পরিসংখ্যান',
    capture_drafts: 'ড্রাফট ক্যাপচার',
    approve: 'অনুমোদন',
    reject: 'বাতিল',
    advanced: 'অ্যাডভান্সড',
    coming_soon: 'শীঘ্রই আসছে',
    coming_soon_desc: 'আপনার ব্যবসার উন্নতির জন্য এই ফিচারটি প্রস্তুত করা হচ্ছে।',
    display_settings: 'ডিসপ্লে সেটিংস',
    system_status: 'সিস্টেম স্ট্যাটাস',
    online: 'অনলাইন',
    version: 'ভার্সন',
    trending_topics: 'ট্রেন্ডিং টপিকস',
    team_bulletin: 'টিম বুলেটিন',
    bulletin_placeholder: 'এখানে গুরুত্বপূর্ণ নোট লিখুন...',
    queries: 'কোয়েরি',
    gemini_magic: 'জেমিনি ম্যাজিক ম্যাজিক',
    add_product: 'পণ্য যোগ করুন',
    retail: 'খুচরা',
    limited_offer: 'সীমিত সময়ের অফার',
    edit: 'এডিট',
    skip: 'আপাতত বাদ দিন',
    next_step: 'পরবর্তী ধাপ',
    profile: 'প্রোফাইল',
    my_plan: 'আমার প্ল্যান',
    billing: 'বিলিং',
    logout: 'লগআউট',
    account_settings: 'অ্যাকাউন্ট সেটিংস',
  }
};

const Dashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') !== 'light');
  const [language, setLanguage] = useState(() => localStorage.getItem('lang') || 'en');
  const [activeTab, setActiveTab] = useState('home');
  const [missionFocus, setMissionFocus] = useState('');
  const [gaps, setGaps] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({});
  const [drafts, setDrafts] = useState([]);
  const [library, setLibrary] = useState([]);
  const [expandingId, setExpandingId] = useState(null);
  const [expandedMenus, setExpandedMenus] = useState([]);
  const [dragOverItem, setDragOverItem] = useState(null); // { type: 'main'|'sub', mainIndex, subIndex }
  const [draggedMainIdx, setDraggedMainIdx] = useState(null);
  const [draggedSubIdx, setDraggedSubIdx] = useState(null);
  const [isDraggingType, setIsDraggingType] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const t = (key) => translations[language][key] || key;

  const [mainNav, setMainNav] = useState([
    { id: 'home', icon: HomeIcon, label: 'home', fixed: true },
    { 
      id: 'facebook', 
      icon: FacebookIcon, 
      label: 'facebook',
      sub: [
        { id: 'fb_inbox', label: 'inbox', icon: MessengerIcon },
        { id: 'fb_comments', label: 'comments', icon: FBCommentIcon }
      ]
    },
    { 
      id: 'instagram', 
      icon: InstagramIcon, 
      label: 'instagram',
      sub: [
        { id: 'ig_inbox', label: 'inbox', icon: IGDirectIcon },
        { id: 'ig_comments', label: 'comments', icon: IGCommentIcon }
      ]
    },
    { 
      id: 'whatsapp', 
      icon: WhatsAppIcon, 
      label: 'whatsapp',
      sub: [
        { id: 'wa_inbox', label: 'inbox', icon: WhatsAppIcon }
      ]
    },
    { 
      id: 'products', 
      icon: ProductHubIcon, 
      label: 'products_offers',
      sub: [
        { id: 'prod_list', label: 'product', icon: ProductHubIcon },
        { id: 'inventory', label: 'inventory', icon: ProductHubIcon },
        { id: 'offers', label: 'offers', icon: ProductHubIcon }
      ]
    },
    { 
      id: 'data', 
      icon: DataEngineIcon, 
      label: 'data_engine',
      sub: [
        { id: 'drafts', label: 'draft_center', icon: DraftIcon },
        { id: 'gaps', label: 'knowledge_gaps', icon: GapIcon },
        { id: 'library', label: 'knowledge_base', icon: KnowledgeIcon },
        { id: 'architect', label: 'blueprint_architect', icon: ArchitectIcon }
      ]
    },
    { id: 'admin', icon: AdminIcon, label: 'admin', fixed: true },
    { id: 'settings_tab', icon: SettingIcon, label: 'setting', fixed: true },
  ]);

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) ? [] : [menuId]
    );
  };

  const handleDragStart = (e, type, mainIndex, subIndex = null) => {
    e.dataTransfer.setData('dragType', type);
    setIsDraggingType(type);
    setDraggedMainIdx(mainIndex);
    if (subIndex !== null) setDraggedSubIdx(subIndex);
    e.target.style.opacity = '0.4';
  };

  const handleDragOver = (e, type, mainIndex, subIndex = null) => {
    e.preventDefault();
    if (isDraggingType !== type) return;

    if (type === 'main') {
      if (draggedMainIdx === mainIndex) return;
      const items = [...mainNav];
      if (items[draggedMainIdx].fixed || items[mainIndex].fixed) return;

      const [draggedItem] = items.splice(draggedMainIdx, 1);
      items.splice(mainIndex, 0, draggedItem);
      
      setDraggedMainIdx(mainIndex);
      setMainNav(items);
    } else if (type === 'sub' && draggedMainIdx === mainIndex) {
      if (draggedSubIdx === subIndex) return;
      const items = [...mainNav];
      const parent = { ...items[mainIndex] };
      const subItems = [...parent.sub];

      const [draggedSub] = subItems.splice(draggedSubIdx, 1);
      subItems.splice(subIndex, 0, draggedSub);
      
      parent.sub = subItems;
      items[mainIndex] = parent;
      
      setDraggedSubIdx(subIndex);
      setMainNav(items);
    }
  };

  const handleDragEnd = (e) => {
    setIsDraggingType(null);
    setDraggedMainIdx(null);
    setDraggedSubIdx(null);
    const allItems = document.querySelectorAll('[draggable="true"]');
    allItems.forEach(el => el.style.opacity = '1');
  };

  const handleDrop = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('lang', language);
  }, [language]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const ThemeToggle = () => (
    <button 
      onClick={() => setIsDarkMode(!isDarkMode)}
      className={`p-2 rounded-lg transition-all ${isDarkMode ? 'bg-white/10 text-yellow-400 hover:bg-white/20' : 'bg-black/10 text-indigo-600 hover:bg-black/20'}`}
      title={t('theme')}
    >
      {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );

  const LanguageToggle = () => (
    <div className={`flex items-center rounded-lg p-1 ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
      <button 
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${language === 'en' ? (isDarkMode ? 'bg-prime-500 text-white' : 'bg-prime-600 text-white') : (isDarkMode ? 'text-gray-400 font-medium' : 'text-gray-600 font-medium')}`}
      >
        EN
      </button>
      <button 
        onClick={() => setLanguage('bn')}
        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${language === 'bn' ? (isDarkMode ? 'bg-prime-500 text-white' : 'bg-prime-600 text-white') : (isDarkMode ? 'text-gray-400 font-medium' : 'text-gray-600 font-medium')}`}
      >
        BN
      </button>
    </div>
  );

  const ProfileDropdown = () => (
    <div className={`absolute right-0 top-14 w-64 rounded-2xl border shadow-2xl z-50 animate-fade-in overflow-hidden transition-all ${
      isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-black/5 text-gray-900'
    }`}>
      <div className={`p-4 border-b ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
        <p className="font-bold text-sm">Azlaan Admin</p>
        <p className="text-xs text-gray-500">premium_member@meta.solution</p>
      </div>
      <div className="p-2">
        <button className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
          <User size={18} className="text-prime-400" />
          {t('profile')}
        </button>
        <button className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
          <Zap size={18} className="text-yellow-500" />
          {t('my_plan')}
        </button>
        <button className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
          <Database size={18} className="text-green-500" />
          {t('billing')}
        </button>
        <button className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
          <Settings size={18} className="text-indigo-400" />
          {t('account_settings')}
        </button>
      </div>
      <div className={`p-2 border-t ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-all font-bold">
          <Trash2 size={18} />
          {t('logout')}
        </button>
      </div>
    </div>
  );

  useEffect(() => {
    // Sync activeTab with URL hash or state on mount
    const handlePopState = (event) => {
      if (event.state && event.state.tab) {
        setActiveTab(event.state.tab);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.history.pushState({ tab: tabId }, '', '');
  };

  useEffect(() => {
    // Real-time listeners
    const unsubGaps = onSnapshot(collection(db, 'knowledge_gaps'), (snap) => {
      setGaps(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubLibrary = onSnapshot(collection(db, 'knowledge_library'), (snap) => {
      setLibrary(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'config'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
        setMissionFocus(doc.data().missionFocus || '');
      }
    });

    const unsubDrafts = onSnapshot(collection(db, 'draft_replies'), (snap) => {
      setDrafts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubGaps();
      unsubProducts();
      unsubSettings();
      unsubDrafts();
      unsubLibrary();
    };
  }, []);

  const updateMissionFocus = async () => {
    const settingsRef = doc(db, 'settings', 'config');
    await updateDoc(settingsRef, { missionFocus });
  };

  const handleExpandKeywords = async (id, keyword) => {
    setExpandingId(id);
    try {
      const resp = await fetch('http://localhost:3000/api/expand-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword })
      });
      const data = await resp.json();
      if (data.variations) {
        const draftRef = doc(db, 'draft_replies', id);
        await updateDoc(draftRef, { 
          variations: data.variations,
          approvedVariations: data.variations // Initially all are approved for review
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExpandingId(null);
    }
  };

  const toggleVariation = async (draftId, variation, currentApproved) => {
    const draftRef = doc(db, 'draft_replies', draftId);
    let newApproved = [...(currentApproved || [])];
    if (newApproved.includes(variation)) {
      newApproved = newApproved.filter(v => v !== variation);
    } else {
      newApproved.push(variation);
    }
    await updateDoc(draftRef, { approvedVariations: newApproved });
  };

  const handleApproveDraft = async (draft) => {
    try {
      const resp = await fetch('http://localhost:3000/api/approve-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          draft_id: draft.id, 
          variations: draft.approvedVariations || [draft.keyword], 
          result: draft.result 
        })
      });
      if (resp.ok) {
        console.log('Approved!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { 
      id: 'facebook', 
      icon: FacebookIcon, 
      label: 'Facebook',
      sub: [
        { id: 'fb_inbox', label: 'Inbox', icon: MessengerIcon },
        { id: 'fb_comments', label: 'Comments', icon: FBCommentIcon }
      ]
    },
    { 
      id: 'instagram', 
      icon: InstagramIcon, 
      label: 'Instagram',
      sub: [
        { id: 'ig_inbox', label: 'Inbox', icon: IGDirectIcon },
        { id: 'ig_comments', label: 'Comments', icon: IGCommentIcon }
      ]
    },
    { 
      id: 'whatsapp', 
      icon: WhatsAppIcon, 
      label: 'WhatsApp',
      sub: [
        { id: 'wa_inbox', label: 'Inbox', icon: WhatsAppIcon }
      ]
    },
    { 
      id: 'products', 
      icon: Package, 
      label: 'Product & Offer Hub',
      sub: [
        { id: 'products', label: 'Product' },
        { id: 'inventory', label: 'Inventory' },
        { id: 'offers', label: 'Offers' }
      ]
    },
    { 
      id: 'data', 
      icon: Database, 
      label: 'Data Engine',
      sub: [
        { id: 'drafts', label: 'Draft Center' },
        { id: 'gaps', label: 'Knowledge Gaps' },
        { id: 'library', label: 'Knowledge Base' },
        { id: 'architect', label: 'Blueprint Architect' }
      ]
    },
    { id: 'admin', icon: User, label: 'Admin' },
    { id: 'settings_tab', icon: Settings, label: 'Setting' },
  ];

  const Sidebar = () => (
    <div className={`w-64 m-4 p-6 hidden lg:block overflow-y-auto rounded-3xl border transition-all duration-300 ${
      isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-black/5 shadow-xl'
    }`}>
      <div className="flex items-center gap-3 mb-10">
        <div className={`p-2 rounded-lg border transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
          <MetaIcon size={32} />
        </div>
        <h1 className={`font-bold text-lg tracking-tight uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {language === 'bn' ? 'মেটা বিজনেস সলিউশন' : 'META BUSINESS SOLUTION'}
        </h1>
      </div>
      
      <nav className="space-y-1">
        {mainNav.map((item, index) => (
          <div 
            key={item.id} 
            className="space-y-1 transition-all duration-300 ease-in-out"
            draggable={!item.fixed}
            onDragStart={(e) => handleDragStart(e, 'main', index)}
            onDragOver={(e) => handleDragOver(e, 'main', index)}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
          >
            <button
              onClick={() => {
                if (item.sub) {
                  toggleMenu(item.id);
                } else {
                  handleTabChange(item.id);
                }
              }}
              title={t(item.label)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === item.id || (item.sub && item.sub.some(s => s.id === activeTab))
                  ? (isDarkMode ? 'bg-prime-500/10 text-prime-400 font-bold' : 'bg-prime-500 text-white font-bold shadow-lg shadow-prime-500/30')
                  : (isDarkMode ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-600 hover:bg-black/5 hover:text-gray-900')
              } ${!item.fixed ? 'group' : ''}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <item.icon size={20} className="shrink-0" />
                <span className={`truncate ${item.sub ? 'font-bold' : 'font-medium'}`}>{t(item.label)}</span>
              </div>
              <div className="flex items-center gap-2">
                {!item.fixed && <div className="hidden group-hover:block opacity-30 cursor-grab active:cursor-grabbing"><GripVertical size={14} /></div>}
              </div>
            </button>
            
            {item.sub && expandedMenus.includes(item.id) && (
              <div className="ml-9 space-y-1 animate-fade-in border-l border-white/5 pl-2">
                {item.sub.map((subItem, subIndex) => (
                  <div 
                    key={subItem.id}
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      handleDragStart(e, 'sub', index, subIndex);
                    }}
                    onDragOver={(e) => {
                      e.stopPropagation();
                      handleDragOver(e, 'sub', index, subIndex);
                    }}
                    onDragEnd={handleDragEnd}
                    onDrop={handleDrop}
                    className="transition-all duration-300 ease-in-out"
                  >
                    <button
                      onClick={() => handleTabChange(subItem.id)}
                      title={t(subItem.label)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all group ${
                        activeTab === subItem.id 
                          ? (isDarkMode ? 'text-prime-400 font-bold bg-prime-500/10' : 'text-prime-600 font-bold bg-prime-500/10 border border-prime-500/20')
                          : (isDarkMode ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-black/5')
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {subItem.icon && <subItem.icon size={16} className="shrink-0" />}
                        <span className="font-medium truncate">{t(subItem.label)}</span>
                      </div>
                      <div className="hidden group-hover:block opacity-20 cursor-grab"><GripVertical size={12} /></div>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );

  const StatCard = ({ icon: Icon, title, value, color, trend, trendLabel }) => (
    <div className={`p-6 rounded-3xl border-b-4 transition-all duration-300 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-md'}`} style={{ borderColor: color }}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-opacity-10`} style={{ backgroundColor: color }}>
          <Icon size={24} style={{ color }} />
        </div>
        {trendLabel && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {trendLabel}
          </span>
        )}
      </div>
      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-1`}>{title}</p>
      <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</h3>
    </div>
  );

  return (
    <div className={`flex min-h-screen transition-all duration-500 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-gray-900'}`}>
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('system_status')}</h2>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full bg-green-500 animate-pulse`}></span>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{t('online')} • {t('version')} 2.4.0</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            
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

        {activeTab === 'home' && (
          <div className="animate-fade-in space-y-8">
            <h1 className="text-4xl font-black tracking-tight">{t('welcome')}</h1>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon={MessageSquare} title="Message Volume" value="1,284" color="#0ea5e9" trend={12} />
              <StatCard icon={Smile} title="Customer Sentiment" value="88%" color="#10b981" trend={5} trendLabel="+5%" />
              <StatCard icon={HelpCircle} title={t('active_gaps')} value={gaps.length} color="#f59e0b" />
              <StatCard icon={TrendingUp} title="Conversion Rate" value="4.2%" color="#8b5cf6" trend={2} trendLabel="+2%" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-8">
                <div className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white shadow-lg border-black/5'}`}>
                  <h3 className="text-xl font-bold mb-6">{t('trending_topics')}</h3>
                  <div className="space-y-4">
                    {['Shipping Delay', 'Vitamin C Serum', 'BOGO Offer'].map((topic, i) => (
                      <div key={i} className={`flex justify-between items-center p-4 rounded-2xl transition-colors cursor-pointer group ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}>
                        <span className="font-medium group-hover:text-prime-400">{topic}</span>
                        <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-sm`}>{(100 - i * 15)} {t('queries')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar Content Area */}
              <div className="space-y-8">
                <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200 shadow-sm'}`}>
                  <div className="flex items-center gap-2 mb-4 text-yellow-500 text-lg font-bold">
                    <Edit2 size={20} />
                    <h3>{t('team_bulletin')}</h3>
                  </div>
                  <textarea 
                    className={`w-full h-40 bg-transparent border-none focus:ring-0 resize-none italic ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    placeholder={t('bulletin_placeholder')}
                    defaultValue={language === 'bn' ? "মনে রাখবেন স্টক শেষ হওয়ার আগে ভিটামিন সি সিরাম আপডেট করতে হবে! 🚀" : "Remember to update the Vitamin C stock levels before the weekend rush! 🚀"}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs would be implemented similarly with specialized UIs */}
        {activeTab === 'gaps' && (
           <div className={`animate-fade-in p-8 rounded-3xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 shadow-none' : 'bg-white border-black/5 shadow-xl'}`}>
             <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('knowledge_gaps')}</h3>
             <div className="space-y-4">
                {gaps.length === 0 ? (
                  <p className="text-gray-500">No unresolved gaps. Good job!</p>
                ) : (
                  gaps.map((gap) => (
                    <div key={gap.id} className={`p-6 rounded-2xl border flex justify-between items-center group transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                      <div>
                        <p className={`font-medium text-lg leading-tight mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>"{gap.question}"</p>
                        <span className="text-xs text-gray-500 uppercase tracking-widest">Received {gap.timestamp?.toDate().toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-3 bg-prime-500/10 hover:bg-prime-500/20 text-prime-400 rounded-xl transition-all flex items-center gap-2 font-bold">
                          <Zap size={18} />
                          {t('gemini_magic')}
                        </button>
                        <button className={`p-3 rounded-xl transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-black/5 hover:bg-black/10 text-gray-600'}`}>
                          <CheckCircle size={20} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
             </div>
           </div>
        )}

        {activeTab === 'drafts' && (
          <div className="animate-fade-in space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold">{t('draft_center')}</h3>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{t('capture_drafts')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {drafts.length === 0 ? (
                <div className={`p-12 text-center rounded-3xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-sm'}`}>
                  <MessageSquare size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-500">No new drafts captured yet.</p>
                </div>
              ) : (
                drafts.map((draft) => (
                  <div key={draft.id} className={`p-8 rounded-3xl border space-y-6 relative overflow-hidden group transition-all ${
                    isDarkMode ? 'bg-white/5 border-white/10 hover:border-prime-500/30' : 'bg-white border-black/10 hover:border-prime-500/50 shadow-sm'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-prime-400 uppercase tracking-widest">{language === 'bn' ? 'কীওয়ার্ড' : 'Keyword'}</span>
                        <h4 className="text-xl font-bold">"{draft.keyword}"</h4>
                      </div>
                      <div className="flex gap-2">
                         <button 
                            onClick={() => handleApproveDraft(draft)}
                            className="p-3 bg-prime-500 text-white rounded-xl hover:scale-105 transition-all shadow-lg shadow-prime-500/30 flex items-center gap-2 font-bold"
                          >
                            <CheckCircle size={18} />
                            {t('approve')}
                         </button>
                         <button className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all">
                            <Trash2 size={20} />
                         </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('advanced')}</span>
                       <div className={`p-5 rounded-2xl italic border-l-4 border-prime-500 text-lg ${isDarkMode ? 'bg-black/20 text-gray-200' : 'bg-black/5 text-gray-800'}`}>
                        "{draft.result}"
                       </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-400">Keyword Variations</span>
                        <button 
                          onClick={() => handleExpandKeywords(draft.id, draft.keyword)}
                          disabled={expandingId === draft.id}
                          className={`text-sm font-bold flex items-center gap-2 px-6 py-2 rounded-full transition-all ${
                            expandingId === draft.id ? 'bg-prime-500/20 text-prime-400 animate-pulse' : 'bg-prime-500/10 text-prime-400 hover:bg-prime-500/20'
                          }`}
                        >
                          <Zap size={14} />
                          {expandingId === draft.id ? 'Gemini is Thinking...' : 'Simulate 30+ Variations'}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {draft.variations?.map((v, idx) => {
                          const isApproved = (draft.approvedVariations || []).includes(v);
                          return (
                            <div 
                              key={idx} 
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                                isApproved 
                                  ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                                  : 'bg-red-500/5 border-red-500/20 text-red-400 opacity-60'
                              }`}
                              onClick={() => toggleVariation(draft.id, v, draft.approvedVariations)}
                            >
                              <span className="text-sm font-medium">{v}</span>
                              {isApproved ? <CheckCircle size={14} /> : <XCircle size={14} />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="animate-fade-in space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('knowledge_base')}</h3>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Official AI brain and response library</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {library.length === 0 ? (
                <div className={`text-center py-20 rounded-3xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-xl'}`}>
                  <BookOpen size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">No approved knowledge yet.</p>
                </div>
              ) : (
                library.map((item) => (
                  <div key={item.id} className={`p-6 rounded-3xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 hover:border-prime-500/30' : 'bg-white border-black/5 shadow-md hover:border-prime-500/50'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-wrap gap-2">
                        {item.keywords.map((kw, i) => (
                          <span key={i} className="px-3 py-1 bg-prime-500/10 text-prime-400 rounded-full text-xs font-bold uppercase tracking-wider">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className={`p-4 rounded-2xl border-l-4 border-prime-500 ${isDarkMode ? 'bg-black/20 text-gray-200' : 'bg-black/5 text-gray-800'}`}>
                      {item.answer}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
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
                      <button className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}>{t('edit')}</button>
                      <button className="w-12 py-2 bg-prime-500/10 rounded-lg text-prime-400 flex justify-center hover:bg-prime-500/20 transition-all">
                        <TrendingUp size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'architect' && (
          <div className="animate-fade-in glass-card p-12 max-w-4xl mx-auto">
            <div className="mb-12 flex justify-between items-end">
              <div>
                <span className="text-prime-400 font-black text-4xl mb-2 block">10</span>
                <h3 className="text-2xl font-bold">Blueprint Architect Wizard</h3>
              </div>
              <div className="text-right text-gray-500 font-medium">STEP 1 / 10</div>
            </div>

            <div className="space-y-10">
              <section className="space-y-6">
                <label className="text-lg font-bold flex items-center gap-3">
                  <UserCircle className="text-prime-500" />
                  Define Brand Voice & Persona
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {['Professional', 'Friendly', 'Excited', 'Consultative'].map((tone) => (
                    <button key={tone} className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-prime-500 hover:bg-prime-500/5 transition-all text-left group">
                      <p className="font-bold group-hover:text-prime-400 mb-1">{tone}</p>
                      <p className="text-xs text-gray-500">The AI will use {tone.toLowerCase()} vocabulary.</p>
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <label className="text-lg font-bold block">Signature Emojis</label>
                <input type="text" placeholder="✨, 🚀, 💎" className="glass-input w-full p-4 rounded-xl" />
              </section>

              <div className="pt-10 flex justify-between">
                <button className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:text-white transition-colors">Skip for now</button>
                <button className="btn-primary px-12 py-3 rounded-xl flex items-center gap-2">
                  Next Step
                  <Zap size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
        {(activeTab === 'fb_inbox' || activeTab === 'fb_comments' || activeTab === 'ig_inbox' || activeTab === 'ig_comments' || activeTab === 'wa_inbox') && (
          <div className={`animate-fade-in py-20 text-center rounded-3xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white shadow-xl border-black/5'}`}>
            <Smartphone size={64} className="mx-auto text-prime-500/30 mb-6" />
            <h3 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('coming_soon')}</h3>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{t('coming_soon_desc')}</p>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className={`animate-fade-in py-20 text-center rounded-3xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white shadow-xl border-black/5'}`}>
            <Package size={64} className="mx-auto text-prime-500/30 mb-6" />
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
                    isDarkMode 
                      ? 'bg-black/20 border border-white/10 text-white focus:ring-prime-500' 
                      : 'bg-slate-50 border border-black/10 text-gray-900 focus:ring-prime-600'
                  }`}
                />
                <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-prime-400" size={20} />
              </div>
            </div>

            <div className={`py-20 text-center rounded-3xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white shadow-xl border-black/5'}`}>
              <Package size={64} className="mx-auto text-prime-500/30 mb-6" />
              <h3 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('coming_soon')}</h3>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{t('coming_soon_desc')}</p>
            </div>
          </div>
        )}

        {activeTab === 'settings_tab' && (
          <div className="animate-fade-in max-w-2xl mx-auto space-y-10">
            <h3 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('display_settings')}</h3>
            
            <div className={`p-8 rounded-3xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white shadow-xl border-black/5'}`}>
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-bold">{t('theme')}</h4>
                    <p className="text-gray-500 text-sm">{isDarkMode ? t('dark') : t('light')}</p>
                  </div>
                  <ThemeToggle />
                </div>
                
                <div className={`h-px w-full ${isDarkMode ? 'bg-white/10' : 'bg-black/5'}`} />
                
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-bold">{t('language')}</h4>
                    <p className="text-gray-500 text-sm">{language === 'en' ? t('english') : t('bangla')}</p>
                  </div>
                  <LanguageToggle />
                </div>
              </div>
            </div>
            
            <div className={`p-8 rounded-2xl border transition-all ${isDarkMode ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-200 text-blue-900'}`}>
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="text-blue-500" />
                <h4 className="font-bold">{t('system_status')}</h4>
              </div>
              <p className="text-sm opacity-80">{t('online')} • {t('version')} 2.4.0</p>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className={`animate-fade-in py-20 text-center rounded-3xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white shadow-xl border-black/5'}`}>
            <Settings size={64} className="mx-auto text-prime-500/30 mb-6" />
            <h3 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('admin')}</h3>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{t('coming_soon_desc')}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
