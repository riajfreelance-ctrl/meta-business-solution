import React from 'react';
import { BookOpen } from 'lucide-react';

const KnowledgeBase = ({ theme, isDarkMode, t, library }) => {
  return (
    <div className="animate-fade-in space-y-8">
      <div className={`flex justify-between items-center p-8 rounded-3xl border transition-all ${
        theme === 'vortex' ? 'bg-white/5 border-white/10 backdrop-blur-2xl shadow-[0_0_50px_rgba(139,92,246,0.1)]' :
        isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-xl'
      }`}>
        <div>
          <h3 className={`text-2xl font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('knowledge_base')}</h3>
          <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Official AI brain and response library</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {library.length === 0 ? (
          <div className={`text-center py-20 rounded-3xl border transition-all ${
            theme === 'vortex' ? 'bg-white/5 border-white/10 backdrop-blur-xl opacity-50' :
            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-xl'
          }`}>
            <BookOpen size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No approved knowledge yet.</p>
          </div>
        ) : (
          library.map((item) => (
            <div key={item.id} className={`p-6 rounded-3xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 hover:border-prime-500/30' : 'bg-white border-black/5 shadow-md hover:border-prime-500/50'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-wrap gap-2">
                  {item.keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-prime-500/10 text-prime-400 rounded-full text-xs font-bold uppercase tracking-wider">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
              <div className={`p-4 rounded-2xl border-l-4 border-prime-500 ${isDarkMode ? 'bg-black/20 text-gray-200' : 'bg-black/5 text-gray-800'}`}>
                {item.answer}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;
