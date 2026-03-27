import React from 'react';
import { ChevronRight, ArrowRight, Zap, Star, ShieldCheck, Globe, Cpu } from 'lucide-react';

const CategoryHub = ({ isDarkMode, t, category, onSubSelect }) => {
  if (!category || !category.sub) return null;

  return (
    <div className="animate-fade-in-up space-y-12 pb-20">
      {/* Hero Section */}
      <div className="relative p-12 rounded-[3.5rem] overflow-hidden border border-white/10">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[130px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/15 blur-[130px] rounded-full animate-pulse delay-700" />
          <div className={`absolute inset-0 ${isDarkMode ? 'bg-[#020617]/40' : 'bg-white/40'} backdrop-blur-3xl`} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-indigo-500/20 rounded-3xl border border-indigo-500/30 text-indigo-500">
                <category.icon size={36} />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.4em] text-indigo-500 bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20">
                Main Category
              </span>
            </div>
            <h1 className={`text-5xl md:text-6xl font-black mb-6 tracking-tight italic ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t(category.label).toUpperCase()}<span className="text-indigo-500">.</span>
            </h1>
            <p className={`text-xl leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {category.longDescription || `Explore the advanced tools and autonomous intelligence modules within the ${t(category.label)} ecosystem.`}
            </p>
          </div>

          <div className="hidden lg:block">
            <div className={`p-8 rounded-[3rem] border backdrop-blur-2xl ${isDarkMode ? 'bg-white/5 border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.5)]' : 'bg-white border-black/5 shadow-2xl'}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">System Status</p>
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Hyper-Dynamic Ready</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-1.5 w-48 bg-gray-500/10 rounded-full overflow-hidden">
                  <div className="h-full w-[94%] bg-gradient-to-r from-indigo-500 to-emerald-500" />
                </div>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest text-right">94% Efficiency</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {category.sub.map((sub, idx) => (
          <button
            key={sub.id}
            onClick={() => onSubSelect(sub.id)}
            className={`group relative p-8 rounded-[3rem] border text-left transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 ${
              isDarkMode 
                ? 'bg-white/5 border-white/5 hover:border-indigo-500/30 hover:bg-white/10 shadow-2xl hover:shadow-indigo-500/10' 
                : 'bg-white border-black/5 hover:border-indigo-500/20 shadow-xl hover:shadow-2xl'
            }`}
          >
            {/* Ambient Tile Glow */}
            <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-700`} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className={`p-4 rounded-2xl transition-all duration-500 group-hover:rotate-12 ${
                  isDarkMode ? 'bg-indigo-500/10 text-indigo-400 border border-white/5' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                }`}>
                  <sub.icon size={28} />
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Launch Module</span>
                  <ArrowRight size={16} className="text-indigo-500" />
                </div>
              </div>

              <h3 className={`text-2xl font-black mb-3 tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t(sub.label)}
              </h3>
              <p className={`text-sm leading-relaxed mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500 text-line-clamp-2'}`}>
                {sub.description || `Manage and optimize your ${t(sub.label).toLowerCase()} environment with autonomous AI intelligence.`}
              </p>

              <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`w-6 h-6 rounded-full border-2 ${isDarkMode ? 'border-slate-900 bg-indigo-500' : 'border-white bg-indigo-400'} flex items-center justify-center`}>
                      <Zap size={10} className="text-white" />
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Optimized</span>
              </div>
            </div>
          </button>
        ))}

        {/* Dynamic Placeholder Card */}
        <div className={`flex flex-col items-center justify-center p-8 rounded-[3rem] border border-dashed transition-all duration-500 ${
          isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-black/10 bg-black/[0.01]'
        }`}>
          <div className="p-4 bg-gray-500/10 rounded-full mb-6">
            <Cpu size={32} className="text-gray-500/40" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-center">
            Intelligence Scaling<br/>in Progress...
          </p>
        </div>
      </div>
    </div>
  );
};

export default CategoryHub;
