import React, { useState, useEffect, useMemo } from 'react';
import { 
  Zap, 
  CheckCircle, 
  Search, 
  AlertCircle, 
  Sparkles, 
  MessageSquare, 
  XCircle, 
  TrendingUp, 
  Clock,
  BrainCircuit,
  Lightbulb,
  GraduationCap,
  Send,
  MoreVertical,
  Edit3
} from 'lucide-react';
import { db } from '../../firebase-client';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import ConfirmModal from '../Shared/ConfirmModal';

const TrainingRow = ({ gap, isDarkMode, handleConvertToDraft, onDelete }) => {
  const [reply, setReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(gap?.question || "");

  useEffect(() => {
    if (gap?.question) setEditedQuestion(gap.question);
  }, [gap?.question]);

  const onComplete = async () => {
    if (!reply.trim()) return;
    setIsSubmitting(true);
    // Use edited question if available
    const finalGap = { ...gap, question: editedQuestion };
    await handleConvertToDraft(finalGap, reply);
    setIsSubmitting(false);
    setReply("");
  };

  return (
    <tr className={`group transition-all ${isDarkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'}`}>
      <td className="p-5 align-top">
         <div className="flex flex-col gap-1">
            {isEditingQuestion ? (
               <input 
                  value={editedQuestion}
                  onChange={(e) => setEditedQuestion(e.target.value)}
                  onBlur={() => setIsEditingQuestion(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingQuestion(false)}
                  autoFocus
                  className={`text-sm font-black tracking-tight leading-tight italic bg-transparent border-b-2 border-prime-500 outline-none w-full ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
               />
            ) : (
               <div 
                  className="flex items-center gap-2 group/q cursor-pointer"
                  onClick={() => setIsEditingQuestion(true)}
               >
                  <span className={`text-sm font-black tracking-tight leading-tight italic ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                     "{editedQuestion}"
                  </span>
                  <Edit3 size={10} className="text-prime-400 opacity-0 group-hover/q:opacity-100 transition-all" />
               </div>
            )}
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
               {gap.category || 'Customer Query'}
            </span>
         </div>
      </td>
      <td className="p-5 align-top min-w-[300px]">
         <div className="space-y-3">
            <div className="relative">
               <textarea 
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type the brand's response..."
                  className={`w-full p-4 rounded-xl text-xs font-medium outline-none transition-all resize-none border ${
                     isDarkMode 
                        ? 'bg-black/40 border-white/5 focus:border-prime-500/40 text-white' 
                        : 'bg-gray-50 border-black/5 focus:border-prime-500/40 text-gray-900'
                  } h-20`}
               />
               {reply.trim() && (
                  <button 
                     onClick={onComplete}
                     className="absolute bottom-2 right-2 p-1.5 bg-prime-500 text-white rounded-lg shadow-lg hover:scale-110 active:scale-95 transition-all"
                  >
                     <Send size={12} />
                  </button>
               )}
            </div>
            
            {/* Suggestions Chips */}
            {gap.suggestions && gap.suggestions.length > 0 && (
               <div className="flex flex-wrap gap-1.5">
                  {gap.suggestions.map((suggestion, i) => (
                     <button 
                        key={i}
                        onClick={() => setReply(suggestion)}
                        className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold text-left transition-all border ${
                           isDarkMode 
                              ? 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-400' 
                              : 'bg-gray-100 border-black/5 hover:bg-gray-200 text-gray-600'
                        }`}
                     >
                        {suggestion}
                     </button>
                  ))}
               </div>
            )}
         </div>
      </td>
      <td className="p-5 align-top text-right">
         <div className="flex items-center justify-end gap-3">
            <button 
               onClick={onComplete}
               disabled={!reply.trim() || isSubmitting}
               className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  reply.trim() 
                     ? 'bg-prime-500 text-white shadow-xl shadow-prime-500/20 active:scale-95' 
                     : 'bg-white/5 text-gray-600 cursor-not-allowed opacity-50'
               }`}
            >
               {isSubmitting ? 'Sending...' : 'Send to Draft Center'}
            </button>
            <button 
               onClick={() => onDelete(gap.id)}
               className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'bg-white/5 text-gray-600 hover:text-red-400 hover:bg-red-400/10' : 'bg-gray-100 text-gray-400'}`}
            >
               <XCircle size={16} />
            </button>
         </div>
      </td>
    </tr>
  );
};

const KnowledgeGaps = ({ isDarkMode, t, gaps: initialGaps = [], handleConvertToDraft, handleDiscoverGaps }) => {
  const [gaps, setGaps] = useState(initialGaps);
  const [deletingGapId, setDeletingGapId] = useState(null);
  const [isDiscovering, setIsDiscovering] = useState(false);

  useEffect(() => {
    setGaps(initialGaps || []);
  }, [initialGaps]);

  const activeGaps = useMemo(() => {
    if (!Array.isArray(gaps)) return [];
    return gaps.filter(g => g.status === 'new').sort((a, b) => {
      const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : (a.timestamp || 0);
      const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : (b.timestamp || 0);
      return timeB - timeA;
    });
  }, [gaps]);

  const progress = useMemo(() => {
     if (!Array.isArray(initialGaps)) return 0;
     const total = initialGaps.length;
     const resolved = initialGaps.filter(g => g.status === 'drafted' || g.status === 'answered').length;
     return total === 0 ? 100 : Math.round((resolved / (total + 10)) * 100);
  }, [initialGaps]);

  const onDiscover = async () => {
    setIsDiscovering(true);
    await handleDiscoverGaps();
    setTimeout(() => setIsDiscovering(false), 3000);
  };

  const handleResolve = async (id) => {
    try {
      await deleteDoc(doc(db, "knowledge_gaps", id));
      setDeletingGapId(null);
    } catch (error) {
       console.error("Error resolving gap:", error);
    }
  };

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      {/* Onboarding Header */}
      <div className={`p-10 rounded-[3rem] border relative overflow-hidden transition-all ${
        isDarkMode ? 'bg-[#020617] border-white/5 shadow-2xl' : 'bg-white border-black/5 shadow-xl shadow-black/5'
      }`}>
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
               <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-prime-500/20 flex items-center justify-center border border-prime-500/30 overflow-hidden">
                     <BrainCircuit size={40} className="text-prime-400 animate-pulse" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-1 bg-green-500 rounded-full border-4 border-[#020617]" />
               </div>
               <div>
                  <h3 className="text-3xl font-black tracking-tighter mb-1">Knowledge Acquisition Hub</h3>
                  <div className="flex items-center gap-2">
                     <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isDarkMode ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                        Learning Mode
                     </span>
                     <span className="text-prime-500 text-[10px] font-black uppercase tracking-widest">Mastering Customer Scenarios</span>
                  </div>
               </div>
            </div>

            <div className="flex-1 max-w-md space-y-3">
               <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Intelligence Readiness</span>
                  <span className="text-2xl font-black tracking-tighter">{progress}%</span>
               </div>
               <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-prime-600 to-purple-500 transition-all duration-1000 ease-out shadow-lg shadow-prime-500/20" 
                    style={{ width: `${progress}%` }}
                  />
               </div>
            </div>
         </div>
      </div>

      <div className="flex justify-between items-end px-4">
         <div>
            <h4 className="text-xl font-black tracking-tighter flex items-center gap-2">
               <Lightbulb className="text-yellow-400" size={20} />
               Practical Scenarios
            </h4>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Teach the AI how to handle these situations before they occur</p>
         </div>

         <button 
           onClick={onDiscover}
           disabled={isDiscovering}
           className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
              isDiscovering 
                ? 'bg-white/5 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-br from-prime-600 to-indigo-600 text-white shadow-prime-600/20 hover:scale-[1.02]'
           }`}
         >
            {isDiscovering ? <Zap className="animate-spin" size={16} /> : <Zap size={16} fill="currentColor" />}
            Generate Practical Scenarios
         </button>
      </div>

      {/* Classical Table Layout */}
      <div className={`rounded-[2rem] border overflow-hidden ${isDarkMode ? 'bg-[#020617]/40 border-white/5 backdrop-blur-3xl shadow-2xl' : 'bg-white border-black/5 shadow-xl shadow-black/5'}`}>
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className={`border-b ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-black/5 bg-gray-50/50'}`}>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Scenario (Goal)</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Practical Reply (Instruction)</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
               {activeGaps.length === 0 ? (
                  <tr>
                     <td colSpan="3" className="p-20 text-center text-gray-500">
                        <GraduationCap size={48} className="mx-auto mb-4 opacity-10" />
                        <p className="text-sm font-black italic">"I'm ready for anything, Boss!"</p>
                        <p className="text-[9px] uppercase tracking-[0.2em] mt-2">All scenarios mastered.</p>
                     </td>
                  </tr>
               ) : (
                  activeGaps.map((gap) => (
                     <TrainingRow 
                        key={gap.id} 
                        gap={gap} 
                        isDarkMode={isDarkMode} 
                        handleConvertToDraft={handleConvertToDraft} 
                        onDelete={id => setDeletingGapId(id)}
                     />
                  ))
               )}
            </tbody>
         </table>
      </div>

      <ConfirmModal 
        isOpen={!!deletingGapId}
        onClose={() => setDeletingGapId(null)}
        onConfirm={() => handleResolve(deletingGapId)}
        title="Dismiss Scenario?"
        message="Are you sure you want to dismiss this scenario?"
        isDarkMode={isDarkMode}
        t={t}
      />
    </div>
  );
};

export default KnowledgeGaps;
