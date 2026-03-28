import React, { useState, useRef, useEffect } from 'react';
import { Zap, Search, X, ChevronRight, MessageSquare, Plus, Check, Loader } from 'lucide-react';

const CannedResponsePanel = ({ drafts = [], onSelect, isDarkMode, brandId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [newResult, setNewResult] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const panelRef = useRef(null);
  const searchRef = useRef(null);
  const keywordRef = useRef(null);

  const filtered = drafts
    .filter(d => d.status === 'approved' || !d.status)
    .filter(d => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        d.keyword?.toLowerCase().includes(s) ||
        d.result?.toLowerCase().includes(s)
      );
    })
    .slice(0, 8);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchRef.current?.focus(), 50);
      setSelectedIdx(0);
      setShowAddForm(false);
    } else {
      setSearch('');
      setShowAddForm(false);
      setNewKeyword('');
      setNewResult('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (showAddForm) setTimeout(() => keywordRef.current?.focus(), 50);
  }, [showAddForm]);

  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(p => (p + 1) % filtered.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(p => (p - 1 + filtered.length) % filtered.length); }
    else if (e.key === 'Enter' && filtered[selectedIdx]) {
      e.preventDefault();
      onSelect(filtered[selectedIdx]);
      setIsOpen(false);
    }
    else if (e.key === 'Escape') setIsOpen(false);
  };

  const handleSave = async () => {
    if (!newKeyword.trim() || !newResult.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/save_draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: newKeyword.trim(), result: newResult.trim(), brandId })
      });
      if (!res.ok) throw new Error('Failed');
      setSavedOk(true);
      setTimeout(() => {
        setSavedOk(false);
        setShowAddForm(false);
        setNewKeyword('');
        setNewResult('');
      }, 1500);
    } catch (e) {
      alert('Failed to save rule. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(o => !o)}
        title="Quick Canned Replies"
        className={`p-2 rounded-xl transition-all flex items-center gap-1.5 ${
          isOpen
            ? 'bg-prime-500/20 text-prime-400 border border-prime-500/30'
            : isDarkMode
              ? 'text-gray-400 hover:bg-white/10 hover:text-prime-400'
              : 'text-gray-500 hover:bg-gray-200 hover:text-prime-600'
        }`}
      >
        <Zap size={18} className={isOpen ? 'fill-prime-500 text-prime-400' : ''} />
      </button>

      {isOpen && (
        <div
          className={`absolute bottom-full mb-2 left-0 w-[320px] sm:w-[380px] rounded-2xl border shadow-2xl overflow-hidden z-50 animate-in slide-in-from-bottom-4 duration-200 ${
            isDarkMode ? 'bg-[#0d1424] border-white/10' : 'bg-white border-black/5'
          }`}
        >
          {/* Header */}
          <div className={`p-3 border-b flex items-center gap-2 ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-black/5 bg-gray-50'}`}>
            <Zap size={14} className="text-prime-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-prime-400">Quick Reply</span>
            <span className={`ml-auto text-[9px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              ↑↓ Navigate · Enter Select
            </span>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-gray-500">
              <X size={12} />
            </button>
          </div>

          {!showAddForm ? (
            <>
              {/* Search */}
              <div className={`px-3 py-2 border-b ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                  <Search size={14} className="opacity-40 shrink-0" />
                  <input
                    ref={searchRef}
                    value={search}
                    onChange={e => { setSearch(e.target.value); setSelectedIdx(0); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Search rules... (e.g. price, delivery)"
                    className="flex-1 bg-transparent border-none outline-none text-xs font-medium placeholder:opacity-40"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="opacity-50 hover:opacity-100">
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Results */}
              <div className="max-h-[240px] overflow-y-auto scrollbar-thin">
                {filtered.length === 0 ? (
                  <div className="p-6 text-center">
                    <MessageSquare size={24} className="mx-auto mb-2 opacity-20" />
                    <p className="text-xs opacity-40 font-bold">No matching rules found</p>
                  </div>
                ) : (
                  filtered.map((draft, idx) => (
                    <button
                      key={draft.id || idx}
                      onClick={() => { onSelect(draft); setIsOpen(false); }}
                      onMouseEnter={() => setSelectedIdx(idx)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all border-b last:border-0 ${
                        selectedIdx === idx
                          ? isDarkMode ? 'bg-prime-500/10 border-prime-500/10' : 'bg-prime-50'
                          : isDarkMode ? 'border-white/5 hover:bg-white/[0.03]' : 'border-black/5 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${selectedIdx === idx ? 'bg-prime-500/20 text-prime-400' : 'bg-white/5 text-gray-500'}`}>
                        <ChevronRight size={12} />
                      </div>
                      <div className="overflow-hidden flex-1">
                        <p className="text-[10px] font-black uppercase tracking-wider text-prime-400 truncate">{draft.keyword}</p>
                        <p className="text-xs font-medium opacity-60 truncate">{draft.result}</p>
                      </div>
                      {(draft.successCount > 0) && (
                        <span className="ml-auto shrink-0 text-[9px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                          {draft.successCount}✓
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Add New Rule Button */}
              <div className={`p-2 border-t ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                <button
                  onClick={() => setShowAddForm(true)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                    isDarkMode
                      ? 'bg-prime-500/10 border border-prime-500/20 text-prime-400 hover:bg-prime-500/20'
                      : 'bg-prime-50 border border-prime-500/20 text-prime-600 hover:bg-prime-100'
                  }`}
                >
                  <Plus size={14} />
                  Add New Rule
                </button>
              </div>
            </>
          ) : (
            /* Inline Add Form */
            <div className="p-4 space-y-3">
              <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                New Canned Reply
              </p>

              {/* Keyword field */}
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-prime-400 mb-1 block">
                  Keyword / Trigger
                </label>
                <input
                  ref={keywordRef}
                  value={newKeyword}
                  onChange={e => setNewKeyword(e.target.value)}
                  placeholder="e.g. price, dam koto, delivery"
                  className={`w-full text-xs px-3 py-2.5 rounded-xl border outline-none transition-all focus:border-prime-500/50 ${
                    isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-600' : 'bg-gray-50 border-black/10 placeholder:text-gray-400'
                  }`}
                />
              </div>

              {/* Reply field */}
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-prime-400 mb-1 block">
                  Reply Text
                </label>
                <textarea
                  value={newResult}
                  onChange={e => setNewResult(e.target.value)}
                  placeholder="আমাদের প্রোডাক্টের দাম ১২০০ টাকা। ডেলিভারি ঢাকার মধ্যে ফ্রি।"
                  rows={3}
                  className={`w-full text-xs px-3 py-2.5 rounded-xl border outline-none resize-none transition-all focus:border-prime-500/50 ${
                    isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-600' : 'bg-gray-50 border-black/10 placeholder:text-gray-400'
                  }`}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowAddForm(false)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || savedOk || !newKeyword.trim() || !newResult.trim()}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    savedOk
                      ? 'bg-emerald-500 text-white'
                      : 'bg-prime-500 hover:bg-prime-600 text-white disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
                >
                  {saving ? (
                    <><Loader size={12} className="animate-spin" /> Saving...</>
                  ) : savedOk ? (
                    <><Check size={12} /> Saved!</>
                  ) : (
                    <><Plus size={12} /> Save Rule</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CannedResponsePanel;
