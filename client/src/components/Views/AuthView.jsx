import React, { useState, useEffect, useRef } from 'react';
import { Layout, Rocket, ArrowRight, ShieldCheck, Zap, Globe, MessageSquare, Database, Cpu, TrendingUp, Star, ChevronRight, CheckCircle2, BarChart3, Fingerprint, Layers, Sparkles } from 'lucide-react';
import { useBrand } from '../../context/BrandContext';

// --- Scroll Reveal Hook ---
const useScrollReveal = () => {
  const [revealed, setRevealed] = useState([]);
  const observer = useRef(null);

  useEffect(() => {
    observer.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setRevealed(prev => [...new Set([...prev, entry.target.id])]);
        }
      });
    }, { threshold: 0.1 });

    const sections = document.querySelectorAll('.reveal-section');
    sections.forEach(s => observer.current.observe(s));

    return () => observer.current?.disconnect();
  }, []);

  return revealed;
};

// --- Sub-Components ---
const MockLiveFeed = ({ isDarkMode }) => {
  const [logs, setLogs] = useState([
    "System Initialized: Core Intelligence Online",
    "Phonetic Bridge: Normalized 2,200+ variations",
    "Pattern Detected: Customer asking for location",
    "AI Learning: Draft created for 'Delivery Time'",
    "WhatsApp Sync: 12 new conversations processed",
    "Success: High-conversion pattern identified"
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(prev => {
        const first = prev[0];
        const rest = prev.slice(1);
        return [...rest, first];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`p-5 rounded-2xl border overflow-hidden relative ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-white border-black/5 shadow-inner'}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">System Logs</span>
      </div>
      <div className="space-y-2 h-20 relative">
        {logs.map((log, i) => (
          <div 
            key={i} 
            className="text-[9px] font-medium tracking-tight text-prime-400/70 animate-in slide-in-from-bottom-1 duration-700 flex items-center gap-2"
          >
            <ChevronRight size={8} className="text-gray-700" />
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

const SectionHeader = ({ tag, title, desc, isDarkMode, center }) => (
  <div className={`space-y-3 mb-10 ${center ? 'text-center' : ''}`}>
    <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-prime-500/80">
      {tag}
    </span>
    <h2 className={`text-3xl md:text-4xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {title}<span className="text-prime-500">;</span>
    </h2>
    <p className={`text-base max-w-xl font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ${center ? 'mx-auto' : ''}`}>
      {desc}
    </p>
  </div>
);

const LiveAutoReplySlider = ({ isDarkMode }) => {
  const interactions = [
    { q: "bhai delivery charge koto?", a: "ঢাকার মধ্যে ৬০ টাকা, ঢাকার বাইরে ১২০ টাকা।", tag: "Logistics" },
    { q: "size 42 hobe naki??", a: "জি, ৪২ সাইজ এখনো স্টকে আছে। অর্ডার করতে ইনবক্স করুন।", tag: "Inventory" },
    { q: "apnadr shop kothay?", a: "আমাদের শোরুম পান্থপথ সিগন্যালে, সিটি সেন্টারের ৪ তলায়।", tag: "Location" },
    { q: "dam ki kom hobe?", a: "আমাদের সব দাম ফিক্সড, স্যার। সেরা কোয়ালিটি নিশ্চিত করছি।", tag: "Pricing" },
    { q: "products kobe pabo?", a: "অর্ডার কনফার্ম করার ২-৩ কার্যদিবসের মধ্যে ডেলিভারি পাবেন।", tag: "Shipping" },
    { q: "exchange kora jabe?", a: "জি, ৭ দিনের মধ্যে আনইউজড প্রোডাক্ট এক্সচেঞ্জ করা যাবে।", tag: "Policy" }
  ];

  const [index, setIndex] = useState(0);
  const [showResponse, setShowResponse] = useState(false);
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    let timeoutId;
    const sequence = async () => {
      // 1. Reset
      setShowResponse(false);
      setIsMatching(false);

      // 2. Initial Wait
      await new Promise(r => setTimeout(r, 600));

      // 3. Customer message 'Magnatic Pop'
      await new Promise(r => setTimeout(r, 1400));
      
      // 4. Engine 'Matches' intent (High speed)
      setIsMatching(true);
      await new Promise(r => setTimeout(r, 600)); 
      setIsMatching(false);
      
      // 5. Instant Magic Reveal
      setShowResponse(true);
      
      // 6. Pause for impact
      await new Promise(r => setTimeout(r, 4500));
      
      // 7. Loop
      setIndex(prev => (prev + 1) % interactions.length);
    };

    sequence();
    return () => clearTimeout(timeoutId);
  }, [index]);

  const current = interactions[index];

  return (
    <div className="relative mt-12 max-w-2xl mx-auto px-4">
      <style>{`
        @keyframes magnetic-pop {
          0% { transform: translateY(30px) scale(0.6); opacity: 0; }
          45% { transform: translateY(-10px) scale(1.08); opacity: 1; }
          70% { transform: translateY(2px) scale(0.98); }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-magnetic-pop {
          animation: magnetic-pop 0.7s cubic-bezier(0.23, 1, 0.32, 1) both;
        }
        @keyframes magic-reveal {
          0% { transform: scale(0.95); opacity: 0; filter: blur(10px); }
          100% { transform: scale(1); opacity: 1; filter: blur(0); }
        }
        .animate-magic-reveal {
          animation: magic-reveal 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
      `}</style>

      <div className="flex items-center justify-center gap-2 mb-10 opacity-30">
        <div className="h-[1px] w-12 bg-gray-500" />
        <div className="flex items-center gap-2">
           <div className={`w-1 h-1 rounded-full bg-prime-500 ${isMatching ? 'animate-ping' : ''}`} />
           <span className="text-[8px] font-bold uppercase tracking-[0.4em]">Autonomous Instant Exchange</span>
        </div>
        <div className="h-[1px] w-12 bg-gray-500" />
      </div>
      
      <div className="relative min-h-[400px] flex flex-col justify-between">
        <div className="flex flex-col gap-6">
          {/* Customer Message - Magnetic Snap */}
          <div className="animate-magnetic-pop">
            <div className={`p-4 rounded-2xl border self-start max-w-[85%] shadow-sm ${isDarkMode ? 'bg-white/[0.03] border-white/5' : 'bg-white border-black/5'}`}>
              <div className="flex items-center gap-2 mb-1.5 opacity-50">
                 <MessageSquare size={10} />
                 <span className="text-[8px] font-bold uppercase tracking-widest">Customer</span>
              </div>
              <p className="text-sm font-medium italic opacity-90 leading-relaxed">"{current.q}"</p>
            </div>
          </div>

          {/* Engine Action Phase */}
          {isMatching && (
             <div className="flex items-center gap-3 px-4 py-1 text-prime-500 animate-pulse">
                <div className="relative">
                   <Cpu size={12} className="animate-spin-slow" />
                   <div className="absolute inset-0 bg-prime-500 blur-md opacity-20 animate-ping" />
                </div>
                <span className="text-[8px] font-bold uppercase tracking-[0.25em] italic">Instant Recognition...</span>
             </div>
          )}

          {/* Bot Response - Instant Magic Block Reveal */}
          {showResponse && (
            <div className="self-end max-w-[85%] animate-magic-reveal">
              <div className={`relative overflow-hidden p-4 rounded-2xl border border-prime-500/30 shadow-2xl shadow-prime-500/10 ${isDarkMode ? 'bg-prime-500/10' : 'bg-prime-50/90 font-medium'}`}>
                <div className="flex items-center justify-between gap-6 mb-2">
                   <div className="flex items-center gap-2 text-prime-500">
                      <Sparkles size={10} />
                      <span className="text-[8px] font-bold uppercase tracking-widest leading-none">Instant Intelligence</span>
                   </div>
                   <span className="text-[7px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-prime-500/30 text-prime-500 border border-prime-500/40">Auto-Resolved</span>
                </div>
                <p className="text-sm font-bold text-prime-500 leading-relaxed">"{current.a}"</p>
              </div>
            </div>
          )}
        </div>

        {/* PERSISTENT CONVERSATION INPUT BOX */}
        <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
           <div className={`p-3 rounded-2xl border flex items-center justify-between gap-4 ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-white border-black/5 shadow-inner'}`}>
              <div className="flex items-center gap-3 flex-1 px-2">
                 <div className={`w-2 h-2 rounded-full ${isMatching ? 'bg-prime-500 animate-ping' : 'bg-gray-500 opacity-30 shadow-[0_0_8px_rgba(0,0,0,0.1)]'}`} />
                 <span className="text-[10px] font-medium opacity-30 italic">Autonomous Engine waiting for inbound...</span>
              </div>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-black/5'}`}>
                 <div className="w-4 h-[1px] bg-prime-500 opacity-20" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

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
        onAuthSuccess({ email, brandName });
        await registerBrand(brandName);
      } else {
        onAuthSuccess({ email, brandName: 'Default Brand' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isRevealed = (id) => revealed.includes(id);

  return (
    <div className={`min-h-screen relative overflow-x-hidden selection:bg-prime-500 selection:text-white ${isDarkMode ? 'bg-[#020617] text-white' : 'bg-slate-50 text-gray-900'}`}>
      
      {/* Subtle Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-prime-600/[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/[0.03] blur-[120px] rounded-full" />
      </div>

      {/* --- Minimal Header --- */}
      <header className={`fixed top-0 left-0 right-0 z-[100] px-8 py-5 transition-all border-b border-transparent ${isDarkMode ? 'bg-[#020617]/40 border-white/[0.03] backdrop-blur-xl' : 'bg-white/70 border-black/[0.03] backdrop-blur-md'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-prime-500 rounded-lg flex items-center justify-center shadow-md">
              <Cpu className="text-white" size={16} />
            </div>
            <h1 className="text-sm font-bold tracking-[0.2em] uppercase">META <span className="text-prime-500">BIZ</span></h1>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => document.getElementById('auth-gateway').scrollIntoView({ behavior: 'smooth' })} className="hidden md:flex flex-col items-end group">
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-prime-500 transition-colors">portal access</span>
              <span className="text-[7px] font-medium text-gray-700 italic opacity-0 group-hover:opacity-100 transition-opacity">পোর্টালে প্রবেশ</span>
            </button>
            <button 
              onClick={() => document.getElementById('auth-gateway').scrollIntoView({ behavior: 'smooth' })}
              className="relative overflow-hidden px-6 py-2.5 bg-prime-500 text-white rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-prime-600 transition-all select-none group/launch shadow-lg shadow-prime-500/20"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/launch:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
              <div className="flex flex-col items-center">
                <span>LAUNCH</span>
                <span className="text-[6.5px] font-medium opacity-70 tracking-normal mt-0.5">শুরু করুন</span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[90vh] pt-32 pb-16 px-6 flex flex-col items-center justify-center text-center">
        <div className="relative z-10 max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
           <div className="inline-block px-4 py-1.5 rounded-full bg-prime-500/[0.05] border border-prime-500/[0.08] text-prime-500 text-[9px] font-bold uppercase tracking-[0.4em]">
              Autonomous Growth Engine v2.4
           </div>
           
           <h2 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
              Scaling without<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-prime-400 via-indigo-400 to-prime-400 animate-gradient-x px-1">friction</span>.
           </h2>
           <div className="flex flex-col items-center gap-1 opacity-60">
             <p className="text-[11px] font-bold uppercase tracking-[0.5em] text-prime-500">সীমহীন প্রবৃদ্ধি</p>
           </div>

           <p className={`text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              The world's most advanced autonomous commerce engine for the Bangladesh market. 
              <span className="block mt-1 text-sm opacity-80 italic">বাংলাদেশি ব্র্যান্ডের জন্য বিশ্বের সবচেয়ে উন্নত অটোনোমাস কমার্স ইঞ্জিন।</span>
           </p>

           <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
               <button 
                 onClick={() => document.getElementById('auth-gateway').scrollIntoView({ behavior: 'smooth' })}
                 className="relative overflow-hidden w-full sm:w-auto px-12 py-5 bg-prime-500 text-white rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-prime-600 hover:-translate-y-1 transition-all shadow-2xl shadow-prime-500/30 group/hero-btn active:scale-95"
               >
                 <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/hero-btn:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                 <div className="flex flex-col items-center gap-0.5">
                   <span>INITIALIZE NOW</span>
                   <span className="text-[8px] font-medium opacity-70 tracking-widest lowercase">এখনই শুরু করুন</span>
                 </div>
               </button>
              <button className={`w-full sm:w-auto px-10 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-black/5'}`}>
                 EXPLORE DOCS
              </button>
           </div>
        </div>

        <div className="mt-16 animate-bounce opacity-10">
           <ChevronRight size={24} className="rotate-90" />
        </div>
      </section>

      {/* --- RE-LOCATED: WORKFLOW & HASSLE-FREE --- */}
      <section id="workflow" className={`reveal-section max-w-6xl mx-auto px-6 mb-32 transition-all duration-1000 ${isRevealed('workflow') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
         <SectionHeader 
           tag="The Process" 
           title="Hassle-Free Automation" 
           desc="We take the manual work out of commerce. Our system operates as a zero-effort layer between your brand and your customers." 
           isDarkMode={isDarkMode} 
           center
         />
         <div className="text-center -mt-8 mb-10 opacity-40">
           <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-prime-500">ঝামেলামুক্ত অটোমেশন</p>
         </div>
         
          <div className={`mt-10 p-8 md:p-12 rounded-[2.5rem] border ${isDarkMode ? 'bg-white/[0.01] border-white/5' : 'bg-white border-black/5 shadow-sm'}`}>
             
             {/* LIVE SIMULATION SLIDER (CONVERSATION PANELS ON TOP) */}
             <div className="mb-16">
                <LiveAutoReplySlider isDarkMode={isDarkMode} />
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative items-start">
                {/* Connection Line (Desktop) */}
                <div className="hidden md:block absolute top-7 left-0 right-0 h-[1px] bg-gradient-to-r from-prime-500/0 via-prime-500/20 to-prime-500/0 z-0" />
                
                {[
                  { step: '01', title: 'Inbound', desc: 'Customer sends a message in any script.', icon: MessageSquare },
                  { step: '02', title: 'Bridge', desc: 'Phonetic engine normalizes the intent.', icon: Sparkles },
                  { step: '03', title: 'Resolve', desc: 'AI selects the perfect verified draft.', icon: Cpu },
                  { step: '04', title: 'Scale', desc: 'Instant response, zero manual input.', icon: Rocket }
                ].map((item, i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center text-center space-y-4">
                     <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all group hover:border-prime-500/50 ${isDarkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-black/5'}`}>
                        <item.icon size={20} className="text-prime-500" />
                     </div>
                     <div>
                        <span className="text-[8px] font-bold text-prime-500 tracking-widest uppercase">{item.step}</span>
                        <h4 className="text-sm font-bold tracking-tight mt-1">{item.title}</h4>
                        <p className="text-[10px] text-gray-500 mt-2 max-w-[150px] mx-auto leading-relaxed">{item.desc}</p>
                     </div>
                  </div>
                ))}
             </div>
             
             <div className="mt-12 pt-10 border-t border-white/[0.03] text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/[0.05] border border-emerald-500/10 text-emerald-500 text-[9px] font-bold uppercase tracking-widest">
                   <ShieldCheck size={12} />
                   Brand Peace of Mind Guaranteed
                </div>
             </div>
          </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 space-y-32 pb-32">
        
        {/* --- STATS GRID --- */}
        <section id="stats" className={`reveal-section grid grid-cols-1 sm:grid-cols-3 gap-6 transition-all duration-1000 ${isRevealed('stats') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
           {[
             { label: 'Intelligence Variations', value: '2,200+', icon: Layers, color: 'text-prime-500' },
             { label: 'Matching Accuracy', value: '98.4%', icon: Fingerprint, color: 'text-emerald-500' },
             { label: 'Commerce Growth', value: '+340%', icon: TrendingUp, color: 'text-indigo-500' }
           ].map((stat, i) => (
             <div key={i} className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-white/[0.02] border-white/5 shadow-sm' : 'bg-white border-black/5 shadow-sm'}`}>
               <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-5 ${stat.color}`}>
                 <stat.icon size={20} />
               </div>
               <h3 className="text-4xl font-bold tracking-tight mb-1">{stat.value}</h3>
               <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">{stat.label}</p>
             </div>
           ))}
        </section>

        {/* --- FEATURE: PHONETIC BRIDGE --- */}
        <section id="phonetic" className={`reveal-section grid grid-cols-1 lg:grid-cols-2 gap-16 items-center transition-all duration-1000 ${isRevealed('phonetic') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
           <div className="space-y-6">
              <SectionHeader 
                tag="Core Intelligence" 
                title="Phonetic Bridge" 
                desc="Bridging the gap between script variations. Our engine understands your customers perfectly, handling Banglish and native Bengali variations with sub-millisecond precision." 
                isDarkMode={isDarkMode} 
              />
              <div className="opacity-40 -mt-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-prime-500">ফনেটিক ব্রিজ</p>
              </div>
              <div className="space-y-3">
                 {[
                   'Automated Romanized to Native translation',
                   'Dialect and slang normalization',
                   'Zero-latency fuzzy matching',
                 ].map((feat, i) => (
                   <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span className="text-sm font-medium opacity-70 italic">{feat}</span>
                   </div>
                 ))}
              </div>
           </div>
           <div className={`p-8 rounded-3xl border relative overflow-hidden backdrop-blur-sm ${isDarkMode ? 'bg-black/10 border-white/5' : 'bg-white border-black/5'}`}>
              <div className="relative z-10 space-y-4">
                 <div className="flex justify-between items-center p-5 bg-prime-500/[0.03] rounded-2xl border border-prime-500/10">
                    <div>
                       <p className="text-[7px] font-bold uppercase tracking-widest text-gray-500 mb-1">Input</p>
                       <p className="text-base font-bold italic">"bhai dam koto??"</p>
                    </div>
                    <ArrowRight className="text-prime-400" size={16} />
                    <div className="text-right">
                       <p className="text-[7px] font-bold uppercase tracking-widest text-gray-500 mb-1">Bridge</p>
                       <p className="text-base font-bold italic text-prime-400">"ভাই দাম কত?"</p>
                    </div>
                 </div>
                 <div className="p-4 bg-emerald-500/[0.03] rounded-2xl border border-emerald-500/10">
                    <p className="text-[7px] font-bold uppercase tracking-widest text-gray-500 mb-2 text-center">Engine Match Performance</p>
                    <div className="h-1 w-full bg-gray-500/10 rounded-full">
                       <div className="h-full w-[99%] bg-emerald-500/70" />
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* --- FEATURE: AUTONOMOUS SCALE --- */}
        <section id="scale" className={`reveal-section grid grid-cols-1 lg:grid-cols-2 gap-16 items-center transition-all duration-1000 ${isRevealed('scale') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
           <div className="order-2 lg:order-1">
              <MockLiveFeed isDarkMode={isDarkMode} />
           </div>
           <div className="space-y-6 order-1 lg:order-2">
              <SectionHeader 
                tag="Operational Scale" 
                title="Autonomous Index" 
                desc="Scale without recurring costs. Every rule you define automatically expands into hundreds of variations, creating a high-performance knowledge net without extra effort." 
                isDarkMode={isDarkMode} 
              />
              <div className="opacity-40 -mt-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-prime-500">অটোনোমাস ইনডেক্স</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-white/[0.01] border-white/5' : 'bg-white border-black/5'}`}>
                    <Zap className="text-prime-500 mb-3" size={16} />
                    <h4 className="font-bold text-[9px] uppercase tracking-widest mb-1">Generative</h4>
                    <p className="text-[8px] text-gray-500">100+ variations per rule.</p>
                 </div>
                 <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-white/[0.01] border-white/5' : 'bg-white border-black/5'}`}>
                    <Database className="text-indigo-500 mb-3" size={16} />
                    <h4 className="font-bold text-[9px] uppercase tracking-widest mb-1">Edge Net</h4>
                    <p className="text-[8px] text-gray-500">Sub-second local lookups.</p>
                 </div>
              </div>
           </div>
        </section>


        {/* --- FINAL CTA: AUTH GATEWAY --- */}
        <section id="auth-gateway" className={`reveal-section pt-16 transition-all duration-1000 ${isRevealed('auth-gateway') ? 'opacity-100 scale-100' : 'opacity-0 scale-98'}`}>
           <div className="max-w-4xl mx-auto flex flex-col items-center">
              <div className="text-center mb-12">
                 <h2 className={`text-4xl md:text-5xl font-extrabold tracking-tight mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Access Command <span className="text-prime-500">Portal</span>
                 </h2>
                 <p className="text-gray-500 font-bold uppercase tracking-[0.4em] text-[9.5px] mb-1">Secure Engine Gateway</p>
                 <p className="text-[10px] font-medium text-prime-500/60 italic tracking-wide">কমান্ড পোর্টালে প্রবেশ করুন</p>
              </div>

              <div className={`w-full max-w-lg p-1 pt-1 rounded-[2.8rem] bg-gradient-to-br from-prime-500/20 via-transparent to-indigo-500/20 p-[1px] relative group/auth-card`}>
                {/* Dynamic Glow Background */}
                <div className="absolute -inset-10 bg-prime-500/5 blur-[100px] rounded-full opacity-0 group-hover/auth-card:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                
                <div className={`relative overflow-hidden p-8 md:p-12 rounded-[2.8rem] border border-white/10 backdrop-blur-3xl transition-all duration-700 shadow-2xl ${
                  isDarkMode ? 'bg-[#020617]/80' : 'bg-white/90 shadow-prime-500/5'
                }`}>
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-prime-500 via-indigo-500 to-prime-500 opacity-20" />
                
                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                    <div className="space-y-2 group/input">
                      <div className="flex justify-between items-end px-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Brand Identifier</label>
                        <span className="text-[8px] font-medium text-gray-600 italic">ব্র্যান্ডের নাম</span>
                      </div>
                      <div className="relative">
                        <input 
                          type="text" required placeholder="Skinzy" value={brandName}
                          onChange={(e) => setBrandName(e.target.value)}
                          className={`w-full p-4.5 rounded-2xl outline-none border text-sm transition-all pr-12 ${
                            isDarkMode ? 'bg-white/[0.03] border-white/5 focus:border-prime-500/40 focus:bg-white/[0.05]' : 'bg-gray-50 border-black/5 focus:border-prime-500/40'
                          }`}
                        />
                        <Layout size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/input:text-prime-500 transition-colors" />
                      </div>
                    </div>
                  <div className="space-y-2 group/input">
                    <div className="flex justify-between items-end px-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Commander Email</label>
                      <span className="text-[8px] font-medium text-gray-600 italic">ইমেইল এড্রেস</span>
                    </div>
                    <div className="relative">
                      <input 
                        type="email" required placeholder="riaj@metasolution.com" value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full p-4.5 rounded-2xl outline-none border text-sm transition-all pr-12 ${
                          isDarkMode ? 'bg-white/[0.03] border-white/5 focus:border-prime-500/40 focus:bg-white/[0.05]' : 'bg-gray-50 border-black/5 focus:border-prime-500/40'
                        }`}
                      />
                      <MessageSquare size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/input:text-prime-500 transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-2 group/input">
                    <div className="flex justify-between items-end px-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Secure Key</label>
                      <span className="text-[8px] font-medium text-gray-600 italic">সিকিউরিটি পাসওয়ার্ড</span>
                    </div>
                    <div className="relative">
                      <input 
                        type="password" required placeholder="••••••••" value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full p-4.5 rounded-2xl outline-none border text-sm transition-all pr-12 ${
                          isDarkMode ? 'bg-white/[0.03] border-white/5 focus:border-prime-500/40 focus:bg-white/[0.05]' : 'bg-gray-50 border-black/5 focus:border-prime-500/40'
                        }`}
                      />
                      <ShieldCheck size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/input:text-prime-500 transition-colors" />
                    </div>
                  </div>

                  <button 
                    type="submit" disabled={loading}
                    className={`w-full py-5 rounded-[1.4rem] font-bold uppercase tracking-[0.2em] text-[10px] text-white bg-gradient-to-r from-prime-500 to-indigo-600 hover:to-prime-600 shadow-xl shadow-prime-500/20 active:scale-[0.98] transition-all mt-6 flex items-center justify-center gap-4 group/btn overflow-hidden relative`}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                    {loading ? <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><span>{isLogin ? 'ENTER COMMAND' : 'INITIALIZE BRAND'}</span><ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" /></>}
                  </button>
                </form>

                <div className="mt-8 text-center relative z-10 flex flex-col items-center gap-1">
                  <button onClick={() => setIsLogin(!isLogin)} className="text-[8.5px] uppercase font-bold tracking-[0.2em] text-gray-500 hover:text-prime-400 transition-colors">
                    {isLogin ? "Generate New Instance" : "Commander Access"}
                  </button>
                  <p className="text-[7.5px] font-bold text-gray-700 uppercase tracking-widest">{isLogin ? "নতুন একাউন্ট তৈরি করুন" : "আগের একাউন্টে ফিরে যান"}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- MINIMAL FOOTER --- */}
        <footer className="pt-16 border-t border-white/[0.03] flex flex-col sm:flex-row justify-between items-center gap-6 text-center sm:text-left opacity-40">
           <div>
              <h4 className="text-xs font-bold tracking-[0.2em] uppercase mb-1">META BIZ</h4>
              <p className="text-[8px] font-bold uppercase tracking-widest">Growth Engine v2.4.0</p>
           </div>
           <p className="text-[8px] font-bold uppercase tracking-widest">© 2026 META SOLUTION</p>
        </footer>

      </div>
    </div>
  );
};

export default AuthView;
