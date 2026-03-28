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
    className={`w-full text-left p-6 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden group ${
      isActive ? 'border-prime-500 bg-prime-500/5 shadow-2xl shadow-prime-500/10 scale-[1.02]' : 'bg-[#0b1120] border-slate-800 shadow-xl hover:border-slate-700'
    }`}
  >
    <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl rounded-full -mr-10 -mt-10 transition-all group-hover:opacity-20 ${color}`} />
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-20`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <ArrowUpRight size={16} className={`transition-transform duration-500 ${isActive ? 'translate-x-1 -translate-y-1 text-prime-500' : 'text-slate-600'}`} />
    </div>
    <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{title}</h4>
    <div className="text-3xl font-black tracking-tighter text-white">{value}</div>
    {subtext && <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">{subtext}</p>}
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
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={16} className="text-prime-400" />
            <span className="text-[10px] font-black tracking-widest uppercase text-prime-400">Vortex Command Center</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white">
            Site <span className="text-transparent bg-clip-text bg-gradient-to-r from-prime-500 to-purple-500">Manager</span>
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-2 max-w-xl">
            Real-time multi-tenant intelligence. Monitor platform health, manage brand fleet, and enforce system-wide quotas.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#0b1120] p-2 rounded-2xl border border-slate-800 shadow-xl">
            <div className="flex items-center gap-2 px-4 py-2 bg-prime-500/10 rounded-xl border border-prime-500/20">
               <div className="w-2 h-2 rounded-full bg-prime-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase text-prime-400">System Live</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-xl border border-green-500/20">
               <Globe size={12} className="text-green-500" />
               <span className="text-[10px] font-black uppercase text-green-500">API: Healthy</span>
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
         <div className="p-8 rounded-[3rem] border bg-[#0b1120] border-slate-800 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 rounded-3xl bg-prime-600/20 flex items-center justify-center text-prime-400">
                  <Activity size={32} />
               </div>
               <div>
                  <h4 className="text-xl font-black text-white">Gemini Pro 1.5</h4>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Model Latency: {healthData.latency}s</p>
               </div>
            </div>
            <div className="text-right">
               <div className="text-2xl font-black text-white tracking-widest">{healthData.uptime}%</div>
               <div className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Uptime</div>
            </div>
         </div>
         <div className="p-8 rounded-[3rem] border bg-[#0b1120] border-slate-800 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 rounded-3xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                  <Cpu size={32} />
               </div>
               <div>
                  <h4 className="text-xl font-black text-white">Meta Cloud API</h4>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Rate Limit: No Issues</p>
               </div>
            </div>
            <div className="text-right">
               <div className="text-2xl font-black text-white tracking-widest">100%</div>
               <div className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Stable</div>
            </div>
         </div>
      </div>

      {/* ── BROADCAST CENTER ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Creator */}
         <div className="lg:col-span-1 p-8 rounded-[3rem] border bg-[#0b1120] border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center gap-3 mb-2">
               <Megaphone className="text-prime-500" size={20} />
               <h3 className="text-xl font-black text-white">Broadcast Center</h3>
            </div>
            
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Alert Title</label>
                  <input 
                    type="text" 
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                    placeholder="E.g. System Maintenance"
                    className="w-full p-4 bg-black/40 border border-slate-800 rounded-2xl text-xs font-bold text-white focus:border-prime-500 transition-all outline-none"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Message Body</label>
                  <textarea 
                    value={newAnnouncement.message}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
                    placeholder="The engine will be down for 5 mins..."
                    className="w-full p-4 bg-black/40 border border-slate-800 rounded-2xl text-xs font-bold text-white focus:border-prime-500 transition-all outline-none h-24 resize-none"
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Alert Type</label>
                     <select 
                       value={newAnnouncement.type}
                       onChange={(e) => setNewAnnouncement({...newAnnouncement, type: e.target.value})}
                       className="w-full p-4 bg-black/40 border border-slate-800 rounded-2xl text-[10px] font-black uppercase text-white focus:border-prime-500 transition-all outline-none"
                     >
                        <option value="info">Information</option>
                        <option value="warning">Critical Alert</option>
                        <option value="feature">New Feature</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Learn More Link</label>
                     <input 
                       type="text" 
                       value={newAnnouncement.link}
                       onChange={(e) => setNewAnnouncement({...newAnnouncement, link: e.target.value})}
                       placeholder="https://..."
                       className="w-full p-4 bg-black/40 border border-slate-800 rounded-2xl text-xs font-bold text-white focus:border-prime-500 transition-all outline-none"
                     />
                  </div>
               </div>
               <button 
                type="submit"
                disabled={isBroadcasting}
                className="w-full py-5 rounded-3xl bg-prime-500 hover:bg-prime-600 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all shadow-xl shadow-prime-500/20 active:scale-95"
               >
                 {isBroadcasting ? 'TRANSMITTING...' : <>Transmit Global Broadcast <Send size={14} /></>}
               </button>
            </form>
         </div>

         {/* Active Feed */}
         <div className="lg:col-span-2 p-8 rounded-[3rem] border bg-[#0b1120] border-slate-800 shadow-xl overflow-hidden">
            <h3 className="text-xl font-black text-white mb-6">Past Transmissions</h3>
            <div className="space-y-4 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar">
               {announcements.map(ann => (
                  <div key={ann.id} className="p-5 rounded-[2rem] bg-black/40 border border-slate-800 flex items-center justify-between group">
                     <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${
                          ann.type === 'warning' ? 'bg-amber-500/20 text-amber-500' : 
                          ann.type === 'feature' ? 'bg-purple-500/20 text-purple-500' : 
                          'bg-prime-500/20 text-prime-500'
                        }`}>
                           {ann.type === 'warning' ? <AlertTriangle size={18} /> : 
                            ann.type === 'feature' ? <Sparkles size={18} /> : 
                            <Info size={18} />}
                        </div>
                        <div>
                           <h5 className="text-sm font-black text-white">{ann.title}</h5>
                           <p className="text-[10px] font-bold text-slate-500">{ann.message.slice(0, 60)}...</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleToggleAnnouncement(ann.id, ann.isActive)}
                          className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${
                            ann.isActive 
                              ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                              : 'bg-slate-800 text-slate-500 border-slate-700'
                          }`}
                        >
                          {ann.isActive ? 'ACTIVE' : 'PAUSED'}
                        </button>
                        <button 
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                        >
                           <Trash2 size={14} />
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
      <div className="p-8 rounded-[3rem] border bg-[#0b1120] border-slate-800 shadow-2xl space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-2xl font-black tracking-tighter text-white">
            Brand Fleet <span className="text-slate-600 text-sm ml-2 font-bold uppercase tracking-widest">Database</span>
            {filterType !== 'all' && <span className="ml-4 text-prime-500 text-[10px] font-black uppercase tracking-widest bg-prime-500/10 px-3 py-1 rounded-full animate-pulse border border-prime-500/20">Filtering: {filterType}</span>}
          </h3>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Filter by Name, ID, or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-black/40 border border-slate-800 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-prime-500 transition-all placeholder:text-slate-700 shadow-inner"
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
                  <tr key={brand.id} className={`group hover:bg-white/[0.02] transition-colors ${isImpersonating ? 'bg-prime-500/[0.03]' : ''}`}>
                    <td className="py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${isImpersonating ? 'bg-prime-500 text-white shadow-lg shadow-prime-500/20' : 'bg-slate-800 text-slate-400'}`}>
                          {brand.name?.charAt(0) || 'B'}
                        </div>
                        <div>
                          <div className="text-sm font-black text-white">{brand.name}</div>
                          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">ID: {brand.id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6">
                      <div className="text-xs font-bold text-slate-400">{brand.ownerEmail}</div>
                    </td>
                    <td className="py-6">
                       <div className="flex flex-col gap-1.5">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg w-fit ${
                            brand.planStatus === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {brand.planStatus || 'active'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{brand.plan}</span>
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
