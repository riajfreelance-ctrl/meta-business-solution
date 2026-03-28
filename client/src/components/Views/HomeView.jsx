import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, Users, Zap, ShoppingBag, ArrowUpRight, ArrowDownRight, 
  Activity, CheckCircle2, Clock, Globe, ShieldCheck, Target, Award, MapPin, Layers, Trophy
} from 'lucide-react';
import { useBrand } from '../../context/BrandContext';

// ── REUSABLE UI COMPONENTS ──
const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-4 md:mb-6">
    <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter text-white flex items-center gap-2">
      {title}
    </h3>
    {subtitle && <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-widest">{subtitle}</p>}
  </div>
);

const OwnerStatCard = ({ title, value, subtext, icon: Icon, color, trend }) => (
  <div className="p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-[#0f172a] border-slate-800 shadow-sm">
    <div className="flex justify-between items-start mb-2 md:mb-4">
      <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl ${color}`}>
        <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
      </div>
      {trend && (
        <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 md:px-2 md:py-1 rounded-full flex items-center gap-0.5 md:gap-1 ${trend > 0 ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
          {trend > 0 ? <ArrowUpRight size={10} className="md:w-3 md:h-3" /> : <ArrowDownRight size={10} className="md:w-3 md:h-3" />} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div>
      <h4 className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wide mb-0.5 md:mb-1 truncate">{title}</h4>
      <div className="text-xl md:text-3xl font-black tracking-tighter text-white truncate">{value}</div>
      <p className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 md:mt-2 truncate">{subtext}</p>
    </div>
  </div>
);

const FunnelStep = ({ stepName, number, percentage, color }) => (
  <div className="flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl bg-[#0f172a] border border-slate-800">
    <div className="flex items-center gap-3 md:gap-4">
      <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0 shadow-[0_0_10px_rgba(0,0,0,0.5)]`} style={{ backgroundColor: color }} />
      <span className="font-bold text-xs md:text-sm tracking-tight text-white line-clamp-1">{stepName}</span>
    </div>
    <div className="text-right flex-shrink-0">
      <div className="font-black text-sm md:text-lg text-white">{number}</div>
      <div className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">{percentage}% Conv</div>
    </div>
  </div>
);

// ── MAIN CEO DASHBOARD VIEW ──
const HomeView = ({ isDarkMode, t, language, theme, drafts = [] }) => {
  const { activeBrandId } = useBrand();
  
  // Real-time greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-6 md:space-y-8 pb-32 md:pb-8">
      
      {/* ── 1. EXECUTIVE BRIEFING (Header) ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6 mb-6 md:mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2.5 w-2.5 md:h-3 md:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-prime-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 md:h-3 md:w-3 bg-prime-500"></span>
            </span>
            <span className="text-[9px] md:text-[10px] font-black tracking-widest uppercase text-prime-400">Live Executive Feed</span>
          </div>
          <h1 className="text-2xl md:text-5xl font-black tracking-tighter text-white">
             {greeting}, <br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-prime-500 to-purple-500 border-b-2 md:border-b-4 border-prime-500">Owner</span>
          </h1>
          <p className="text-xs md:text-sm font-medium text-slate-400 mt-2 max-w-xl">
             This is your 360° bird's-eye view. Monitoring financials, AI savings, sales funnels, and operational health in real-time.
          </p>
        </div>
        
        {/* Quick Date Toggle */}
        <div className="flex w-full md:w-auto bg-[#0f172a] p-1 rounded-xl md:rounded-2xl shadow-inner overflow-x-auto hide-scrollbar border border-slate-800">
          <button className="flex-1 md:flex-none px-4 md:px-6 py-2 text-[10px] md:text-xs font-black rounded-lg md:rounded-xl bg-[#1e293b] shadow-sm text-prime-400 transition-all uppercase tracking-widest whitespace-nowrap">Today</button>
          <button className="flex-1 md:flex-none px-4 md:px-6 py-2 text-[10px] md:text-xs font-bold rounded-lg md:rounded-xl text-slate-500 hover:text-white transition-all uppercase tracking-widest whitespace-nowrap">7 Days</button>
          <button className="flex-1 md:flex-none px-4 md:px-6 py-2 text-[10px] md:text-xs font-bold rounded-lg md:rounded-xl text-slate-500 hover:text-white transition-all uppercase tracking-widest whitespace-nowrap">30 Days</button>
        </div>
      </div>

      {/* ── 2. CORE FINANCIAL & GROWTH METRICS (The "Money" Row - 1x2 on Mobile) ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
        <OwnerStatCard title="Gross Revenue" value="৳ 1,42k" subtext="Target: ৳ 2L/D" icon={DollarSign} color="bg-gradient-to-br from-emerald-500 to-green-400" trend={18.5} />
        <OwnerStatCard title="Total Ad Spend" value="৳ 12.4k" subtext="ROAS: 11.4x" icon={TrendingUp} color="bg-gradient-to-br from-orange-500 to-amber-400" trend={-4.2} />
        <OwnerStatCard title="Customer ACQ" value="৳ 85" subtext="Per New Customer" icon={Target} color="bg-gradient-to-br from-rose-500 to-pink-400" trend={-12.0} />
        <OwnerStatCard title="AI Savings" value="৳ 4,850" subtext="Draft Auto-Reply" icon={ShieldCheck} color="bg-gradient-to-br from-purple-500 to-indigo-500" trend={32.4} />
      </div>

      {/* ── 3. MIDDLE COMPLEX GRID (Funnel, Products, Audience) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mt-6 md:mt-8">
        
        {/* Left Col: Master Sales Funnel (Highly detailed) */}
        <div className="p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] border bg-[#0b1120] border-slate-800 shadow-xl shadow-black/20 flex flex-col">
          <SectionHeader title="Sales Funnel" subtitle="Where are customers dropping off?" />
          
          <div className="space-y-3 md:space-y-4 mt-2 md:mt-4 flex-1">
            <FunnelStep stepName="1. Ad Clicks" number="14.2k" percentage="100" color="#3b82f6" />
            <FunnelStep stepName="2. Inquiries" number="3.1k" percentage="22.1" color="#8b5cf6" />
            <FunnelStep stepName="3. Hot Leads" number="840" percentage="26.6" color="#f59e0b" />
            <FunnelStep stepName="4. Orders Drafted" number="310" percentage="36.9" color="#ec4899" />
            <FunnelStep stepName="5. Successful Sales" number="285" percentage="91.9" color="#10b981" />
          </div>
        </div>

        {/* Center Col: Top Products & Inventory Alerts */}
        <div className="p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] border bg-[#0b1120] border-slate-800 shadow-xl shadow-black/20 flex flex-col">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <SectionHeader title="Top Movers" subtitle="Best Selling Items Today" />
            <div className="p-1.5 md:p-2 bg-rose-500/10 text-rose-500 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black tracking-widest uppercase flex items-center gap-1 shrink-0 border border-rose-500/20">
              <Zap size={10} className="md:w-3 md:h-3" /> 2 Low
            </div>
          </div>
          
          <div className="space-y-4 md:space-y-5">
            {[
              { name: 'Pure Vitamin C Serum', sales: 124, revenue: '৳ 62k', status: 'In Stock' },
              { name: 'Hydrating Matte Sunscreen', sales: 85, revenue: '৳ 38.2k', status: 'Low Stock' },
              { name: 'Organic Aloe Gel', sales: 52, revenue: '৳ 15.6k', status: 'In Stock' },
              { name: 'Night Repair Cream', sales: 24, revenue: '৳ 26.6k', status: 'Out of Stock' }
            ].map((prod, i) => (
              <div key={i} className="flex justify-between items-center group cursor-pointer">
                <div className="flex items-center gap-3 md:gap-4 truncate mr-2">
                  <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-lg md:rounded-xl bg-[#1e293b] flex items-center justify-center text-sm md:text-lg font-black text-slate-500 group-hover:bg-prime-500 group-hover:text-white transition-colors border border-slate-800">
                    #{i+1}
                  </div>
                  <div className="truncate">
                    <h4 className="font-bold text-xs md:text-sm text-white truncate lg:max-w-[140px]">{prod.name}</h4>
                    <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest ${prod.status === 'Low Stock' ? 'text-orange-500' : prod.status === 'Out of Stock' ? 'text-red-500' : 'text-green-500'}`}>
                      {prod.status}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-black text-xs md:text-sm text-white">{prod.sales} Sold</div>
                  <div className="text-[10px] md:text-xs text-slate-500 font-medium">{prod.revenue}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 md:mt-auto py-3 md:py-4 rounded-xl md:rounded-2xl bg-[#0f172a] hover:bg-[#1e293b] text-[10px] md:text-xs font-black uppercase tracking-widest text-white transition-colors border border-slate-800">
            View Full Catalog
          </button>
        </div>

        {/* Right Col: Operations & AI Health Pulse */}
        <div className="flex flex-col gap-4 md:gap-6">
          {/* AI vs Human Box */}
          <div className="p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border relative overflow-hidden bg-gradient-to-br from-indigo-900/40 to-[#0b1120] border-slate-800 shadow-2xl">
            <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter mb-2 md:mb-4 text-white">AI Workload</h3>
            <div className="flex items-end gap-2 mb-4 md:mb-6">
              <span className="text-4xl md:text-5xl font-black tracking-tighter text-white">94.2%</span>
              <span className="text-xs md:text-sm font-bold uppercase tracking-widest mb-1 text-slate-400">Automated</span>
            </div>
            
            <div className="space-y-2 md:space-y-3">
              <div>
                <div className="flex justify-between text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 opacity-80 text-white">
                  <span>Gemini Answers</span>
                  <span>52%</span>
                </div>
                <div className="w-full h-1 md:h-1.5 bg-[#0f172a] rounded-full overflow-hidden"><div className="w-[52%] h-full bg-cyan-400" /></div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 opacity-80 text-white">
                  <span>Draft Auto-Replies</span>
                  <span>42%</span>
                </div>
                <div className="w-full h-1 md:h-1.5 bg-[#0f172a] rounded-full overflow-hidden"><div className="w-[42%] h-full bg-emerald-400" /></div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 opacity-80 text-white">
                  <span>Human Overrides</span>
                  <span>5.8%</span>
                </div>
                <div className="w-full h-1 md:h-1.5 bg-[#0f172a] rounded-full overflow-hidden"><div className="w-[5.8%] h-full bg-rose-400" /></div>
              </div>
            </div>
          </div>

          {/* New Report: Audience Demographics Highlight */}
          <div className="p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border flex-1 flex flex-col justify-center bg-[#0b1120] border-slate-800 shadow-sm">
             <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                <MapPin size={20} className="md:w-6 md:h-6 text-prime-500" />
                <div>
                  <h3 className="font-bold uppercase tracking-widest text-xs md:text-sm text-white">Audience Insight</h3>
                  <p className="text-[8px] md:text-[10px] text-slate-500 font-bold tracking-widest uppercase">Demographics Report</p>
                </div>
             </div>
             <p className="text-[11px] md:text-sm font-medium text-slate-300 leading-relaxed md:leading-relaxed">
               Highest active conversion happens in <strong className="text-prime-400 font-black">Dhaka (42%)</strong> specifically with female demographics aged <strong className="text-emerald-400 font-black">18-24</strong>. 
               WhatsApp retargeting shows +15% open rate vs last week.
             </p>
          </div>
        </div>
      </div>

      {/* ── 4. TOP PERFORMING RULES WIDGET (Non-AI, Live Data) ── */}
      {drafts.filter(d => (d.status === 'approved' || !d.status) && d.successCount > 0).length > 0 && (
        <div className="p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] border bg-[#0b1120] border-slate-800 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter text-white flex items-center gap-2">
                <Trophy size={20} className="text-amber-400" /> Top Performing Rules
              </h3>
              <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-widest">Non-AI • Most Successful Auto-Replies</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              AI-Free
            </div>
          </div>
          <div className="space-y-3">
            {drafts
              .filter(d => (d.status === 'approved' || !d.status) && d.successCount > 0)
              .sort((a, b) => (b.successCount || 0) - (a.successCount || 0))
              .slice(0, 5)
              .map((draft, i) => (
                <div key={draft.id || i} className="flex items-center gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl bg-[#0f172a] border border-slate-800 group hover:border-prime-500/30 transition-all">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                    i === 0 ? 'bg-amber-500/20 text-amber-400' :
                    i === 1 ? 'bg-slate-400/20 text-slate-300' :
                    'bg-slate-700/30 text-slate-500'
                  }`}>#{i + 1}</div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs md:text-sm font-black text-white truncate">{draft.keyword}</p>
                    <p className="text-[10px] text-slate-500 font-medium truncate">{draft.result}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg md:text-xl font-black text-emerald-400">{draft.successCount}</p>
                    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-600">Hits</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default HomeView;
