import React from 'react';
import { XCircle } from 'lucide-react';

const FollowUpModal = ({ isOpen, onClose, onConfirm, modalData, setModalData, isDarkMode, t }) => {
  if (!isOpen) return null;
  
  const reasons = [
    { id: 'price', label: 'Price Inquiry' },
    { id: 'delivery', label: 'Delivery Info' },
    { id: 'stock', label: 'Product Availability' },
    { id: 'order', label: 'Order Confirmation' },
    { id: 'issue', label: 'Complaint/Issue' },
    { id: 'other', label: 'Other' }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden ${
        isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-black/5 text-gray-900'
      } animate-in zoom-in-95 duration-200`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-black text-xs uppercase tracking-widest opacity-60">
            {modalData.type === 'followup' ? 'Mark for Follow-up' : 'Mark as Priority'}
          </h3>
          <button onClick={onClose} className="opacity-40 hover:opacity-100 transition-opacity">
            <XCircle size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase opacity-40 tracking-widest pl-1">Select Reason</label>
            <div className="grid grid-cols-2 gap-2">
              {reasons.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setModalData({ ...modalData, reason: r.label })}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    modalData.reason === r.label
                      ? 'bg-prime-500 border-prime-500 text-white shadow-lg shadow-prime-500/20'
                      : (isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-gray-100 border-black/5 hover:bg-gray-100')
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase opacity-40 tracking-widest pl-1">Custom Note</label>
            <textarea
              value={modalData.note}
              onChange={(e) => setModalData({ ...modalData, note: e.target.value })}
              placeholder="Add details about this follow-up..."
              className={`w-full h-24 p-4 rounded-2xl text-sm outline-none border transition-all resize-none ${
                isDarkMode ? 'bg-white/5 border-white/10 focus:border-prime-500/50' : 'bg-gray-50 border-black/5 focus:border-prime-500/50'
              }`}
            />
          </div>
        </div>
        
        <div className={`p-4 flex items-center gap-3 border-t ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl font-bold bg-transparent hover:bg-white/5 transition-all opacity-40 hover:opacity-100"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl font-bold bg-prime-500 text-white hover:bg-prime-600 shadow-xl shadow-prime-500/20 active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default FollowUpModal;
