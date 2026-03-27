import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, Beaker, CheckCircle, Info } from 'lucide-react';
import { useBrand } from '../../context/BrandContext';

const AILearner = ({ isDarkMode, t }) => {
  const { activeBrandId, brandData } = useBrand();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'ai',
      text: "হ্যালো! আমি আপনার ব্র্যান্ডের নতুন এআই অ্যাসিস্ট্যান্ট। আমাকে শেখান আমি কাস্টমারদের সাথে ঠিক কীভাবে কথা বলবো? আপনার ব্র্যান্ডের টোন কেমন হবে? (যেমন: ফ্রেন্ডলি, প্রফেশনাল, নাকি মজার?)"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !activeBrandId) return;

    const userMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: activeBrandId,
          message: userMessage.text,
          history: messages.map(m => ({ role: m.role, content: m.text }))
        })
      });

      if (!res.ok) throw new Error('Training API failed');
      
      const data = await res.json();
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        text: data.reply
      }]);

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        text: "দুঃখিত, কানেকশনে একটু সমস্যা হয়েছে। আবার বলবেন?"
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`h-[calc(100vh-10rem)] flex flex-col rounded-[2.5rem] border overflow-hidden animate-in fade-in zoom-in duration-500 ${isDarkMode ? 'bg-[#0a0f1d] border-white/5' : 'bg-white shadow-2xl border-black/5'}`}>
      
      {/* Header */}
      <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-black/5 bg-gray-50'}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-500">
            <Beaker size={24} />
          </div>
          <div>
            <h2 className={`text-xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              AI Sandbox <span className="text-xs ml-2 bg-indigo-500/20 text-indigo-500 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Trainer Mode</span>
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Teach the AI your brand's specific personality</p>
          </div>
        </div>
        <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${isDarkMode ? 'bg-black/20 border-white/10 text-gray-400' : 'bg-white border-black/10 text-gray-500 shadow-sm'}`}>
          <Info size={14} className="text-indigo-500" />
          The AI will auto-update your blueprint based on this chat.
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m, i) => (
          <div key={m.id || i} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-end gap-3 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center shadow-md ${
                m.role === 'user' 
                  ? 'bg-prime-500 text-white' 
                  : 'bg-indigo-500/20 text-indigo-500 border border-indigo-500/30'
              }`}>
                {m.role === 'user' ? <div className="text-xs font-bold font-mono">U</div> : <Bot size={16} />}
              </div>

              {/* Bubble */}
              <div className={`px-5 py-4 rounded-3xl text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-prime-500 text-white rounded-br-none shadow-xl shadow-prime-500/20'
                  : isDarkMode
                    ? 'bg-white/5 text-gray-200 rounded-bl-none border border-white/5 shadow-lg'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none border border-black/5 shadow-sm'
              }`}>
                {m.text}
              </div>

            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex w-full justify-start">
            <div className="flex items-end gap-3 flex-row">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-500 border border-indigo-500/30 flex shrink-0 items-center justify-center">
                <Bot size={16} />
              </div>
              <div className={`px-5 py-4 rounded-3xl rounded-bl-none flex items-center gap-1 ${isDarkMode ? 'bg-white/5 border border-white/5' : 'bg-gray-100 border border-black/5'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className={`p-6 border-t ${isDarkMode ? 'border-white/5 bg-black/20' : 'border-black/5 bg-gray-50'}`}>
        <div className="relative flex items-center">
          <input 
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type your instruction... (e.g. 'Use formal Bengali only')"
            className={`w-full pl-6 pr-16 py-5 rounded-3xl text-sm transition-all shadow-inner focus:ring-2 focus:ring-indigo-500/30 ${
              isDarkMode 
                ? 'bg-[#020617] text-white border border-white/10 placeholder-gray-600' 
                : 'bg-white text-gray-900 border border-black/10 placeholder-gray-400'
            }`}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              input.trim() && !isTyping
                ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/30 active:scale-95'
                : 'bg-gray-500/20 text-gray-500'
            }`}
          >
            <Send size={20} className={input.trim() && !isTyping ? "translate-x-0.5" : ""} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default AILearner;
