import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Zap, Shield, TrendingUp, MessageSquare, Star, Check, ArrowRight, Sparkles, Crown, Rocket, Users, BarChart3, Clock, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import { useBrand } from '../../context/BrandContext';

// --- Animated Counter Hook ---
const useAnimatedCounter = (end, duration = 2000, startOnView = true) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(!startOnView);
  const ref = useRef(null);

  useEffect(() => {
    if (!startOnView) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasStarted) {
        setHasStarted(true);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [startOnView, hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration, hasStarted]);

  return { count, ref };
};

// --- Live Chat Demo (Enhanced) ---
const LiveChatDemo = ({ isDarkMode }) => {
  const messages = [
    { type: 'user', text: 'bhai delivery charge koto?', time: '2m ago' },
    { type: 'bot', text: 'ঢাকার মধ্যে ৬০ টাকা, ঢাকার বাইরে ১২০ টাকা। অর্ডার করবেন?', time: '2m ago', delay: 1500 },
    { type: 'user', text: 'jio, order korbo', time: '1m ago', delay: 3000 },
    { type: 'bot', text: '✅ অর্ডার কনফার্ম! নাম, ঠিকানা ও ফোন নম্বর দিন।', time: '1m ago', delay: 4500 },
  ];

  const [visibleMessages, setVisibleMessages] = useState([0]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const sequence = async () => {
      for (let i = 1; i < messages.length; i++) {
        await new Promise(r => setTimeout(r, messages[i].delay || 2000));
        setIsTyping(true);
        await new Promise(r => setTimeout(r, 800));
        setIsTyping(false);
        setVisibleMessages(prev => [...prev, i]);
      }
      // Reset after showing all
      await new Promise(r => setTimeout(r, 5000));
      setVisibleMessages([0]);
    };
    sequence();
    const interval = setInterval(sequence, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border ${isDarkMode ? 'bg-[#0a0f1d]/80 border-white/10' : 'bg-white border-black/10'}`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'bg-gradient-to-r from-prime-600/20 to-indigo-600/20 border-white/10' : 'bg-gradient-to-r from-prime-50 to-indigo-50 border-black/5'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-prime-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <MessageSquare size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <h4 className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>MetaSolution Bot</h4>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-green-500 uppercase tracking-wider">Online • Auto-Replying</span>
            </div>
          </div>
          <Zap size={16} className="text-prime-500 animate-pulse" />
        </div>
      </div>

      {/* Messages */}
      <div className={`p-6 space-y-4 min-h-[320px] max-h-[320px] overflow-y-auto ${isDarkMode ? 'bg-[#020617]' : 'bg-gray-50'}`}>
        {visibleMessages.map((msgIdx) => {
          const msg = messages[msgIdx];
          const isUser = msg.type === 'user';
          return (
            <div key={msgIdx} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                isUser 
                  ? 'bg-gradient-to-br from-prime-500 to-prime-600 text-white rounded-br-md shadow-lg shadow-prime-500/20'
                  : isDarkMode
                    ? 'bg-white/10 text-white rounded-bl-md border border-white/5'
                    : 'bg-white text-gray-900 rounded-bl-md border border-black/5 shadow-md'
              }`}>
                <p className="text-xs font-medium leading-relaxed">{msg.text}</p>
                <p className={`text-[8px] mt-1.5 ${isUser ? 'text-white/60' : 'text-gray-500'}`}>{msg.time}</p>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-200">
            <div className={`px-4 py-3 rounded-2xl rounded-bl-md ${isDarkMode ? 'bg-white/10' : 'bg-white border border-black/5'}`}>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-prime-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-prime-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-prime-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className={`p-4 border-t flex items-center justify-between ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'}`}>
        <div className="flex items-center gap-2">
          <Clock size={12} className="text-prime-500" />
          <span className="text-[9px] font-black text-prime-500 uppercase tracking-wider">Avg Response: 0.3s</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 size={12} className="text-green-500" />
          <span className="text-[9px] font-black text-green-500 uppercase tracking-wider">99.8% Accuracy</span>
        </div>
      </div>
    </div>
  );
};

// --- Pricing Card ---
const PricingCard = ({ tier, price, features, isPopular, isDarkMode, badge }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative rounded-3xl p-8 transition-all duration-500 border ${
        isPopular
          ? 'bg-gradient-to-br from-prime-500/20 via-indigo-500/20 to-prime-500/20 border-prime-500/50 shadow-2xl shadow-prime-500/20 scale-105'
          : isDarkMode
            ? 'bg-white/5 border-white/10 hover:border-prime-500/30'
            : 'bg-white border-black/10 hover:border-prime-500/30 shadow-lg'
      } ${isHovered ? 'scale-105' : ''}`}
    >
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-prime-500 to-indigo-500 rounded-full shadow-lg">
          <span className="text-[9px] font-black text-white uppercase tracking-widest">{badge}</span>
        </div>
      )}

      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          {tier === 'Starter' && <Rocket size={20} className="text-blue-500" />}
          {tier === 'Pro' && <Star size={20} className="text-prime-500" />}
          {tier === 'Elite' && <Crown size={20} className="text-purple-500" />}
          {tier === 'God Mode' && <Sparkles size={20} className="text-amber-500" />}
          <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{tier}</h3>
        </div>
        <div className="flex items-baseline justify-center gap-1">
          <span className={`text-5xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>৳{price}</span>
          <span className="text-sm font-bold text-gray-500">/mo</span>
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            <Check size={14} className="text-green-500 shrink-0 mt-0.5" />
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{feature}</span>
          </li>
        ))}
      </ul>

      <button className={`w-full py-4 rounded-2xl font-black uppercase tracking-wider text-xs transition-all ${
        isPopular
          ? 'bg-gradient-to-r from-prime-500 to-indigo-500 text-white shadow-lg hover:shadow-xl hover:scale-105'
          : isDarkMode
            ? 'bg-white/10 text-white hover:bg-prime-500/20'
            : 'bg-gray-900 text-white hover:bg-prime-500'
      }`}>
        Get Started
      </button>
    </div>
  );
};

// --- Main AuthView ---
const AuthView = ({ onAuthSuccess, isDarkMode }) => {
  const { registerBrand } = useBrand();
  const [isLogin, setIsLogin] = useState(true);
  const [brandName, setBrandName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { count: usersCount, ref: usersRef } = useAnimatedCounter(12847, 2500);
  const { count: revenueCount, ref: revenueRef } = useAnimatedCounter(50, 2000);
  const { count: messagesCount, ref: messagesRef } = useAnimatedCounter(2, 1500);

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

  const pricingTiers = [
    {
      tier: 'Starter',
      price: '0',
      features: ['1 Brand', '100 Auto-Replies/mo', 'Basic Analytics', 'Email Support', 'Standard Response Time'],
      badge: null,
    },
    {
      tier: 'Pro',
      price: '2,999',
      features: ['3 Brands', 'Unlimited Auto-Replies', 'Advanced Analytics', 'Priority Support', 'AI Learning Mode', 'Custom Branding'],
      badge: 'MOST POPULAR',
      isPopular: true,
    },
    {
      tier: 'Elite',
      price: '9,999',
      features: ['10 Brands', 'Everything in Pro', 'WhatsApp Integration', 'Instagram DM Auto', 'Vector Search AI', 'Team Collaboration', 'API Access'],
      badge: 'BEST VALUE',
    },
    {
      tier: 'God Mode',
      price: '24,999',
      features: ['Unlimited Brands', 'Everything in Elite', 'Dedicated Account Manager', 'Custom AI Training', 'White-Label Solution', '24/7 Phone Support', 'SLA Guarantee'],
      badge: 'ULTIMATE',
    },
  ];

  return (
    <div className={`min-h-screen relative overflow-x-hidden ${isDarkMode ? 'bg-[#020617] text-white' : 'bg-slate-50 text-gray-900'}`}>
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-prime-600/[0.08] blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/[0.08] blur-[150px] rounded-full animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-purple-600/[0.05] blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-[100] px-8 py-4 transition-all border-b border-transparent ${isDarkMode ? 'bg-[#020617]/60 border-white/[0.05] backdrop-blur-2xl' : 'bg-white/80 border-black/[0.02] backdrop-blur-xl'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-prime-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-prime-500/30">
              <Cpu className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-[0.2em] uppercase leading-none">META <span className="text-prime-500">SOLUTION</span></h1>
              <span className="text-[8px] font-bold uppercase tracking-widest text-gray-500">Business Automation Engine</span>
            </div>
          </div>
          <button
            onClick={() => document.getElementById('auth-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-6 py-2.5 bg-gradient-to-r from-prime-500 to-indigo-500 text-white rounded-xl text-[9px] font-black uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Start Free Trial
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-prime-500/10 border border-prime-500/20">
                  <Zap size={14} className="text-prime-500" />
                  <span className="text-[9px] font-black text-prime-500 uppercase tracking-widest">AI-Powered Automation</span>
                </div>
                <h1 className={`text-5xl md:text-7xl font-black leading-tight tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Automate Your
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-prime-400 via-indigo-400 to-prime-500">Business Growth</span>
                </h1>
                <p className={`text-lg font-medium leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  ২৪/৭ অটোমেটেড ইনবক্স ম্যানেজমেন্ট। কাস্টমার মেসেজের উত্তর দিন চোখের পলকে, সেলস বাড়ান automatcially।
                </p>
              </div>

              {/* Stats */}
              <div ref={usersRef} className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{usersCount.toLocaleString()}+</div>
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mt-1">Active Users</div>
                </div>
                <div ref={revenueRef} className="text-center">
                  <div className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>৳{revenueCount}M+</div>
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mt-1">Revenue Generated</div>
                </div>
                <div ref={messagesRef} className="text-center">
                  <div className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{messagesCount}M+</div>
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mt-1">Messages Handled</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => document.getElementById('auth-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex-1 py-4 px-8 bg-gradient-to-r from-prime-500 to-indigo-500 text-white rounded-2xl font-black uppercase tracking-wider text-sm shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  Start Free Trial <ArrowRight size={16} />
                </button>
                <button className={`px-8 py-4 rounded-2xl font-black uppercase tracking-wider text-sm border transition-all ${isDarkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-black/20 text-gray-900 hover:bg-gray-100'}`}>
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Right - Live Chat Demo */}
            <div className="relative">
              <LiveChatDemo isDarkMode={isDarkMode} />
              {/* Floating badges */}
              <div className={`absolute -top-4 -right-4 px-4 py-2 rounded-2xl shadow-lg animate-bounce ${isDarkMode ? 'bg-green-500/20 border border-green-500/30' : 'bg-green-100 border border-green-200'}`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-green-500" />
                  <span className="text-[9px] font-black text-green-500 uppercase tracking-wider">Auto-Replying...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className={`text-4xl md:text-6xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Why Choose <span className="text-prime-500">MetaSolution</span>?
            </h2>
            <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              আপনার ব্যবসাকে নিয়ে যান অটোমেশনের পরবর্তী পর্যায়ে
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: MessageSquare, title: 'Smart Inbox', desc: 'বাংলা, বাংলিশ, English - সব ভাষায় auto-reply', color: 'from-blue-500 to-blue-600' },
              { icon: Zap, title: 'Instant Response', desc: '0.3 সেকেন্ডে reply, কাস্টমার পাবে না waiting', color: 'from-prime-500 to-prime-600' },
              { icon: TrendingUp, title: 'Sales Automation', desc: 'Order থেকে delivery - সব automated', color: 'from-green-500 to-green-600' },
              { icon: Shield, title: 'Enterprise Security', desc: 'Bank-level encryption, 100% data safe', color: 'from-purple-500 to-purple-600' },
              { icon: BarChart3, title: 'Real-time Analytics', desc: 'Track conversions, revenue, performance', color: 'from-amber-500 to-amber-600' },
              { icon: Users, title: 'Team Collaboration', desc: 'Multiple admins, role-based access', color: 'from-pink-500 to-pink-600' },
            ].map((feature, i) => (
              <div key={i} className={`group p-8 rounded-3xl border transition-all duration-500 hover:scale-105 ${isDarkMode ? 'bg-white/5 border-white/10 hover:border-prime-500/30' : 'bg-white border-black/10 hover:border-prime-500/30 shadow-lg'}`}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon size={24} className="text-white" />
                </div>
                <h3 className={`text-xl font-black mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-prime-500/10 border border-prime-500/20">
              <Crown size={14} className="text-prime-500" />
              <span className="text-[9px] font-black text-prime-500 uppercase tracking-widest">Choose Your Plan</span>
            </div>
            <h2 className={`text-4xl md:text-6xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Simple, Transparent <span className="text-prime-500">Pricing</span>
            </h2>
            <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingTiers.map((tier, i) => (
              <PricingCard key={i} {...tier} isDarkMode={isDarkMode} />
            ))}
          </div>
        </div>
      </section>

      {/* Auth Form Section */}
      <section id="auth-form" className="py-20 px-6">
        <div className="max-w-xl mx-auto">
          <div className={`p-10 md:p-12 rounded-[2.5rem] border shadow-2xl ${isDarkMode ? 'bg-[#0a0f1d]/80 border-white/10 backdrop-blur-xl' : 'bg-white border-black/10'}`}>
            <div className="text-center mb-8 space-y-2">
              <h2 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {isLogin ? 'Welcome Back' : 'Start Your Journey'}
              </h2>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {isLogin ? 'আপনার অ্যাকাউন্টে লগইন করুন' : '14-day free trial, no credit card required'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <label className={`text-[9px] font-black uppercase tracking-widest ml-2 ${isDarkMode ? 'text-prime-500' : 'text-prime-600'}`}>Brand Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Your Brand"
                    className={`w-full p-4 rounded-2xl border outline-none transition-all font-medium ${isDarkMode ? 'bg-white/5 border-white/10 focus:border-prime-500 text-white placeholder-gray-500' : 'bg-gray-50 border-black/10 focus:border-prime-500 text-gray-900 placeholder-gray-400'}`}
                    value={brandName}
                    onChange={e => setBrandName(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className={`text-[9px] font-black uppercase tracking-widest ml-2 ${isDarkMode ? 'text-prime-500' : 'text-prime-600'}`}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  className={`w-full p-4 rounded-2xl border outline-none transition-all font-medium ${isDarkMode ? 'bg-white/5 border-white/10 focus:border-prime-500 text-white placeholder-gray-500' : 'bg-gray-50 border-black/10 focus:border-prime-500 text-gray-900 placeholder-gray-400'}`}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className={`text-[9px] font-black uppercase tracking-widest ml-2 ${isDarkMode ? 'text-prime-500' : 'text-prime-600'}`}>Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className={`w-full p-4 rounded-2xl border outline-none transition-all font-medium ${isDarkMode ? 'bg-white/5 border-white/10 focus:border-prime-500 text-white placeholder-gray-500' : 'bg-gray-50 border-black/10 focus:border-prime-500 text-gray-900 placeholder-gray-400'}`}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-2 bg-gradient-to-r from-prime-500 to-indigo-500 text-white rounded-2xl font-black uppercase tracking-wider text-sm shadow-xl hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : isLogin ? (
                  'Login to Dashboard'
                ) : (
                  'Start Free Trial'
                )}
              </button>

              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className={`text-xs font-bold transition-colors ${isDarkMode ? 'text-gray-400 hover:text-prime-500' : 'text-gray-600 hover:text-prime-500'}`}
                >
                  {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Access */}
          <div className="mt-6">
            <button
              onClick={() => {
                const userData = { email: 'riajfreelance@gmail.com', brandName: 'Skinzy' };
                localStorage.setItem('anzaar_user', JSON.stringify(userData));
                onAuthSuccess(userData);
              }}
              className={`w-full py-3 rounded-2xl border font-black uppercase tracking-wider text-[9px] transition-all ${isDarkMode ? 'border-prime-500/30 text-prime-400 hover:bg-prime-500/10' : 'border-prime-500/30 text-prime-600 hover:bg-prime-50'}`}
            >
              ⚡ Quick Access — Admin Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 px-6 border-t ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Cpu size={16} className="text-prime-500" />
            <span className="text-sm font-black tracking-wider uppercase">MetaSolution</span>
          </div>
          <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
            © 2026 MetaSolution. All rights reserved. Built with ❤️ in Bangladesh.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AuthView;
