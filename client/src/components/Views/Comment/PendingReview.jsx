import React from 'react';
import { MessageCircle, PlusCircle, ShieldAlert, Trash2, Clock, User, ArrowRightCircle } from 'lucide-react';

const PendingReview = ({ 
  isDarkMode, 
  pendingComments = [], 
  commentDrafts = [], 
  handleNewFromPending, 
  handleMoveToStrategy, 
  handleSpamPending, 
  deleteDoc, 
  doc, 
  db 
}) => {
  return (
    <div className={`rounded-[2.5rem] border overflow-hidden transition-all duration-700 ${
      isDarkMode 
        ? 'bg-[#020617]/40 border-white/5 backdrop-blur-3xl shadow-2xl shadow-black/20' 
        : 'bg-white border-black/5 shadow-xl shadow-black/5'
    }`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className={`border-b ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-black/5 bg-gray-50/50'}`}>
            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] w-1/4">Customer</th>
            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Message context</th>
            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Decisions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {pendingComments.length === 0 ? (
            <tr>
              <td colSpan="3" className="p-20 text-center text-gray-500">
                <div className="flex flex-col items-center gap-4 opacity-30">
                  <div className="p-6 rounded-full bg-green-500/10 text-green-400">
                    <Clock size={48} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">
                    Inbox Zero! No pending comments to review.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            pendingComments.map((pc) => (
              <tr key={pc.id} className={`group transition-all duration-300 ${isDarkMode ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50'}`}>
                <td className="p-6 align-top">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                      isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-black/5'
                    }`}>
                      <User size={20} className="text-gray-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[12px] font-black uppercase tracking-tight text-prime-400">{pc.fromName}</p>
                        {pc.type === 'human_requested' && (
                          <div className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-widest border border-red-500/20 flex items-center gap-1 animate-pulse">
                            <span className="w-1 h-1 bg-red-500 rounded-full" />
                            Urgent Handoff
                          </div>
                        )}
                      </div>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest opacity-60">ID: {(pc.fromId || "").slice(-8)}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6 align-top">
                  <div className="space-y-3">
                    <div className={`p-5 rounded-[1.5rem] border ${
                      isDarkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-black/5'
                    }`}>
                      <p className={`text-[13px] font-medium leading-relaxed ${isDarkMode ? 'text-white/90' : 'text-gray-900'}`}>{pc.commentText}</p>
                    </div>
                    <div className="flex items-center gap-2 pl-2">
                       <ArrowRightCircle size={10} className="text-gray-500" />
                       <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest opacity-60">Post Source: {(pc.postId || "").slice(-12)}</span>
                    </div>
                  </div>
                </td>
                <td className="p-6 text-right align-top">
                  <div className="flex justify-end items-center gap-3">
                    <button 
                      onClick={() => handleNewFromPending(pc)}
                      title="Create Innovative Strategy"
                      className="p-3 rounded-2xl bg-green-500/5 text-green-500/40 hover:text-green-500 hover:bg-green-500/10 hover:scale-110 active:scale-95 transition-all duration-500"
                    >
                      <PlusCircle size={20} />
                    </button>
                    
                    <div className="relative group/sel">
                      <select 
                        onChange={(e) => handleMoveToStrategy(pc, e.target.value)}
                        className={`appearance-none pl-4 pr-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none border transition-all duration-500 ${
                          isDarkMode 
                            ? 'bg-white/5 border-white/5 text-gray-400 focus:border-prime-500/50 hover:bg-white/10' 
                            : 'bg-gray-50 border-black/10 text-gray-600 focus:border-prime-500/50 hover:bg-white'
                        }`}
                        defaultValue=""
                      >
                        <option value="" disabled>Link to Strategy...</option>
                        <optgroup label="Global Flow">
                          {commentDrafts.filter(d => !d.postId).map(d => (
                            <option key={d.id} value={d.id}>{d.keywords[0].toUpperCase()} ({d.variations.length})</option>
                          ))}
                        </optgroup>
                        <optgroup label="Post Specific">
                          {(commentDrafts || []).filter(d => d.postId).map(d => (
                            <option key={d.id} value={d.id}>Post: {(d.postId || "").slice(-6)} - {(d.keywords?.[0] || "").toUpperCase()}</option>
                          ))}
                        </optgroup>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                        <ArrowRightCircle size={14} className="rotate-90" />
                      </div>
                    </div>

                    <button 
                      onClick={() => handleSpamPending(pc)}
                      title="Neutralize Spam (Hide)"
                      className="p-3 rounded-2xl bg-orange-500/5 text-orange-500/40 hover:text-orange-500 hover:bg-orange-500/10 hover:scale-110 active:scale-95 transition-all duration-500"
                    >
                      <ShieldAlert size={20} />
                    </button>
                    
                    <button 
                      onClick={() => deleteDoc(doc(db, "pending_comments", pc.id))}
                      className="p-3 rounded-2xl text-gray-500/20 hover:text-red-500/60 transition-all duration-500"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PendingReview;
