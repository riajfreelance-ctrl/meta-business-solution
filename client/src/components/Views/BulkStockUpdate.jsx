import React, { useState } from 'react';
import { 
  Package, 
  Upload, 
  Clipboard, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  X, 
  Search,
  RefreshCw,
  ArrowRight,
  Save
} from 'lucide-react';
import { useBrand } from '../../context/BrandContext';

const BulkStockUpdate = ({ isDarkMode, t }) => {
  const { activeBrandId } = useBrand();
  const [activeTab, setActiveTab] = useState('paste'); // 'paste' or 'upload'
  const [pastedData, setPastedData] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [updateResult, setUpdateResult] = useState(null);

  const parsePastedData = () => {
    if (!pastedData.trim()) return;

    const lines = pastedData.trim().split('\n');
    const parsed = lines.map(line => {
      // Split by tab or comma
      const parts = line.split(/[\t,]/).map(p => p.trim());
      return {
        code: parts[0] || '',
        price: parts[1] || '',
        stock: parts[2] || '',
        status: 'pending'
      };
    }).filter(item => item.code);

    setPreviewData(parsed);
    setUpdateResult(null);
  };

  const handleApply = async () => {
    if (!previewData.length || !activeBrandId) return;

    setIsProcessing(true);
    setUpdateResult(null);

    try {
      const updates = previewData.map(item => ({
        code: item.code,
        price: item.price ? Number(item.price) : undefined,
        stock: item.stock ? Number(item.stock) : undefined
      }));

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/bulk-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: activeBrandId, updates })
      });

      if (!res.ok) throw new Error('Update failed');
      
      const data = await res.json();
      setUpdateResult(data.summary);
      
      // Update preview status
      if (data.summary.errors && data.summary.errors.length > 0) {
          // Some failed
          const errorCodes = data.summary.errors.map(e => {
              const match = e.match(/not found: (.*)/);
              return match ? match[1] : null;
          }).filter(Boolean);

          setPreviewData(prev => prev.map(item => ({
              ...item,
              status: errorCodes.includes(item.code) ? 'failed' : 'success'
          })));
      } else {
          setPreviewData(prev => prev.map(item => ({ ...item, status: 'success' })));
      }

    } catch (e) {
      console.error(e);
      alert('Error updating stock. Please check connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  const clear = () => {
    setPastedData('');
    setPreviewData([]);
    setUpdateResult(null);
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
        <div>
          <h2 className={`text-3xl md:text-4xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Bulk Inventory Update.
          </h2>
          <p className="text-sm text-gray-500 mt-2">ব্যালেন্স বা দাম একসাথে অনেকগুলো প্রোডাক্টের জন্য আপডেট করুন।</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={clear}
            className={`flex-1 md:flex-none p-3 rounded-2xl border transition-all active:scale-95 flex items-center justify-center gap-2 ${
              isDarkMode ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white' : 'bg-gray-100 border-black/5 text-gray-500 hover:text-gray-900'
            }`}
          >
            <RefreshCw size={20} />
            <span className="md:hidden text-[10px] font-black uppercase">Reset</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Aspect: Input */}
        <div className="lg:col-span-1 space-y-6">
          <div className={`p-6 rounded-[2.5rem] border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-xl'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-prime-500/20 flex items-center justify-center text-prime-500">
                <Clipboard size={20} />
              </div>
              <h3 className="font-black uppercase tracking-widest text-xs">Step 1: Paste Data</h3>
            </div>

            <p className="text-[10px] text-gray-500 font-bold mb-4 uppercase tracking-wider">Format: Code [TAB] Price [TAB] Stock</p>
            
            <textarea 
              rows={12}
              value={pastedData}
              onChange={(e) => setPastedData(e.target.value)}
              placeholder="Example:&#10;SKU001  1200  50&#10;SKU002  1500  30"
              className={`w-full p-6 rounded-3xl outline-none border transition-all resize-none text-sm font-mono leading-relaxed ${
                isDarkMode ? 'bg-black/40 border-white/10 focus:border-prime-500 text-gray-300' : 'bg-gray-50 border-black/5 focus:border-prime-500 text-gray-800'
              }`}
            />

            <button 
              onClick={parsePastedData}
              disabled={!pastedData.trim()}
              className="w-full mt-6 py-4 bg-prime-500 hover:bg-prime-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-prime-500/20"
            >
              Parse Data <ArrowRight size={18} />
            </button>
          </div>

          {/* Quick Help */}
          <div className={`p-6 rounded-[2.5rem] border flex items-start gap-4 ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 bg-indigo-100/50 border-indigo-100'}`}>
            <AlertCircle size={20} className="text-indigo-500 shrink-0 mt-1" />
            <div className="text-xs text-indigo-400 space-y-2 leading-relaxed">
              <p className="font-bold">Pro Tip:</p>
              <p>You can copy multiple columns directly from your Excel or Google Sheet and paste them here.</p>
            </div>
          </div>
        </div>

        {/* Right Aspect: Preview & Apply */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`h-full min-h-[500px] flex flex-col rounded-[2.5rem] border overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-xl'}`}>
            
            {/* Preview Header */}
            <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-black/5 bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <Search size={18} className="text-gray-500" />
                <h3 className="font-black uppercase tracking-widest text-xs">Step 2: Preview & Apply</h3>
              </div>
              {previewData.length > 0 && (
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  {previewData.length} Items Detected
                </div>
              )}
            </div>

            {/* Preview Table */}
            <div className="flex-1 overflow-x-auto overflow-y-auto">
              {previewData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4 opacity-30">
                  <Package size={64} />
                  <p className="text-sm font-bold">No data to display. Paste data on the left to begin.</p>
                </div>
              ) : (
                <div className="min-w-[600px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`text-[10px] font-black uppercase tracking-widest text-gray-500 border-b ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                        <th className="px-6 py-4">Item Code</th>
                        <th className="px-6 py-4 text-center">New Price</th>
                        <th className="px-6 py-4 text-center">New Stock</th>
                        <th className="px-6 py-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {previewData.map((item, idx) => (
                        <tr key={idx} className={`text-sm group transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                          <td className="px-6 py-4 font-mono font-bold text-prime-500 underline decoration-prime-500/30 underline-offset-4">{item.code}</td>
                          <td className="px-6 py-4 text-center font-bold">{item.price || '-'}</td>
                          <td className="px-6 py-4 text-center font-bold">{item.stock || '-'}</td>
                          <td className="px-6 py-4 text-right">
                            {item.status === 'success' && <CheckCircle2 size={16} className="text-emerald-500 inline" />}
                            {item.status === 'failed' && <X size={16} className="text-red-500 inline" />}
                            {item.status === 'pending' && <div className="w-2 h-2 rounded-full bg-gray-600 animate-pulse inline-block" />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Summary Footer */}
            {updateResult && (
              <div className={`p-6 border-t font-black uppercase tracking-widest text-[10px] flex gap-8 ${isDarkMode ? 'border-white/5 bg-emerald-500/5' : 'border-black/5 bg-emerald-50'}`}>
                <div className="flex items-center gap-2 text-emerald-500">
                  <CheckCircle2 size={14} /> Success: {updateResult.success}
                </div>
                {updateResult.failed > 0 && (
                  <div className="flex items-center gap-2 text-red-500">
                    <X size={14} /> Failed: {updateResult.failed}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="p-6 border-t border-white/5 flex gap-4">
              <button 
                onClick={handleApply}
                disabled={previewData.length === 0 || isProcessing}
                className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {isProcessing ? 'Processing Updates...' : 'Apply Bulk Changes Now'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BulkStockUpdate;
