import React from 'react';
import { CreditCard, Download, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';

const BillingHistory = ({ isDarkMode, t }) => {
  const invoices = [
    { id: 'INV-2026-001', date: 'Mar 01, 2026', amount: '7,500 BDT', status: 'Paid', method: '•••• 4242' },
    { id: 'INV-2025-012', date: 'Feb 01, 2026', amount: '7,500 BDT', status: 'Paid', method: '•••• 4242' },
    { id: 'INV-2025-011', date: 'Jan 01, 2026', amount: '2,500 BDT', status: 'Paid', method: '•••• 4242' },
  ];

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10">
        <h2 className={`text-4xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Billing History.
        </h2>
        <p className="text-gray-500 mt-2">Manage your payment methods and download past invoices.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ${
          isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-xl'
        }`}>
          <div className="flex items-center gap-6">
            <div className="w-16 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-white/10 shrink-0">
              <span className="text-white font-black text-xs italic">VISA</span>
            </div>
            <div>
              <h4 className="font-bold text-sm md:text-base">Visa Ending in 4242</h4>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Expires 12/28</p>
            </div>
          </div>
          <button className="text-xs font-black text-prime-500 hover:underline">Update Method</button>
        </div>

        <div className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border flex flex-col justify-center ${
          isDarkMode ? 'bg-prime-500/10 border-prime-500/20' : 'bg-prime-50/50 border-prime-100 shadow-sm'
        }`}>
          <p className="text-[10px] uppercase font-black tracking-widest text-prime-500 mb-1">Next Payment</p>
          <h4 className="text-2xl font-black">7,500 BDT</h4>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <Calendar size={12} /> Apr 01, 2026
          </p>
        </div>
      </div>

      <div className={`rounded-[2rem] md:rounded-[2.5rem] border overflow-hidden ${
        isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-xl'
      }`}>
        <div className={`px-6 md:px-8 py-4 border-b flex items-center justify-between ${isDarkMode ? 'border-white/10 bg-white/5' : 'border-black/5 bg-gray-50'}`}>
          <h3 className="font-bold text-sm uppercase tracking-widest">Invoices</h3>
          <button className="text-[10px] font-black uppercase text-gray-500 hover:text-prime-500 flex items-center gap-1 transition-all">
            View All <ExternalLink size={12} />
          </button>
        </div>
        <div className="divide-y divide-inherit">
          {invoices.map((invoice, idx) => (
            <div key={idx} className="px-6 md:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/5 transition-all group">
              <div className="flex items-center gap-6 w-full sm:w-auto">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-green-500/10 text-green-500' : 'bg-green-50 text-green-600'}`}>
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-tight">{invoice.id}</h4>
                  <p className="text-xs text-gray-500">{invoice.date} • {invoice.method}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <span className="font-bold">{invoice.amount}</span>
                <button className={`p-3 rounded-xl border transition-all ${
                  isDarkMode ? 'border-white/10 group-hover:bg-prime-500 group-hover:text-white' : 'border-black/5 group-hover:bg-prime-500 group-hover:text-white group-hover:border-prime-500'
                }`}>
                  <Download size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BillingHistory;
