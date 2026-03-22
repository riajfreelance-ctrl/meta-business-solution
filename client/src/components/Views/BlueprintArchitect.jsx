import React, { useState } from 'react';
import { UserCircle, Zap, CheckCircle } from 'lucide-react';
import { db } from '../../firebase-client';
import { doc, setDoc } from 'firebase/firestore';

const BlueprintArchitect = ({ isDarkMode, t }) => {
  const [step, setStep] = useState(1);
  const [tone, setTone] = useState('Friendly');
  const [emojis, setEmojis] = useState('✨, 🚀, 💎');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, "settings", "blueprint"), {
        tone,
        emojis,
        updatedAt: new Date(),
        version: '1.0.0'
      }, { merge: true });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setStep(prev => Math.min(prev + 1, 10));
      }, 1500);
    } catch (error) {
      console.error("Error saving blueprint:", error);
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="animate-fade-in glass-card p-12 max-w-4xl mx-auto">
      <div className="mb-12 flex justify-between items-end">
        <div>
          <span className="text-prime-400 font-black text-4xl mb-2 block">10</span>
          <h3 className="text-2xl font-bold">Blueprint Architect Wizard</h3>
        </div>
        <div className="text-right text-gray-500 font-medium uppercase tracking-widest text-xs">STEP {step} / 10</div>
      </div>

      {showSuccess ? (
        <div className="flex flex-col items-center justify-center py-20 animate-bounce">
          <CheckCircle size={64} className="text-prime-500 mb-4" />
          <h4 className="text-2xl font-bold">Progress Saved!</h4>
        </div>
      ) : (
        <div className="space-y-10">
        <section className="space-y-6">
          <label className="text-lg font-bold flex items-center gap-3">
            <UserCircle className="text-prime-500" />
            Define Brand Voice & Persona
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
                <p className="text-xs text-gray-500">The AI will use {tName.toLowerCase()} vocabulary.</p>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <label className="text-lg font-bold block">Signature Emojis</label>
          <input 
            type="text" 
            value={emojis}
            onChange={(e) => setEmojis(e.target.value)}
            placeholder="✨, 🚀, 💎" 
            className="glass-input w-full p-4 rounded-xl" 
          />
        </section>

        <div className="pt-10 flex justify-between">
          <button className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:text-white transition-colors">Skip for now</button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary px-12 py-3 rounded-xl flex items-center gap-2"
          >
            {isSaving ? 'Saving...' : 'Next Step'}
            <Zap size={18} />
          </button>
        </div>
      </div>
      )}
    </div>
  );
};

export default BlueprintArchitect;
