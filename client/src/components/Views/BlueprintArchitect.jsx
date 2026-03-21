import React from 'react';
import { UserCircle, Zap } from 'lucide-react';

const BlueprintArchitect = ({ isDarkMode, t }) => {
  return (
    <div className="animate-fade-in glass-card p-12 max-w-4xl mx-auto">
      <div className="mb-12 flex justify-between items-end">
        <div>
          <span className="text-prime-400 font-black text-4xl mb-2 block">10</span>
          <h3 className="text-2xl font-bold">Blueprint Architect Wizard</h3>
        </div>
        <div className="text-right text-gray-500 font-medium">STEP 1 / 10</div>
      </div>

      <div className="space-y-10">
        <section className="space-y-6">
          <label className="text-lg font-bold flex items-center gap-3">
            <UserCircle className="text-prime-500" />
            Define Brand Voice & Persona
          </label>
          <div className="grid grid-cols-2 gap-4">
            {['Professional', 'Friendly', 'Excited', 'Consultative'].map((tone) => (
              <button key={tone} className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-prime-500 hover:bg-prime-500/5 transition-all text-left group">
                <p className="font-bold group-hover:text-prime-400 mb-1">{tone}</p>
                <p className="text-xs text-gray-500">The AI will use {tone.toLowerCase()} vocabulary.</p>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <label className="text-lg font-bold block">Signature Emojis</label>
          <input type="text" placeholder="✨, 🚀, 💎" className="glass-input w-full p-4 rounded-xl" />
        </section>

        <div className="pt-10 flex justify-between">
          <button className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:text-white transition-colors">Skip for now</button>
          <button className="btn-primary px-12 py-3 rounded-xl flex items-center gap-2">
            Next Step
            <Zap size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlueprintArchitect;
