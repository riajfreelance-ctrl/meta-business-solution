import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isDarkMode, t, type = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-sm rounded-[2.5rem] border shadow-2xl overflow-hidden ${
        isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-black/5 text-gray-900'
      } animate-in zoom-in-95 duration-200`}>
        <div className="p-8 space-y-6 text-center">
          <div className="relative inline-block">
             <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 animate-pulse ${type === 'danger' ? 'bg-red-500' : 'bg-prime-500'}`} />
             <div className={`relative p-5 rounded-full border ${
               isDarkMode 
                 ? (type === 'danger' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-prime-500/10 border-prime-500/20 text-prime-400') 
                 : (type === 'danger' ? 'bg-red-50 border-red-100 text-red-500' : 'bg-prime-50 border-prime-100 text-prime-600')
             }`}>
               <AlertTriangle size={32} />
             </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black tracking-tight">{title}</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">{message}</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={onClose}
              className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
                isDarkMode ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {t('cancel') || 'Cancel'}
            </button>
            <button 
              onClick={onConfirm}
              className={`flex-1 py-4 rounded-2xl font-bold transition-all shadow-xl active:scale-95 ${
                type === 'danger' 
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
                  : 'bg-prime-500 hover:bg-prime-600 text-white shadow-prime-500/20'
              }`}
            >
              {t('confirm') || 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
