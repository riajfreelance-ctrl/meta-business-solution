import React, { useState } from 'react';
import { Facebook, Instagram, MessageCircle, Link as LinkIcon, AlertCircle, CheckCircle, Activity, Globe, Zap, Power } from 'lucide-react';

const ConnectorCard = ({ title, icon: Icon, isConnected, onConnect, colorClass, gradient, details, t, isDarkMode }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    // Simulate OAuth/SDK connection delay
    await new Promise(r => setTimeout(r, 1500));
    setIsLoading(false);
    onConnect();
  };

  return (
    <div className={`relative p-6 rounded-3xl border transition-all duration-500 overflow-hidden group ${
      isDarkMode ? 'bg-[#0a0f1d] border-white/5 hover:border-white/20' : 'bg-white border-black/5 hover:border-black/20 shadow-xl'
    }`}>
      {/* Dynamic Background Glow */}
      <div className={`absolute -inset-4 opacity-0 group-hover:opacity-20 transition-opacity duration-1000 blur-2xl pointer-events-none bg-gradient-to-br ${gradient}`} />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br ${gradient}`}>
            <Icon size={28} />
          </div>
          {isConnected ? (
            <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[9px] font-black uppercase tracking-widest border border-green-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Connected
            </div>
          ) : (
            <div className="px-3 py-1 rounded-full bg-gray-500/10 text-gray-400 text-[9px] font-black uppercase tracking-widest border border-gray-500/20">
              Disconnected
            </div>
          )}
        </div>

        <h3 className={`text-xl font-black tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        
        {isConnected ? (
          <div className="space-y-3 mb-6 flex-1">
            <div className={`p-3 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-black/5'}`}>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Page Name</span>
              <span className={`text-[10px] font-black truncate max-w-[120px] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{details.name}</span>
            </div>
            <div className="flex gap-2">
              <div className={`flex-1 p-3 rounded-xl border flex flex-col gap-1 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-black/5'}`}>
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest text-center">API Health</span>
                <span className="text-[10px] font-black text-green-500 text-center">99.9%</span>
              </div>
              <div className={`flex-1 p-3 rounded-xl border flex flex-col gap-1 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-black/5'}`}>
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest text-center">Last Sync</span>
                <span className={`text-[10px] font-black text-center ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>12s ago</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 mb-6 flex flex-col justify-center">
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
              Connect your {title} to enable Omni-Channel Inbox and AI automation directly through Meta's Graph API.
            </p>
          </div>
        )}

        <button 
          onClick={handleConnect}
          disabled={isLoading}
          className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 ${
            isConnected
              ? (isDarkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-black/5')
              : `bg-gradient-to-r text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] ${gradient}`
          }`}
        >
          {isLoading ? (
            <Activity className="animate-spin" size={16} />
          ) : isConnected ? (
            <>
              <Power size={14} /> Reauthorize
            </>
          ) : (
            <>
              <LinkIcon size={14} /> Connect {title}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const MetaConnectors = ({ apiConfig, setApiConfig, isDarkMode, t, brandData }) => {
  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500">
          <Globe size={28} />
        </div>
        <div>
          <h4 className={`text-xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Omni-Channel Integration</h4>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mt-1">Native SDK Secure Connection</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ConnectorCard 
          title="Facebook Page"
          icon={Facebook}
          isConnected={!!apiConfig.facebookPageId}
          onConnect={() => setApiConfig({ ...apiConfig, facebookPageId: 'Connected_Via_SDK' })}
          colorClass="text-blue-500"
          gradient="from-blue-500 to-blue-700"
          details={{ name: brandData?.name || 'Your Brand Page' }}
          t={t}
          isDarkMode={isDarkMode}
        />
        <ConnectorCard 
          title="Instagram Direct"
          icon={Instagram}
          isConnected={!!apiConfig.instagramId}
          onConnect={() => setApiConfig({ ...apiConfig, instagramId: 'Connected_Via_SDK' })}
          colorClass="text-pink-500"
          gradient="from-fuchsia-500 via-rose-500 to-amber-500"
          details={{ name: `@${brandData?.name?.toLowerCase().replace(/\s+/g, '') || 'brand'}` }}
          t={t}
          isDarkMode={isDarkMode}
        />
        <ConnectorCard 
          title="WhatsApp API"
          icon={MessageCircle}
          isConnected={!!apiConfig.whatsappPhoneId}
          onConnect={() => setApiConfig({ ...apiConfig, whatsappPhoneId: 'Connected_Via_SDK' })}
          colorClass="text-green-500"
          gradient="from-emerald-400 to-teal-600"
          details={{ name: '+88 017XXXXXXX' }}
          t={t}
          isDarkMode={isDarkMode}
        />
      </div>

      <div className={`p-4 rounded-2xl border flex items-start gap-4 mt-8 ${
        isDarkMode ? 'bg-prime-500/5 border-prime-500/10' : 'bg-prime-50 border-prime-100'
      }`}>
        <Zap size={16} className="text-prime-500 shrink-0 mt-0.5" />
        <p className="text-[10px] font-bold text-prime-500 uppercase tracking-widest leading-relaxed">
          Native integration establishes a secure token utilizing Meta's Graph API v18.0. Messages, comments and ad engagements sync directly to your unified inbox within 12ms.
        </p>
      </div>
    </div>
  );
};

export default MetaConnectors;
