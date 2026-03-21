import React from 'react';

const StatCard = ({ icon: Icon, title, value, color, trend, trendLabel, theme, isDarkMode }) => (
  <div className={`p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden group ${
    theme === 'vortex' ? 'bg-white/5 border-white/10 backdrop-blur-xl shadow-[0_0_30px_rgba(139,92,246,0.1)]' :
    isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-md'
  }`} style={{ borderBottomColor: color, borderBottomWidth: '4px' }}>
    
    {/* Decorative Glow for Vortex */}
    {theme === 'vortex' && (
      <div className="absolute -right-4 -top-4 w-12 h-12 rounded-full blur-2xl opacity-20 transition-all group-hover:scale-150" style={{ backgroundColor: color }} />
    )}

    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-3 rounded-xl bg-opacity-10 transition-transform duration-500 group-hover:scale-110`} style={{ backgroundColor: color }}>
        <Icon size={24} style={{ color }} className={theme === 'vortex' ? 'drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]' : ''} />
      </div>
      {trendLabel && (
        <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${trend > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {trendLabel}
        </span>
      )}
    </div>
    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-[10px] font-black uppercase tracking-widest mb-1 relative z-10`}>{title}</p>
    <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'} relative z-10`}>{value}</h3>
  </div>
);

export default StatCard;
