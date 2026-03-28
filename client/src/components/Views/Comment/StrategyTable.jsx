import React from 'react';
import { MessageCircle, Shuffle, Globe, Send, PlusCircle, TrendingUp, Sparkles, Loader2, Edit3, Trash2, MoreHorizontal } from 'lucide-react';

const StrategyTable = ({ 
  isDarkMode, 
  activeTab, 
  commentDrafts = [], 
  posts = [], 
  handleEdit, 
  setDeletingDraftId, 
  handleQuickGenerateAI, 
  rowLoading = {} 
}) => {
  const filteredDrafts = activeTab === 'post_id' 
    ? (commentDrafts || []).filter(d => d.postId) 
    : (commentDrafts || []).filter(d => !d.postId);

  return (
    <div className={`rounded-[2.5rem] border overflow-hidden transition-all duration-700 ${
      isDarkMode 
        ? 'bg-[#020617]/40 border-white/5 backdrop-blur-3xl shadow-2xl shadow-black/20' 
        : 'bg-white border-black/5 shadow-xl shadow-black/5'
    }`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className={`border-b ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-black/5 bg-gray-50/50'}`}>
            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] w-[22%]">
              {activeTab === 'post_id' ? 'Target Post' : 'Trigger Keywords'}
            </th>
            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] w-[40%]">
              Shuffle variations
            </th>
            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] w-[20%]">
              Performance
            </th>
            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {filteredDrafts.length === 0 ? (
            <tr>
              <td colSpan="4" className="p-20 text-center text-gray-500">
                <div className="flex flex-col items-center gap-4 opacity-30">
                  <div className="p-6 rounded-full bg-gray-500/10">
                    <MessageCircle size={48} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">
                    No {activeTab === 'post_id' ? 'Post-Specific' : 'Global'} strategies found
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            filteredDrafts.map((draft) => {
              const post = posts.find(p => p.id === draft.postId);
              return (
                <tr key={draft.id} className={`group transition-all duration-300 ${isDarkMode ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50'}`}>
                  <td className="p-6 align-top">
                    {activeTab === 'post_id' ? (
                      <div className="space-y-4">
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/5 shadow-lg">
                          {post?.full_picture ? (
                            <img src={post.full_picture} alt="Post Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full bg-prime-500/10 flex items-center justify-center">
                              <Globe size={24} className="text-prime-400/20" />
                            </div>
                          )}
                          <div className="absolute top-2 left-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                             <span className="text-[8px] font-black text-white uppercase tracking-widest">
                              ID: {draft.postId.slice(-8)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {draft.keywords.map((kw, i) => (
                            <span key={i} className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest border transition-all ${
                              isDarkMode ? 'bg-white/5 border-white/10 text-prime-400' : 'bg-prime-50 border-prime-100 text-prime-600'
                            }`}>
                              {kw.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {draft.keywords.map((kw, i) => (
                          <span key={i} className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-[0.1em] border transition-all shadow-sm ${
                            isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-black/5 text-gray-900'
                          }`}>
                            {kw.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="p-6 align-top">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-prime-500/10">
                          <Shuffle size={12} className="text-prime-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                          {draft.variations.length} Active Variations
                        </span>
                      </div>
                      <div className="space-y-3">
                        {draft.variations.slice(0, 2).map((v, i) => (
                          <div key={i} className={`p-4 rounded-2xl border transition-all group/var ${
                            isDarkMode ? 'bg-white/5 border-white/5 hover:border-white/20' : 'bg-gray-50 border-black/5 hover:bg-white hover:shadow-lg'
                          }`}>
                            <div className="flex items-center gap-2 mb-2 opacity-40">
                              <Globe size={10} className="text-prime-400" /> 
                              <span className="uppercase font-black tracking-[0.2em] text-[8px]">Public Reply</span>
                            </div>
                            <p className="text-[11px] font-medium leading-relaxed  mb-3">"{v.publicReply}"</p>
                            
                            {v.privateReply && (
                              <div className="pt-3 border-t border-white/5">
                                <div className="flex items-center justify-between gap-2 mb-2 opacity-40">
                                  <div className="flex items-center gap-2">
                                    <Send size={10} className="text-purple-400" /> 
                                    <span className="uppercase font-black tracking-[0.2em] text-[8px]">Private Inbox</span>
                                  </div>
                                  {v.buttonText && (
                                    <div className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[8px] font-black uppercase tracking-widest border border-purple-500/20 flex items-center gap-1.5">
                                      <PlusCircle size={8} /> {v.buttonText}
                                    </div>
                                  )}
                                </div>
                                <p className="text-[11px] font-bold text-prime-400/90 leading-relaxed">"{v.privateReply}"</p>
                              </div>
                            )}
                          </div>
                        ))}
                        {draft.variations.length > 2 && (
                          <div className="flex items-center gap-2 pl-2">
                            <MoreHorizontal size={14} className="text-gray-500 opacity-30" />
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.15em] ">
                              +{draft.variations.length - 2} more optimized variations
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-6 align-top">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-green-500/10">
                          <TrendingUp size={12} className="text-green-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Engagement</span>
                      </div>
                      <div className="space-y-4">
                        {draft.variations.slice(0, 3).map((v, i) => (
                          <div key={i} className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                              <span className="text-[8px] font-black text-gray-500 uppercase">#Var {i+1}</span>
                              <span className="text-[9px] font-black text-green-400">{v.hitCount || 0} hits</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner">
                              <div 
                                className="h-full bg-gradient-to-r from-green-600/50 to-green-400/80 transition-all duration-1000 ease-out" 
                                style={{ width: `${Math.min((v.hitCount || 0) * 10, 100)}%` }} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-right align-middle">
                    <div className="flex justify-end items-center gap-3">
                      <button 
                        onClick={() => handleQuickGenerateAI(draft)}
                        disabled={rowLoading[draft.id]}
                        className={`p-3 rounded-2xl transition-all duration-500 group/ai ${
                          rowLoading[draft.id] 
                            ? 'bg-purple-500/10 text-purple-400 animate-pulse' 
                            : 'bg-purple-500/5 text-purple-400 hover:bg-purple-500/20 hover:scale-110 active:scale-95'
                        }`}
                        title="AI Growth Engine (10 Variations)"
                      >
                         {rowLoading[draft.id] ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="group-hover/ai:rotate-12 transition-transform" />}
                      </button>
                      <button 
                        onClick={() => handleEdit(draft)}
                        className={`p-3 rounded-2xl transition-all duration-500 ${
                          isDarkMode 
                            ? 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 hover:scale-110' 
                            : 'bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 hover:scale-110'
                        }`}
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => setDeletingDraftId(draft.id)}
                        className={`p-3 rounded-2xl transition-all duration-500 bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 hover:scale-110`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StrategyTable;
