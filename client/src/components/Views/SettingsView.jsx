import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { ThemeToggle, LanguageToggle } from '../ThemeLanguageToggles';

const SettingsView = ({ isDarkMode, theme, setTheme, language, setLanguage, t }) => {
  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-10">
      <h3 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('display_settings')}</h3>
      
      <div className={`p-8 rounded-3xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white shadow-xl border-black/5'}`}>
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-lg font-bold">{t('theme')}</h4>
              <p className="text-gray-500 text-sm tracking-widest uppercase font-black">{theme}</p>
            </div>
            <ThemeToggle theme={theme} setTheme={setTheme} isDarkMode={isDarkMode} />
          </div>
        </div>
      </div>
      
      <div className={`p-8 rounded-2xl border transition-all ${isDarkMode ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-200 text-blue-900'}`}>
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="text-blue-500" />
          <h4 className="font-bold">{t('system_status')}</h4>
        </div>
        <p className="text-sm opacity-80">{t('online')} • {t('version')} 2.4.0</p>
      </div>
    </div>
  );
};

export default SettingsView;
