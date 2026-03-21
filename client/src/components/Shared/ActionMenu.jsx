import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Trash2, X } from 'lucide-react';

const ActionMenu = ({ isDarkMode, onEdit, onDelete, t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-xl transition-all ${
          isDarkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-black/5 text-gray-500 hover:text-black'
        }`}
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-48 rounded-2xl border shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200 ${
          isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-black/5'
        }`}>
          <button 
            onClick={() => { onEdit(); setIsOpen(false); }}
            className={`w-full text-left px-4 py-3 text-xs font-bold transition-all flex items-center gap-3 ${
              isDarkMode ? 'hover:bg-white/5 text-gray-400 hover:text-white' : 'hover:bg-gray-50 text-gray-600'
            }`}
          >
            <Edit size={16} className="text-prime-500" />
            {t('edit')}
          </button>
          <div className={`h-px mx-2 my-1 ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`} />
          <button 
            onClick={() => { onDelete(); setIsOpen(false); }}
            className={`w-full text-left px-4 py-3 text-xs font-bold transition-all flex items-center gap-3 ${
              isDarkMode ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-500'
            }`}
          >
            <Trash2 size={16} />
            {t('delete')}
          </button>
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
