import React, { useState, useEffect } from 'react';
import { UserCircle, Activity, CheckCircle } from 'lucide-react';
import { db } from '../../firebase-client';
import { doc, updateDoc } from 'firebase/firestore';
import { useBrand } from '../../context/BrandContext';

const BlueprintArchitect = ({ isDarkMode, t }) => {
  const { activeBrandId, brandData } = useBrand();
  const [step, setStep] = useState(1);
  const [tone, setTone] = useState('Friendly');
  const [emojis, setEmojis] = useState('✨, 🚀, 💎');
  const [delay, setDelay] = useState('30s');
  const [length, setLength] = useState('Balanced');
  const [languageMode, setLanguageMode] = useState('Mixed');
  const [handoverTrigger, setHandoverTrigger] = useState('Purchase Interest');
  const [priorityFAQs, setPriorityFAQs] = useState(['Shipping', 'Pricing']);
  const [socials, setSocials] = useState({ fb: '', ig: '', wa: '' });
  const [payments, setPayments] = useState(['bKash', 'Cash on Delivery']);
  const [delivery, setDelivery] = useState({ insideDhaka: '2-3 Days', outsideDhaka: '3-5 Days' });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize from brandData if available
  useEffect(() => {
    if (brandData?.blueprint) {
      const b = brandData.blueprint;
      if (b.tone) setTone(b.tone);
      if (b.emojis) setEmojis(b.emojis);
      if (b.delay) setDelay(b.delay);
      if (b.length) setLength(b.length);
      if (b.languageMode) setLanguageMode(b.languageMode);
      if (b.handoverTrigger) setHandoverTrigger(b.handoverTrigger);
      if (b.priorityFAQs) setPriorityFAQs(b.priorityFAQs);
      if (b.socials) setSocials(b.socials);
      if (b.payments) setPayments(b.payments);
      if (b.delivery) setDelivery(b.delivery);
    }
  }, [brandData?.blueprint]);

  const handleSave = async () => {
    if (!activeBrandId) return;
    setIsSaving(true);
    try {
      const blueprint = {
        tone,
        emojis,
        delay,
        length,
        languageMode,
        handoverTrigger,
        priorityFAQs,
        socials,
        payments,
        delivery,
        updatedAt: new Date(),
        version: '1.4.0'
      };

      await updateDoc(doc(db, "brands", activeBrandId), {
        blueprint: blueprint
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        if (step < 10) setStep(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error saving blueprint:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const togglePayment = (method) => {
    setPayments(prev => 
      prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
    );
  };

  const toggleFAQ = (faq) => {
    setPriorityFAQs(prev => 
      prev.includes(faq) ? prev.filter(f => f !== faq) : [...prev, faq]
    );
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <section className="space-y-6 animate-in slide-in-from-right duration-300">
            <label className="text-xl font-bold flex items-center gap-3">
              <UserCircle className="text-prime-500" />
              1. Brand Voice & Persona
            </label>
            <div className="grid grid-cols-2 gap-4">
              {['Professional', 'Friendly', 'Excited', 'Consultative'].map((tName) => (
                <button 
                  key={tName} 
                  onClick={() => setTone(tName)}
                  className={`p-6 rounded-2xl border transition-all text-left group ${
                    tone === tName 
                      ? 'border-prime-500 bg-prime-500/10' 
                      : 'border-white/10 bg-white/5 hover:border-prime-500/50'
                  }`}
                >
                  <p className={`font-bold mb-1 ${tone === tName ? 'text-prime-400' : ''}`}>{tName}</p>
                  <p className="text-xs text-gray-500 ">Conversational style: {tName.toLowerCase()}</p>
                </button>
              ))}
            </div>
            <div className="space-y-4 pt-4">
              <label className="text-sm font-bold block text-gray-400 uppercase tracking-widest">Signature Emojis</label>
              <input 
                type="text" 
                value={emojis}
                onChange={(e) => setEmojis(e.target.value)}
                placeholder="✨, 🚀, 💎" 
                className="glass-input w-full p-4 rounded-xl border-white/10" 
              />
            </div>
          </section>
        );
      case 2:
        return (
          <section className="space-y-6 animate-in slide-in-from-right duration-300">
            <label className="text-xl font-bold flex items-center gap-3">
              <Activity className="text-prime-500" />
              2. Auto-Reply Delay
            </label>
            <p className="text-gray-400 text-sm ">How long should the AI wait before sending a reply?</p>
            <div className="grid grid-cols-2 gap-4">
              {['Immediate', '15 Seconds', '30 Seconds', '1 Minute'].map((d) => (
                <button 
                  key={d} 
                  onClick={() => setDelay(d)}
                  className={`p-6 rounded-2xl border transition-all text-left ${
                    delay === d 
                      ? 'border-prime-500 bg-prime-500/10' 
                      : 'border-white/10 bg-white/5 hover:border-prime-500/50'
                  }`}
                >
                  <p className={`font-bold ${delay === d ? 'text-prime-400' : ''}`}>{d}</p>
                </button>
              ))}
            </div>
          </section>
        );
      case 3:
        return (
          <section className="space-y-6 animate-in slide-in-from-right duration-300">
            <label className="text-xl font-bold flex items-center gap-3 text-prime-400">
              3. Response Length
            </label>
            <div className="grid grid-cols-1 gap-4">
              {[
                { id: 'Concise', label: 'Concise & Fast', desc: 'Short answers, straight to the point.' },
                { id: 'Balanced', label: 'Balanced', desc: 'Natural conversation with enough detail.' },
                { id: 'Detailed', label: 'Detailed & Comprehensive', desc: 'Deep explanations, best for consults.' }
              ].map((l) => (
                <button 
                  key={l.id} 
                  onClick={() => setLength(l.id)}
                  className={`p-6 rounded-2xl border transition-all text-left ${
                    length === l.id 
                      ? 'border-prime-500 bg-prime-500/10' 
                      : 'border-white/10 bg-white/5 hover:border-prime-500/50'
                  }`}
                >
                  <p className={`font-bold ${length === l.id ? 'text-prime-400' : ''}`}>{l.label}</p>
                  <p className="text-xs text-gray-500">{l.desc}</p>
                </button>
              ))}
            </div>
          </section>
        );
      case 4:
        return (
          <section className="space-y-6 animate-in slide-in-from-right duration-300">
            <label className="text-xl font-bold flex items-center gap-3">
              4. Language Preference
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['English', 'Bengali', 'Mixed'].map((lang) => (
                <button 
                  key={lang} 
                  onClick={() => setLanguageMode(lang)}
                  className={`p-6 rounded-2xl border transition-all text-center ${
                    languageMode === lang 
                      ? 'border-prime-500 bg-prime-500/10' 
                      : 'border-white/10 bg-white/5 hover:border-prime-500/50'
                  }`}
                >
                  <p className={`font-bold ${languageMode === lang ? 'text-prime-400' : ''}`}>{lang}</p>
                </button>
              ))}
            </div>
            <div className="p-6 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 text-yellow-500/80 text-sm">
              Note: "Mixed" mode uses Banglish (Bengali written in Roman script) common in Messenger chats.
            </div>
          </section>
        );
      case 5:
        return (
          <section className="space-y-6 animate-in slide-in-from-right duration-300">
            <label className="text-xl font-bold flex items-center gap-3 text-prime-400">
              5. Handover Triggers
            </label>
            <p className="text-gray-400 text-sm">When should the AI stop and ask a human to join?</p>
            <div className="grid grid-cols-1 gap-3">
              {[
                'Purchase Interest (Payment/Order)',
                'Negative Sentiment (Angry/Frustrated)',
                'Complex Product Questions',
                'Human Requested ("Talk to agent")'
              ].map((t) => (
                <button 
                  key={t} 
                  onClick={() => setHandoverTrigger(t)}
                  className={`p-5 rounded-2xl border transition-all text-left ${
                    handoverTrigger === t 
                      ? 'border-prime-500 bg-prime-500/10' 
                      : 'border-white/10 bg-white/5 hover:border-prime-500/50'
                  }`}
                >
                  <p className={`font-bold ${handoverTrigger === t ? 'text-prime-400' : ''}`}>{t}</p>
                </button>
              ))}
            </div>
          </section>
        );
      case 6:
        return (
          <section className="space-y-6 animate-in slide-in-from-right duration-300">
            <label className="text-xl font-bold flex items-center gap-3">
              6. Priority FAQ Library
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['Shipping Policy', 'Refunds & Returns', 'Product Pricing', 'Stock Availability', 'Wholesale Inquiry', 'Store Location'].map((faq) => (
                <button 
                  key={faq} 
                  onClick={() => toggleFAQ(faq)}
                  className={`p-4 rounded-xl border transition-all text-left relative overflow-hidden ${
                    priorityFAQs.includes(faq) 
                      ? 'border-prime-500 bg-prime-500/10' 
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <span className={`text-sm font-bold ${priorityFAQs.includes(faq) ? 'text-white' : 'text-gray-500'}`}>{faq}</span>
                  {priorityFAQs.includes(faq) && (
                    <div className="absolute top-0 right-0 p-1 bg-prime-500 rounded-bl-lg">
                      <CheckCircle size={10} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        );
      case 7:
        return (
          <section className="space-y-6 animate-in slide-in-from-right duration-300">
            <label className="text-xl font-bold text-prime-400">7. Social Media Links</label>
            <div className="space-y-4">
              {['Facebook', 'Instagram', 'WhatsApp'].map((s) => (
                <div key={s} className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-500">{s} URL / Number</label>
                  <input 
                    type="text" 
                    value={socials[s.toLowerCase().substring(0,2)]}
                    onChange={(e) => setSocials({...socials, [s.toLowerCase().substring(0,2)]: e.target.value})}
                    placeholder={`Enter ${s} link`}
                    className="glass-input w-full p-4 rounded-xl border-white/5"
                  />
                </div>
              ))}
            </div>
          </section>
        );
      case 8:
        return (
          <section className="space-y-6 animate-in slide-in-from-right duration-300">
            <label className="text-xl font-bold">8. Payment Methods</label>
            <div className="grid grid-cols-1 gap-3">
              {['bKash', 'Nagad', 'Rocket', 'Cash on Delivery', 'Bank Transfer'].map((m) => (
                <button 
                  key={m} 
                  onClick={() => togglePayment(m)}
                  className={`p-4 rounded-xl border transition-all text-left flex justify-between items-center ${
                    payments.includes(m) ? 'border-prime-500 bg-prime-500/10' : 'border-white/10 bg-white/5'
                  }`}
                >
                  <span className={payments.includes(m) ? 'text-white font-bold' : 'text-gray-500'}>{m}</span>
                  {payments.includes(m) && <CheckCircle size={18} className="text-prime-500" />}
                </button>
              ))}
            </div>
          </section>
        );
      case 9:
        return (
          <section className="space-y-6 animate-in slide-in-from-right duration-300">
            <label className="text-xl font-bold text-prime-400">9. Delivery Timeline</label>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Inside Dhaka</label>
                <input 
                  type="text" 
                  value={delivery.insideDhaka}
                  onChange={(e) => setDelivery({...delivery, insideDhaka: e.target.value})}
                  className="glass-input w-full p-4 rounded-xl border-white/5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Outside Dhaka</label>
                <input 
                  type="text" 
                  value={delivery.outsideDhaka}
                  onChange={(e) => setDelivery({...delivery, outsideDhaka: e.target.value})}
                  className="glass-input w-full p-4 rounded-xl border-white/5"
                />
              </div>
            </div>
          </section>
        );
      case 10:
        return (
          <section className="space-y-8 animate-in zoom-in duration-500 text-center py-10">
            <div className="w-24 h-24 bg-prime-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Activity size={48} className="text-prime-400" />
            </div>
            <h4 className="text-3xl font-black">All Set!</h4>
            <p className="text-gray-400 max-w-sm mx-auto">Your brand blueprint is ready. Click finalize to activate the AI with these settings.</p>
            <div className="grid grid-cols-2 gap-4 text-left mt-8 p-6 bg-white/5 rounded-3xl border border-white/10">
              <div className="text-xs text-gray-500">TONE: <span className="text-white font-bold">{tone}</span></div>
              <div className="text-xs text-gray-500">DELAY: <span className="text-white font-bold">{delay}</span></div>
              <div className="text-xs text-gray-500">LANGUAGE: <span className="text-white font-bold">{languageMode}</span></div>
              <div className="text-xs text-gray-500">PAYMENT: <span className="text-white font-bold">{payments.length} Enabled</span></div>
            </div>
          </section>
        );
      default:
        return <div className="p-20 text-center text-gray-500 ">Step {step} is under construction...</div>;
    }
  };

  return (
    <div className="animate-fade-in glass-card p-12 max-w-4xl mx-auto min-h-[600px] flex flex-col">
      <div className="mb-12 flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <span className="text-prime-400 font-black text-5xl mb-2 block tracking-tighter">0{step}</span>
          <h3 className="text-3xl font-black tracking-tight uppercase">Blueprint Architect</h3>
        </div>
        <div className="text-right">
          <div className="flex gap-1 mb-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className={`h-1.5 w-6 rounded-full transition-all ${i + 1 <= step ? 'bg-prime-500 shadow-[0_0_10px_rgba(var(--prime-rgb),0.5)]' : 'bg-white/10'}`} />
            ))}
          </div>
          <div className="text-gray-500 font-black text-[10px] tracking-[0.2em]">CONFIGURATION {Math.round((step/10)*100)}%</div>
        </div>
      </div>

      <div className="flex-1">
        {showSuccess ? (
          <div className="h-full flex flex-col items-center justify-center py-20 animate-pulse">
            <CheckCircle size={80} className="text-prime-500 mb-6 drop-shadow-[0_0_20px_rgba(var(--prime-rgb),0.4)]" />
            <h4 className="text-3xl font-black tracking-widest uppercase">Saved</h4>
          </div>
        ) : (
          renderStep()
        )}
      </div>

      <div className="pt-12 flex justify-between items-center border-t border-white/5 mt-12">
        <button 
          onClick={() => setStep(prev => Math.max(1, prev - 1))}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
        >
          Previous
        </button>
        
        <div className="flex gap-4">
          <button className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:text-white transition-colors">Skip Wizard</button>
          <button 
            onClick={handleSave}
            disabled={isSaving || showSuccess}
            className="btn-primary px-12 py-4 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-sm shadow-2xl shadow-prime-500/20 active:scale-95 transition-all"
          >
            {isSaving ? 'Processing...' : step === 10 ? 'Finalize' : 'Lock & Next'}
            <Activity size={18} className={isSaving ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlueprintArchitect;
