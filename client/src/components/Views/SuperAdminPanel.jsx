import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, Activity, Users, DollarSign, Search, 
  ExternalLink, Ban, CheckCircle, AlertTriangle, 
  ArrowUpRight, BarChart3, Globe, Cpu,
  Megaphone, Trash2, Sparkles, Info, Send
} from 'lucide-react';
import { useBrand } from '../../context/BrandContext';
import { db } from '../../firebase-client';
import { doc, updateDoc, collection, addDoc, serverTimestamp, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

const GlobalStatCard = ({ title, value, icon: Icon, color, subtext, onClick, isActive }) => (
  <button 
    onClick={onClick}
    className={`glass-card p-8 text-left transition-all duration-500 relative overflow-hidden group border-none ${
      isActive ? 'shadow-[0_0_30px_rgba(107,33,168,0.2)] scale-[1.05]' : 'bg-slate-950/20'
    }`}
  >
    <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-10 transition-all group-hover:opacity-30 ${color}`} />
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-2xl ${color} bg-opacity-20 backdrop-blur-md border border-white/5`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-').replace('-500', '-400')}`} />
      </div>
      <ArrowUpRight size={18} className={`transition-transform duration-500 ${isActive ? 'translate-x-1 -translate-y-1 text-prime-500' : 'text-slate-700'}`} />
    </div>
    <h4 className="text-gray-500 text-[9px] font-black uppercase tracking-[0.3em] mb-2">{title}</h4>
    <div className="text-4xl font-black tracking-tighter text-white">{value}</div>
    {subtext && <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-3">{subtext}</p>}
  </button>
);

const SuperAdminPanel = ({ isDarkMode, t }) => {
  const { brands, setActiveBrandId, activeBrandId } = useBrand();
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'active', 'revenue'
  const [notification, setNotification] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', type: 'info', link: '' });
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  
  // Real-time Health Simulation
  const [healthData, setHealthData] = useState({ latency: 1.2, uptime: 99.9 });

  React.useEffect(() => {
    const interval = setInterval(() => {
      setHealthData({
        latency: (1.1 + Math.random() * 0.3).toFixed(2),
        uptime: (99.8 + Math.random() * 0.2).toFixed(1)
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const q = query(collection(db, "global_announcements"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const stats = useMemo(() => {
    const total = Array.isArray(brands) ? brands.length : 0;
    const active = Array.isArray(brands) ? brands.filter(b => b.planStatus === 'active').length : 0;
    const totalRev = Array.isArray(brands) ? brands.reduce((acc, b) => acc + (b.usageStats?.ordersThisMonth || 0) * 10, 0) : 0;
    return { total, active, totalRev };
  }, [brands]);

  const filteredBrands = useMemo(() => {
    if (!Array.isArray(brands)) return [];
    let items = brands.filter(b => 
      b.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.ownerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterType === 'active') items = items.filter(b => b.planStatus === 'active');
    if (filterType === 'revenue') items = items.sort((a, b) => (b.usageStats?.ordersThisMonth || 0) - (a.usageStats?.ordersThisMonth || 0));

    return items;
  }, [brands, searchTerm, filterType]);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpdatePlan = async (id, newPlan) => {
    setUpdatingId(id);
    try {
      const docRef = doc(db, "brands", id);
      const PLAN_LIMITS = {
        free_trial: { maxOrders: 50, maxProducts: 20, aiRepliesPerMonth: 100, activeAgents: 1 },
        business_pro: { maxOrders: 500, maxProducts: 200, aiRepliesPerMonth: 1000, activeAgents: 5 },
        enterprise: { maxOrders: 99999, maxProducts: 99999, aiRepliesPerMonth: 99999, activeAgents: 20 }
      };
      await updateDoc(docRef, { 
        plan: newPlan,
        usageLimits: PLAN_LIMITS[newPlan]
      });
      showToast(`Plan updated for ${id.slice(-6)}`);
    } catch (e) {
      console.error("Plan update failed:", e);
      showToast("Update Failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    setUpdatingId(id);
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
      const docRef = doc(db, "brands", id);
      await updateDoc(docRef, { planStatus: newStatus });
      showToast(`Unit ${id.slice(-6)} set to ${newStatus}`);
    } catch (e) {
      console.error("Status toggle failed:", e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleShadowMode = (brand) => {
    setActiveBrandId(brand.id);
    showToast(`Shadow Mode: Accessing ${brand.name}`);
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.message) return;
    setIsBroadcasting(true);
    try {
      await addDoc(collection(db, "global_announcements"), {
        ...newAnnouncement,
        isActive: true,
        createdAt: serverTimestamp()
      });
      setNewAnnouncement({ title: '', message: '', type: 'info', link: '' });
      showToast("Announcement Broadcasted!");
    } catch (e) {
      console.error(e);
      showToast("Broadcast Failed");
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleToggleAnnouncement = async (id, currentIsActive) => {
    try {
      await updateDoc(doc(db, "global_announcements", id), { isActive: !currentIsActive });
      showToast(`Announcement ${!currentIsActive ? 'Activated' : 'Paused'}`);
    } catch (e) { console.error(e); }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Delete this broadcast forever?")) return;
    try {
      await deleteDoc(doc(db, "global_announcements", id));
      showToast("Broadcast Deleted");
    } catch (e) { console.error(e); }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-8 pb-32 relative">
      
      {/* ── TOAST NOTIFICATION ── */}
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 bg-prime-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-2xl shadow-prime-500/40 animate-in slide-in-from-top-4 duration-500 border border-white/20 backdrop-blur-3xl">
          {notification}
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase flex items-center gap-4">
            <ShieldCheck size={48} className="text-prime-500 text-stroke-thin" />
            Vortex <span className="text-prime-500 text-stroke-thin">Matrix</span>
          </h1>
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-prime-500 mt-4 flex items-center gap-2">
            <Cpu size={14} /> Neural Fleet Command Center
          </p>
        </div>

        <div className="flex items-center gap-4 glass-card p-3 border-none">
            <div className="flex items-center gap-2 px-5 py-2.5 bg-prime-500/10 rounded-xl border border-prime-500/10">
               <div className="w-2 h-2 rounded-full bg-prime-500 animate-pulse shadow-[0_0_10px_rgba(107,33,168,1)]" />
               <span className="text-[9px] font-black uppercase tracking-widest text-prime-400">System Nominal</span>
            </div>
            <div className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 rounded-xl border border-blue-500/10">
               <Globe size={12} className="text-blue-400 animate-spin-slow" />
               <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">API Active</span>
            </div>
        </div>
      </div>

      {/* ── GLOBAL STATS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlobalStatCard 
            title="Total Fleet" 
            value={stats.total} 
            icon={Users} 
            color="bg-blue-500" 
            subtext="Registered Brands"
            isActive={filterType === 'all'}
            onClick={() => setFilterType('all')}
        />
        <GlobalStatCard 
            title="Active Units" 
            value={stats.active} 
            icon={Activity} 
            color="bg-emerald-500" 
            subtext="Paid & Trial Subscriptions" 
            isActive={filterType === 'active'}
            onClick={() => setFilterType('active')}
        />
        <GlobalStatCard 
            title="Global GMV" 
            value={`৳ ${stats.totalRev.toLocaleString()}`} 
            icon={DollarSign} 
            color="bg-purple-500" 
            subtext="Platform Volume" 
            isActive={filterType === 'revenue'}
            onClick={() => setFilterType('revenue')}
        />
      </div>

      {/* ── SYSTEM PULSE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="glass-card p-10 relative overflow-hidden dark border-none">
            <div className="flex items-center gap-6 relative z-10">
               <div className="w-20 h-20 rounded-[2.5rem] bg-prime-500/20 border border-prime-500/30 flex items-center justify-center text-prime-400 shadow-[0_0_30px_rgba(107,33,168,0.2)]">
                  <Cpu size={36} />
               </div>
               <div className="flex-1">
                  <h4 className="text-2xl font-black text-white tracking-tighter uppercase">Processor <span className="text-prime-500">Node Alpha</span></h4>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                    <Activity size={12} className="text-prime-500" /> Latency Pipeline: {healthData.latency}s
                  </p>
               </div>
               <div className="text-right">
                  <div className="text-3xl font-black text-white tracking-tighter">{healthData.uptime}%</div>
                  <div className="text-[9px] text-prime-400 font-black uppercase tracking-[0.2em] mt-1 pulse-glow px-2 py-0.5 rounded-lg border border-prime-500/20 bg-prime-500/10">Stable</div>
               </div>
            </div>
         </div>
         <div className="glass-card p-10 relative overflow-hidden dark border-none">
            <div className="flex items-center gap-6 relative z-10">
               <div className="w-20 h-20 rounded-[2.5rem] bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                  <Cloud size={36} />
               </div>
               <div className="flex-1">
                  <h4 className="text-2xl font-black text-white tracking-tighter uppercase">Cloud <span className="text-blue-500">Engine V3</span></h4>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                    <Globe size={12} className="text-blue-500" /> Regional Sync: Active
                  </p>
               </div>
               <div className="text-right">
                  <div className="text-3xl font-black text-white tracking-tighter">100%</div>
                  <div className="text-[9px] text-blue-400 font-black uppercase tracking-[0.2em] mt-1 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">Optimal</div>
               </div>
            </div>
         </div>
      </div>

      {/* ── BROADCAST CENTER ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Creator */}
         <div className="lg:col-span-1 glass-card p-8 dark border-none space-y-8">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 rounded-2xl bg-prime-500/20 border border-prime-500/20 flex items-center justify-center text-prime-400">
                  <Megaphone size={20} />
               </div>
               <h3 className="text-xl font-black text-white tracking-tight uppercase">Broadcast Hub</h3>
            </div>
            
            <form onSubmit={handleCreateAnnouncement} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] ml-1">Transmission Title</label>
                  <input 
                    type="text" 
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                    placeholder="E.g. Protocol Update"
                    className="glass-input w-full p-4 rounded-2xl"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] ml-1">Signal Content</label>
                  <textarea 
                    value={newAnnouncement.message}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
                    placeholder="All nodes report for sync..."
                    className="glass-input w-full p-4 rounded-2xl h-24 resize-none"
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] ml-1">Alert Level</label>
                     <select 
                       value={newAnnouncement.type}
                       onChange={(e) => setNewAnnouncement({...newAnnouncement, type: e.target.value})}
                       className="glass-input w-full p-4 rounded-2xl text-[10px] font-black uppercase"
                     >
                        <option value="info">Information</option>
                        <option value="warning">Critical Alert</option>
                        <option value="feature">System Feature</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] ml-1">Access URL</label>
                     <input 
                       type="text" 
                       value={newAnnouncement.link}
                       onChange={(e) => setNewAnnouncement({...newAnnouncement, link: e.target.value})}
                       placeholder="https://..."
                       className="glass-input w-full p-4 rounded-2xl"
                     />
                  </div>
               </div>
               <button 
                type="submit"
                disabled={isBroadcasting}
                className="w-full py-5 rounded-3xl bg-prime-500 hover:bg-prime-600 text-white font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 transition-all shadow-[0_20px_40px_-10px_rgba(107,33,168,0.3)] active:scale-95 disabled:opacity-50"
               >
                 {isBroadcasting ? 'RESONATING...' : <>Fire Global Pulse <Send size={14} /></>}
               </button>
            </form>
         </div>

         {/* Active Feed */}
         <div className="lg:col-span-2 glass-card p-8 dark border-none overflow-hidden">
            <h3 className="text-xl font-black text-white mb-8 tracking-tight uppercase">Signal Logs</h3>
            <div className="space-y-4 max-h-[440px] overflow-y-auto pr-2 scrollbar-thin">
               {announcements.map(ann => (
                  <div key={ann.id} className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-between group transition-all hover:bg-white/5">
                     <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          ann.type === 'warning' ? 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 
                          ann.type === 'feature' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 
                          'bg-prime-500/10 text-prime-400 border border-prime-500/20'
                        }`}>
                           {ann.type === 'warning' ? <AlertTriangle size={18} /> : 
                            ann.type === 'feature' ? <Sparkles size={18} /> : 
                            <Info size={18} />}
                        </div>
                        <div>
                           <h5 className="text-[11px] font-black text-white uppercase tracking-widest">{ann.title}</h5>
                           <p className="text-[10px] font-bold text-gray-500 mt-1">{ann.message.slice(0, 100)}...</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleToggleAnnouncement(ann.id, ann.isActive)}
                          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                            ann.isActive 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                              : 'bg-white/5 text-gray-500 border-white/5'
                          }`}
                        >
                          {ann.isActive ? 'ACTIVE' : 'OFFLINE'}
                        </button>
                        <button 
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 border border-red-500/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                        >
                           <Trash2 size={16} />
                        </button>
                     </div>
                  </div>
               ))}
               {announcements.length === 0 && (
                  <div className="py-20 text-center opacity-20">
                     <Megaphone size={48} className="mx-auto mb-4" />
                     <p className="text-[10px] font-black uppercase tracking-[0.3em]">No broadcasts in history</p>
                  </div>
               )}
            </div>
         </div>
      </div>

      {/* ── BRAND FLEET TABLE ── */}
      <div className="glass-card p-10 dark border-none space-y-10">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="text-3xl font-black tracking-tighter text-white uppercase">Brand <span className="text-prime-500 text-stroke-thin">Fleet</span></h3>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mt-2 flex items-center gap-2">
              <Search size={12} className="text-prime-500" /> Authorized Multi-Tenant Intelligence
            </p>
          </div>
          <div className="relative w-full lg:w-[450px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by Code, Domain or Vector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input w-full pl-16 pr-8 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest outline-none border-none shadow-2xl"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-[.2em]">Unit Name</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-[.2em]">Contact</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-[.2em]">Plan Status</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-[.2em]">Usage Meter</th>
                <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-[.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredBrands.map(brand => {
                const isImpersonating = activeBrandId === brand.id;
                const orders = brand.usageStats?.ordersThisMonth || 0;
                const limit = brand.usageLimits?.maxOrders || 50;
                const usagePerc = Math.min(Math.round((orders / limit) * 100), 100);

                return (
                  <tr key={brand.id} className={`group hover:bg-white/[0.02] transition-all border-b border-white/[0.03] ${isImpersonating ? 'bg-prime-500/[0.03]' : ''}`}>
                    <td className="py-8">
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border border-white/5 transition-all group-hover:scale-110 ${isImpersonating ? 'bg-prime-500 text-white shadow-[0_0_20px_rgba(107,33,168,0.4)]' : 'bg-white/5 text-gray-400'}`}>
                          {brand.name?.charAt(0) || 'B'}
                        </div>
                        <div>
                          <div className="text-lg font-black text-white tracking-tight uppercase">{brand.name}</div>
                          <div className="text-[9px] font-black text-prime-500 uppercase tracking-[0.2em] mt-1">NODE_{brand.id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-8">
                      <div className="text-[11px] font-black text-gray-500 uppercase tracking-widest">{brand.ownerEmail}</div>
                    </td>
                    <td className="py-8">
                       <div className="flex flex-col gap-2">
                          <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl w-fit border border-white/10 client-status-badge ${
                            brand.planStatus === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                          }`}>
                            {brand.planStatus || 'ACTIVE'}
                          </span>
                          <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">{brand.plan?.replace('_', ' ')}</span>
                       </div>
                    </td>
                    <td className="py-6 min-w-[150px]">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          <span>{orders}/{limit} Orders</span>
                          <span>{usagePerc}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className={`h-full transition-all duration-1000 ${usagePerc > 90 ? 'bg-rose-500' : usagePerc > 70 ? 'bg-orange-500' : 'bg-prime-500'}`} 
                            style={{ width: `${usagePerc}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleShadowMode(brand)}
                          className={`p-2.5 rounded-xl transition-all ${
                            isImpersonating 
                              ? 'bg-prime-500 text-white shadow-lg' 
                              : 'bg-slate-800 text-slate-400 hover:text-prime-400 hover:bg-prime-500/10'
                          }`}
                          title="Shadow Mode: View Dashboard as Brand"
                        >
                          <ExternalLink size={14} />
                        </button>
                        
                        <div className="relative group/actions">
                           <button className={`p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 transition-all ${updatingId === brand.id ? 'animate-pulse' : ''}`}>
                              <Activity size={14} strokeWidth={3} />
                           </button>
                           {/* Quick Action Overlay */}
                           <div className="absolute right-0 bottom-full mb-2 hidden group-hover/actions:flex flex-col bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 w-48 text-left animate-in fade-in slide-in-from-bottom-2">
                              {['free_trial', 'business_pro', 'enterprise'].map((p) => (
                                 <button 
                                   key={p}
                                   onClick={() => handleUpdatePlan(brand.id, p)}
                                   className={`p-3 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/5 rounded-xl text-left ${brand.plan === p ? 'text-prime-400 bg-prime-500/10' : ''}`}
                                 >
                                   {p.replace('_', ' ')}
                                 </button>
                              ))}
                              <div className="h-px bg-slate-800 my-1" />
                              <button 
                                onClick={() => handleToggleStatus(brand.id, brand.planStatus)}
                                className={`p-3 text-[10px] font-black uppercase tracking-widest rounded-xl text-left ${
                                  brand.planStatus === 'suspended' ? 'text-green-400 hover:bg-green-500/10' : 'text-rose-400 hover:bg-rose-500/10'
                                }`}
                              >
                                {brand.planStatus === 'suspended' ? 'Activate Brand' : 'Suspend Brand'}
                              </button>
                           </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredBrands.length === 0 && searchTerm && (
            <div className="py-20 text-center text-slate-600">
               <AlertTriangle size={48} className="mx-auto mb-4 opacity-20" />
               <p className="text-sm font-black  uppercase tracking-widest mb-2">No units detected on this frequency</p>
               <p className="text-[10px] font-medium">Try searching for a different name, ID, or owner email.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default SuperAdminPanel;
