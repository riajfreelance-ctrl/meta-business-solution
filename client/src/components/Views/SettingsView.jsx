import React, { useState, useEffect } from 'react';
import { ShieldCheck, Database, Key, CheckCircle, AlertCircle, Facebook, Instagram, MessageCircle, Info } from 'lucide-react';
import { ThemeToggle } from '../ThemeLanguageToggles';
import { db } from '../../firebase-client';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useBrand } from '../../context/BrandContext';

const SettingsView = ({ isDarkMode, theme, setTheme, language, setLanguage, t }) => {
  const { activeBrandId, brandData } = useBrand();
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
    }
  }, [brandData]);

  useEffect(() => {
    // Fetch system configuration status (backend .env fallback)
    fetch('/api/config-status')
      .then(res => res.json())
      .then(data => setSysConfig(data))
      .catch(err => console.error("SysConfig fetch error:", err));
  }, []);

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
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Gemini API Key (Google AI)</label>
                {sysConfig.gemini && !apiConfig.googleAIKey && (
                  <span className="text-[8px] font-black bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md uppercase tracking-tighter border border-blue-500/20">System Active</span>
                )}
              </div>
              <input 
                type="password"
                value={apiConfig.googleAIKey}
                onChange={(e) => setApiConfig({...apiConfig, googleAIKey: e.target.value})}
                placeholder="Enter AI Key"
                className={`w-full p-5 rounded-2xl border font-mono text-sm transition-all focus:ring-2 focus:ring-prime-500/20 ${isDarkMode ? 'bg-white/5 border-white/5 text-white' : 'bg-gray-50 border-black/5'}`}
              />
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
