import React from 'react';
import { Check, Zap, Crown, Star, ArrowRight } from 'lucide-react';

const SubscriptionPlan = ({ isDarkMode, t }) => {
  const plans = [
    {
      name: 'Starter',
      price: '2,500',
      period: '/month',
      description: 'Perfect for small shops starting their AI journey.',
      icon: Star,
      features: [
        '2,000 Messages / month', 
        'AI Draft Learning (Basic)', 
        'FB & IG Inbox Integration', 
        '1 User Seat',
        'Basic Performance Analytics',
        'Community Support'
      ],
      color: 'blue'
    },
    {
      name: 'Professional',
      price: '7,500',
      period: '/month',
      description: 'Scalable automation for growing businesses.',
      icon: Crown,
      features: [
        'Unlimited Messages', 
        'WhatsApp Business API', 
        'Advanced AI Blueprint Architect', 
        '5 User Seats', 
        'CRM Intelligence & Lead Scoring',
        'Campaign Wizard (Basic)',
        'Lifecycle Automation Loops',
        'Priority Support'
      ],
      popular: true,
      color: 'prime'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'Full-scale solution for high-volume brands.',
      icon: Zap,
      features: [
        'Unlimited User Seats', 
        'Agency Multi-Brand Support', 
        'Custom AI Training & Voice', 
        'Full Growth Engine & BI', 
        'A/B Testing Experiments', 
        'Dedicated Account Manager',
        '24/7 VIP Support & SLA',
        'API & Webhook Access'
      ],
      color: 'purple'
    }
  ];


  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="text-center mb-16">
        <h2 className={`text-4xl font-black tracking-tighter mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Scale Your <span className="text-prime-500 text-italic">Mission.</span>
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto">Choose a plan that fits your brand's growth and unlock the full power of Anzaar Engine.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, idx) => (
          <div 
            key={idx}
            className={`relative p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border transition-all duration-500 ${
              plan.popular 
                ? 'bg-prime-500/10 border-prime-500/50 scale-100 md:scale-105 z-10 my-4 md:my-0' 
                : isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-xl'
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-prime-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg shadow-prime-500/30">
                Most Popular
              </div>
            )}

            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
              plan.popular ? 'bg-prime-500 text-white' : 'bg-prime-500/10 text-prime-500'
            }`}>
              <plan.icon size={28} />
            </div>

            <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
            <p className="text-sm text-gray-500 mb-6 min-h-[40px]">{plan.description}</p>

            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-black">{plan.price}</span>
              <span className="text-gray-500 text-sm">{plan.period}</span>
            </div>

            <div className="space-y-4 mb-10">
              {plan.features.map((feature, fidx) => (
                <div key={fidx} className="flex items-center gap-3">
                  <div className={`p-1 rounded-full ${plan.popular ? 'bg-prime-500/20 text-prime-400' : 'bg-green-500/10 text-green-500'}`}>
                    <Check size={12} strokeWidth={4} />
                  </div>
                  <span className="text-xs font-bold opacity-80">{feature}</span>
                </div>
              ))}
            </div>

            <button className={`w-full py-4 rounded-[1.5rem] font-black transition-all active:scale-95 flex items-center justify-center gap-2 ${
              plan.popular 
                ? 'bg-prime-500 text-white shadow-lg shadow-prime-500/30 hover:bg-prime-600' 
                : isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}>
              {plan.price === 'Custom' ? 'Contact Sales' : 'Upgrade Now'}
              <ArrowRight size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className={`mt-16 p-8 rounded-[2.5rem] border text-center ${
        isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-xl'
      }`}>
        <p className="text-gray-500 text-sm italic">
          Need a custom plan for 50+ brands? 
          <button className="ml-2 font-black text-prime-500 hover:underline">Chat with our agency team.</button>
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPlan;
