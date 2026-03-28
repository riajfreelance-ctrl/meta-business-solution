import React, { useState } from 'react';
import { X, Building2, Rocket, Shield, Crown, Check, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { useBrand } from '../../context/BrandContext';

const BrandOnboarding = ({ isOpen, onClose, isDarkMode }) => {
  const { registerBrand } = useBrand();
  const [step, setStep] = useState(1);
  const [brandName, setBrandName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('free_trial');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const plans = [
    {
      id: 'free_trial',
      name: 'Free Starter',
      price: '৳0',
      desc: 'Perfect for initial testing and small shops.',
      icon: Rocket,
      color: 'blue',
      features: ['50 Orders / Mo', '20 Products', '100 AI Replies', '1 Agent']
    },
    {
      id: 'business_pro',
      name: 'Business Pro',
      price: '৳4,500',
      desc: 'For growing brands scaling their sales.',
      icon: Zap,
      color: 'amber',
      features: ['500 Orders / Mo', '200 Products', '1,000 AI Replies', '5 Agents', 'Analytics']
    },
    {
      id: 'enterprise',
      name: 'Tier Extra',
      price: 'Custom',
      desc: 'Bespoke solutions for high-volume entities.',
      icon: Crown,
      color: 'purple',
      features: ['Unlimited Orders', 'Unlimited Products', 'Priority AI', 'Dedicated Manager']
    }
  ];

  const handleSubmit = async () => {
    if (!brandName) return;
    setIsSubmitting(true);
    try {
      await registerBrand(brandName, selectedPlan);
      setStep(3); // Success step
    } catch (e) {
      console.error(e);
      alert("Initialization Failed: " + (e.message || "Unknown Error. Please try again or check connection."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
      
      <div className={`relative w-full max-w-4xl overflow-hidden rounded-[3rem] border shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-700 ${
        isDarkMode ? 'bg-[#020617] border-white/10' : 'bg-white border-black/5'
      }`}>
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex gap-1 px-4 py-3">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-700 ${
              step >= s ? 'bg-prime-500' : 'bg-white/10'
            }`} />
          ))}
        </div>

        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-all z-10">
          <X size={20} className={isDarkMode ? 'text-white' : 'text-gray-900'} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-5 h-full min-h-[600px]">
          {/* Left Panel - Branding */}
          <div className="md:col-span-2 p-12 bg-gradient-to-br from-prime-600 to-purple-800 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-10 left-10 w-64 h-64 bg-white blur-[100px] rounded-full animate-pulse" />
                <div className="absolute bottom-10 right-10 w-48 h-48 bg-white blur-[100px] rounded-full animate-pulse delay-700" />
            </div>

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center mb-8 shadow-2xl border border-white/20">
                <Building2 size={32} />
              </div>
              <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-4">Launch your <br/> next brand.</h2>
              <p className="text-white/60 text-sm font-medium leading-relaxed uppercase tracking-widest ">Anzaar Engine helps you scale with AI-driven commerce intelligence.</p>
            </div>

            <div className="relative z-10 space-y-6">
               <div className="flex items-center gap-4">
                  <div className="p-2 bg-white/10 rounded-xl"><Shield size={16} /></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">{step === 3 ? 'Completed' : 'Onboarding System'}</p>
               </div>
            </div>
          </div>

          {/* Right Panel - Steps */}
          <div className="md:col-span-3 p-12 flex flex-col justify-center">
            {step === 1 && (
              <div className="space-y-8 animate-in slide-in-from-right duration-500">
                <div>
                  <h3 className={`text-2xl font-black uppercase tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Name your vision</h3>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">A unique name is the seed of identity.</p>
                </div>
                
                <div className="space-y-4">
                   <div className="relative group">
                      <input 
                        autoFocus
                        type="text" 
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="ENTER BRAND NAME..."
                        className={`w-full p-6 bg-transparent border-b-2 text-2xl font-black uppercase tracking-tight focus:outline-none transition-all ${
                          isDarkMode ? 'border-white/10 focus:border-prime-500 text-white' : 'border-black/5 focus:border-prime-600 text-gray-900'
                        }`}
                      />
                      <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 text-prime-500 opacity-30 group-focus-within:opacity-100 transition-all" size={24} />
                   </div>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                     <Check size={12} className="text-green-500"/> Supports Multiple Meta Assets
                   </p>
                </div>

                <button 
                  disabled={!brandName}
                  onClick={() => setStep(2)}
                  className="w-full py-5 rounded-[2rem] bg-prime-500 hover:bg-prime-600 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-30 shadow-2xl shadow-prime-500/30"
                >
                  Configure Plan <ArrowRight size={18} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in slide-in-from-right duration-500">
                <div>
                  <h3 className={`text-2xl font-black uppercase tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Select Engine Tier</h3>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Scalable resources for every stage of growth.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {plans.map(plan => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`p-6 rounded-3xl border text-left transition-all duration-300 relative overflow-hidden group ${
                        selectedPlan === plan.id 
                          ? (isDarkMode ? 'bg-prime-500/10 border-prime-500' : 'bg-prime-50 border-prime-500 shadow-xl')
                          : (isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-gray-50 border-black/5 hover:bg-gray-100')
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${selectedPlan === plan.id ? 'bg-prime-500 text-white' : 'bg-white/10 text-gray-500'}`}>
                            <plan.icon size={16} />
                          </div>
                          <span className={`text-sm font-black uppercase tracking-widest ${isDarkMode && selectedPlan !== plan.id ? 'text-gray-400' : ''}`}>{plan.name}</span>
                        </div>
                        <span className="text-sm font-black text-prime-500">{plan.price}</span>
                      </div>
                      <p className="text-[10px] opacity-60 font-medium mb-4">{plan.desc}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {plan.features.map(f => (
                          <span key={f} className={`text-[8px] font-black uppercase tracking-tighter px-2 py-1 rounded-md ${
                            selectedPlan === plan.id ? 'bg-prime-500/20 text-prime-400' : 'bg-black/20 text-gray-500'
                          }`}>
                            {f}
                          </span>
                        ))}
                      </div>

                      {selectedPlan === plan.id && (
                        <div className="absolute top-4 right-4 text-prime-500">
                          <Check size={20} className="animate-in zoom-in duration-300" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex gap-4">
                   <button onClick={() => setStep(1)} className={`flex-1 py-4 rounded-[2rem] font-bold uppercase tracking-widest text-[10px] ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>Back</button>
                   <button 
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="flex-[2] py-5 rounded-[2rem] bg-prime-500 hover:bg-prime-600 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl shadow-prime-500/20"
                   >
                     {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <>Initialize Brand <Zap size={18} /></>}
                   </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-center space-y-8 animate-in zoom-in duration-700">
                 <div className="w-24 h-24 rounded-full bg-green-500/10 border-4 border-green-500/20 flex items-center justify-center mx-auto mb-6">
                    <Check size={48} className="text-green-500" />
                 </div>
                 <div>
                    <h3 className={`text-3xl font-black uppercase tracking-tighter mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Brand Synchronized.</h3>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">System has initialized the Vortex Engine for {brandName}.</p>
                 </div>
                 
                 <div className={`p-6 rounded-3xl border border-dashed ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-green-50 border-green-500/20'}`}>
                    <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-4 ${isDarkMode ? 'text-gray-500' : 'text-green-600'}`}>Assigned Environment</p>
                    <div className="flex items-center justify-center gap-6">
                       <div className="text-center">
                          <p className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>FREE</p>
                          <p className="text-[8px] font-bold uppercase opacity-40">Plan Status</p>
                       </div>
                       <div className="w-px h-8 bg-gray-500/20" />
                       <div className="text-center">
                          <p className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>ACTIVE</p>
                          <p className="text-[8px] font-bold uppercase opacity-40">Sync State</p>
                       </div>
                    </div>
                 </div>

                 <button 
                  onClick={onClose}
                  className="w-full py-5 rounded-[2rem] bg-prime-500 text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-prime-500/30"
                 >
                   Enter Dashboard
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandOnboarding;
