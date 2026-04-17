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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white flex items-center gap-4">
            <Users className="text-prime-500 text-stroke-thin" size={40} />
            CRM <span className="text-prime-500 text-stroke-thin">Intelligence</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-prime-500 mt-2 flex items-center gap-2">
            <Zap size={12} /> Real-time Behavioral Profiling
          </p>
        </div>
        <button
          onClick={handleRunSegmentation}
          disabled={isSegmenting}
          className="px-8 py-4 rounded-2xl bg-prime-500 text-white font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-prime-500/20 hover:bg-prime-600 active:scale-95 disabled:opacity-50"
        >
          <div className="flex items-center gap-2">
            {isSegmenting ? <RefreshCw size={16} className="animate-spin"/> : <Zap size={16}/>}
            {isSegmenting ? 'Segmenting...' : 'Sync AI Intelligence'}
          </div>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(SEGMENT_CONFIG).map(([seg, cfg]) => {
          const Icon = cfg.icon;
          return (
            <button
              key={seg}
              onClick={() => setFilter(filter === seg ? 'all' : seg)}
              className={`glass-card p-6 text-left transition-all hover:-translate-y-1 relative overflow-hidden group ${
                filter === seg ? 'ring-2 ring-prime-500 scale-105' : ''
              }`}
            >
              <div className={`absolute -bottom-4 -right-4 w-16 h-16 blur-2xl opacity-10 group-hover:opacity-30 transition-all ${cfg.bg}`} />
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 ${cfg.bg}`}>
                  <Icon size={18} className={cfg.color} />
                </div>
                <span className={`text-4xl font-black tracking-tighter ${cfg.color}`}>{stats[seg] || 0}</span>
              </div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 relative z-10">{seg}</p>
            </button>
          );
        })}
      </div>

      <div className="glass-card flex-1 overflow-hidden dark">
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Customer Matrix Feed</h3>
          <span className="text-[10px] font-black text-prime-500 animate-pulse">{filtered.length} ACTIVE PROFILES</span>
        </div>
        <div className="overflow-y-auto max-h-[500px] scrollbar-thin">
          {filtered.map(c => (
            <div key={c.id} className="flex items-center gap-6 px-8 py-6 border-b border-white/5 transition-all hover:bg-white/[0.02] group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 flex items-center justify-center font-black text-lg text-white shadow-xl transition-all group-hover:border-prime-500/30 group-hover:scale-105">
                {(c.name || c.id || '?')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-black text-lg tracking-tight text-white group-hover:text-prime-400 transition-colors uppercase">{c.name || c.id}</p>
                  <div className="h-0.5 w-4 bg-white/10 rounded-full" />
                </div>
                <p className="text-[11px] font-bold text-gray-500 tracking-wide">{c.lastMessage?.substring(0, 70) || 'Initialized passive connection...'}…</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap justify-end">
                {c.location && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-blue-400 text-[9px] font-black uppercase tracking-widest shadow-lg">
                    <MapPin size={10} className="text-blue-500" /> {c.location}
                  </span>
                )}
                {c.segment && (() => {
                  const cfg = SEGMENT_CONFIG[c.segment] || {};
                  return (
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/5 ${cfg.bg} ${cfg.color}`}>
                      {c.segment}
                    </span>
                  );
                })()}
                {c.leadScore !== undefined && (
                  <div className="relative w-12 h-12 rounded-full border border-prime-500/20 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-t-2 border-prime-500 animate-spin-slow opacity-30" />
                    <span className="text-[10px] font-black text-white">
                      {c.leadScore}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 opacity-20">
              <div className="w-20 h-20 rounded-full bg-prime-500/10 flex items-center justify-center mb-6">
                <Users size={40} className="text-prime-500" strokeWidth={1} />
              </div>
              <p className="font-black uppercase tracking-[0.4em] text-xs">Awaiting Synaptic Input</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CRMIntelligence;
