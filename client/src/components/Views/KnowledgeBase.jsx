import React, { useState } from 'react';
import { BookOpen, Edit3, Trash2 } from 'lucide-react';
import { db } from '../../firebase-client';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import ActionMenu from '../Shared/ActionMenu';
import ConfirmModal from '../Shared/ConfirmModal';

const KnowledgeBase = ({ isDarkMode, t, library }) => {
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [editForm, setEditForm] = useState({ keywords: '', answer: '' });

  const handleEdit = (item) => {
    setEditingItem(item);
    setEditForm({ 
      keywords: item.keywords.join(', '), 
      answer: item.answer 
    });
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
    try {
      const itemRef = doc(db, "knowledge_base", editingItem.id);
      await updateDoc(itemRef, {
        keywords: editForm.keywords.split(',').map(kw => kw.trim()).filter(kw => kw),
        answer: editForm.answer
      });
      setEditingItem(null);
    } catch (error) {
      console.error("Error updating knowledge base:", error);
    }
  };

  const handleDelete = async () => {
    if (!deletingItemId) return;
    try {
      await deleteDoc(doc(db, "knowledge_base", deletingItemId));
      setDeletingItemId(null);
    } catch (error) {
      console.error("Error deleting knowledge:", error);
    }
  };
  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('knowledge_base')}</h3>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Official AI brain and response library</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {library.length === 0 ? (
          <div className={`text-center py-20 rounded-3xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-xl'}`}>
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
                  <ActionMenu 
                    isDarkMode={isDarkMode} 
                    t={t} 
                    onEdit={() => handleEdit(item)} 
                    onDelete={() => setDeletingItemId(item.id)} 
                  />
                </div>
              <div className={`p-4 rounded-2xl border-l-4 border-prime-500 ${isDarkMode ? 'bg-black/20 text-gray-200' : 'bg-black/5 text-gray-800'}`}>
                {item.answer}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Knowledge Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-[2.5rem] border shadow-2xl overflow-hidden ${
            isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-black/5 text-gray-900'
          } animate-in zoom-in-95 duration-200`}>
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-prime-500/10 rounded-2xl">
                  <BookOpen className="text-prime-400" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">{t('edit_knowledge')}</h3>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{t('manage')} {t('knowledge_base')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">{t('keywords')} (comma separated)</label>
                  <input 
                    type="text" 
                    value={editForm.keywords}
                    onChange={(e) => setEditForm({...editForm, keywords: e.target.value})}
                    className={`w-full p-4 rounded-2xl outline-none border transition-all ${
                      isDarkMode ? 'bg-black/20 border-white/10 focus:border-prime-500/50' : 'bg-gray-50 border-black/5 focus:border-prime-500/50'
                    }`}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">{t('answer')}</label>
                  <textarea 
                    value={editForm.answer}
                    onChange={(e) => setEditForm({...editForm, answer: e.target.value})}
                    className={`w-full h-48 p-4 rounded-2xl outline-none border transition-all resize-none ${
                      isDarkMode ? 'bg-black/20 border-white/10 focus:border-prime-500/50' : 'bg-gray-50 border-black/5 focus:border-prime-500/50'
                    }`}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setEditingItem(null)}
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
                    isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {t('cancel')}
                </button>
                <button 
                  onClick={handleUpdate}
                  className="flex-1 py-4 rounded-2xl font-bold bg-prime-500 text-white hover:bg-prime-600 shadow-xl shadow-prime-500/20 active:scale-95 transition-all"
                >
                  {t('save_changes')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Knowledge Confirmation */}
      <ConfirmModal 
        isOpen={!!deletingItemId}
        onClose={() => setDeletingItemId(null)}
        onConfirm={handleDelete}
        title={t('confirm_delete')}
        message="Are you sure you want to remove this knowledge from the AI brain? This will affect future responses."
        isDarkMode={isDarkMode}
        t={t}
      />
    </div>
  );
};

export default KnowledgeBase;
