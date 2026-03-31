import React from 'react';
import { ChevronRight, ArrowRight, Zap, Star, ShieldCheck, Globe, Cpu, Activity, Layout } from 'lucide-react';

const CategoryHub = ({ isDarkMode, t, category, onSubSelect, metrics = [] }) => {
  if (!category || !category.sub) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-1000 space-y-6 md:space-y-10 pb-16 md:pb-24 max-w-[1400px] mx-auto px-3 md:px-0">
      {/* Hero Section - Command Center V3 (Designer Icons) */}
      <div className="relative p-7 md:p-14 rounded-[2.5rem] md:rounded-[4rem] overflow-hidden group/hero">
        {/* Animated Background Layers */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-30%] left-[-20%] w-[80%] h-[80%] bg-prime-600/20 blur-[140px] rounded-full animate-pulse duration-[12000ms]" />
          <div className="absolute bottom-[-30%] right-[-20%] w-[80%] h-[80%] bg-purple-600/15 blur-[140px] rounded-full animate-pulse duration-[10000ms] delay-1000" />
          
          <div className={`absolute inset-0 ${isDarkMode ? 'bg-[#020617]/50' : 'bg-white/50'} backdrop-blur-3xl`} />
        </div>

        <div className="relative z-10 flex flex-col xl:flex-row gap-10 xl:items-center justify-between">
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center gap-5 mb-8">
               <div className="relative group/icon overflow-visible">
                  <div className="absolute -inset-4 bg-prime-500 blur-3xl opacity-20 group-hover/icon:opacity-40 transition-opacity" />
                  <div className={`relative p-5 rounded-[1.8rem] transition-all duration-700 shadow-2xl overflow-hidden border-t border-white/30 group-hover/icon:scale-110 group-hover/icon:-rotate-3 ${
                    category.id === 'social_suite' ? 'bg-gradient-to-br from-emerald-400 to-teal-600 shadow-emerald-500/30' :
                    category.id === 'products_hub' ? 'bg-gradient-to-br from-orange-400 to-pink-600 shadow-orange-500/30' :
                    'bg-gradient-to-br from-fuchsia-500 to-purple-700 shadow-fuchsia-500/30'
                  }`}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent pointer-events-none" />
                    <category.icon className="w-14 h-14 md:w-20 md:h-20 text-white relative z-10 drop-shadow-2xl" strokeWidth={1.5} />
                  </div>
               </div>
               <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] text-prime-400">Core Engine</span>
                    <div className="h-px w-6 bg-prime-500/20" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] absolute" />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Status: Autonomous</span>
                  </div>
               </div>
            </div>
            
            <h1 className={`text-4xl md:text-8xl font-black mb-6 md:mb-8 tracking-tighter leading-[0.85] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t(category.label).toUpperCase()}<span className="text-prime-500 drop-shadow-[0_0_20px_rgba(139,92,246,0.5)]">.</span>
            </h1>
            
            <p className={`text-sm md:text-2xl leading-relaxed max-w-xl font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t(`${category.id}_desc`) || `Monitor and manage high-performance infrastructure with designer intelligence.`}
            </p>
          </div>

          {/* 6-Box Grid - Active Sensor Style Icons */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 shrink-0">
            {metrics.map((m, i) => (
              <div 
                key={i}
                className={`group/metric relative p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border backdrop-blur-2xl transition-all duration-700 hover:scale-[1.05] overflow-hidden ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-white/[0.08] to-white/[0.01] border-white/10 hover:border-prime-500/50 hover:shadow-[0_30px_60px_-20px_rgba(139,92,246,0.3)]' 
                    : 'bg-white border-black/[0.05] shadow-xl hover:shadow-2xl hover:border-prime-500/20'
                }`}
              >
                <div className="relative z-10 flex flex-col space-y-4 md:space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="relative group/sensor">
                      <div className="absolute inset-0 bg-prime-500 blur-lg opacity-0 group-hover/metric:opacity-20 transition-opacity" />
                      <div className="p-3 bg-gradient-to-br from-white/15 to-white/5 rounded-xl border-t border-white/20 text-prime-400 group-hover/metric:scale-125 transition-all duration-500 shadow-xl backdrop-blur-md">
                        <m.icon size={16} strokeWidth={2.5} className="text-white drop-shadow-sm" />
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-prime-500/40 animate-pulse" />
                      <div className="w-1 h-1 rounded-full bg-prime-500/20" />
                    </div>
                  </div>
                  <div>
                    <p className={`text-2xl md:text-4xl font-black tracking-tighter mb-1.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {m.value}
                    </p>
                    <p className={`text-[9px] md:text-[11px] font-bold uppercase tracking-[0.3em] ${isDarkMode ? 'text-prime-400' : 'text-prime-600 font-black'}`}>
                      {m.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid - Modules (App Icon Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        {category.sub.map((sub, idx) => (
          <button
            key={sub.id}
            onClick={() => onSubSelect(sub.id)}
            className={`group relative p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border text-left transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) hover:scale-[1.03] ${
              isDarkMode 
                ? 'bg-gradient-to-b from-white/[0.04] to-white/[0.01] border-white/5 hover:border-prime-500/40 hover:bg-white/[0.08] shadow-2xl' 
                : 'bg-white border-black/5 hover:border-prime-500/20 shadow-lg hover:shadow-2xl'
            }`}
          >
            <div className="relative z-10 flex flex-col h-full space-y-10 md:space-y-14">
              <div className="flex items-center justify-between">
                {/* Designer App Icon Container */}
                <div className={`relative p-5 rounded-[1.4rem] transition-all duration-700 group-hover:rotate-[12deg] group-hover:scale-110 shadow-2xl border-t border-white/20 overflow-hidden ${
                  isDarkMode ? 'bg-gradient-to-br from-white/10 to-white/5 text-white' : 'bg-prime-50 text-prime-600'
                }`}>
                   <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
                  <sub.icon className="w-10 h-10 md:w-16 md:h-16 relative z-10 drop-shadow-lg" strokeWidth={1.5} />
                </div>
                <div className="w-12 h-12 rounded-full bg-prime-500/10 border border-prime-500/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 shadow-lg">
                  <ArrowRight size={22} className="text-prime-400" />
                </div>
              </div>

              <div>
                <h3 className={`text-2xl md:text-5xl font-black mb-4 md:mb-6 tracking-tighter leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t(sub.label)}
                </h3>
                <p className={`text-[14px] md:text-[18px] leading-relaxed font-semibold ${isDarkMode ? 'text-gray-400/80' : 'text-gray-500'}`}>
                  {sub.description || `Optimized autonomous module for your enterprise ecosystem.`}
                </p>
              </div>

              <div className="mt-auto pt-10 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                   <span className="text-[10px] md:text-[13px] font-black uppercase tracking-widest text-emerald-500">Live Operation</span>
                </div>
                <span className="text-[10px] md:text-[13px] font-black uppercase tracking-widest text-gray-700">MT-v4.0.1</span>
              </div>
            </div>
          </button>
        ))}

        {/* Scalable Placeholder Card */}
        <div className={`flex flex-col items-center justify-center p-12 md:p-20 rounded-[2.5rem] md:rounded-[4rem] border-2 border-dashed transition-all duration-700 ${
          isDarkMode ? 'border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-prime-500/20' : 'border-black/5 bg-black/[0.01]'
        }`}>
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-700 shadow-inner">
            <Layout className="w-10 h-10 md:w-12 md:h-12 text-gray-700 opacity-30" />
          </div>
          <p className="text-[11px] md:text-[14px] font-black uppercase tracking-[0.5em] text-gray-700 text-center opacity-40">
            Node Expansion Ready
          </p>
        </div>
      </div>
    </div>
  );
};

export default CategoryHub;
