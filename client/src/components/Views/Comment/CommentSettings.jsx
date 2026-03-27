import React from 'react';
import { Settings, Zap, Shuffle, ShieldAlert, UserPlus, MessageCircle, Clock } from 'lucide-react';

const CommentSettings = ({ isDarkMode, t, settings, handleToggleSetting, isSavingSettings }) => {
  const SettingToggle = ({ icon: Icon, label, description, active, onToggle, color = "prime" }) => (
    <div className={`p-5 rounded-[2rem] border transition-all duration-500 ${
      isDarkMode 
        ? 'bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10' 
        : 'bg-gray-50 border-black/5 hover:bg-white hover:shadow-xl hover:shadow-black/5'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl transition-all duration-500 ${
            active 
              ? `bg-${color}-500/20 text-${color}-400 scale-110 shadow-lg shadow-${color}-500/10` 
              : 'bg-gray-500/10 text-gray-500 opacity-50'
          }`}>
            <Icon size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-0.5">{label}</p>
            <p className="text-[9px] text-gray-500 font-medium leading-tight max-w-[120px]">{description}</p>
          </div>
        </div>
        <button 
          onClick={onToggle}
          className={`relative w-12 h-6 rounded-full transition-all duration-500 ${
            active ? `bg-${color}-500 shadow-lg shadow-${color}-500/30` : 'bg-gray-400/20'
          }`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 shadow-md ${
            active ? 'left-7 scale-110' : 'left-1 scale-90'
          }`} />
        </button>
      </div>
    </div>
  );

  return (
    <div className={`p-8 rounded-[3rem] border transition-all duration-700 ${
      isDarkMode 
        ? 'bg-[#020617]/60 border-white/5 backdrop-blur-3xl shadow-2xl shadow-black/40' 
        : 'bg-white border-black/5 shadow-2xl shadow-black/5'
    }`}>
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-prime-500/10 rounded-lg">
            <Settings size={18} className="text-prime-400" />
          </div>
          <div>
            <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-prime-400">
              {t('advanced_settings')}
            </h4>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
              Control your autonomous engagement engine
            </p>
          </div>
        </div>
        {isSavingSettings && (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-prime-500/10 border border-prime-500/20">
            <div className="w-1 h-1 bg-prime-400 rounded-full animate-ping" />
            <span className="text-[9px] text-prime-400 font-black uppercase tracking-widest italic leading-none">
              Saving...
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SettingToggle 
          icon={Zap} 
          label="AI Auto-Reply" 
          description="AI takes over if no keyword match"
          active={settings.aiReply}
          onToggle={() => handleToggleSetting('aiReply')}
          color="prime"
        />
        <SettingToggle 
          icon={Shuffle} 
          label="System Match" 
          description="Prioritize your keyword strategies"
          active={settings.systemAutoReply}
          onToggle={() => handleToggleSetting('systemAutoReply')}
          color="indigo"
        />
        <SettingToggle 
          icon={ShieldAlert} 
          label={t('spam_filter')} 
          description="Hide links and blacklisted keywords"
          active={settings.spamFilter}
          onToggle={() => handleToggleSetting('spamFilter')}
          color="red"
        />
        <SettingToggle 
          icon={UserPlus} 
          label={t('lead_capture')} 
          description="Save commenters to leads database"
          active={settings.leadCapture}
          onToggle={() => handleToggleSetting('leadCapture')}
          color="green"
        />
        <SettingToggle 
          icon={MessageCircle} 
          label="Human Handoff" 
          description="Send to Pending if admin is requested"
          active={settings.humanHandoff}
          onToggle={() => handleToggleSetting('humanHandoff')}
          color="purple"
        />
        <SettingToggle 
          icon={Clock} 
          label={t('human_delay')} 
          description="Replies sent with 5-15s delay"
          active={settings.humanDelay}
          onToggle={() => handleToggleSetting('humanDelay')}
          color="orange"
        />
      </div>
    </div>
  );
};

export default CommentSettings;
