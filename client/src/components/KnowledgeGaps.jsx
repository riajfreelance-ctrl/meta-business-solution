import React from 'react';
import { Zap, Sparkles, Trash2 } from 'lucide-react';
import { db } from '../firebase-client';
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

const KnowledgeGaps = ({ 
  gaps, 
  isSimulatorLoading, 
  handleDreamGaps, 
  theme, 
  isDarkMode, 
  gapAnswers, 
  setGapAnswers, 
  setEditingDraftId, 
  setEditKeyword, 
  setEditResult, 
  setActiveTab,
  t 
}) => {
  return (
    <div className={`animate-fade-in p-8 rounded-3xl border transition-all ${
      theme === 'vortex' ? 'bg-white/5 border-white/10 backdrop-blur-2xl shadow-[0_0_50px_rgba(139,92,246,0.1)]' :
      isDarkMode ? 'bg-white/5 border-white/10 shadow-none' : 'bg-white border-black/5 shadow-xl'
    }`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className={`text-xl font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('knowledge_gaps')}</h3>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1 italic">Train AI on Micro-Brand Details</p>
        </div>
        <button 
          onClick={handleDreamGaps}
          disabled={isSimulatorLoading}
          className={`px-6 py-3 bg-prime-500 text-white rounded-xl text-[10px] font-black uppercase hover:bg-prime-600 transition-all flex items-center gap-2 ${
            isSimulatorLoading ? 'opacity-50' : ''
          }`}
        >
          <Sparkles size={14} className={isSimulatorLoading ? 'animate-spin' : ''} />
          Ask Me Details
        </button>
      </div>

      <div className="space-y-6">
        {gaps.length === 0 ? (
          <p className="text-gray-500 italic text-sm text-center py-10 border border-dashed border-white/10 rounded-2xl">Use "Ask Me Details" to let AI generate questions about your brand.</p>
        ) : (
          gaps.map((gap) => (
            <div key={gap.id} className="p-6 rounded-2xl border border-white/10 bg-white/5 transition-all hover:bg-white/10 group/gap-card">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-prime-400 group-hover/gap-card:scale-125 transition-transform" />
                  <h4 className="font-bold text-white text-lg">{gap.question}</h4>
                </div>
                {gap.suggestedAnswer && (
                  <div className="p-3 bg-prime-500/10 border border-prime-500/20 rounded-xl mb-4 animate-in slide-in-from-top-2">
                    <p className="text-[10px] font-black text-prime-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                      <Sparkles size={10} /> Gemini Suggestion (Editable)
                    </p>
                    <p className="text-xs italic text-gray-300">"{gap.suggestedAnswer}"</p>
                  </div>
                )}
                <textarea 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-prime-500 transition-all resize-none mb-3 placeholder-gray-600 focus:ring-1 focus:ring-prime-500/30"
                  rows="3"
                  placeholder="Type your brand's specific answer here..."
                  value={gapAnswers[gap.id] !== undefined ? gapAnswers[gap.id] : (gap.suggestedAnswer || '')}
                  onChange={(e) => setGapAnswers(prev => ({ ...prev, [gap.id]: e.target.value }))}
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-3">
                <button 
                  onClick={async () => {
                    const inputVal = gapAnswers[gap.id] !== undefined ? gapAnswers[gap.id] : (gap.suggestedAnswer || '');
                    if(!inputVal.trim()) return alert('Please enter an answer first');
                    try {
                      const draftRef = await addDoc(collection(db, 'draft_replies'), {
                        keyword: gap.question,
                        result: inputVal,
                        variations: [gap.question.toLowerCase()],
                        status: 'ai-suggested',
                        confidenceScore: 100,
                        timestamp: serverTimestamp()
                      });
                      await deleteDoc(doc(db, 'knowledge_gaps', gap.id));
                      setEditingDraftId(draftRef.id);
                      setEditKeyword(gap.question);
                      setEditResult(inputVal);
                      setActiveTab('drafts');
                    } catch(e) { console.error('Save error', e); }
                  }}
                  className="px-6 py-2 bg-prime-500/20 text-prime-300 rounded-lg text-[10px] uppercase font-black hover:bg-prime-500 hover:text-white transition-all shadow-lg hover:shadow-prime-500/10"
                >
                  Approve & Add to Drafts
                </button>
                <button 
                  onClick={async () => { try { await deleteDoc(doc(db, 'knowledge_gaps', gap.id)); } catch(e){} }}
                  className="p-2 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-all opacity-50 hover:opacity-100"
                  title="Discard Question"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default KnowledgeGaps;
