import React, { useState, useEffect, useRef } from 'react';
import { Layout, Rocket, ArrowRight, ShieldCheck, Zap, Globe, MessageSquare, Database, Cpu, TrendingUp, Star, ChevronRight, CheckCircle2, BarChart3, Fingerprint, Layers, Sparkles } from 'lucide-react';
import { useBrand } from '../../context/BrandContext';

// --- Scroll Reveal Hook ---
const useScrollReveal = () => {
  const [revealed, setRevealed] = useState([]);
  const [hasRevealed, setHasRevealed] = useState(new Set());
  const observer = useRef(null);

  useEffect(() => {
    observer.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasRevealed.has(entry.target.id)) {
          setRevealed(prev => [...new Set([...prev, entry.target.id])]);
          setHasRevealed(prev => new Set([...prev, entry.target.id]));
        }
      });
    }, { threshold: 0.1 });

    const sections = document.querySelectorAll('.reveal-section');
    sections.forEach(s => observer.current.observe(s));
    return () => observer.current?.disconnect();
  }, [hasRevealed]);

  return revealed;
};

// --- Redesigned Premium Sub-Components ---

const MockLiveFeed = ({ isDarkMode }) => {
  const logs = [
    "সিস্টেম ইনিশিয়ালাইজড: কোর ইন্টেলিজেন্স অনলাইন",
    "ফনেটিক ব্রিজ: ২,২০০+ বৈচিত্র্য হ্যান্ডেল করা হয়েছে",
    "প্যাটার্ন ডিটেক্টেড: কাস্টমার লোকেশন জানতে চাচ্ছে",
    "এআই লার্নিং: ড্রাফট তৈরি হয়েছে - 'ডেলিভারি টাইম'",
    "হোয়াটসঅ্যাপ সিঙ্ক: ১২টি নতুন কথোপকথন প্রোসেসড",
    "সাকসেস: হাই-কনভার্সন প্যাটার্ন আইডেন্টিফাইড"
  ];
  return (
    <div className={`p-6 rounded-[2.5rem] border overflow-hidden relative group/logs ${isDarkMode ? 'bg-[#0a0f1d]/40 border-white/5 shadow-2xl' : 'bg-white border-black/5 shadow-xl'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Live Engine Ops</span>
        </div>
      </div>
      <div className="space-y-3 h-28 relative overflow-hidden">
        {logs.map((log, i) => (
          <div key={i} className="text-[10px] font-bold tracking-tight text-prime-400/90 flex items-center gap-3">
            <div className="w-1 h-1 rounded-full bg-prime-500/30" />
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

const SectionHeader = ({ tag, tagBn, title, desc, isDarkMode, center }) => (
  <div className={`space-y-4 mb-16 ${center ? 'text-center' : ''}`}>
    {(tag || tagBn) && (
      <div className={`flex flex-col ${center ? 'items-center' : 'items-start'} gap-1`}>
         {tag && <span className="text-[10px] font-black uppercase tracking-[0.4em] text-prime-500">{tag}</span>}
         {tagBn && <span className="text-[8px] font-bold uppercase tracking-widest text-gray-500 opacity-60">{tagBn}</span>}
      </div>
    )}
    <h2 className={`text-3xl md:text-6xl font-black tracking-tight leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}<span className="text-prime-500">.</span></h2>
    <div className={`text-base md:text-xl max-w-2xl font-medium leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ${center ? 'mx-auto' : ''}`}>{desc}</div>
  </div>
);

const LiveAutoReplySlider = ({ isDarkMode }) => {
  const interactions = [
    { q: "bhai delivery charge koto?", a: "ঢাকার মধ্যে ৬০ টাকা, ঢাকার বাইরে ১২০ টাকা।", tag: "Logistics" },
    { q: "size 42 hobe naki??", a: "জি, ৪২ সাইজ এখনো স্টকে আছে। অর্ডার করতে ইনবক্স করুন।", tag: "Inventory" },
    { q: "apnadr shop kothay?", a: "আমাদের শোরুম পান্থপথ সিগন্যালে, সিটি সেন্টারের ৪ তলায়।", tag: "Location" }
  ];
  const [index, setIndex] = useState(0);
  const [showResponse, setShowResponse] = useState(false);
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    const sequence = async () => {
      setShowResponse(false); setIsMatching(false);
      await new Promise(r => setTimeout(r, 2000));
      setIsMatching(true); await new Promise(r => setTimeout(r, 600)); setIsMatching(false);
      setShowResponse(true); await new Promise(r => setTimeout(r, 4000));
      setIndex(prev => (prev + 1) % interactions.length);
    };
    sequence();
  }, [index]);

  const current = interactions[index];

  return (
    <div className="relative mt-8 max-w-lg mx-auto">
      <div className={`relative min-h-[300px] p-8 md:p-12 rounded-[3.5rem] flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-1000 ${isDarkMode ? 'bg-[#0a0f1d]/40 border border-white/5' : 'bg-white/40 border border-black/5'}`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-prime-500/10 blur-[80px] -z-10" />
        <div className="space-y-8 flex flex-col relative z-10">
          <div className="animate-in fade-in slide-in-from-left-8 duration-1000 self-start">
            <div className={`p-5 rounded-[2rem] rounded-tl-none border ${isDarkMode ? 'bg-white/[0.03] border-white/5' : 'bg-white border-black/5'}`}>
              <p className="text-xs md:text-sm font-medium tracking-tight opacity-90 leading-relaxed">"{current.q}"</p>
            </div>
          </div>
          {isMatching && (
            <div className="flex items-center gap-3 px-6 py-2 self-center animate-pulse">
              <div className="w-1.5 h-1.5 bg-prime-500 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-prime-500/60">Engine Syncing</span>
            </div>
          )}
          {showResponse && (
            <div className="self-end max-w-[90%] animate-in fade-in slide-in-from-right-10 duration-1000">
              <div className="p-6 rounded-[2.5rem] rounded-br-none border border-prime-500/20 bg-prime-500/[0.05] backdrop-blur-3xl shadow-[0_20px_50px_rgba(35,166,240,0.1)]">
                <p className="text-xs md:text-sm font-black text-prime-400 leading-relaxed">"{current.a}"</p>
              </div>
            </div>
          )}
        </div>
        <div className="mt-12 flex items-center justify-center gap-4 border-t border-white/[0.03] pt-8 opacity-40">
           <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
           <span className="text-[9px] font-black uppercase tracking-[0.4em]">Live Conversation Stream</span>
        </div>
      </div>
    </div>
  );
};

const BrandStoryteller = ({ isDarkMode }) => (
  <section id="storyteller" className="reveal-section max-w-4xl mx-auto px-6 mb-40 text-center">
    <div className={`p-12 md:p-20 rounded-[4rem] border relative overflow-hidden ${isDarkMode ? 'bg-prime-500/[0.03] border-prime-500/10' : 'bg-white border-black/5 shadow-2xl'}`}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-prime-500 to-transparent opacity-20" />
      <Sparkles className="text-prime-500 mx-auto mb-8 opacity-50" size={32} />
      <p className={`text-xl md:text-2xl font-medium leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        "একটি সফল ব্র্যান্ডের সার্থকতা লুকিয়ে থাকে তার কাস্টমারের আস্থায়। কিন্তু ইনবক্সে যখন মেসেজের পাহাড় জমে আর রিপ্লাই দিতে দেরি হয়, তখন আপনি শুধু একজন কাস্টমারই হারান না, বরং হারান আপনার ব্র্যান্ডের বিশ্বাসযোগ্যতা। মেটা সলিউশন আপনার ব্যবসার সেই না বলা কথাগুলো বোঝে। এটি কেবল একটি সফটওয়্যার নয়, বরং আপনার ব্র্যান্ডের জন্য এক অদম্য ডিজিটাল রিপ্রেজেন্টেটিভ—যা কাস্টমারের সাথে কথা বলে আপনার মতোই আপন করে, কাজ করে মেশিনের গতিতে। বাংলিশ হোক বা শুদ্ধ বাংলা, সব বুঝে নিয়ে এটি উত্তর দেয় চোখের পলকে। এতে করে আপনি যখন বড় কোনো ব্যবসায়িক মিটিংয়ে বা গভীর ঘুমে, তখনও আপনার সেলস ইউনিট থাকে সচল। এখন ইনবক্সের প্রতিটি মেসেজ হবে আপনার নতুন আয়ের উৎস।"
      </p>
    </div>
  </section>
);

const AuthView = ({ onAuthSuccess, isDarkMode }) => {
  const { registerBrand } = useBrand();
  const [isLogin, setIsLogin] = useState(true);
  const [brandName, setBrandName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const revealed = useScrollReveal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!isLogin && brandName) {
        onAuthSuccess({ email, brandName }); await registerBrand(brandName);
      } else {
        onAuthSuccess({ email, brandName: 'Default Brand' });
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const isRevealed = (id) => revealed.includes(id);

  return (
    <div className={`min-h-screen relative overflow-x-hidden ${isDarkMode ? 'bg-[#020617] text-white' : 'bg-slate-50 text-gray-900'}`}>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-prime-600/[0.05] blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/[0.05] blur-[150px] rounded-full animate-pulse" />
      </div>

      <header className={`fixed top-0 left-0 right-0 z-[100] px-8 py-6 transition-all border-b border-transparent ${isDarkMode ? 'bg-[#020617]/40 border-white/[0.05] backdrop-blur-2xl' : 'bg-white/70 border-black/[0.02] backdrop-blur-xl'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-prime-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(35,166,240,0.3)]">
              <Cpu className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-sm md:text-base font-black tracking-[0.3em] uppercase leading-none">META <span className="text-prime-500">BIZ</span></h1>
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1">Growth Engine</span>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <button onClick={() => document.getElementById('auth-gateway').scrollIntoView({ behavior: 'smooth' })} className="hidden md:block text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity pointer-events-auto">Login</button>
            <button onClick={() => document.getElementById('auth-gateway').scrollIntoView({ behavior: 'smooth' })} className="relative px-8 py-3 bg-prime-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">LAUNCH</button>
          </div>
        </div>
      </header>

      <section id="hero-simulation" className="relative pt-40 pb-4 px-6 flex flex-col items-center justify-center text-center">
         <div className="max-w-5xl w-full">
            <SectionHeader 
               title="Autopilot Experience" 
               desc={
                 <div className="space-y-4">
                   <p className="font-black text-prime-400 text-xl md:text-2xl tracking-tight">আপনার ব্যবসার প্রতিটি পদক্ষেপ হবে এবার অটোপাইলট মুডে।</p>
                   <p className="opacity-80 font-bold">আপনি যখন গভীর ঘুমে, তখনও আপনার সেলস চলবে পুরোদমে।</p>
                 </div>
               } 
               isDarkMode={isDarkMode} 
               center 
            />
            <div className={`mt-8 p-10 md:p-16 rounded-[4.5rem] border ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-white border-black/5 shadow-2xl'}`}>
                <LiveAutoReplySlider isDarkMode={isDarkMode} />
            </div>
         </div>
      </section>

      <section id="scaling-hero" className="relative py-24 px-6 flex flex-col items-center justify-center text-center">
        <div className="max-w-5xl space-y-8">
           <h2 className="text-5xl md:text-8xl font-black leading-[1.1] tracking-tighter">Scaling without<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-prime-400 via-indigo-400 to-prime-400">friction</span>.</h2>
           <div className="space-y-3">
             <p className="text-lg md:text-2xl font-black text-prime-500/90 tracking-tight">কাস্টমারের ইনবক্সে আর কখনো দেরি নয়।</p>
             <p className={`text-xs md:text-lg leading-relaxed max-w-2xl mx-auto font-bold opacity-60 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
               আমাদের স্মার্ট ইঞ্জিন ইনবক্স সামলাবে ঠিক আপনার মতোই, কিন্তু চোখের পলকে।
             </p>
           </div>
        </div>
      </section>

      <section id="value-demographic" className={`reveal-section max-w-7xl mx-auto px-6 mb-40 transition-all duration-1000 ${isRevealed('value-demographic') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
         <div className="text-center mb-20">
            <h3 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">How your brand <span className="text-prime-500">wins</span>.</h3>
            <p className="text-sm md:text-lg font-bold text-gray-500 max-w-2xl mx-auto">আমাদের ইঞ্জিন আপনার ব্যবসাকে করে তোলে নিরবচ্ছিন্ন এবং স্মার্ট।</p>
         </div>

          <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 md:gap-8 mb-24 max-w-5xl mx-auto">
            {[
              { title: 'ইনবক্স অটোমেশন', desc: 'সহজ কথায় সব বুঝবে, দারুণ ভাবে উত্তর দেবে। কাস্টমারও হবে খুশি আমাদের এই স্মার্ট ইনবক্স ফিচারের সাথে।', icon: MessageSquare, color: 'prime' },
              { title: 'স্মার্ট সেলস', desc: 'আপনি যখন অন্য কাজে ব্যস্ত বা গভীর ঘুমে, তখনও আপনার সেলস চলবে পুরোদমে। কোনো কাস্টমারই আর অর্ডার না করে যাবে না।', icon: TrendingUp, color: 'indigo' }
            ].map((item, i) => (
              <div key={i} className={`group p-6 md:p-12 rounded-[2.5rem] md:rounded-[4.5rem] border transition-all duration-500 hover:scale-[1.02] ${isDarkMode ? 'bg-white/[0.02] border-white/10 shadow-3xl' : 'bg-white border-black/5 shadow-xl'}`}>
                 <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 text-center md:text-left">
                    <div className={`p-4 md:p-5 rounded-2xl text-white shadow-xl ${item.color === 'prime' ? 'bg-prime-500 shadow-prime-500/20' : 'bg-indigo-500 shadow-indigo-500/20'}`}><item.icon size={28} className="md:w-8 md:h-8" /></div>
                    <h3 className="text-lg md:text-3xl font-black tracking-tight">{item.title}</h3>
                 </div>
                 <p className="mt-6 md:mt-8 text-[10px] md:text-base font-medium opacity-70 leading-relaxed">{item.desc}</p>
              </div>
            ))}
         </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              { title: 'অফুরন্ত ধৈর্য্য', tag: 'Infinite Energy', desc: 'মানুষের ক্লান্তি আছে, কিন্তু আমাদের ইঞ্জিনের নেই। দিনে-রাতে হাজার হাজার কাস্টমারকে সার্ভিস দিতে এটি সর্বদা প্রস্তুত।', icon: Cpu, color: 'prime' },
              { title: 'ইমোশনাল ইন্টেলিজেন্স', tag: 'Heartbeat Engine', desc: 'কাস্টমারের ভাষা এবং মুড বুঝে উত্তর দেয়। এটি কথা বলে ঠিক আপনার সেরা সেলসপার্সনের মতো।', icon: Sparkles, color: 'prime' },
              { title: 'সফল কনভার্সন', tag: 'Direct Growth', desc: 'এটি কাস্টমারকে পেমেন্ট লিঙ্ক পাঠানো এবং অর্ডার কনফার্ম করা পর্যন্ত প্রতিটি ধাপ নিজে থেকেই সম্পন্ন করে।', icon: TrendingUp, color: 'indigo' }
            ].map((item, i) => (
              <div key={i} className={`group p-10 rounded-[4rem] border transition-all duration-500 hover:scale-[1.02] ${isDarkMode ? 'bg-white/[0.02] border-white/5 shadow-2xl' : 'bg-white border-black/5 shadow-xl'}`}>
                 <div className={`mb-8 w-16 h-16 rounded-3xl flex items-center justify-center transition-transform group-hover:rotate-6 ${item.color === 'prime' ? 'bg-prime-500/10 text-prime-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                    <item.icon size={32} />
                 </div>
                 <div className="space-y-4">
                    <h4 className="text-2xl md:text-3xl font-black tracking-tight">{item.title}</h4>
                    <p className={`text-[11px] font-bold uppercase tracking-widest ${item.color === 'prime' ? 'text-prime-400' : 'text-indigo-400'}`}>{item.tag}</p>
                    <p className="text-sm md:text-base font-medium leading-relaxed opacity-80">{item.desc}</p>
                 </div>
              </div>
            ))}
         </div>
      </section>

      <BrandStoryteller isDarkMode={isDarkMode} />

      <section id="auth-gateway" className="max-w-xl mx-auto px-6 pb-40">
         <form onSubmit={handleSubmit} className={`p-10 md:p-14 rounded-[4rem] border transition-all duration-500 ${isDarkMode ? 'bg-[#0a0f1d]/60 border-white/10 shadow-3xl' : 'bg-white border-black/5 shadow-2xl'}`}>
            <div className="text-center mb-12">
               <h2 className="text-3xl font-black mb-3">Access Portal</h2>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 opacity-60">আপনার ব্র্যান্ডে প্রবেশ করুন</p>
            </div>
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-prime-500 ml-4">Command Center</label>
                  <input type="text" required placeholder="Brand Identity" className="w-full p-6 rounded-3xl bg-white/[0.03] border border-white/10 outline-none focus:border-prime-500/50 transition-all font-bold placeholder:opacity-30" value={brandName} onChange={e => setBrandName(e.target.value)} />
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-prime-500 ml-4">Secure Channel</label>
                  <input type="email" required placeholder="Operational Email" className="w-full p-6 rounded-3xl bg-white/[0.03] border border-white/10 outline-none focus:border-prime-500/50 transition-all font-bold placeholder:opacity-30" value={email} onChange={e => setEmail(e.target.value)} />
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-prime-500 ml-4">Auth Key</label>
                  <input type="password" required placeholder="••••••••" className="w-full p-6 rounded-3xl bg-white/[0.03] border border-white/10 outline-none focus:border-prime-500/50 transition-all font-bold tracking-widest" value={password} onChange={e => setPassword(e.target.value)} />
               </div>
               <button type="submit" className="w-full py-6 mt-4 rounded-3xl bg-prime-500 text-white font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(35,166,240,0.3)] hover:scale-[1.02] transition-transform active:scale-95">
                  {loading ? 'INITIALIZING...' : (isLogin ? 'ENTER COMMAND' : 'INITIALIZE')}
               </button>
               <div className="text-center pt-6">
                  <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
                     {isLogin ? 'Create Brand Identity' : 'Already have an Engine?'}
                  </button>
               </div>
            </div>
         </form>
      </section>

      {/* QUICK ACCESS: Admin shortcut */}
      <section className="max-w-xl mx-auto px-6 pb-20 -mt-16">
        <button
          onClick={() => {
            const userData = { email: 'riajfreelance@gmail.com', brandName: 'Skinzy' };
            localStorage.setItem('anzaar_user', JSON.stringify(userData));
            onAuthSuccess(userData);
          }}
          className="w-full py-5 rounded-3xl border border-prime-500/30 text-prime-400 font-black uppercase tracking-[0.3em] text-[10px] hover:bg-prime-500/10 transition-all"
        >
          ⚡ Quick Access — Skinzy Admin
        </button>
      </section>
    </div>
  );
};

export default AuthView;
