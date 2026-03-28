import React, { useState } from 'react';
import { User, Mail, Shield, Camera, Save, CheckCircle2 } from 'lucide-react';
import { useBrand } from '../../context/BrandContext';

const ProfileSettings = ({ isDarkMode, t }) => {
  const { user } = useBrand();
  const [formData, setFormData] = useState({
    name: user?.brandName || 'Managing Director',
    email: user?.email || '',
    phone: '+880 1700 000000',
    bio: 'Digital marketing strategist focusing on AI automation and customer engagement.',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className={`text-4xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Profile Settings.
          </h2>
          <p className="text-gray-500 mt-2">Manage your account information and preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          className="px-8 py-3 bg-prime-500 hover:bg-prime-600 text-white rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-prime-500/20"
        >
          {saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className={`p-8 rounded-[2.5rem] border ${
          isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-xl'
        }`}>
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="w-full h-full rounded-full bg-prime-500/20 flex items-center justify-center text-4xl font-black text-prime-500 border-4 border-prime-500/10">
              {formData.name.charAt(0)}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-prime-500 text-white rounded-full border-4 border-slate-900 hover:scale-110 transition-all">
              <Camera size={16} />
            </button>
          </div>
          <div className="text-center space-y-1">
            <h3 className="font-bold text-lg">{formData.name}</h3>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-black">System Administrator</p>
          </div>

          <div className="mt-8 space-y-3">
            <div className={`p-4 rounded-2xl flex items-center gap-3 ${isDarkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
              <Shield size={16} className="text-prime-500" />
              <span className="text-xs font-bold">Two-Factor Auth: ON</span>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className={`md:col-span-2 p-8 rounded-[2.5rem] border space-y-6 ${
          isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-xl'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none border transition-all ${
                    isDarkMode ? 'bg-black/20 border-white/10 focus:border-prime-500' : 'bg-gray-50 border-black/5 focus:border-prime-500'
                  }`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="email" 
                  value={formData.email}
                  disabled
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none border cursor-not-allowed opacity-50 ${
                    isDarkMode ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-black/5'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-1">Short Bio</label>
            <textarea 
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className={`w-full p-4 rounded-3xl outline-none border transition-all resize-none ${
                isDarkMode ? 'bg-black/20 border-white/10 focus:border-prime-500' : 'bg-gray-50 border-black/5 focus:border-prime-500'
              }`}
            />
          </div>

          <div className="pt-4 flex items-center justify-between">
            <p className="text-xs text-gray-500 ">Your email address cannot be changed for security reasons.</p>
            <button className="text-xs font-black text-prime-500 hover:underline px-2 py-1">Reset Password</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
