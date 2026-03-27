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
          <h2 className={`text-2xl font-black uppercase tracking-tight italic flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <Target className="text-prime-500" />
            Meta Ads Growth Engine
          </h2>
          <p className="text-xs opacity-50 font-bold uppercase tracking-widest mt-1">Agency-Free Data Driven Advertising</p>
        </div>
        <button 
          onClick={fetchAdAccounts}
          className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''}/>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Step 1: Ad Account & Strategy */}
        <div className={`p-6 rounded-[2rem] border transition-all ${
          isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-xl shadow-slate-200'
        }`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500 font-black">1</div>
            <h3 className="font-black uppercase tracking-tight text-sm">Select Ad Account</h3>
          </div>
          
          <select 
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className={`w-full p-4 rounded-2xl border text-sm font-bold transition-all mb-4 ${
              isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-prime-500/50' : 'bg-slate-50 border-black/5'
            }`}
          >
            {adAccounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name} ({acc.account_id})</option>
            ))}
            {adAccounts.length === 0 && <option disabled>No Ad Accounts Found</option>}
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
            
            <p className="text-[9px] text-center opacity-40 italic">Estimated cost per message: 0.12 - 0.25 BDT</p>
          </div>
        </div>

      </div>

      {/* Live Performance Snapshot */}
      <div className={`p-8 rounded-[2.5rem] border ${
        isDarkMode ? 'bg-slate-900/50 border-white/5' : 'bg-white border-black/5 shadow-xl'
      }`}>
        <div className="flex items-center gap-2 mb-8">
           <BarChart3 size={18} className="text-prime-500" />
           <h3 className="text-xs font-black uppercase tracking-widest opacity-50">ROI Analytics Pipeline</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Ad Spend', value: '45,000', unit: 'BDT', color: 'text-blue-500' },
            { label: 'New Leads', value: '1,240', unit: 'Leads', color: 'text-purple-500' },
            { label: 'Conv. Rate', value: '8.4', unit: '%', color: 'text-prime-500' },
            { label: 'Est. Revenue', value: '3,20,000', unit: 'BDT', color: 'text-green-500' }
          ].map((stat, i) => (
            <div key={i} className="text-center md:text-left">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">{stat.label}</p>
              <div className="flex items-baseline gap-1 justify-center md:justify-start">
                <span className={`text-3xl font-black ${stat.color}`}>{stat.value}</span>
                <span className="text-[10px] font-bold opacity-50">{stat.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampaignWizard;
