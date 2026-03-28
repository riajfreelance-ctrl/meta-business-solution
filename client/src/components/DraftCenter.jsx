import React from 'react';
import { 
  Database, 
  Terminal, 
  Search, 
  Zap, 
  Sparkles, 
  CheckCircle, 
  Trash2, 
  Edit2 
} from 'lucide-react';

const DraftCenter = ({
  theme,
  isDarkMode,
  t,
  drafts,
  globalTone,
  setGlobalTone,
  globalLength,
  setGlobalLength,
  searchTerm,
  setSearchTerm,
  editingDraftId,
  setEditingDraftId,
  editKeyword,
  setEditKeyword,
  editResult,
  setEditResult,
  handleUpdateDraft,
  handleDeleteDraft,
  handleExpandKeywords,
  handleRefineDraft,
  handleApproveDraft,
  simulationText,
  setSimulationText,
  handleSimulateTrigger,
  simulationResult,
  expandingId,
  refiningId
}) => {
  return (
    <div className="animate-fade-in flex flex-col xl:flex-row gap-8">
      <div className="flex-1 space-y-8">
        <div className={`flex flex-wrap justify-between items-center p-6 rounded-3xl border transition-all ${
          theme === 'vortex' ? 'bg-white/5 border-white/10 backdrop-blur-2xl shadow-[0_0_50px_rgba(139,92,246,0.1)]' :
          'bg-white/5 border-white/10 backdrop-blur-md'
        } gap-6`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl transition-all ${
              theme === 'vortex' ? 'bg-prime-500/20 text-prime-300 shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'bg-prime-500/20 text-prime-400'
            }`}>
              <Database size={32} />
            </div>
            <div>
              <h3 className={`text-2xl font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('draft_center')}</h3>
              <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Self-Learning Brand Brain Engine</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col gap-1 pr-6 border-r border-white/10">
                 <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Global AI Tone</span>
                 <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
                    {['Professional', 'Friendly', 'Humorous'].map(tone => (
                      <button 
                        key={tone}
                        onClick={() => setGlobalTone(tone)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                          globalTone === tone ? 'bg-prime-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                 <input 
                   type="text"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder="Search Drafts..."
                   className="pl-12 pr-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs focus:ring-1 focus:ring-prime-500 focus:outline-none w-64"
                 />
              </div>
          </div>
        </div>

        <div className="space-y-4">
          {drafts.length === 0 ? (
            <div className="py-20 text-center text-gray-500  border border-dashed border-white/10 rounded-3xl">No draft replies found. Let the AI discover more Knowledge Gaps first.</div>
          ) : (
            drafts.map((draft) => (
              <div key={draft.id} className={`p-6 rounded-3xl border transition-all duration-500 flex items-start gap-6 group hover:translate-x-1 ${
                theme === 'vortex' ? 'bg-white/[0.03] border-white/10 hover:border-prime-500/30' : 
                isDarkMode ? 'bg-white/5 border-white/10 hover:border-prime-500/50' : 'bg-white border-black/5 shadow-md hover:shadow-xl'
              }`}>
                
                {/* Confidence Meter (Minimalist UI) */}
                <div className="flex flex-col items-center gap-2">
                   <div className="w-12 h-12 rounded-full relative flex items-center justify-center bg-black/20 border border-white/5">
                      <div 
                        className="absolute inset-0 border-2 border-prime-500 rounded-full" 
                        style={{ clipPath: `conic-gradient(black ${(draft.confidenceScore || 85)}%, transparent 0)` }} 
                      />
                      <span className="text-[9px] font-black">{draft.confidenceScore || 85}%</span>
                   </div>
                   <div className="flex flex-col gap-1 min-w-0">
                      <span className={`text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md inline-block w-fit ${
                        draft.status === 'ai-suggested' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-prime-500/10 text-prime-400'
                      }`}>
                        {draft.status || 'New'}
                      </span>
                   </div>
                </div>

                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                       <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest leading-none">Question</span>
                       <button 
                          onClick={() => {
                            setEditingDraftId(draft.id);
                            setEditKeyword(draft.keyword);
                            setEditResult(draft.result);
                          }}
                          className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-prime-400"
                       >
                         <Edit2 size={10} />
                       </button>
                    </div>
                    {editingDraftId === draft.id ? (
                      <input 
                        type="text"
                        value={editKeyword}
                        onChange={(e) => setEditKeyword(e.target.value)}
                        className="w-full bg-black/20 border border-prime-500/30 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none"
                      />
                    ) : (
                      <h4 className="text-sm font-bold truncate">"{draft.keyword}"</h4>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black text-prime-400 uppercase tracking-widest leading-none">Response</span>
                    {editingDraftId === draft.id ? (
                       <textarea 
                         value={editResult}
                         onChange={(e) => setEditResult(e.target.value)}
                         className="w-full bg-black/20 border border-prime-500/30 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none h-20 resize-none mt-1"
                       />
                     ) : (
                       <p className={`text-xs font-medium line-clamp-2  opacity-70 ${refiningId === draft.id ? 'animate-pulse text-prime-400' : ''}`}>
                         "{draft.result}"
                       </p>
                     )}
                  </div>
                  
                  {editingDraftId === draft.id && (
                    <div className="flex gap-2 pt-2">
                       <button onClick={() => handleUpdateDraft(draft.id)} className="px-4 py-1.5 bg-prime-500 text-white rounded-lg text-[10px] font-black uppercase">Save</button>
                       <button onClick={() => setEditingDraftId(null)} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase">Cancel</button>
                    </div>
                  )}
                </div>

                 <div className={`flex items-center gap-2 shrink-0 border-l ${isDarkMode ? 'border-white/5' : 'border-black/5'} pl-6`}>
                    <button onClick={() => handleExpandKeywords(draft.id, draft.keyword)} className="p-2.5 rounded-xl transition-all">
                       <Zap size={14} className={expandingId === draft.id ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => handleRefineDraft(draft.id, draft.result, globalTone, globalLength)} className="p-2.5 rounded-xl transition-all">
                       <Sparkles size={14} className={refiningId === draft.id ? 'animate-pulse' : ''} />
                    </button>
                    <button onClick={() => handleApproveDraft(draft)} className="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 bg-prime-500 text-white">
                       <CheckCircle size={14} /> Approve
                    </button>
                    <button onClick={() => handleDeleteDraft(draft.id)} className="p-2.5">
                       <Trash2 size={14} />
                    </button>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="w-full xl:w-96 space-y-6">
        <div className={`p-8 rounded-3xl border sticky top-8 transition-all duration-500 ${
          theme === 'vortex' ? 'bg-white/[0.03] border-white/10 backdrop-blur-2xl' :
          isDarkMode ? 'bg-white/5 border-white/10 shadow-2xl backdrop-blur-xl' : 'bg-white border-black/5 shadow-xl'
        }`}>
           <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-2xl bg-green-500/20 text-green-400">
                 <Terminal size={24} />
              </div>
              <h4 className="text-xl font-black uppercase tracking-tighter">Simulation Lab</h4>
           </div>

           <div className="space-y-4">
              <textarea 
                value={simulationText}
                onChange={(e) => setSimulationText(e.target.value)}
                placeholder="e.g. Price koto?"
                className="w-full p-5 rounded-2xl text-sm h-32 resize-none bg-black/20 border border-white/10 text-white"
              />
              <button 
                onClick={handleSimulateTrigger}
                className="w-full py-4 rounded-2xl font-black uppercase bg-green-500 text-white transition-all shadow-lg"
              >
                 Test Trigger
              </button>
           </div>

           {simulationResult && (
              <div className="mt-8 animate-fade-in space-y-4">
                 <div className={`p-6 rounded-2xl border ${simulationResult.source === 'none' ? 'border-red-500/30 bg-red-500/5' : 'border-green-500/30 bg-green-500/5'}`}>
                     <p className="text-[10px] font-black text-gray-500 uppercase mb-3">Result Source: {simulationResult.source}</p>
                     {simulationResult.source === 'none' ? (
                       <p className="text-red-400 font-bold text-xs ">No exact match found.</p>
                     ) : (
                       <div className="space-y-2">
                          <p className="text-green-400 font-bold text-xs uppercase tracking-widest">Matched Trigger!</p>
                          <p className="text-sm  text-gray-300">"{simulationResult.match.answer || simulationResult.match.result}"</p>
                       </div>
                     )}
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default DraftCenter;
