import React, { useState } from 'react';
import { 
  CreditCard, Shield, Zap, Crown, Check, 
  ArrowRight, Loader2, AlertTriangle, 
  BarChart3, Activity, Rocket
} from 'lucide-react';
import { useBrand } from '../../context/BrandContext';
import { db } from '../../firebase-client';
import { doc, updateDoc } from 'firebase/firestore';

const PlanCard = ({ plan, isCurrent, onSelect, isDarkMode }) => (
  <button 
    onClick={() => !isCurrent && onSelect(plan.id)}
    className={`p-6 rounded-[2.5rem] border text-left transition-all duration-500 relative overflow-hidden group ${
      isCurrent 
        ? 'border-prime-500 bg-prime-500/5 shadow-2xl' 
        : `bg-[#0b1120] border-slate-800 hover:border-slate-700`
    }`}
  >
    <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl rounded-full -mr-10 -mt-10 transition-all group-hover:opacity-20 ${plan.color.bg}`} />
    
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-3xl ${plan.color.bg} bg-opacity-20`}>
        <plan.icon className={`w-6 h-6 ${plan.color.text}`} />
      </div>
      {isCurrent && (
        <div className="px-4 py-1.5 rounded-full bg-prime-500 text-white text-[8px] font-black uppercase tracking-widest shadow-lg shadow-prime-500/20">Active Plan</div>
      )}
    </div>

    <h3 className="text-xl font-black text-white mb-1 uppercase tracking-tighter">{plan.name}</h3>
    <div className="flex items-baseline gap-1 mb-4">
      <span className="text-3xl font-black text-white">{plan.price}</span>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">/ month</span>
    </div>

    <div className="space-y-3 mb-8">
      {plan.features.map(f => (
        <div key={f} className="flex items-center gap-3">
          <Check size={14} className="text-prime-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f}</span>
        </div>
      ))}
    </div>

    {!isCurrent && (
      <div className="w-full py-4 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-prime-500 group-hover:text-white text-center text-[10px] font-black uppercase tracking-widest transition-all">
        Switch to {plan.name}
      </div>
    )}
  </button>
);

const BillingView = ({ isDarkMode, t }) => {
  const { brandData, activeBrandId } = useBrand();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [step, setStep] = useState('overview'); // 'overview', 'checkout', 'success'
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = [
    {
      id: 'free_trial',
      name: 'Free Starter',
      price: '৳0',
      icon: Rocket,
      color: { bg: 'bg-blue-500', text: 'text-blue-500' },
      features: ['50 Orders / Mo', '20 Products', '100 AI Replies', '1 Agent']
    },
    {
      id: 'business_pro',
      name: 'Business Pro',
      price: '৳4,500',
      icon: Zap,
      color: { bg: 'bg-amber-500', text: 'text-amber-500' },
      features: ['500 Orders / Mo', '200 Products', '1,000 AI Replies', '5 Agents']
    },
    {
      id: 'enterprise',
      name: 'Tier Extra',
      price: '৳15,000',
      icon: Crown,
      color: { bg: 'bg-purple-500', text: 'text-purple-500' },
      features: ['Unlimited Orders', 'Unlimited Products', 'Priority AI', 'Dedicated Manager']
    }
  ];

  const handleUpgrade = async () => {
    setIsProcessing(true);
    // Simulate payment delay
    await new Promise(r => setTimeout(r, 2000));
    
    try {
      const PLAN_LIMITS = {
        free_trial: { maxOrders: 50, maxProducts: 20, aiRepliesPerMonth: 100, activeAgents: 1 },
        business_pro: { maxOrders: 500, maxProducts: 200, aiRepliesPerMonth: 1000, activeAgents: 5 },
        enterprise: { maxOrders: 99999, maxProducts: 99999, aiRepliesPerMonth: 99999, activeAgents: 20 }
      };

      const docRef = doc(db, "brands", activeBrandId);
      await updateDoc(docRef, {
        plan: selectedPlan,
        usageLimits: PLAN_LIMITS[selectedPlan],
        planStatus: 'active'
      });
      setStep('success');
    } catch (e) {
      console.error(e);
      alert("Billing Update Failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const usageStats = brandData?.usageStats || { ordersThisMonth: 0, productsCount: 0 };
  const usageLimits = brandData?.usageLimits || { maxOrders: 50, maxProducts: 20 };

  const getUsageColor = (val, max) => {
    const perc = (val / max) * 100;
    if (perc > 90) return 'bg-rose-500';
    if (perc > 70) return 'bg-orange-500';
    return 'bg-prime-500';
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-8 pb-32">
      
      {/* ── HEADER ── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <CreditCard size={16} className="text-prime-400" />
          <span className="text-[10px] font-black tracking-widest uppercase text-prime-400">Billing & Subscriptions</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-white">
          Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-prime-500 to-purple-500">Your Engine</span>
        </h1>
        <p className="text-sm font-medium text-slate-400 mt-2 max-w-xl">
          Scale your operation by upgrading to higher intelligence tiers. Monitor your resource usage in real-time.
        </p>
      </div>

      {step === 'overview' && (
        <>
          {/* ── USAGE MONITOR ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="p-8 rounded-[3rem] border bg-[#0b1120] border-slate-800 shadow-xl space-y-6">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-xl font-black text-white">Resource Usage</h3>
                   <div className="p-2 rounded-xl bg-prime-500/10 text-prime-400">
                      <BarChart3 size={20} />
                   </div>
                                 </div>
                 
                 <div className="space-y-8">
                   <div className="space-y-3">
                      <div className="flex justify-between items-end">
                         <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Orders Processed</p>
                         <p className="text-xs font-black text-white">{usageStats.ordersThisMonth} <span className="text-slate-600">/ {usageLimits.maxOrders}</span></p>
                      </div>
                      <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-slate-800/50 p-0.5">
                         <div 
                           className={`h-full rounded-full transition-all duration-1000 relative ${getUsageColor(usageStats.ordersThisMonth, usageLimits.maxOrders)} shadow-[0_0_20px_rgba(100,100,255,0.2)]`} 
                           style={{ width: `${Math.min((usageStats.ordersThisMonth / usageLimits.maxOrders) * 100, 100)}%` }}
                         >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                         </div>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <div className="flex justify-between items-end">
                         <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Product Inventory</p>
                         <p className="text-xs font-black text-white">{usageStats.productsCount} <span className="text-slate-600">/ {usageLimits.maxProducts}</span></p>
                      </div>
                      <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-slate-800/50 p-0.5">
                         <div 
                           className={`h-full rounded-full transition-all duration-1000 relative ${getUsageColor(usageStats.productsCount, usageLimits.maxProducts)}`} 
                           style={{ width: `${Math.min((usageStats.productsCount / usageLimits.maxProducts) * 100, 100)}%` }}
                         >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="p-8 rounded-[3rem] border bg-gradient-to-br from-prime-600 to-purple-800 border-white/10 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 blur-[100px] -mr-32 -mt-32" />
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-4">
                      <Shield size={20} className="text-white" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Current Plan</span>
                   </div>
                   <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">{brandData?.plan?.replace('_', ' ') || 'Free Edition'}</h2>
                   <p className="text-white/60 text-xs font-medium uppercase tracking-widest">{brandData?.planStatus === 'active' ? 'Active & Synchronized' : 'Account Suspended'}</p>
                </div>
                <div className="relative z-10 pt-8">
                   <div className="text-4xl font-black text-white mb-2">৳{plans.find(p => p.id === brandData?.plan)?.price.slice(1) || '0'}</div>
                   <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Next Billing Date: {brandData?.planExpiry?.toDate ? brandData.planExpiry.toDate().toLocaleDateString() : 'N/A'}</p>
                </div>
             </div>
          </div>

          {/* ── PLAN SELECTION ── */}
          <div className="space-y-6">
             <div className="flex items-center gap-4">
                <h3 className="text-2xl font-black tracking-tighter text-white">System Tiers</h3>
                <div className="h-px flex-1 bg-slate-800" />
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map(p => (
                  <PlanCard 
                    key={p.id} 
                    plan={p} 
                    isCurrent={brandData?.plan === p.id} 
                    onSelect={(id) => { setSelectedPlan(id); setStep('checkout'); }}
                    isDarkMode={isDarkMode}
                  />
                ))}
             </div>
          </div>
        </>
      )}

      {step === 'checkout' && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right duration-700">
           <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setStep('overview')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-slate-400">
                 <ArrowRight size={20} className="rotate-180" />
              </button>
              <h3 className="text-2xl font-black text-white">Checkout Configuration</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Plan Summary */}
              <div className="p-8 rounded-[3rem] border bg-[#0b1120] border-slate-800 space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-prime-500/20 text-prime-400">
                       <Rocket size={24} />
                    </div>
                    <div>
                       <h4 className="text-sm font-black text-white uppercase tracking-widest">Upgrade to {selectedPlan?.replace('_', ' ')}</h4>
                       <p className="text-[10px] text-slate-500 font-bold">Billed Monthly • Cancel Anytime</p>
                    </div>
                 </div>
                 <div className="h-px bg-slate-800" />
                 <div className="flex justify-between items-center text-white">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-60">Subtotal</span>
                    <span className="text-xl font-black">{plans.find(p => p.id === selectedPlan)?.price}</span>
                 </div>
                 <div className="flex justify-between items-center text-prime-400">
                    <span className="text-xs font-bold uppercase tracking-widest">Vortex Discount</span>
                    <span className="text-xs font-black">- ৳0</span>
                 </div>
                 <div className="h-px bg-slate-800" />
                 <div className="flex justify-between items-center text-white">
                    <span className="text-sm font-black uppercase tracking-widest">Total Due Today</span>
                    <span className="text-3xl font-black">{plans.find(p => p.id === selectedPlan)?.price}</span>
                 </div>
              </div>

              {/* Mock Form */}
              <div className="p-8 rounded-[3rem] border bg-[#0b1120] border-slate-800 space-y-6">
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Card Holder</label>
                       <input type="text" placeholder="FULL NAME ON CARD" className="w-full p-4 bg-black/40 border border-slate-800 rounded-2xl text-[10px] font-bold text-white focus:border-prime-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Card Number</label>
                       <div className="relative">
                          <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full p-4 bg-black/40 border border-slate-800 rounded-2xl text-[10px] font-bold text-white focus:border-prime-500 outline-none" />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                             <div className="w-6 h-4 bg-red-500/50 rounded-sm" />
                             <div className="w-6 h-4 bg-amber-500/50 rounded-sm" />
                          </div>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Expiry</label>
                          <input type="text" placeholder="MM/YY" className="w-full p-4 bg-black/40 border border-slate-800 rounded-2xl text-[10px] font-bold text-white focus:border-prime-500 outline-none" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">CVV</label>
                          <input type="text" placeholder="XXX" className="w-full p-4 bg-black/40 border border-slate-800 rounded-2xl text-[10px] font-bold text-white focus:border-prime-500 outline-none" />
                       </div>
                    </div>
                 </div>

                 <button 
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                  className="w-full py-5 rounded-3xl bg-prime-500 text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-prime-500/30 flex items-center justify-center gap-3 active:scale-95 transition-all"
                 >
                   {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <>Initialize Payment <Activity size={18} /></>}
                 </button>
                 <p className="text-[9px] text-center text-slate-600 font-bold uppercase tracking-widest">Secure Vortex-Encrypted Transaction</p>
              </div>
           </div>
        </div>
      )}

      {step === 'success' && (
        <div className="py-20 text-center space-y-8 animate-in zoom-in duration-700">
           <div className="w-32 h-32 rounded-full bg-green-500/10 border-8 border-green-500/20 flex items-center justify-center mx-auto mb-8">
              <Check size={64} className="text-green-500" />
           </div>
           <div>
              <h1 className="text-5xl font-black text-white tracking-tighter mb-4 uppercase">Engine Upgraded.</h1>
              <p className="text-xl text-slate-400 font-medium">Your platform limits have been synchronized with the {selectedPlan?.replace('_', ' ')} tier.</p>
           </div>
           <button 
            onClick={() => setStep('overview')}
            className="px-12 py-5 rounded-[2rem] bg-prime-500 text-white font-black uppercase tracking-widest text-sm shadow-2xl shadow-prime-500/30 active:scale-95 transition-all"
           >
             Return to Dashboard
           </button>
        </div>
      )}
    </div>
  );
};

export default BillingView;
