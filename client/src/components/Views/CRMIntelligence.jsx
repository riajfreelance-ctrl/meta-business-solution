import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, TrendingUp, Star, ShoppingBag, RefreshCw, Zap, MapPin, Calendar, Tag } from 'lucide-react';
import { db } from '../../firebase-client';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { useBrand } from '../../context/BrandContext';

const SEGMENT_CONFIG = {
  'Hot Lead':        { color: 'text-red-500',    bg: 'bg-red-500/10',    border: 'border-red-500/20',    icon: Star },
  'Regular Customer':{ color: 'text-blue-500',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   icon: Users },
  'Returning Buyer': { color: 'text-green-500',  bg: 'bg-green-500/10',  border: 'border-green-500/20',  icon: ShoppingBag },
  'Window Shopper':  { color: 'text-gray-400',   bg: 'bg-gray-500/10',   border: 'border-gray-500/20',   icon: TrendingUp },
};

const CRMIntelligence = ({ isDarkMode, t }) => {
  const { activeBrandId } = useBrand();
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({});
  const [isSegmenting, setIsSegmenting] = useState(false);
  const [filter, setFilter] = useState('all');

  // Live customer data feed
  useEffect(() => {
    if (!activeBrandId) return;
    const q = query(
      collection(db, 'conversations'),
      where('brandId', '==', activeBrandId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    return onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCustomers(data);
      // Compute local stats
      const s = {};
      data.forEach(c => { const seg = c.segment || 'Untagged'; s[seg] = (s[seg] || 0) + 1; });
      setStats(s);
    });
  }, [activeBrandId]);

  const handleRunSegmentation = async () => {
    setIsSegmenting(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/crm/segment`, { brandId: activeBrandId });
    } catch (e) { console.error(e); }
    finally { setIsSegmenting(false); }
  };

  const filtered = filter === 'all' ? customers : customers.filter(c => c.segment === filter);

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className={`text-2xl font-black uppercase tracking-tight italic flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <Users className="text-prime-500" size={28} />
            CRM Intelligence
          </h2>
          <p className="text-xs opacity-50 font-bold uppercase tracking-widest mt-1">AI-Powered Customer Profiling</p>
        </div>
        <button
          onClick={handleRunSegmentation}
          disabled={isSegmenting}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${
            isSegmenting ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed' : 'bg-prime-500 text-white shadow-lg shadow-prime-500/30 hover:scale-[1.02]'
          }`}
        >
          {isSegmenting ? <RefreshCw size={16} className="animate-spin"/> : <Zap size={16}/>}
          {isSegmenting ? 'Segmenting...' : 'Run AI Segment'}
        </button>
      </div>

      {/* Segment Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(SEGMENT_CONFIG).map(([seg, cfg]) => {
          const Icon = cfg.icon;
          return (
            <button
              key={seg}
              onClick={() => setFilter(filter === seg ? 'all' : seg)}
              className={`p-5 rounded-[1.5rem] border text-left transition-all hover:scale-[1.02] ${cfg.bg} ${cfg.border} ${
                filter === seg ? 'ring-2 ring-prime-500' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <Icon size={20} className={cfg.color} />
                <span className={`text-3xl font-black ${cfg.color}`}>{stats[seg] || 0}</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{seg}</p>
            </button>
          );
        })}
      </div>

      {/* Customer Table */}
      <div className={`flex-1 rounded-[2rem] border overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-xl shadow-slate-200'}`}>
        <div className={`px-6 py-4 border-b flex items-center justify-between ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
          <h3 className="text-xs font-black uppercase tracking-widest opacity-60">Customer Profiles</h3>
          <span className="text-[10px] font-black opacity-40">{filtered.length} records</span>
        </div>
        <div className="overflow-y-auto max-h-[400px]">
          {filtered.map(c => (
            <div key={c.id} className={`flex items-center gap-4 px-6 py-4 border-b transition-all hover:bg-white/5 ${isDarkMode ? 'border-white/5' : 'border-black/3'}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${
                isDarkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}>
                {(c.name || c.id || '?')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm truncate">{c.name || c.id}</p>
                <p className="text-[10px] opacity-50">{c.lastMessage?.substring(0, 60) || '—'}…</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {c.location && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase">
                    <MapPin size={10}/> {c.location}
                  </span>
                )}
                {c.ageRange && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 text-[9px] font-black uppercase">
                    <Calendar size={10}/> {c.ageRange}
                  </span>
                )}
                {c.segment && (() => {
                  const cfg = SEGMENT_CONFIG[c.segment] || {};
                  return (
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${cfg.bg} ${cfg.color}`}>
                      {c.segment}
                    </span>
                  );
                })()}
                {c.leadScore !== undefined && (
                  <span className="px-2.5 py-1 rounded-full bg-prime-500/10 text-prime-400 text-[9px] font-black">
                    {c.leadScore}/100
                  </span>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 opacity-30">
              <Users size={48} className="mb-4"/>
              <p className="font-black uppercase text-xs">No customers yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CRMIntelligence;
