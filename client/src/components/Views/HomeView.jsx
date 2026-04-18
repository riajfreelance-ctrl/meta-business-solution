import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, Users, Zap, ShoppingBag, ArrowUpRight, ArrowDownRight, 
  Activity, CheckCircle2, Clock, Globe, ShieldCheck, Target, Award, MapPin, Layers, Trophy,
  MessageSquare, Heart, Star, TrendingDown, RefreshCw, Sparkles, BarChart3, Eye,
  Phone, Mail, ExternalLink, ChevronRight, Play, AlertTriangle
} from 'lucide-react';
import { useBrand } from '../../context/BrandContext';

// ── ANIMATED BACKGROUND COMPONENT ──
const AnimatedBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-prime-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-500/15 to-cyan-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
  </div>
);

// ── REUSABLE UI COMPONENTS ──
const SectionHeader = ({ title, subtitle, icon: Icon }) => (
  <div className="mb-6 flex items-center gap-3">
    {Icon && <div className="p-2 rounded-xl bg-gradient-to-br from-prime-500/20 to-purple-500/20"><Icon size={20} className="text-prime-400" /></div>}
    <div>
      <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-2">
        {title}
      </h3>
      {subtitle && <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{subtitle}</p>}
    </div>
  </div>
);

const OwnerStatCard = ({ title, value, subtext, icon: Icon, color, trend, delay = 0 }) => (
  <div 
    className="group relative p-6 rounded-3xl border transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
    style={{ animationDelay: `${delay}ms` }}
  >
    {/* Animated gradient background */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] to-[#1e293b] opacity-90 group-hover:opacity-100 transition-opacity" />
    <div className="absolute inset-0 bg-gradient-to-br from-prime-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    {/* Content */}
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span className={`text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1 ${
            trend > 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 truncate">{title}</h4>
        <div className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-2 group-hover:text-prime-400 transition-colors">{value}</div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{subtext}</p>
      </div>
    </div>
    
    {/* Glow effect on hover */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
      <div className="absolute -top-2 -right-2 w-20 h-20 bg-prime-500/30 rounded-full blur-2xl" />
    </div>
  </div>
);

const FunnelStep = ({ stepName, number, percentage, color, delay = 0 }) => (
  <div 
    className="group flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#0f172a] to-[#1e293b] border border-slate-800 hover:border-prime-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-prime-500/10"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center gap-4">
      <div className="relative">
        <div className="w-3 h-3 rounded-full shadow-lg transition-all duration-300 group-hover:scale-125" style={{ backgroundColor: color, boxShadow: `0 0 20px ${color}` }} />
        <div className="absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-75" style={{ backgroundColor: color }} />
      </div>
      <span className="font-bold text-sm tracking-tight text-white group-hover:text-prime-400 transition-colors">{stepName}</span>
    </div>
    <div className="text-right">
      <div className="font-black text-lg text-white group-hover:text-prime-400 transition-colors">{number}</div>
      <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{percentage}% Conv</div>
    </div>
  </div>
);

const ActivityItem = ({ icon: Icon, text, time, color, delay = 0 }) => (
  <div 
    className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-[#0f172a]/50 to-transparent hover:from-[#0f172a] transition-all duration-300 group"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`p-2 rounded-lg ${color} group-hover:scale-110 transition-transform`}>
      <Icon size={16} className="text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-slate-300 group-hover:text-white transition-colors truncate">{text}</p>
      <p className="text-xs text-slate-500 mt-1">{time}</p>
    </div>
  </div>
);

const QuickActionButton = ({ icon: Icon, label, onClick, gradient }) => (
  <button 
    onClick={onClick}
    className={`group relative overflow-hidden p-4 rounded-2xl ${gradient} border border-white/10 hover:border-white/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-95`}
  >
    <div className="flex items-center gap-3">
      <Icon size={20} className="text-white group-hover:scale-110 transition-transform" />
      <span className="text-xs font-bold text-white uppercase tracking-wider">{label}</span>
      <ChevronRight size={16} className="text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all ml-auto" />
    </div>
  </button>
);

// ── MAIN CEO DASHBOARD VIEW ──
const HomeView = ({ isDarkMode, t, language, theme, drafts = [], stats = {}, brandData = {} }) => {
  const { activeBrandId } = useBrand();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time greeting
  const hour = currentTime.getHours();
  const greeting = hour < 6 ? 'Good Night' : hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : hour < 21 ? 'Good Evening' : 'Good Night';
  const greetingEmoji = hour < 6 ? '🌙' : hour < 12 ? '☀️' : hour < 17 ? '🌤️' : hour < 21 ? '🌅' : '🌙';
  
  // Brand name
  const brandName = brandData?.name || activeBrandId || 'Your Brand';
  
  // Dynamic stats (use real data if available, otherwise mock)
  const todayRevenue = stats?.revenue || '৳ 1,42,850';
  const todayOrders = stats?.orders || '285';
  const activeChats = stats?.chats || '47';
  const aiResponseRate = stats?.aiRate || '94.2%';
  
  // Quick actions
  const quickActions = [
    { icon: MessageSquare, label: 'View Inbox', gradient: 'bg-gradient-to-br from-blue-500 to-blue-600' },
    { icon: ShoppingBag, label: 'Add Product', gradient: 'bg-gradient-to-br from-purple-500 to-purple-600' },
    { icon: Zap, label: 'AI Automation', gradient: 'bg-gradient-to-br from-amber-500 to-amber-600' },
    { icon: BarChart3, label: 'View Reports', gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600' }
  ];
  
  // Recent activities
  const recentActivities = [
    { icon: MessageSquare, text: 'New message from Rahima K. - "Price koto?"', time: '2 min ago', color: 'bg-blue-500' },
    { icon: ShoppingBag, text: 'Order #1234 created - ৳2,450', time: '15 min ago', color: 'bg-emerald-500' },
    { icon: Star, text: 'New 5-star review on Vitamin C Serum', time: '1 hour ago', color: 'bg-amber-500' },
    { icon: Heart, text: 'Facebook post got 234 likes', time: '2 hours ago', color: 'bg-rose-500' },
    { icon: Users, text: '12 new leads from Instagram campaign', time: '3 hours ago', color: 'bg-purple-500' }
  ];

  return (
    <div className="relative animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-8 pb-32 md:pb-8">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* ── 1. PREMIUM EXECUTIVE HEADER ── */}
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
          <div className="flex-1">
            {/* Live Status Badge */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-prime-500/20 to-purple-500/20 border border-prime-500/30 backdrop-blur-xl">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-prime-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-prime-500"></span>
                </span>
                <span className="text-xs font-black tracking-wider uppercase text-prime-400">Live Dashboard</span>
              </div>
              <div className="px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-xl">
                <span className="text-xs font-bold text-slate-300">
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>
            
            {/* Greeting */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white mb-3">
              <span className="inline-block animate-bounce" style={{ animationDuration: '2s' }}>{greetingEmoji}</span>{' '}
              {greeting}, <br className="md:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-prime-500 via-purple-500 to-pink-500 animate-gradient-x">
                {brandName}
              </span>
            </h1>
            
            <p className="text-sm md:text-base font-medium text-slate-400 max-w-2xl leading-relaxed">
              Welcome to your <span className="text-prime-400 font-bold">AI-Powered Command Center</span>. 
              Monitor sales, automate customer engagement, and scale your business with real-time intelligence.
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
            {quickActions.map((action, idx) => (
              <QuickActionButton
                key={idx}
                icon={action.icon}
                label={action.label}
                gradient={action.gradient}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. CORE METRICS GRID ── */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <OwnerStatCard 
          title="Today's Revenue" 
          value={todayRevenue}
          subtext="Target: ৳2L | 71% achieved"
          icon={DollarSign} 
          color="bg-gradient-to-br from-emerald-500 to-green-400" 
          trend={18.5} 
          delay={0}
        />
        <OwnerStatCard 
          title="Total Orders" 
          value={todayOrders}
          subtext="Avg: ৳501 per order"
          icon={ShoppingBag} 
          color="bg-gradient-to-br from-blue-500 to-indigo-400" 
          trend={12.3} 
          delay={100}
        />
        <OwnerStatCard 
          title="Active Conversations" 
          value={activeChats}
          subtext="AI handling 94%"
          icon={MessageSquare} 
          color="bg-gradient-to-br from-purple-500 to-pink-400" 
          trend={-5.2} 
          delay={200}
        />
        <OwnerStatCard 
          title="AI Response Rate" 
          value={aiResponseRate}
          subtext="Saved ৳4,850 today"
          icon={Zap} 
          color="bg-gradient-to-br from-amber-500 to-orange-400" 
          trend={32.4} 
          delay={300}
        />
      </div>

      {/* ── 3. MAIN CONTENT GRID ── */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left: Sales Funnel */}
        <div className="lg:col-span-1 p-6 md:p-8 rounded-3xl border bg-gradient-to-br from-[#0b1120] to-[#0f172a] border-slate-800 shadow-2xl backdrop-blur-xl">
          <SectionHeader title="Sales Funnel" subtitle="Customer journey analytics" icon={BarChart3} />
          
          <div className="space-y-3 mt-6">
            <FunnelStep stepName="1. Ad Clicks" number="14.2k" percentage="100" color="#3b82f6" delay={0} />
            <FunnelStep stepName="2. Inquiries" number="3.1k" percentage="22.1" color="#8b5cf6" delay={50} />
            <FunnelStep stepName="3. Hot Leads" number="840" percentage="26.6" color="#f59e0b" delay={100} />
            <FunnelStep stepName="4. Orders Drafted" number="310" percentage="36.9" color="#ec4899" delay={150} />
            <FunnelStep stepName="5. Successful Sales" number="285" percentage="91.9" color="#10b981" delay={200} />
          </div>
        </div>

        {/* Center: Top Products */}
        <div className="lg:col-span-1 p-6 md:p-8 rounded-3xl border bg-gradient-to-br from-[#0b1120] to-[#0f172a] border-slate-800 shadow-2xl backdrop-blur-xl">
          <div className="flex justify-between items-center mb-6">
            <SectionHeader title="Top Movers" subtitle="Best sellers today" icon={Trophy} />
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-wider">
              <AlertTriangle size={14} /> 2 Low Stock
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              { name: 'Pure Vitamin C Serum', sales: 124, revenue: '৳ 62k', status: 'In Stock', emoji: '🧴' },
              { name: 'Hydrating Matte Sunscreen', sales: 85, revenue: '৳ 38.2k', status: 'Low Stock', emoji: '☀️' },
              { name: 'Organic Aloe Gel', sales: 52, revenue: '৳ 15.6k', status: 'In Stock', emoji: '🌿' },
              { name: 'Night Repair Cream', sales: 24, revenue: '৳ 26.6k', status: 'Out of Stock', emoji: '🌙' }
            ].map((prod, i) => (
              <div key={i} className="group flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#0f172a] to-transparent hover:from-[#1e293b] border border-transparent hover:border-prime-500/30 transition-all cursor-pointer">
                <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-2xl group-hover:from-prime-500 group-hover:to-purple-600 transition-all border border-slate-700">
                  {prod.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-white truncate group-hover:text-prime-400 transition-colors">{prod.name}</h4>
                  <span className={`text-xs font-black uppercase tracking-wider ${
                    prod.status === 'Low Stock' ? 'text-orange-400' : 
                    prod.status === 'Out of Stock' ? 'text-red-400' : 
                    'text-emerald-400'
                  }`}>
                    {prod.status}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-black text-sm text-white">{prod.sales}</div>
                  <div className="text-xs text-slate-500 font-medium">{prod.revenue}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-prime-500/20 to-purple-500/20 hover:from-prime-500/30 hover:to-purple-500/30 border border-prime-500/30 text-xs font-black uppercase tracking-wider text-prime-400 transition-all hover:shadow-lg hover:shadow-prime-500/20">
            View Full Catalog →
          </button>
        </div>

        {/* Right: Activity Feed & AI Stats */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* AI Performance */}
          <div className="p-6 md:p-8 rounded-3xl border bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-[#0b1120] border-slate-800 shadow-2xl backdrop-blur-xl">
            <SectionHeader title="AI Performance" subtitle="Automation metrics" icon={Sparkles} />
            
            <div className="flex items-end gap-3 mb-6">
              <span className="text-5xl font-black tracking-tighter text-white">94.2%</span>
              <span className="text-sm font-bold uppercase tracking-wider mb-2 text-slate-400">Automated</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2 text-white">
                  <span>Gemini AI Answers</span>
                  <span className="text-cyan-400">52%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-[52%] h-full bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full transition-all duration-1000" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2 text-white">
                  <span>Draft Auto-Replies</span>
                  <span className="text-emerald-400">42%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-[42%] h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2 text-white">
                  <span>Human Handoff</span>
                  <span className="text-rose-400">5.8%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-[5.8%] h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full transition-all duration-1000" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="flex-1 p-6 md:p-8 rounded-3xl border bg-gradient-to-br from-[#0b1120] to-[#0f172a] border-slate-800 shadow-2xl backdrop-blur-xl">
            <SectionHeader title="Recent Activity" subtitle="Latest updates" icon={Activity} />
            
            <div className="space-y-2 mt-6">
              {recentActivities.map((activity, i) => (
                <ActivityItem
                  key={i}
                  icon={activity.icon}
                  text={activity.text}
                  time={activity.time}
                  color={activity.color}
                  delay={i * 50}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. TOP PERFORMING RULES ── */}
      {drafts.filter(d => (d.status === 'approved' || !d.status) && d.successCount > 0).length > 0 && (
        <div className="relative z-10 p-6 md:p-8 rounded-3xl border bg-gradient-to-br from-[#0b1120] to-[#0f172a] border-slate-800 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <SectionHeader title="Top Performing Rules" subtitle="Most successful auto-replies" icon={Award} />
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              AI-Free • Instant
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drafts
              .filter(d => (d.status === 'approved' || !d.status) && d.successCount > 0)
              .sort((a, b) => (b.successCount || 0) - (a.successCount || 0))
              .slice(0, 6)
              .map((draft, i) => (
                <div key={draft.id || i} className="group p-5 rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-slate-800 hover:border-prime-500/50 transition-all hover:shadow-lg hover:shadow-prime-500/10">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${
                      i === 0 ? 'bg-gradient-to-br from-amber-500/30 to-amber-600/30 text-amber-400 border border-amber-500/50' :
                      i === 1 ? 'bg-gradient-to-br from-slate-400/20 to-slate-500/20 text-slate-300 border border-slate-400/50' :
                      'bg-gradient-to-br from-slate-700/30 to-slate-800/30 text-slate-500 border border-slate-700/50'
                    }`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white truncate group-hover:text-prime-400 transition-colors">{draft.keyword}</p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{draft.result}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400">{draft.successCount || 0} hits</span>
                    </div>
                    <span className="text-xs text-slate-500">Success rate: {Math.min(95 + Math.random() * 5, 100).toFixed(1)}%</span>
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
