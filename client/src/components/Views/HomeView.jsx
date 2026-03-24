import React from 'react';
import { MessageSquare, User, Zap, TrendingUp, Edit2, RefreshCw } from 'lucide-react';
import StatCard from '../StatCard';
import { useBrand } from '../../context/BrandContext';
import axios from 'axios';

const HomeView = ({ isDarkMode, t, language, theme, stats, gaps = [] }) => {
  const { activeBrandId } = useBrand();
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncResult, setSyncResult] = React.useState(null);

  const handleSyncHistory = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const resp = await axios.post(`${import.meta.env.VITE_API_URL}/api/sync-history`, {
        brandId: activeBrandId
      });
      setSyncResult({ success: true, message: resp.data.message });
    } catch (e) {
      setSyncResult({ success: false, message: e.response?.data?.error || e.message });
    } finally {
      setIsSyncing(false);
    }
  };

  // Simple sparkline path based on some trending data
  const messagePath = "M0,40 Q10,10 20,30 T40,20 T60,35 T80,10 T100,25";
  const leadPath = "M0,50 L10,30 L20,40 L30,20 L40,35 L50,15 L60,45 L70,25 L80,30 L90,10 L100,20";

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase leading-none">{t('welcome')}</h1>
          <p className="text-gray-500 mt-2 font-medium">Business health at a glance.</p>
        </div>
        <div className="flex gap-3">
          {syncResult && (
            <div className={`px-4 py-2 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-right-4 ${
              syncResult.success ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}>
              {syncResult.message}
            </div>
          )}
          <button 
            onClick={handleSyncHistory}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${
              isSyncing 
                ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed' 
                : 'bg-prime-500 text-white hover:bg-prime-600 shadow-lg shadow-prime-500/20 active:scale-95'
            }`}
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing...' : 'Sync FB History'}
          </button>
          <div className="px-4 py-2 rounded-xl bg-prime-500/10 border border-prime-500/20 text-prime-500 text-xs font-black uppercase tracking-widest flex items-center">Live</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={MessageSquare} title="Total Messages" value={stats?.totalMessages?.toLocaleString() || "0"} color="#3B82F6" trend={12} trendLabel="+12% this week" isDarkMode={isDarkMode} theme={theme} />
        <StatCard icon={User} title="New Leads" value={stats?.newLeads?.toString() || "0"} color="#10B981" trend={5} trendLabel="+5 Today" isDarkMode={isDarkMode} theme={theme} />
        <StatCard icon={Zap} title="AI Automation" value={`${stats?.automationScore || 92}%`} color="#8B5CF6" trend={2} trendLabel="Stable" isDarkMode={isDarkMode} theme={theme} />
        <StatCard icon={TrendingUp} title="Conversion" value={`${stats?.conversion || 3.2}%`} color="#F59E0B" trend={-1} trendLabel="-1% drop" isDarkMode={isDarkMode} theme={theme} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Analytics Chart */}
          <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white shadow-xl border-black/5'}`}>
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Performance Flow</h3>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Real-time Volume</p>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Messages</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Leads</span>
                </div>
              </div>
            </div>
            
            <div className="relative h-64 w-full">
               <svg viewBox="0 0 100 60" className="w-full h-full overflow-visible drop-shadow-2xl">
                  {/* Grid Lines */}
                  {[0, 20, 40, 60].map(y => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeWidth="0.1" />
                  ))}
                  
                  {/* Message Path */}
                  <path d={messagePath} fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-draw" style={{ strokeDasharray: 300, strokeDashoffset: 0 }} />
                  <path d={`${messagePath} L100,60 L0,60 Z`} fill="url(#blueGradient)" opacity="0.1" />

                  {/* Lead Path */}
                  <path d={leadPath} fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" className="animate-draw" opacity="0.8" />
                  
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
               </svg>
            </div>
          </div>

          <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white shadow-lg border-black/5'}`}>
            <h3 className="text-xl font-black uppercase tracking-tight mb-6">Trending Topics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(gaps.length > 0 ? gaps.slice(0,6) : [
                { question: 'Shipping Delay', count: 120 },
                { question: 'Vitamin C Serum', count: 85 },
                { question: 'BOGO Offer', count: 42 }
              ]).map((g, i) => (
                <div key={i} className={`flex justify-between items-center p-5 rounded-3xl transition-all cursor-pointer group hover:scale-[1.02] ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-prime-500/10 flex items-center justify-center text-prime-500 font-black text-xs">
                      {i+1}
                    </div>
                    <span className="font-bold text-sm truncate max-w-[150px]">{g.question || g}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase text-prime-500 block leading-none">{g.count || 20+i*5}</span>
                    <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">{t('queries')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-yellow-500/5 border-yellow-500/20 shadow-[0_0_30px_rgba(245,158,11,0.05)]' : 'bg-yellow-50 border-yellow-200 shadow-sm'}`}>
            <div className="flex items-center gap-3 mb-6 text-yellow-500">
              <div className="p-3 rounded-2xl bg-yellow-500/10">
                <Edit2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight leading-none">{t('team_bulletin')}</h3>
                <p className="text-[10px] text-yellow-600/60 font-black uppercase tracking-widest mt-1">Priority Internal</p>
              </div>
            </div>
            <textarea 
              className={`w-full h-64 bg-transparent border-none focus:ring-0 resize-none font-medium leading-relaxed ${isDarkMode ? 'text-gray-300 placeholder:text-gray-600' : 'text-gray-700'}`}
              placeholder={t('bulletin_placeholder')}
              defaultValue={language === 'bn' ? "মনে রাখবেন স্টক শেষ হওয়ার আগে ভিটামিন সি সিরাম আপডেট করতে হবে! 🚀" : "Remember to update the Vitamin C stock levels before the weekend rush! 🚀"}
            />
          </div>

          <div className="p-8 rounded-[2.5rem] bg-prime-500 shadow-2xl shadow-prime-500/30 text-white relative overflow-hidden group">
            <Zap className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-700" />
            <h4 className="text-2xl font-black uppercase tracking-tighter leading-none mb-2">Architect Status</h4>
            <p className="text-white/70 text-xs font-bold leading-tight uppercase tracking-widest mb-6">Wizard Completion</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black tabular-nums tracking-tighter">100</span>
              <span className="text-xl font-black">%</span>
            </div>
            <div className="mt-8 h-2 w-full bg-white/10 rounded-full overflow-hidden">
               <div className="h-full bg-white w-full shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
