import React from 'react';
import { Sun, Moon, Zap } from 'lucide-react';

export const ThemeToggle = ({ theme, setTheme, isDarkMode }) => {
  const cycleTheme = () => {
    let nextTheme = 'light';
    if (theme === 'light') nextTheme = 'dark';
    else if (theme === 'dark') nextTheme = 'vortex';
    setTheme(nextTheme);
    localStorage.setItem('site-theme', nextTheme);
  };

  return (
    <button
      onClick={cycleTheme}
      className={`p-3 rounded-2xl border transition-all duration-500 hover:scale-110 active:scale-95 flex items-center gap-2 group relative overflow-hidden ${
        theme === 'vortex' ? 'bg-prime-500/20 border-prime-500/30 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]' :
        isDarkMode ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-black/10 text-gray-900 shadow-sm hover:shadow-md'
      }`}
      title={`Switch to ${theme === 'light' ? 'Dark' : theme === 'dark' ? 'Vortex' : 'Light'} Theme`}
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        {theme === 'light' && <Sun size={20} />}
        {theme === 'dark' && <Moon size={20} />}
        {theme === 'vortex' && <Zap size={20} className="text-prime-400" />}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">
        {theme === 'vortex' ? 'Vortex' : theme === 'dark' ? 'Dark' : 'Light'}
      </span>
    </button>
  );
};

export const LanguageToggle = ({ language, setLanguage, isDarkMode }) => (
  <div className={`flex items-center rounded-lg p-1 ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
    <button 
      onClick={() => setLanguage('en')}
      className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${language === 'en' ? (isDarkMode ? 'bg-prime-500 text-white' : 'bg-prime-600 text-white') : (isDarkMode ? 'text-gray-400 font-medium' : 'text-gray-600 font-medium')}`}
    >
      EN
    </button>
    <button 
      onClick={() => setLanguage('bn')}
      className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${language === 'bn' ? (isDarkMode ? 'bg-prime-500 text-white' : 'bg-prime-600 text-white') : (isDarkMode ? 'text-gray-400 font-medium' : 'text-gray-600 font-medium')}`}
    >
      BN
    </button>
  </div>
);
