import React from 'react';
import { MessageSquare, User, Zap, TrendingUp, Edit2 } from 'lucide-react';
import StatCard from '../StatCard';

const HomeView = ({ isDarkMode, t, language, theme, stats }) => {
  return (
    <div className="animate-fade-in space-y-8">
      <h1 className="text-4xl font-black tracking-tight uppercase">{t('welcome')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={MessageSquare} title="Total Messages" value={stats?.totalMessages?.toLocaleString() || "0"} color="#3B82F6" trend={12} trendLabel="+12% this week" isDarkMode={isDarkMode} theme={theme} />
        <StatCard icon={User} title="New Leads" value={stats?.newLeads?.toString() || "0"} color="#10B981" trend={5} trendLabel="+5 Today" isDarkMode={isDarkMode} theme={theme} />
        <StatCard icon={Zap} title="AI Automation" value={`${stats?.automationScore || 92}%`} color="#8B5CF6" trend={2} trendLabel="Stable" isDarkMode={isDarkMode} theme={theme} />
        <StatCard icon={TrendingUp} title="Conversion" value={`${stats?.conversion || 3.2}%`} color="#F59E0B" trend={-1} trendLabel="-1% drop" isDarkMode={isDarkMode} theme={theme} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white shadow-lg border-black/5'}`}>
            <h3 className="text-xl font-bold mb-6">{t('trending_topics')}</h3>
            <div className="space-y-4">
              {['Shipping Delay', 'Vitamin C Serum', 'BOGO Offer'].map((topic, i) => (
                <div key={i} className={`flex justify-between items-center p-4 rounded-2xl transition-colors cursor-pointer group ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}>
                  <span className="font-medium group-hover:text-prime-400">{topic}</span>
                  <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-sm`}>{(100 - i * 15)} {t('queries')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200 shadow-sm'}`}>
            <div className="flex items-center gap-2 mb-4 text-yellow-500 text-lg font-bold">
              <Edit2 size={20} />
              <h3>{t('team_bulletin')}</h3>
            </div>
            <textarea 
              className={`w-full h-40 bg-transparent border-none focus:ring-0 resize-none italic ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              placeholder={t('bulletin_placeholder')}
              defaultValue={language === 'bn' ? "মনে রাখবেন স্টক শেষ হওয়ার আগে ভিটামিন সি সিরাম আপডেট করতে হবে! 🚀" : "Remember to update the Vitamin C stock levels before the weekend rush! 🚀"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
