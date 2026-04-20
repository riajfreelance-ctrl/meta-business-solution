import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit2, Link, MessageSquare, Shuffle, Database } from 'lucide-react';
import { db } from '../../firebase-client';
import { doc, deleteDoc, addDoc, collection, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { useBrand } from '../../context/BrandContext';
import ConfirmModal from '../Shared/ConfirmModal';

const CommentDataCenter = ({ isDarkMode }) => {
  const { activeBrandId } = useBrand();
  const [dataEntries, setDataEntries] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(true); // Start with true
  const [error, setError] = useState(null);

  // Form state
  const [form, setForm] = useState({
    postId: '',
    postLink: '',
    questions: [
      {
        keywords: '',
        replies: [
          { public: '', private: '' },
          { public: '', private: '' },
          { public: '', private: '' },
          { public: '', private: '' },
          { public: '', private: '' }
        ]
      }
    ]
  });

  useEffect(() => {
    console.log('[Data Center] Component mounted, loading data...');
    fetchDataEntries();
  }, []);

  const fetchDataEntries = async () => {
    const startTime = Date.now();
    console.log('[Data Center] 🚀 Starting fetch...');
    setLoading(true);
    setError(null);
    
    try {
      // Improved fetch with direct collection reference
      const querySnapshot = await getDocs(collection(db, "comment_data_center"));
      
      const elapsed = Date.now() - startTime;
      console.log(`[Data Center] ✅ Fetched ${querySnapshot.size} docs in ${elapsed}ms`);
      
      const entries = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        };
      });
      
      setDataEntries(entries);
      setError(null);
      console.log('[Data Center] ✅ State updated successfully');
    } catch (err) {
      console.error(`[Data Center] ❌ Error loading data:`, err);
      setError(err.message || 'Failed to connect to database. Please check your internet.');
      setDataEntries([]);
    } finally {
      setLoading(false);
      console.log('[Data Center] 🏁 Fetch complete');
    }
  };

  const handleAddQuestion = () => {
    setForm(prev => ({
      ...prev,
      questions: [...prev.questions, {
        keywords: '',
        replies: [
          { public: '', private: '' },
          { public: '', private: '' },
          { public: '', private: '' },
          { public: '', private: '' },
          { public: '', private: '' }
        ]
      }]
    }));
  };

  const handleRemoveQuestion = (index) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!form.postId) {
      alert("Post ID is required!");
      return;
    }

    // Validate form
    for (const question of form.questions) {
      if (!question.keywords.trim()) {
        alert("Please add keywords for all questions!");
        return;
      }
      for (const reply of question.replies) {
        if (!reply.public.trim() || !reply.private.trim()) {
          alert("Please fill all reply variations!");
          return;
        }
      }
    }

    try {
      const data = {
        brandId: activeBrandId || 'universal', // Use active brand or mark as universal
        postId: form.postId,
        postLink: form.postLink || null,
        isActive: true,
        isGlobal: false,
        isUniversal: true, // Mark as available for all brands
        questions: form.questions.map(q => ({
          keywords: q.keywords.split(',').map(k => k.trim()).filter(Boolean),
          replies: q.replies
        })),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (editingEntry) {
        await updateDoc(doc(db, "comment_data_center", editingEntry.id), data);
      } else {
        await addDoc(collection(db, "comment_data_center"), data);
      }

      setIsAdding(false);
      setEditingEntry(null);
      resetForm();
      fetchDataEntries();
    } catch (error) {
      console.error("Error saving data entry:", error);
      alert("Error saving. Please try again.");
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setForm({
      postId: entry.postId || '',
      postLink: entry.postLink || '',
      questions: entry.questions.map(q => ({
        keywords: q.keywords.join(', '),
        replies: q.replies
      }))
    });
    setIsAdding(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteDoc(doc(db, "comment_data_center", deletingId));
      setDeletingId(null);
      fetchDataEntries();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const resetForm = () => {
    setForm({
      postId: '',
      postLink: '',
      questions: [
        {
          keywords: '',
          replies: [
            { public: '', private: '' },
            { public: '', private: '' },
            { public: '', private: '' },
            { public: '', private: '' },
            { public: '', private: '' }
          ]
        }
      ]
    });
  };

  const totalVariations = dataEntries.reduce((sum, entry) => {
    return sum + entry.questions.reduce((qSum, q) => qSum + q.replies.length, 0);
  }, 0);

  console.log('[Data Center UI] === RENDER ===');
  console.log('[Data Center UI] loading:', loading);
  console.log('[Data Center UI] error:', error);
  console.log('[Data Center UI] dataEntries.length:', dataEntries.length);
  console.log('[Data Center UI] dataEntries:', dataEntries);
  console.log('[Data Center UI] totalVariations:', totalVariations);

  return (
    <div className="animate-fade-in space-y-8">
      {/* DEBUG PANEL */}
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <h3 className="font-bold text-yellow-500 mb-2">🔍 DEBUG INFO</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Loading: <strong>{loading ? 'YES ⏳' : 'NO ✅'}</strong></div>
          <div>Error: <strong>{error ? 'YES ❌' : 'NO ✅'}</strong></div>
          <div>Entries: <strong>{dataEntries.length}</strong></div>
          <div>Variations: <strong>{totalVariations}</strong></div>
        </div>
        {dataEntries.length > 0 && (
          <div className="mt-2 text-xs">
            <strong>Post IDs:</strong> {dataEntries.map(e => e.postId).join(', ')}
          </div>
        )}
      </div>
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-4xl font-black tracking-tighter mb-2">Comment Data Center</h3>
          <p className={`text-[11px] uppercase font-black tracking-[0.4em] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Universal Automation • {dataEntries.length} Posts • {totalVariations} Reply Variations • All Brands
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
          className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.2em] border transition-all duration-500 ${
            isDarkMode 
              ? 'bg-prime-500 text-white border-transparent hover:bg-prime-400 hover:scale-110 shadow-xl shadow-prime-500/20' 
              : 'bg-prime-500 text-white border-transparent hover:bg-prime-600 hover:scale-110 shadow-xl shadow-prime-500/10'
          }`}
        >
          <PlusCircle size={18} />
          Add Post Automation
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-prime-500 mx-auto mb-4"></div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading Data Center...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-start gap-4">
            <div className="text-red-500 text-2xl">⚠️</div>
            <div>
              <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                Error Loading Data
              </h4>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {error}
              </p>
              <button
                onClick={fetchDataEntries}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600"
              >
                Retry
              </button>
              <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Check browser console (F12) for detailed error logs
              </p>
            </div>
          </div>
        </div>
      )}
      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex items-start gap-4">
          <Database size={24} className="text-blue-500 flex-shrink-0 mt-1" />
          <div>
            <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
              How It Works
            </h4>
            <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>✅ Works for ALL brands automatically</li>
              <li>✅ Each post gets its own automation rules</li>
              <li>✅ 5 shuffled replies per question (prevents Facebook blocking)</li>
              <li>✅ Auto DM sent to inbox when someone comments</li>
              <li>✅ No AI involved - pure rule-based (fast & reliable)</li>
              <li>✅ Your inbox automation remains completely untouched</li>
              <li>✅ New brands automatically get access to all rules</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Data Entries Table */}
      {loading ? (
        <div className="text-center py-20">Loading...</div>
      ) : dataEntries.length === 0 ? (
        <div className={`py-20 text-center border-2 border-dashed rounded-3xl ${isDarkMode ? 'border-white/10 text-gray-500' : 'border-gray-300 text-gray-400'}`}>
          <Database size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-bold">No data entries yet</p>
          <p className="text-sm mt-2">Click "Add Post Automation" to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {dataEntries.map(entry => (
            <div
              key={entry.id}
              className={`p-6 rounded-2xl border transition-all ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 hover:border-prime-500/30' 
                  : 'bg-white border-gray-200 hover:border-prime-500/50 shadow-md'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link size={16} className="text-prime-500" />
                    <h4 className="font-bold text-lg">{entry.postId}</h4>
                    {entry.postLink && (
                      <a 
                        href={entry.postLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-prime-500 hover:underline"
                      >
                        View Post
                      </a>
                    )}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {entry.questions.length} question sets • {entry.questions.reduce((sum, q) => sum + q.replies.length, 0)} reply variations
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(entry)}
                    className={`p-2 rounded-lg transition-all ${isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => setDeletingId(entry.id)}
                    className={`p-2 rounded-lg transition-all ${isDarkMode ? 'hover:bg-red-500/20 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-600 hover:text-red-600'}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Questions Preview */}
              <div className="space-y-2">
                {entry.questions.slice(0, 3).map((q, idx) => (
                  <div key={idx} className={`text-xs p-3 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare size={12} className="text-prime-500" />
                      <span className="font-bold">Keywords:</span>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {q.keywords.join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shuffle size={12} className="text-green-500" />
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {q.replies.length} shuffled replies
                      </span>
                    </div>
                  </div>
                ))}
                {entry.questions.length > 3 && (
                  <div className={`text-xs text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    +{entry.questions.length - 3} more question sets
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black">
                {editingEntry ? 'Edit Post Automation' : 'Add Post Automation'}
              </h3>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setEditingEntry(null);
                  resetForm();
                }}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                ✕
              </button>
            </div>

            {/* Post Info */}
            <div className="space-y-4 mb-6">
              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Post ID *
                </label>
                <input
                  type="text"
                  value={form.postId}
                  onChange={(e) => setForm(prev => ({ ...prev, postId: e.target.value }))}
                  placeholder="122105925219235530"
                  className={`w-full p-4 rounded-xl border font-medium ${
                    isDarkMode 
                      ? 'bg-black/40 border-white/10 focus:border-prime-500/50' 
                      : 'bg-gray-50 border-gray-300 focus:border-prime-500'
                  }`}
                />
              </div>
              <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Post Link (Optional)
                </label>
                <input
                  type="text"
                  value={form.postLink}
                  onChange={(e) => setForm(prev => ({ ...prev, postLink: e.target.value }))}
                  placeholder="https://web.facebook.com/..."
                  className={`w-full p-4 rounded-xl border font-medium ${
                    isDarkMode 
                      ? 'bg-black/40 border-white/10 focus:border-prime-500/50' 
                      : 'bg-gray-50 border-gray-300 focus:border-prime-500'
                  }`}
                />
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {form.questions.map((question, qIdx) => (
                <div key={qIdx} className={`p-6 rounded-2xl border ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold">Question Set {qIdx + 1}</h4>
                    {form.questions.length > 1 && (
                      <button
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="text-red-500 hover:text-red-600 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Keywords */}
                  <div className="mb-4">
                    <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Keywords (comma-separated) *
                    </label>
                    <input
                      type="text"
                      value={question.keywords}
                      onChange={(e) => {
                        const newQuestions = [...form.questions];
                        newQuestions[qIdx].keywords = e.target.value;
                        setForm(prev => ({ ...prev, questions: newQuestions }));
                      }}
                      placeholder="price, দাম, rate, কত"
                      className={`w-full p-4 rounded-xl border font-medium ${
                        isDarkMode 
                          ? 'bg-black/40 border-white/10 focus:border-prime-500/50' 
                          : 'bg-gray-50 border-gray-300 focus:border-prime-500'
                      }`}
                    />
                  </div>

                  {/* Reply Variations */}
                  <div className="space-y-4">
                    <label className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Reply Variations (5 required) *
                    </label>
                    {question.replies.map((reply, rIdx) => (
                      <div key={rIdx} className={`p-4 rounded-xl ${isDarkMode ? 'bg-black/20' : 'bg-gray-50'}`}>
                        <div className="text-xs font-bold mb-2 text-prime-500">Variation {rIdx + 1}</div>
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={reply.public}
                            onChange={(e) => {
                              const newQuestions = [...form.questions];
                              newQuestions[qIdx].replies[rIdx].public = e.target.value;
                              setForm(prev => ({ ...prev, questions: newQuestions }));
                            }}
                            placeholder="Public reply (shown in comments)"
                            className={`w-full p-3 rounded-lg border text-sm ${
                              isDarkMode 
                                ? 'bg-black/40 border-white/10' 
                                : 'bg-white border-gray-300'
                            }`}
                          />
                          <textarea
                            value={reply.private}
                            onChange={(e) => {
                              const newQuestions = [...form.questions];
                              newQuestions[qIdx].replies[rIdx].private = e.target.value;
                              setForm(prev => ({ ...prev, questions: newQuestions }));
                            }}
                            placeholder="Private reply (sent to inbox)"
                            rows={3}
                            className={`w-full p-3 rounded-lg border text-sm resize-none ${
                              isDarkMode 
                                ? 'bg-black/40 border-white/10' 
                                : 'bg-white border-gray-300'
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddQuestion}
                className={`w-full py-4 rounded-xl border-2 border-dashed font-bold transition-all ${
                  isDarkMode 
                    ? 'border-white/20 text-gray-400 hover:border-prime-500/50 hover:text-prime-400' 
                    : 'border-gray-300 text-gray-600 hover:border-prime-500 hover:text-prime-600'
                }`}
              >
                + Add Another Question Set
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => {
                  setIsAdding(false);
                  setEditingEntry(null);
                  resetForm();
                }}
                className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-sm ${
                  isDarkMode 
                    ? 'bg-white/5 hover:bg-white/10 text-gray-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-sm bg-prime-500 text-white hover:bg-prime-600 shadow-lg shadow-prime-500/20"
              >
                {editingEntry ? 'Update' : 'Create'} Automation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Automation?"
        message="This will remove the post-specific automation. This action cannot be undone."
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default CommentDataCenter;
