import React, { useState, useEffect } from 'react';
import { ShieldCheck, Database, Key, CheckCircle, AlertCircle, Facebook, Instagram, MessageCircle, Info, Activity, Sparkles } from 'lucide-react';
import { ThemeToggle } from '../ThemeLanguageToggles';
import { db } from '../../firebase-client';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useBrand } from '../../context/BrandContext';

const SettingsView = ({ isDarkMode, theme, setTheme, language, setLanguage, t }) => {
  const { activeBrandId, brandData, refreshBrandData } = useBrand();
  const [apiConfig, setApiConfig] = useState({
    googleAIKey: '',
    fbPageAccessToken: '',
    fbVerifyToken: '',
    facebookPageId: '',
    instagramId: '',
    whatsappPhoneId: '',
    waAccessToken: '',
    waVerifyToken: ''
  });
  const [aiSettings, setAiSettings] = useState({
    inboxAiEnabled: true,
    commentAiEnabled: true,
    autoLearningEnabled: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sysConfig, setSysConfig] = useState({ gemini: false, facebook: false, whatsapp: false });

  useEffect(() => {
    if (brandData) {
      setApiConfig({
        googleAIKey: brandData.googleAIKey || '',
        fbPageAccessToken: brandData.fbPageToken || '', // Mapping name
        fbVerifyToken: brandData.fbVerifyToken || '',
        facebookPageId: brandData.facebookPageId || '',
        instagramId: brandData.instagramId || '',
        whatsappPhoneId: brandData.whatsappPhoneId || '',
        waAccessToken: brandData.waAccessToken || '',
        waVerifyToken: brandData.waVerifyToken || ''
      });
      setAiSettings({
        inboxAiEnabled: brandData.aiSettings?.inboxAiEnabled !== false,
        commentAiEnabled: brandData.aiSettings?.commentAiEnabled !== false,
        autoLearningEnabled: brandData.aiSettings?.autoLearningEnabled !== false
      });
    }
  }, [brandData]);

  useEffect(() => {
    // SysConfig fetch removed to resolve browser load hang.
  }, []);

  const handleToggleAi = async (key, newValue) => {
    if (!activeBrandId) return;
    const updatedSettings = { ...aiSettings, [key]: newValue };
    setAiSettings(updatedSettings); // Update local state for UI responsiveness
    
    try {
      await updateDoc(doc(db, "brands", activeBrandId), {
        aiSettings: updatedSettings
      });
      await refreshBrandData(); // Sync with global context
    } catch (e) {
      console.error("Error toggling AI setting:", e);
      // Revert on error
      setAiSettings(aiSettings);
    }
  };

  const handleSave = async () => {
    if (!activeBrandId) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "brands", activeBrandId), {
        googleAIKey: apiConfig.googleAIKey,
        fbPageToken: apiConfig.fbPageAccessToken, // Sync name
        fbVerifyToken: apiConfig.fbVerifyToken,
        facebookPageId: apiConfig.facebookPageId,
        instagramId: apiConfig.instagramId,
        whatsappPhoneId: apiConfig.whatsappPhoneId,
        waAccessToken: apiConfig.waAccessToken,
        waVerifyToken: apiConfig.waVerifyToken,
        aiSettings: aiSettings,
        updatedAt: new Date()
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (e) {
      console.error("Error saving API config:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const isEnvActive = sysConfig.gemini || sysConfig.facebook || sysConfig.whatsapp;

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-3xl flex items-center justify-center shadow-lg ${isDarkMode ? 'bg-white/5 text-white border border-white/10' : 'bg-white text-gray-900 border border-black/5 shadow-xl'}`}>
              <ShieldCheck size={28} />
            </div>
            <div>
              <h2 className={`text-4xl font-black uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('account_settings')}</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">{t('certified_brand')} System 2.4</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Subscription & Usage Section */}
        <section className={`p-8 rounded-[2.5rem] border transition-all duration-300 relative overflow-hidden ${
          isDarkMode ? 'bg-[#0a0f1d] border-white/5' : 'bg-white shadow-2xl border-black/5'
        }`}>
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 blur-[100px] pointer-events-none" />
          
          <div className="flex items-start justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                <Activity size={28} />
              </div>
              <div>
                <h4 className={`text-xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Plan & Usage</h4>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mt-1">
                  Current Tier: <span className="text-amber-500">{brandData?.plan?.replace('_', ' ').toUpperCase() || 'FREE TRIAL'}</span>
                </p>
              </div>
            </div>
            {brandData?.planExpiry && (
              <div className="text-right">
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">Expires On</p>
                <p className={`text-[10px] font-black italic ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {(() => {
                    try {
                      const exp = brandData.planExpiry;
                      const date = exp?.seconds ? new Date(exp.seconds * 1000) : new Date(exp);
                      return isNaN(date.getTime()) ? 'Active' : date.toLocaleDateString();
                    } catch (e) {
                      return 'Active';
                    }
                  })()}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-8">
             {/* Usage Meters */}
             <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <span>Monthly Orders</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {brandData?.usageStats?.ordersThisMonth || 0} / {brandData?.usageLimits?.maxOrders || 50}
                    </span>
                  </div>
                  <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                    <div 
                      className="h-full bg-prime-500 transition-all duration-1000" 
                      style={{ width: `${Math.min(100, ((brandData?.usageStats?.ordersThisMonth || 0) / (brandData?.usageLimits?.maxOrders || 50)) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <span>Product Catalog</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {brandData?.usageStats?.productsCount || 0} / {brandData?.usageLimits?.maxProducts || 20}
                    </span>
                  </div>
                  <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                    <div 
                      className="h-full bg-purple-500 transition-all duration-1000" 
                      style={{ width: `${Math.min(100, ((brandData?.usageStats?.productsCount || 0) / (brandData?.usageLimits?.maxProducts || 20)) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <span>AI Replies </span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {brandData?.usageStats?.aiRepliesThisMonth || 0} / {brandData?.usageLimits?.aiRepliesPerMonth || 100}
                    </span>
                  </div>
                  <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                    <div 
                      className="h-full bg-blue-500 transition-all duration-1000" 
                      style={{ width: `${Math.min(100, ((brandData?.usageStats?.aiRepliesThisMonth || 0) / (brandData?.usageLimits?.aiRepliesPerMonth || 100)) * 100)}%` }}
                    />
                  </div>
                </div>
             </div>

             <div className="pt-6 border-t border-white/5">
                <button className="w-full py-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-black uppercase tracking-widest text-xs transition-all active:scale-95 border border-amber-500/20">
                  Upgrade to Business Pro
                </button>
             </div>
          </div>
        </section>
        
        {/* Automation & AI Control Section */}
        <section className={`p-8 rounded-[2.5rem] border transition-all duration-300 relative overflow-hidden ${
          isDarkMode ? 'bg-[#0a0f1d] border-white/5' : 'bg-white shadow-2xl border-black/5'
        }`}>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[100px] pointer-events-none" />
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-500">
              <Sparkles size={28} />
            </div>
            <div>
              <h4 className={`text-xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>AI & Bot Strategy</h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mt-1">Hybrid Intelligence Control</p>
            </div>
          </div>

          <div className="space-y-6">
            {[
              { 
                id: 'inboxAiEnabled', 
                label: 'Inbox AI Response', 
                desc: 'Enable Gemini fallback if no draft matches the customer query.',
                icon: MessageCircle,
                active: aiSettings.inboxAiEnabled
              },
              { 
                id: 'commentAiEnabled', 
                label: 'Comment AI Discovery', 
                desc: 'Auto-reply to Facebook/Instagram comments using AI context.',
                icon: Facebook,
                active: aiSettings.commentAiEnabled
              },
              { 
                id: 'autoLearningEnabled', 
                label: 'Autonomous Learning', 
                desc: 'Capture best AI replies as "Pending Drafts" to train the bot.',
                icon: Activity,
                active: aiSettings.autoLearningEnabled
              }
            ].map((item) => (
              <div key={item.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-black/5'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${item.active ? 'bg-prime-500/20 text-prime-500' : 'bg-gray-500/10 text-gray-500'}`}>
                    <item.icon size={18} />
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.label}</p>
                    <p className="text-[9px] text-gray-500 font-medium">{item.desc}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleToggleAi(item.id, !item.active)}
                  className={`w-12 h-6 rounded-full transition-all relative ${item.active ? 'bg-prime-500' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${item.active ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* API Engine Section */}
        <section className={`p-8 rounded-[2.5rem] border transition-all duration-300 relative overflow-hidden ${
          isDarkMode ? 'bg-[#0a0f1d] border-white/5' : 'bg-white shadow-2xl border-black/5'
        }`}>
          {/* Decorative Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-prime-500/20 blur-[100px] pointer-events-none" />
          
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-prime-500/20 flex items-center justify-center text-prime-500">
                <Key size={32} />
              </div>
              <div>
                <h4 className={`text-xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>API Engine</h4>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{brandData?.name || 'Active Brand'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {isEnvActive && (
              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4 mb-4">
                <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest leading-relaxed">System Fallback Active: Some settings are being loaded from the server's environment configuration (.env). You can still override them by entering values below.</p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                  Gemini API Key (Google AI)
                  <span className="bg-purple-500/10 text-purple-500 border border-purple-500/20 px-2 py-0.5 rounded-full text-[8px]">BYOK</span>
                </label>
                {sysConfig.gemini && !apiConfig.googleAIKey && (
                  <span className="text-[8px] font-black bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md uppercase tracking-tighter border border-blue-500/20">System Master Key Active</span>
                )}
              </div>
              <input 
                type="password"
                value={apiConfig.googleAIKey}
                onChange={(e) => setApiConfig({...apiConfig, googleAIKey: e.target.value})}
                placeholder="Enter AI Key for Unlimited Usage"
                className={`w-full p-5 rounded-2xl border font-mono text-sm transition-all focus:ring-2 focus:ring-prime-500/20 ${isDarkMode ? 'bg-white/5 border-white/5 text-white' : 'bg-gray-50 border-black/5'}`}
              />
              <p className="text-[9px] font-bold text-gray-500 mt-1 uppercase tracking-widest">
                Don't have a key? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-prime-500 hover:underline">Get your Free API Key here</a>
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Facebook & Instagram IDs</label>
                {sysConfig.facebook && !apiConfig.facebookPageId && (
                  <span className="text-[8px] font-black bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md uppercase tracking-tighter border border-blue-500/20">System Active</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input 
                    type="text"
                    value={apiConfig.facebookPageId}
                    onChange={(e) => setApiConfig({...apiConfig, facebookPageId: e.target.value})}
                    placeholder="Page ID"
                    className={`w-full p-4 rounded-xl border font-mono text-xs pl-12 ${isDarkMode ? 'bg-white/5 border-white/5 text-white' : 'bg-gray-50 border-black/5'}`}
                  />
                  <Facebook size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                </div>
                <div className="relative">
                  <input 
                    type="text"
                    value={apiConfig.instagramId}
                    onChange={(e) => setApiConfig({...apiConfig, instagramId: e.target.value})}
                    placeholder="IG Business ID"
                    className={`w-full p-4 rounded-xl border font-mono text-xs pl-12 ${isDarkMode ? 'bg-white/5 border-white/5 text-white' : 'bg-gray-50 border-black/5'}`}
                  />
                  <Instagram size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500" />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle size={16} className="text-green-500" />
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-green-500">WhatsApp Cloud API</h5>
                </div>
                {sysConfig.whatsapp && !apiConfig.whatsappPhoneId && (
                  <span className="text-[8px] font-black bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md uppercase tracking-tighter border border-blue-500/20">System Active</span>
                )}
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-gray-500 tracking-widest">Phone Number ID</label>
                  <input 
                    type="text"
                    value={apiConfig.whatsappPhoneId}
                    onChange={(e) => setApiConfig({...apiConfig, whatsappPhoneId: e.target.value})}
                    placeholder="e.g. 1029384756..."
                    className={`w-full p-3 rounded-xl border font-mono text-xs ${isDarkMode ? 'bg-white/5 border-white/5 text-white' : 'bg-gray-50 border-black/5'}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-gray-500 tracking-widest">WhatsApp Access Token</label>
                  <textarea 
                    value={apiConfig.waAccessToken}
                    onChange={(e) => setApiConfig({...apiConfig, waAccessToken: e.target.value})}
                    placeholder="Permanent Token"
                    className={`w-full p-3 rounded-xl border font-mono text-[10px] h-16 resize-none ${isDarkMode ? 'bg-white/5 border-white/5 text-white' : 'bg-gray-50 border-black/5'}`}
                  />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-4 rounded-2xl bg-prime-500 hover:bg-prime-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-prime-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSaving ? 'Updating...' : 'Update Engine Settings'}
              </button>
              {showSuccess && (
                <div className="mt-4 flex items-center justify-center gap-2 text-green-500 font-bold text-[10px] uppercase tracking-widest">
                  <CheckCircle size={12} />
                  Settings Synchronized!
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Display Settings Section */}
        <section className={`p-8 rounded-[2.5rem] border ${
          isDarkMode ? 'bg-[#0a0f1d] border-white/5' : 'bg-white shadow-2xl border-black/5'
        }`}>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-500">
              <Database size={28} />
            </div>
            <div>
              <h4 className={`text-xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('display_settings')}</h4>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{t('vortex_engine')} Dashboard</p>
            </div>
          </div>

          <div className="space-y-12">
            <div className="space-y-4">
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>{t('theme')}</p>
              <ThemeToggle theme={theme} setTheme={setTheme} t={t} />
            </div>

            <div className="space-y-6 pt-8 border-t border-white/5">
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>{t('language')}</p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setLanguage('en')}
                  className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    language === 'en' 
                      ? 'bg-prime-500 text-white border-transparent shadow-lg shadow-prime-500/20' 
                      : (isDarkMode ? 'bg-white/5 text-gray-400 border-white/5 hover:text-white' : 'bg-gray-50 text-gray-600 border-black/5 hover:bg-gray-100')
                  }`}
                >
                  {t('english')}
                </button>
                <button 
                  onClick={() => setLanguage('bn')}
                  className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    language === 'bn' 
                      ? 'bg-prime-500 text-white border-transparent shadow-lg shadow-prime-500/20' 
                      : (isDarkMode ? 'bg-white/5 text-gray-400 border-white/5 hover:text-white' : 'bg-gray-50 text-gray-600 border-black/5 hover:bg-gray-100')
                  }`}
                >
                  {t('bangla')}
                </button>
              </div>
            </div>

            <div className={`p-6 rounded-3xl border border-dashed flex items-center justify-between ${
               isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-black/5'
            }`}>
               <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('system_status')}</p>
                  <p className="text-[8px] font-bold text-green-500 uppercase tracking-widest animate-pulse mt-1">● {t('online')}</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('version')} 2.4.0</p>
               </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsView;
