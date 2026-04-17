import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, 
  Users, 
  Target, 
  Plus, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Zap,
  Globe,
  Facebook,
  Instagram
} from 'lucide-react';

const CampaignWizard = ({ isDarkMode, t, activeBrandId }) => {
  const [adAccounts, setAdAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null); // 'success', 'error'
  const [activeStep, setActiveStep] = useState(1);
  
  const [audienceConfig, setAudienceConfig] = useState({
    name: 'Skinzy Hot Leads - ' + new Date().toLocaleDateString(),
    segment: 'Hot Lead'
  });

  // Fetch Ad Accounts on mount
  useEffect(() => {
    if (activeBrandId) fetchAdAccounts();
  }, [activeBrandId]);

  const fetchAdAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/ads/accounts?brandId=${activeBrandId}`);
      if (res.data.success) {
        setAdAccounts(res.data.accounts);
        if (res.data.accounts.length > 0) setSelectedAccount(res.data.accounts[0].id);
      }
    } catch (error) {
      console.error("Error fetching ad accounts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncAudience = async () => {
    if (!selectedAccount || isSyncing) return;
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ads/sync-audience`, {
        brandId: activeBrandId,
        adAccountId: selectedAccount,
        audienceName: audienceConfig.name,
        segment: audienceConfig.segment
      });
      if (res.data.success) {
        setSyncStatus('success');
      }
    } catch (error) {
      setSyncStatus('error');
      console.error("Sync Error:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white flex items-center gap-4">
            <Target className="text-prime-500 text-stroke-thin" size={40} />
            Meta Ads <span className="text-prime-500 text-stroke-thin">Matrix</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-prime-500 mt-2 flex items-center gap-2">
            <Zap size={12} /> Autonomous Audience Intelligence
          </p>
        </div>
        <button 
          onClick={fetchAdAccounts}
          className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-gray-500 hover:text-prime-500 hover:bg-prime-500/10 transition-all border-none"
        >
          <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''}/>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="glass-card p-8 group transition-all duration-700 relative overflow-hidden dark">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-prime-500/20 border border-prime-500/30 flex items-center justify-center text-prime-400 font-black text-xl shadow-[0_0_20px_rgba(107,33,168,0.3)]">1</div>
            <h3 className="font-black uppercase tracking-widest text-[10px] text-gray-400">Select Ad Account</h3>
          </div>
          
          <select 
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="glass-input w-full p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest mb-6"
          >
            {adAccounts.map(acc => (
              <option key={acc.id} value={acc.id} className="bg-slate-900">{acc.name} ({acc.account_id})</option>
            ))}
            {adAccounts.length === 0 && <option disabled>Scanning Accounts...</option>}
          </select>

          <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-prime-500/5 border-prime-500/10' : 'bg-prime-50 border-prime-500/20'}`}>
            <p className="text-[10px] uppercase font-black tracking-widest text-prime-500 mb-1">Active Pixel</p>
            <p className="text-xs font-black">Skinzy_Main_Pixel_2024</p>
          </div>
        </div>

        {/* Step 2: Custom Audience Sync */}
        <div className={`p-6 rounded-[2rem] border transition-all ${
          isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-xl shadow-slate-200'
        }`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-500 font-black">2</div>
            <h3 className="font-black uppercase tracking-tight text-sm">Audience Intelligence</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase opacity-50 mb-2 block">Source Segment</label>
              <select 
                value={audienceConfig.segment}
                onChange={(e) => setAudienceConfig(prev => ({...prev, segment: e.target.value}))}
                className={`w-full p-3 rounded-2xl border text-xs font-bold ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-black/5'}`}
              >
                <option value="Hot Lead">Hot Leads (High Interest)</option>
                <option value="Customer">Existing Customers (Upsell)</option>
                <option value="Inquiry">New Inquiries (Retarget)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase opacity-50 mb-2 block">Audience Name</label>
              <input 
                type="text"
                value={audienceConfig.name}
                onChange={(e) => setAudienceConfig(prev => ({...prev, name: e.target.value}))}
                className={`w-full p-3 rounded-2xl border text-xs font-bold ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-black/5'}`}
              />
            </div>

            <button 
              onClick={handleSyncAudience}
              disabled={isSyncing || adAccounts.length === 0}
              className={`w-full py-4 rounded-3xl flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all ${
                isSyncing || adAccounts.length === 0
                  ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                  : 'bg-prime-500 text-white shadow-lg shadow-prime-500/30 hover:scale-[1.02]'
              }`}
            >
              {isSyncing ? <RefreshCw className="animate-spin" size={18}/> : <Users size={18}/>}
              {isSyncing ? 'Syncing...' : 'Sync to Meta'}
            </button>

            {syncStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-500 justify-center animate-in zoom-in-95">
                <CheckCircle size={16} />
                <span className="text-[10px] font-black uppercase">Audience Ready in Ads Manager</span>
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Campaign Activation */}
        <div className={`p-6 rounded-[2rem] border transition-all ${
          isDarkMode ? 'bg-prime-500/10 border-prime-500/20' : 'bg-prime-50 border-prime-500/30 shadow-xl'
        }`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-prime-500 flex items-center justify-center text-white font-black shadow-lg shadow-prime-500/20">3</div>
            <h3 className="font-black uppercase tracking-tight text-sm">Launch Campaign</h3>
          </div>

          <div className="space-y-4">
            <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-white'} border border-prime-500/20`}>
              <div className="flex items-center gap-3 mb-2">
                <Zap size={14} className="text-prime-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-prime-500">Fast-Track Setup</span>
              </div>
              <h4 className="text-xs font-black mb-1">Messenger Retargeting Ads</h4>
              <p className="text-[10px] opacity-60">Automatically targets the synced audience on FB & IG with a "Message Us" call to action.</p>
            </div>

            <button className="w-full py-4 rounded-3xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95">
              Launch Wizard
              <ArrowRight size={18} />
            </button>
            
            <p className="text-[9px] text-center opacity-40 ">Estimated cost per message: 0.12 - 0.25 BDT</p>
          </div>
        </div>

      </div>

      {/* Live Performance Snapshot */}
      <div className="glass-card p-10 relative overflow-hidden dark">
        <div className="absolute top-0 right-0 w-64 h-64 bg-prime-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
        
        <div className="flex items-center gap-3 mb-10 relative z-10">
           <BarChart3 size={16} className="text-prime-500" />
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">ROI Analytics Pipeline</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 relative z-10">
          {[
            { label: 'Total Ad Spend', value: '45,200', unit: 'BDT', color: 'text-white' },
            { label: 'Attributed Leads', value: '1,240', unit: 'Leads', color: 'text-prime-400' },
            { label: 'Conversion Rate', value: '8.4', unit: '%', color: 'text-green-400' },
            { label: 'Projected Revenue', value: '3,20,000', unit: 'BDT', color: 'text-prime-500' }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col gap-2">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-black tracking-tighter ${stat.color}`}>{stat.value}</span>
                <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">{stat.unit}</span>
              </div>
              <div className="w-12 h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-prime-500/40 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampaignWizard;
