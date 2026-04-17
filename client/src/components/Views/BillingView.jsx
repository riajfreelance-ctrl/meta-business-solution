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
    className={`glass-card p-8 text-left transition-all duration-700 relative overflow-hidden group border-none ${
      isCurrent 
        ? 'shadow-[0_0_40px_rgba(107,33,168,0.2)] ring-2 ring-prime-500/50' 
        : 'hover:scale-[1.02] hover:shadow-2xl'
    }`}
  >
    <div className={`absolute top-0 right-0 w-48 h-48 blur-[100px] opacity-10 transition-all group-hover:opacity-20 ${plan.color.bg}`} />
    
    <div className="flex justify-between items-start mb-8 relative z-10">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5 ${plan.color.bg} bg-opacity-20 backdrop-blur-md`}>
        <plan.icon className={`w-7 h-7 ${plan.color.text}`} />
      </div>
      {isCurrent && (
        <div className="px-4 py-1.5 rounded-xl bg-prime-500 text-white text-[9px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(107,33,168,0.5)]">ACTIVE NODE</div>
      )}
    </div>

    <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">{plan.name}</h3>
    <div className="flex items-baseline gap-2 mb-6">
      <span className="text-4xl font-black text-white">{plan.price}</span>
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">/ MO</span>
    </div>

    <div className="space-y-3 mb-10 relative z-10">
      {plan.features.map(f => (
        <div key={f} className="flex items-center gap-3 group/feat">
          <div className="w-5 h-5 rounded-full bg-prime-500/10 flex items-center justify-center border border-prime-500/20">
            <Check size={10} className="text-prime-500" />
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{f}</span>
        </div>
      ))}
    </div>

    {!isCurrent ? (
      <div className="w-full py-4.5 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-prime-500 group-hover:text-white text-center text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl">
        REASSIGN TO {plan.name}
      </div>
    ) : (
      <div className="w-full py-4.5 rounded-2xl bg-prime-500/10 border border-prime-500/30 text-prime-500 text-center text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md">
        PRIMARY FREQUENCY
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
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase flex items-center gap-4">
          <CreditCard size={48} className="text-prime-500 text-stroke-thin" />
          Billing <span className="text-prime-500 text-stroke-thin">Matrix</span>
        </h1>
        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-prime-500 mt-4 flex items-center gap-2">
          <Activity size={14} /> Neural Quota Management
        </p>
      </div>

      {step === 'overview' && (
        <>
          {/* ── USAGE MONITOR ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="glass-card p-10 dark border-none space-y-8">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Resource Quotas</h3>
                   <div className="w-12 h-12 rounded-2xl bg-prime-500/20 flex items-center justify-center text-prime-400 border border-prime-500/20 shadow-lg">
                      <BarChart3 size={20} />
                   </div>
                </div>
                 
                 <div className="space-y-10">
                   <div className="space-y-4">
                      <div className="flex justify-between items-end">
                         <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em]">Synaptic Orders</p>
                         <p className="text-xs font-black text-white tracking-widest">{usageStats.ordersThisMonth} <span className="text-gray-600">/ {usageLimits.maxOrders}</span></p>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
                         <div 
                           className={`h-full rounded-full transition-all duration-1000 relative ${getUsageColor(usageStats.ordersThisMonth, usageLimits.maxOrders)} shadow-[0_0_20px_rgba(107,33,168,0.5)]`} 
                           style={{ width: `${Math.min((usageStats.ordersThisMonth / usageLimits.maxOrders) * 100, 100)}%` }}
                         />
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex justify-between items-end">
                         <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em]">Inventory Vectors</p>
                         <p className="text-xs font-black text-white tracking-widest">{usageStats.productsCount} <span className="text-gray-600">/ {usageLimits.maxProducts}</span></p>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
                         <div 
                           className={`h-full rounded-full transition-all duration-1000 relative ${getUsageColor(usageStats.productsCount, usageLimits.maxProducts)}`} 
                           style={{ width: `${Math.min((usageStats.productsCount / usageLimits.maxProducts) * 100, 100)}%` }}
                         />
                      </div>
                   </div>
                </div>
             </div>

             <div className="glass-card p-10 bg-gradient-to-br from-prime-600/40 to-purple-900/40 dark border-none relative overflow-hidden flex flex-col justify-between shadow-[0_30px_60px_-15px_rgba(107,33,168,0.3)] min-h-[300px]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 blur-[100px] -mr-32 -mt-32" />
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-6">
                      <Shield size={20} className="text-prime-400" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Active Frequency</span>
                   </div>
                   <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">{brandData?.plan?.replace('_', ' ') || 'NEURAL STARTER'}</h2>
                   <p className="text-prime-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> {brandData?.planStatus === 'active' ? 'ENCRYPTED & SYNCED' : 'SIGNAL LOST'}
                   </p>
                </div>
                <div className="relative z-10 pt-8 border-t border-white/10 mt-8">
                   <div className="text-5xl font-black text-white mb-2 tracking-tighter">৳{plans.find(p => p.id === brandData?.plan)?.price.slice(1) || '0'}</div>
                   <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em]">Cycle Renewal: {brandData?.planExpiry?.toDate ? brandData.planExpiry.toDate().toLocaleDateString() : 'N/A'}</p>
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
